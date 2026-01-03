import { Link } from 'react-router-dom';
import { ArrowRight, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-black font-sans text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <div className="mb-8 p-1 rounded-2xl inline-block overflow-hidden border border-neutral-800">
                    <img src="/InitClub.jpeg" alt="Init Club Logo" className="w-20 h-20 object-contain rounded-xl" />
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-white">
                    Init Club
                </h1>

                <p className="max-w-sm mx-auto text-base text-neutral-500 mb-10 leading-relaxed font-mono">
                    Build together. Ship faster. Open source.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-none justify-center">
                    {user ? (
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                to="/dashboard"
                                className="px-6 py-2.5 bg-white text-black rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
                            >
                                Dashboard <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                to="/login"
                                className="px-6 py-2.5 bg-white text-black rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
                            >
                                Get Started <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    )}
                </div>

                <div className="mt-16 flex items-center gap-2 text-neutral-600 text-xs font-mono">
                    <Github size={14} />
                    <span>Open Source Contribution</span>
                </div>
            </motion.div>
        </div>
    );
}
