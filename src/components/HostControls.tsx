import { QRCodeSVG } from 'qrcode.react';
import { Users, Share2 } from 'lucide-react';

interface Props {
    sessionId: string;
    participants: any[];
}

export function HostControls({ sessionId, participants }: Props) {
    const shareUrl = `${window.location.origin}?session=${sessionId}`;

    return (
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                    {participants.map((p, i) => (
                        <div
                            key={i}
                            title={p.name}
                            className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold uppercase"
                        >
                            {p.name.charAt(0)}
                        </div>
                    ))}
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Users size={14} /> {participants.length} Active
                </span>
            </div>

            <div className="flex items-center gap-3">
                {/* QR Popover */}
                <div className="group relative">
                    <button className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all">
                        <Share2 size={14} /> Invite Participants
                    </button>
                    <div className="hidden group-hover:block absolute right-0 mt-2 p-4 bg-white shadow-2xl rounded-xl border border-slate-100 z-50 w-64">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Scan to Join</p>
                        <div className="bg-white p-2 border border-slate-100 rounded-lg flex justify-center">
                            <QRCodeSVG value={shareUrl} size={180} />
                        </div>
                        <input
                            readOnly
                            value={shareUrl}
                            className="w-full mt-3 p-2 bg-slate-50 border rounded text-[10px] text-slate-400 font-mono cursor-pointer"
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}