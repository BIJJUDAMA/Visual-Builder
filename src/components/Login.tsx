import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-sm p-6"
            >
                <Link to="/" className="inline-flex items-center gap-2 text-neutral-600 text-sm mb-8 hover:text-white transition-colors">
                    <ArrowLeft size={14} /> Back
                </Link>

                <h1 className="text-2xl font-semibold text-white mb-1">Sign in</h1>
                <p className="text-neutral-500 text-sm mb-8">Welcome back to Init Club.</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/10 text-red-400 rounded text-sm border border-red-900/30 font-mono">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-neutral-600 outline-none placeholder:text-neutral-700"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:border-neutral-600 outline-none placeholder:text-neutral-700"
                            placeholder="••••••••"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-3 rounded-lg font-semibold text-sm disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Signing in...' : 'Continue'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
