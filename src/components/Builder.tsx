import { useState, useEffect, useCallback } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, LogOut } from 'lucide-react';

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

    // Validate Session ID
    useEffect(() => {
        if (!sessionId) {
            // Should not happen due to routing, but safe fallback
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
                <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-8">

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

                {/* Canvas */}
                <main className="flex-1 overflow-y-auto relative bg-slate-100">
                    <Canvas
                        components={layout}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />
                </main>

                {/* Inspector */}
                <aside className="w-80 bg-white border-l border-slate-200">
                    <Inspector
                        selectedComponent={selectedComponent}
                        updateStyles={updateStyles}
                        updateContent={updateContent}
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
