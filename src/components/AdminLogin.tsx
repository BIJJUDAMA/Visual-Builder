import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';

export function AdminLogin({ onAuthenticated }: { onAuthenticated: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);



        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) showToast(error.message, 'error');
        else onAuthenticated();
        setLoading(false);
    };

    return (
        <div className="p-6 border-t border-slate-200 bg-slate-50 mt-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Admin Access</h3>
            <form onSubmit={handleLogin} className="space-y-2">
                <input
                    type="email"
                    placeholder="Admin Email"
                    className="w-full p-2 text-xs border rounded"
                    value={email} onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 text-xs border rounded"
                    value={password} onChange={e => setPassword(e.target.value)}
                />
                <button
                    disabled={loading}
                    className="w-full bg-slate-900 text-white p-2 rounded text-xs font-bold hover:bg-black transition-all"
                >
                    {loading ? 'Authenticating...' : 'Unlock Admin Panel'}
                </button>
            </form>
        </div>
    );
}