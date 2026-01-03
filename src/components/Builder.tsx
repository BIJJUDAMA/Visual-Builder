import { useState, useEffect, useCallback } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, LogOut, Eye, Edit2, Trash2, ChevronLeft } from 'lucide-react';
import { PaletteItem } from './PaletteItem';
import { Canvas } from './Canvas';
import { Inspector } from './Inspector';
import { ShareModal } from './ShareModal';

import type { UIComponent } from '../types/builder';
import type { MutationPayload } from '../types/supabase';
import { useRealtime } from '../hooks/useRealtime';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const MY_ID = uuidv4(); // Unique ID for this browser tab instance

export function Builder() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [layout, setLayout] = useState<UIComponent[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [canEdit, setCanEdit] = useState(true);


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
        if (!confirm("Are you sure you want to terminate this session? It will be permanently deleted for all users.")) return;

        // 1. Notify participants to leave
        if (sendMutation) { // Ensure hook is ready
            // We need to use 'as any' because Typescript might not pick up the new type immediately without restart
            // or we just cast it to satisfy the compiler if it's strictly typed
            await sendMutation({
                type: 'TERMINATE_SESSION' as any,
                data: null,
                actorId: MY_ID
            } as MutationPayload);
        }

        // 2. Delete the session
        const { error } = await supabase.from('page_sessions').delete().eq('id', sessionId);
        if (error) {
            alert("Failed to terminate session.");
            console.error(error);
        } else {
            navigate('/dashboard'); // Admin goes to dashboard
        }
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
                    .select('layout')
                    .eq('id', sessionId)
                    .single();

                if (data) setLayout(data.layout || []);
            } catch (err) {
                console.error("Failed to load session", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadInitialState();
    }, [sessionId]);

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
                        c.id === payload.id ? { ...c, content: payload.data } : c
                    );
                case 'DELETE_COMPONENT':
                    return prev.filter((c) => c.id !== payload.id);
                case 'TERMINATE_SESSION' as any:
                    alert("The host has terminated this session.");
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
            const newComponent: UIComponent = {
                id: `node-${uuidv4().slice(0, 8)}`,
                type,
                content: `New ${type}`,
                styles: { padding: '20px', marginTop: '10px', backgroundColor: '#ffffff' }
            };

            // Custom defaults for Club Components
            if (active.data.current?.type === 'Hero') {
                newComponent.styles = { width: '100%', marginBottom: '20px' };
                newComponent.content = "Build Something Epic|Open Source is the future.";
            }
            if (active.data.current?.type === 'MemberCard') {
                newComponent.styles = { display: 'inline-block', margin: '10px' };
                newComponent.content = "Member Name|Core Contributor";
            }
            if (active.data.current?.type === 'EventCard') {
                newComponent.styles = { width: '100%', maxWidth: '400px', margin: '10px auto' };
                newComponent.content = "Hackathon 2024|Join us for 48 hours of coding.";
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

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    if (isLoading) return <div className="h-screen w-full flex items-center justify-center font-mono bg-black text-neutral-600">Loading...</div>;

    const selectedComponent = layout.find((c) => c.id === selectedId) || null;

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex h-screen w-full bg-black overflow-hidden">

                {/* Palette */}
                <aside className={`w-56 bg-neutral-950 border-r border-neutral-900 p-4 flex flex-col transition-all duration-300 ${!canEdit ? 'hidden' : ''}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="w-7 h-7 rounded-lg overflow-hidden border border-neutral-800">
                            <img src="/InitClub.jpeg" alt="Init Club" className="w-full h-full object-contain" />
                        </div>

                        {user && (
                            <button onClick={() => { signOut(); navigate('/login'); }} title="Sign Out" className="text-neutral-600 hover:text-red-400 transition-colors">
                                <LogOut size={14} />
                            </button>
                        )}
                    </div>

                    <div className="space-y-1 flex-1 overflow-y-auto">
                        <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-wide mb-2">Elements</p>
                        <PaletteItem type="Section" />
                        <PaletteItem type="Text" />
                        <PaletteItem type="Button" />
                        <PaletteItem type="Image" />
                        <div className="h-px bg-neutral-900 my-3"></div>
                        <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-wide mb-2">Templates</p>
                        <PaletteItem type="Hero" />
                        <PaletteItem type="MemberCard" />
                        <PaletteItem type="EventCard" />
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
                                    <ChevronLeft size={14} /> Back
                                </button>
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
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Canvas */}
                    <main className="flex-1 overflow-y-auto relative bg-black p-6">
                        <div className="min-h-full flex justify-center">
                            <Canvas
                                components={layout}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                            />
                        </div>
                    </main>
                </div>

                {/* Inspector */}
                <aside className="w-72 bg-neutral-950 border-l border-neutral-900">
                    <Inspector
                        selectedComponent={selectedComponent}
                        updateStyles={updateStyles}
                        updateContent={updateContent}
                        readOnly={!canEdit}
                    />
                </aside>

                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    sessionId={sessionId || ''}
                />

            </div>
        </DndContext>
    );
}
