import { useState, useEffect, useCallback } from 'react';
import { DndContext, useSensor, useSensors, TouchSensor, MouseSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, LogOut, Eye, Edit2, Trash2, ChevronLeft, Menu, Layers } from 'lucide-react';
import { PaletteItem } from './PaletteItem';
import { Canvas } from './Canvas';
import { ShareModal } from './ShareModal';
import { LayerPanel } from './LayerPanel';


import type { UIComponent } from '../types/builder';
import type { MutationPayload } from '../types/supabase';
import { useRealtime } from '../hooks/useRealtime';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { useModal } from './Modal';

const MY_ID = uuidv4(); // Unique ID for this browser tab instance

export function Builder() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { showConfirm } = useModal();

    const [sessionName, setSessionName] = useState('Untitled Project');
    const [layout, setLayout] = useState<UIComponent[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [canEdit, setCanEdit] = useState(true);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);


    useEffect(() => {
        if (user) {
            // Admin: Default to edit mode, but can toggle
            setCanEdit(true);
        } else {
            // Participant: Always can edit
            setCanEdit(true);
        }
    }, [user]);

    // Terminate Session (Admin Only)
    // Terminate Session (Admin Only)
    const terminateSession = async () => {
        if (!sessionId || !user) return;

        showConfirm(
            'Are you sure you want to terminate this session? It will be permanently deleted for all users.',
            async () => {
                // 1. Notify participants to leave
                if (sendMutation) {
                    await sendMutation({
                        type: 'TERMINATE_SESSION' as any,
                        data: null,
                        actorId: MY_ID
                    } as MutationPayload);
                }

                // 2. Delete the session
                const { error } = await supabase.from('page_sessions').delete().eq('id', sessionId);
                if (error) {
                    showToast('Failed to terminate session.', 'error');
                    console.error(error);
                } else {
                    navigate('/dashboard');
                }
            },
            'Terminate Session'
        );
    };

    // Validate Session ID
    useEffect(() => {
        if (!sessionId) {
            navigate('/login');
        }
    }, [sessionId, navigate]);


    useEffect(() => {
        if (!sessionId) return;

        async function loadInitialState() {
            try {
                const { data } = await supabase
                    .from('page_sessions')
                    .select('layout, name')
                    .eq('id', sessionId)
                    .single();

                if (data) {
                    setLayout(data.layout || []);
                    setSessionName(data.name || 'Untitled Project');
                }
            } catch (err) {
                console.error("Failed to load session", err);
            } finally {
                setIsLoading(false);
            }
        }

        loadInitialState();
    }, [sessionId]);

    // Auto-save persistence: Update page_sessions table so that refresh/reload works
    useEffect(() => {
        if (isLoading || !sessionId || !user) return;

        const timer = setTimeout(async () => {
            try {
                await supabase
                    .from('page_sessions')
                    .update({ layout } as any) // Cast any if type mismatch on layout JSON
                    .eq('id', sessionId);
            } catch (err) {
                console.error("Auto-save failed", err);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [layout, sessionId, isLoading, user]);

    // Handle remote mutations
    const applyRemoteMutation = useCallback((payload: MutationPayload) => {
        if (payload.actorId === MY_ID) return;

        setLayout((prev) => {
            switch (payload.type) {
                case 'ADD_COMPONENT':
                    return [...prev, payload.data];
                case 'UPDATE_STYLE':
                    return prev.map((c) =>
                        c.id === payload.id ? { ...c, styles: { ...c.styles, ...payload.data } } : c
                    );
                case 'UPDATE_CONTENT':
                    return prev.map((c) =>
                        c.id === payload.id ? { ...c, content: typeof payload.data === 'string' ? payload.data : c.content } : c
                    );
                case 'UPDATE_IMAGE':
                    return prev.map((c) =>
                        c.id === payload.id ? { ...c, imageSrc: payload.data.imageSrc } : c
                    );
                case 'DELETE_COMPONENT':
                    return prev.filter((c) => c.id !== payload.id);
                case 'TERMINATE_SESSION' as any:
                    showToast('The host has terminated this session.', 'warning');
                    navigate('/'); // Participant goes to home
                    return prev;
                default:
                    return prev;
            }
        });
    }, [navigate]);

    const { sendMutation } = useRealtime(sessionId || '', applyRemoteMutation);

    // Push local changes to DB
    const pushMutation = async (mutation: Omit<MutationPayload, 'actorId'>) => {
        const fullMutation = { ...mutation, actorId: MY_ID };
        await sendMutation(fullMutation);
    };


    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && over.id === 'main-canvas') {
            const type = active.data.current?.type;

            // Check if element type
            const isElementItem = ['Text', 'Image', 'Button', 'Card'].includes(type);

            const newComponent: UIComponent = {
                id: `node-${uuidv4().slice(0, 8)}`,
                type,
                content: `New ${type}`,
                styles: {}
            };

            // LAYOUT ITEMS: Stacked, full-width, not free-move
            if (type === 'Navbar') {
                newComponent.styles = { width: '100%', height: '60px', padding: '16px 24px', backgroundColor: '#0a0a0a' };
                newComponent.content = "Init Club|Home,About,Projects,Contact|Sign Up";
            }
            if (type === 'Footer') {
                newComponent.styles = { width: '100%', height: '80px', padding: '24px', backgroundColor: '#0a0a0a' };
                newComponent.content = "© 2025 Init Club. Open source forever.";
            }
            if (type === 'Section') {
                newComponent.styles = { width: '100%', height: '300px', backgroundColor: 'rgba(255,255,255,0.03)' };
                newComponent.content = "Section";
            }

            // ELEMENT ITEMS: Free-move inside sections
            if (isElementItem) {
                // Find first section to assign as parent
                const sections = layout.filter(c => c.type === 'Section');
                if (sections.length === 0) {
                    showToast('Add a Section first, then add elements inside it.', 'warning');
                    return;
                }

                const maxZ = Math.max(1, ...layout.map(c => c.styles.zIndex || 1));
                const baseX = 50 + (layout.filter(c => c.parentId === sections[0].id).length * 20) % 200;
                const baseY = 50 + (layout.filter(c => c.parentId === sections[0].id).length * 20) % 200;

                newComponent.parentId = sections[0].id;
                newComponent.styles = { x: baseX, y: baseY, zIndex: maxZ + 1, backgroundColor: '#171717' };
            }

            if (type === 'Card') {
                newComponent.styles = { ...newComponent.styles, width: '280px', height: '180px', padding: '20px', backgroundColor: '#171717', borderRadius: '12px' };
                newComponent.content = "Card Title|Card description goes here.|Learn More";
            }
            if (type === 'Text') {
                newComponent.styles = { ...newComponent.styles, width: '200px', height: '40px', padding: '8px', color: '#ffffff', backgroundColor: 'transparent' };
                newComponent.content = "Text content";
            }
            if (type === 'Image') {
                newComponent.styles = { ...newComponent.styles, width: '200px', height: '150px' };
                newComponent.imageSrc = '';
                newComponent.content = '';
            }
            if (type === 'Button') {
                newComponent.styles = { ...newComponent.styles, width: '120px', height: '44px', padding: '10px 20px', backgroundColor: '#ffffff', borderRadius: '8px' };
                newComponent.content = 'Button';
                newComponent.linkUrl = '';
            }

            setLayout((prev) => [...prev, newComponent]);
            setSelectedId(newComponent.id);
            await pushMutation({ type: 'ADD_COMPONENT', data: newComponent });
        }
    };

    const updateStyles = (id: string, newStyles: any) => {
        setLayout((prev) =>
            prev.map((c) => (c.id === id ? { ...c, styles: { ...c.styles, ...newStyles } } : c))
        );
        pushMutation({ type: 'UPDATE_STYLE', id, data: newStyles });
    };

    const updateContent = (id: string, content: string) => {
        setLayout((prev) =>
            prev.map((c) => (c.id === id ? { ...c, content } : c))
        );
        pushMutation({ type: 'UPDATE_CONTENT', id, data: content });
    };

    const updateImageSrc = (id: string, imageSrc: string) => {
        setLayout((prev) =>
            prev.map((c) => (c.id === id ? { ...c, imageSrc } : c))
        );
        pushMutation({ type: 'UPDATE_IMAGE' as any, id, data: { imageSrc } }); // Use custom type
    };

    const deleteComponent = (id: string) => {
        setLayout((prev) => prev.filter((c) => c.id !== id));
        setSelectedId(null);
        pushMutation({ type: 'DELETE_COMPONENT', id });
    };

    const moveComponent = (id: string, direction: 'up' | 'down') => {
        setLayout((prev) => {
            const index = prev.findIndex((c) => c.id === id);
            if (index === -1) return prev;
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;
            const newLayout = [...prev];
            [newLayout[index], newLayout[newIndex]] = [newLayout[newIndex], newLayout[index]];
            return newLayout;
        });
    };

    const bringForward = (id: string) => {
        setLayout((prev) => {
            const maxZ = Math.max(...prev.map(c => c.styles.zIndex || 1));
            return prev.map(c => c.id === id ? { ...c, styles: { ...c.styles, zIndex: maxZ + 1 } } : c);
        });
    };

    const sendBackward = (id: string) => {
        setLayout((prev) => {
            const comp = prev.find(c => c.id === id);
            const currentZ = comp?.styles.zIndex || 1;
            return prev.map(c => c.id === id ? { ...c, styles: { ...c.styles, zIndex: Math.max(1, currentZ - 1) } } : c);
        });
    };

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150, // Reduced delay for better responsiveness
                tolerance: 5,
            },
        })
    );

    if (isLoading) return <div className="h-screen w-full flex items-center justify-center font-mono bg-black text-neutral-600">Loading...</div>;

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex h-screen w-full bg-black overflow-hidden">

                {/* Palette - Hidden on mobile unless toggled, Visible on Desktop */}
                {/* Mobile Overlay for Left Sidebar */}
                {isLeftSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsLeftSidebarOpen(false)}
                    />
                )}

                <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-neutral-950 border-r border-neutral-900 p-4 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${!canEdit ? 'hidden' : ''} ${isLeftSidebarOpen ? 'translate-x-0' : 'max-md:-translate-x-full'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div
                            className="w-7 h-7 rounded-lg overflow-hidden border border-neutral-800 cursor-pointer hover:border-neutral-600 transition-colors"
                            onClick={() => navigate('/')}
                            title="Back to Home"
                        >
                            <img src="/InitClub.jpeg" alt="Init Club" className="w-full h-full object-contain" />
                        </div>

                        {user && (
                            <button onClick={() => { signOut(); navigate('/login'); }} title="Sign Out" className="text-neutral-600 hover:text-red-400 transition-colors">
                                <LogOut size={14} />
                            </button>
                        )}
                    </div>

                    <div className="space-y-1 flex-1 overflow-y-auto">
                        <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-wide mb-2">Layout</p>
                        <PaletteItem type="Navbar" />
                        <PaletteItem type="Footer" />
                        <PaletteItem type="Section" />
                        <div className="h-px bg-neutral-900 my-3"></div>
                        <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-wide mb-2">Elements</p>
                        <PaletteItem type="Text" />
                        <PaletteItem type="Button" />
                        <PaletteItem type="Image" />
                        <PaletteItem type="Card" />
                    </div>

                    {user && (
                        <div className="pt-4 mt-4 border-t border-neutral-900">
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 bg-white text-black py-2 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors"
                            >
                                <Share2 size={12} />
                                Share
                            </button>
                        </div>
                    )}
                </aside>

                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Admin Toolbar */}
                    {user && (
                        <div className="bg-neutral-950 border-b border-neutral-900 text-white px-4 py-2 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors"
                                >
                                    <ChevronLeft size={14} /> <span className="hidden sm:inline">Back</span>
                                </button>
                                <span className="text-sm font-semibold text-neutral-300 ml-2 hidden md:inline-block border-l border-neutral-800 pl-4 h-4 leading-4">
                                    {sessionName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCanEdit(!canEdit)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${canEdit ? 'bg-neutral-800 text-white' : 'bg-neutral-900 text-neutral-500'}`}
                                >
                                    {canEdit ? <Edit2 size={12} /> : <Eye size={12} />}
                                    {canEdit ? 'Edit' : 'View'}
                                </button>
                                <button
                                    onClick={terminateSession}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 hover:bg-red-900/20 rounded-lg text-xs font-medium transition-all"
                                >
                                    <Trash2 size={12} /> <span className="hidden sm:inline">Delete</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Canvas */}
                    <main className="flex-1 overflow-y-auto relative bg-black">
                        <Canvas
                            components={layout}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onUpdateContent={updateContent}
                            onUpdateStyles={updateStyles}
                            onUpdateImageSrc={updateImageSrc}
                            onDelete={deleteComponent}
                            onMoveUp={(id) => moveComponent(id, 'up')}
                            onMoveDown={(id) => moveComponent(id, 'down')}
                            onBringForward={bringForward}
                            onSendBackward={sendBackward}
                            isViewMode={!canEdit}
                        />
                    </main>

                    {/* Mobile Bottom Navigation */}
                    {canEdit && (
                        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-800 flex items-center justify-around p-3 z-50 safe-area-bottom">
                            <button
                                onClick={() => {
                                    setIsLeftSidebarOpen(!isLeftSidebarOpen);
                                    setIsRightSidebarOpen(false);
                                }}
                                className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${isLeftSidebarOpen ? 'text-white' : 'text-neutral-500'}`}
                            >
                                <Menu size={20} />
                                Elements
                            </button>
                            <button
                                onClick={() => {
                                    setIsRightSidebarOpen(!isRightSidebarOpen);
                                    setIsLeftSidebarOpen(false);
                                }}
                                className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${isRightSidebarOpen ? 'text-white' : 'text-neutral-500'}`}
                            >
                                <Layers size={20} />
                                Layers
                            </button>
                        </div>
                    )}
                </div>

                {/* Layer Panel - Hidden on mobile, Drawer on Desktop */}
                {/* Mobile Overlay for Right Sidebar */}
                {isRightSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsRightSidebarOpen(false)}
                    />
                )}

                {canEdit && (
                    <div className={`fixed inset-y-0 right-0 z-40 w-64 bg-neutral-950 border-l border-neutral-900 transition-transform duration-300 md:relative md:translate-x-0 ${isRightSidebarOpen ? 'translate-x-0' : 'max-md:translate-x-full'}`}>
                        <LayerPanel
                            components={layout}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onReorder={(oldIdx, newIdx) => {
                                // Swap zIndex values
                                const sorted = [...layout].sort((a, b) => (b.styles.zIndex || 0) - (a.styles.zIndex || 0));
                                const comp = sorted[oldIdx];
                                const target = sorted[newIdx];
                                if (comp && target) {
                                    updateStyles(comp.id, { ...comp.styles, zIndex: target.styles.zIndex });
                                    updateStyles(target.id, { ...target.styles, zIndex: comp.styles.zIndex });
                                }
                            }}
                        />
                        <ShareModal
                            isOpen={isShareModalOpen}
                            onClose={() => setIsShareModalOpen(false)}
                            sessionId={sessionId || ''}
                        />
                    </div>
                )}
            </div>
        </DndContext>
    );
}
