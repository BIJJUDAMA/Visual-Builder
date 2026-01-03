import { useState } from 'react';

export function ParticipantOverlay({ onJoin }: { onJoin: (name: string) => void }) {
    const [userName, setUserName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userName.trim()) {
            localStorage.setItem('builder_user_name', userName);
            onJoin(userName);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                <h2 className="text-2xl font-bold mb-2">Join Builder</h2>
                <p className="text-slate-500 mb-6">Please enter your name to start building together.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Your Name"
                        className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all text-center text-lg font-bold"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                        Start Building
                    </button>
                </form>
            </div>
        </div>
    );
}