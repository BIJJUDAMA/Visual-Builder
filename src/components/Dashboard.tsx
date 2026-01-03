import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Folder, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Session {
    id: string;
    created_at: string;
    name?: string;
}

export function Dashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!user) return;

        async function fetchSessions() {
            const { data, error } = await supabase
                .from('page_sessions')
                .select('*')
                .eq('owner_id', user!.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setSessions(data);
            }
            setLoading(false);
        }

        fetchSessions();
    }, [user]);

    const createSession = async () => {
        if (!user) return;

        const name = prompt("Enter a name for your session:", "Untitled Project");
        if (!name) return;

        setCreating(true);

        const newId = uuidv4();
        const { error } = await supabase.from('page_sessions').insert({
            id: newId,
            owner_id: user.id,
            name: name,
            layout: [],
        });

        if (error) {
            console.error('Error creating session:', error);
            alert('Failed to create session.');
            setCreating(false);
        } else {
            navigate(`/s/${newId}`);
        }
    };

    return (
        <div className="min-h-screen bg-black font-sans text-white">
            {/* Subtle grid background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>

            <header className="relative z-10 border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-neutral-800">
                        <img src="/InitClub.jpeg" alt="Init Club" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-sm font-semibold text-neutral-400">Dashboard</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-neutral-600 hidden sm:block">
                        {user?.email}
                    </span>
                    <button
                        onClick={() => signOut()}
                        className="text-neutral-500 hover:text-red-400 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            <main className="relative z-10 max-w-3xl mx-auto p-6 sm:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-between mb-8"
                >
                    <h1 className="text-xl font-semibold text-white">Your Projects</h1>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={createSession}
                        disabled={creating}
                        className="bg-white text-black px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-50"
                    >
                        <Plus size={14} />
                        {creating ? 'Creating...' : 'New Project'}
                    </motion.button>
                </motion.div>

                {loading ? (
                    <div className="text-center py-20 text-neutral-600 font-mono text-sm">Loading...</div>
                ) : sessions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 border border-dashed border-neutral-800 rounded-xl"
                    >
                        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900 text-neutral-600">
                            <Folder size={24} />
                        </div>
                        <h3 className="text-base font-medium text-neutral-400 mb-1">No projects yet</h3>
                        <p className="text-neutral-600 text-sm mb-6">Create your first project to get started.</p>
                        <button
                            onClick={createSession}
                            disabled={creating}
                            className="text-white font-semibold hover:underline text-sm"
                        >
                            Create a Project →
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid gap-3">
                        {sessions.map((session, index) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                onClick={() => navigate(`/s/${session.id}`)}
                                className="group bg-neutral-950 p-4 rounded-lg border border-neutral-900 hover:border-neutral-700 transition-all cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 bg-neutral-900 text-neutral-500 rounded-lg flex items-center justify-center">
                                        <Folder size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-200 text-sm">{session.name || 'Untitled Project'}</p>
                                        <p className="text-xs text-neutral-600 font-mono">{session.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-neutral-600 group-hover:text-white transition-colors">
                                    <ChevronRight size={16} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
