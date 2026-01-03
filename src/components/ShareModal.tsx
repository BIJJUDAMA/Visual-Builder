import { QRCodeSVG } from 'qrcode.react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string;
}

export function ShareModal({ isOpen, onClose, sessionId }: Props) {
    if (!isOpen) return null;

    const shareUrl = `${window.location.origin}/s/${sessionId}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Share Session</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        ✕
                    </button>
                </header>

                <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white border border-slate-200 rounded">
                        <QRCodeSVG value={shareUrl} size={200} />
                    </div>

                    <div className="w-full">
                        <p className="text-xs text-slate-500 mb-1 uppercase font-bold">Session Link</p>
                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={shareUrl}
                                className="flex-1 bg-slate-50 text-xs p-2 rounded border border-slate-200 text-slate-600 font-mono"
                            />
                            <button
                                onClick={() => navigator.clipboard.writeText(shareUrl)}
                                className="px-3 py-1 bg-slate-800 text-white text-xs rounded hover:bg-slate-700"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 text-center">
                        Participants can scan this QR code or use the link to join.
                    </p>
                </div>
            </div>
        </div>
    );
}
