import { Trash2, Lock, ShieldCheck, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
    sessionId: string;
    onClearCanvas: () => void;
}

export function AdminPanel({ sessionId, onClearCanvas }: Props) {
    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="p-4 bg-blue-50 border-t border-blue-100 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    <ShieldCheck size={14} /> Admin Controls
                </span>
                <button
                    onClick={handleSignOut}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    title="Sign Out"
                >
                    <LogOut size={14} />
                </button>
            </div>

            {/* Using the sessionId here to resolve the TS warning */}
            <div className="mb-4">
                <p className="text-[9px] text-blue-400 uppercase font-bold mb-1">Active Session ID</p>
                <p className="text-[10px] font-mono text-blue-800 bg-blue-100/50 p-1.5 rounded truncate">
                    {sessionId}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <button
                    onClick={() => {
                        if (confirm("This will clear the canvas for EVERYONE. Are you sure?")) {
                            onClearCanvas();
                        }
                    }}
                    className="flex items-center justify-center gap-2 w-full p-3 bg-white border border-red-100 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-all shadow-sm active:scale-95"
                >
                    <Trash2 size={14} /> Reset Canvas for All
                </button>

                <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full p-3 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed opacity-60"
                >
                    <Lock size={14} /> Freeze Session
                </button>
            </div>
        </div>
    );
}