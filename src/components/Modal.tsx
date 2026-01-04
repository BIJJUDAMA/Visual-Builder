import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface ModalContextType {
    showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
    showPrompt: (message: string, defaultValue: string, onSubmit: (value: string) => void, title?: string) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within ModalProvider');
    return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
    const [confirmState, setConfirmState] = useState<{ message: string; onConfirm: () => void; title?: string } | null>(null);
    const [promptState, setPromptState] = useState<{ message: string; defaultValue: string; onSubmit: (value: string) => void; title?: string } | null>(null);
    const [promptValue, setPromptValue] = useState('');

    const showConfirm = useCallback((message: string, onConfirm: () => void, title?: string) => {
        setConfirmState({ message, onConfirm, title });
    }, []);

    const showPrompt = useCallback((message: string, defaultValue: string, onSubmit: (value: string) => void, title?: string) => {
        setPromptValue(defaultValue);
        setPromptState({ message, defaultValue, onSubmit, title });
    }, []);

    const closeConfirm = () => setConfirmState(null);
    const closePrompt = () => setPromptState(null);

    const handleConfirm = () => {
        confirmState?.onConfirm();
        closeConfirm();
    };

    const handlePromptSubmit = () => {
        if (promptValue.trim()) {
            promptState?.onSubmit(promptValue);
        }
        closePrompt();
    };

    return (
        <ModalContext.Provider value={{ showConfirm, showPrompt }}>
            {children}

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmState && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
                        onClick={closeConfirm}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-neutral-800 rounded-lg">
                                    <AlertTriangle size={20} className="text-neutral-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold mb-2">{confirmState.title || 'Confirm'}</h3>
                                    <p className="text-neutral-400 text-sm">{confirmState.message}</p>
                                </div>
                                <button onClick={closeConfirm} className="text-neutral-500 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={closeConfirm}
                                    className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="px-4 py-2 text-sm font-medium bg-white hover:bg-neutral-200 text-black rounded-lg transition-colors"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Prompt Modal */}
            <AnimatePresence>
                {promptState && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
                        onClick={closePrompt}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-semibold">{promptState.title || 'Input'}</h3>
                                <button onClick={closePrompt} className="text-neutral-500 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                            <p className="text-neutral-400 text-sm mb-4">{promptState.message}</p>
                            <input
                                type="text"
                                value={promptValue}
                                onChange={(e) => setPromptValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmit()}
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-white transition-colors"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={closePrompt}
                                    className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePromptSubmit}
                                    className="px-4 py-2 text-sm font-medium bg-white hover:bg-neutral-200 text-black rounded-lg transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
}
