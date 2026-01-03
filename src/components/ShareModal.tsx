import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string;
}

export function ShareModal({ isOpen, onClose, sessionId }: Props) {
    const shareUrl = `${window.location.origin}/s/${sessionId}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-neutral-950 p-6 rounded-xl max-w-sm w-full mx-4 border border-neutral-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="flex justify-between items-center mb-6">
                            <h2 className="text-base font-semibold text-white">Share Project</h2>
                            <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </header>

                        <div className="flex flex-col items-center space-y-5">
                            <div className="p-4 bg-white rounded-lg">
                                <QRCodeSVG value={shareUrl} size={180} />
                            </div>

                            <div className="w-full">
                                <p className="text-xs text-neutral-500 mb-2 uppercase font-medium tracking-wide">Project Link</p>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={shareUrl}
                                        className="flex-1 bg-black text-xs p-2.5 rounded-lg border border-neutral-800 text-neutral-400 font-mono"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigator.clipboard.writeText(shareUrl)}
                                        className="px-4 py-2 bg-white text-black text-xs rounded-lg font-semibold"
                                    >
                                        Copy
                                    </motion.button>
                                </div>
                            </div>

                            <p className="text-xs text-neutral-600 text-center">
                                Scan or share the link to collaborate
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
