import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Layout, LogOut, ChevronRight } from 'lucide-react';
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
            // Requires 'owner_id' column in 'page_sessions'
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
        setCreating(true);

        const newId = uuidv4();
        const { error } = await supabase.from('page_sessions').insert({
            id: newId,
            owner_id: user.id,
            layout: [], // Start empty
        });

        if (error) {
            console.error('Error creating session:', error);
            alert('Failed to create session. Please check database permissions.');
            setCreating(false);
        } else {
            navigate(`/s/${newId}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        B
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-400 hidden sm:block">
                        {user?.email}
                    </span>
                    <button
                        onClick={() => signOut()}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 sm:p-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Your Sessions</h1>
                    <button
                        onClick={createSession}
                        disabled={creating}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} />
                        {creating ? 'Creating...' : 'New Session'}
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400">
                            <Layout size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 mb-1">No sessions yet</h3>
                        <p className="text-slate-500 mb-6">Create your first layout to get started.</p>
                        <button
                            onClick={createSession}
                            disabled={creating}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Create a Project
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => navigate(`/s/${session.id}`)}
                                className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                                        <Layout size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">Untitled Session</p>
                                        <p className="text-xs text-slate-400 font-mono">ID: {session.id.slice(0, 8)}...</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-slate-300 group-hover:text-blue-500 transition-colors">
                                    <span className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Open Editor</span>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
