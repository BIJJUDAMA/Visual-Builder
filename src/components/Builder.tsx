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
    const terminateSession = async () => {
        if (!sessionId || !user) return;
        if (!confirm("Are you sure you want to terminate this session? It will be permanently deleted.")) return;

        const { error } = await supabase.from('page_sessions').delete().eq('id', sessionId);
        if (error) {
            alert("Failed to terminate session.");
            console.error(error);
        } else {
            navigate('/');
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
                default:
                    return prev;
            }
        });
    }, []);

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

    if (isLoading) return <div className="h-screen w-full flex items-center justify-center font-mono bg-slate-50 text-slate-500">Loading Session...</div>;

    const selectedComponent = layout.find((c) => c.id === selectedId) || null;

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex h-screen w-full bg-slate-100 overflow-hidden">

                {/* Palette */}
                <aside className={`w-64 bg-white border-r border-slate-200 p-4 flex flex-col transition-all duration-300 ${!canEdit ? 'hidden' : ''}`}>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-xs font-black uppercase tracking-widest text-blue-600">Builder Pro</h1>

                        {/* Sign Out */}
                        {user && (
                            <button onClick={() => { signOut(); navigate('/login'); }} title="Sign Out" className="text-slate-400 hover:text-red-500">
                                <LogOut size={14} />
                            </button>
                        )}
                    </div>

                    <div className="space-y-2 flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Elements</p>
                        <PaletteItem type="Section" />
                        <PaletteItem type="Text" />
                        <PaletteItem type="Button" />
                        <PaletteItem type="Image" />
                    </div>

                    {/* Share Button */}
                    {user && (
                        <div className="pt-4 mt-4 border-t border-slate-100">
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded text-xs font-bold uppercase tracking-wide hover:bg-slate-800 transition-colors"
                            >
                                <Share2 size={14} />
                                Share Session
                            </button>
                        </div>
                    )}
                </aside>

                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Admin Toolbar */}
                    {user && (
                        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between shadow-md z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/')}
                                    className="flex items-center gap-2 text-xs font-bold hover:text-blue-300 transition-colors"
                                >
                                    <ChevronLeft size={14} /> Dashboard
                                </button>
                                <div className="h-4 w-px bg-slate-700 mx-2"></div>
                                <span className="text-xs font-mono text-slate-400">Admin Controls</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setCanEdit(!canEdit)}
                                    className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors ${canEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                                >
                                    {canEdit ? <Edit2 size={12} /> : <Eye size={12} />}
                                    {canEdit ? 'Editing Enabled' : 'View Only Mode'}
                                </button>
                                <button
                                    onClick={terminateSession}
                                    className="flex items-center gap-2 px-3 py-1 bg-red-900/50 text-red-200 hover:bg-red-900 hover:text-white rounded text-xs font-bold transition-all border border-red-900"
                                >
                                    <Trash2 size={12} /> Terminate
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Canvas */}
                    <main className="flex-1 overflow-y-auto relative bg-slate-100 p-8">
                        {/* Centered logic handled by Canvas component via props mostly, keeping it simple here */}
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
                <aside className="w-80 bg-white border-l border-slate-200">
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
