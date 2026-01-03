import type { UIComponent } from '../types/builder';

interface Props {
    component: UIComponent;
    isSelected: boolean;
    onClick: () => void;
}

export function RenderNode({ component, isSelected, onClick }: Props) {
    const baseStyles = "relative transition-all duration-200";
    const widthStyles = component.type === 'Button' || component.type === 'MemberCard' ? 'w-fit' : 'w-full';
    const selectionStyles = isSelected
        ? "ring-1 ring-white ring-offset-2 ring-offset-black"
        : "hover:ring-1 hover:ring-neutral-700 hover:ring-offset-1 hover:ring-offset-black";

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={component.styles}
            className={`${baseStyles} ${widthStyles} ${selectionStyles}`}
        >
            {component.type === 'Text' && (
                <div className="min-h-[1em] text-white">{component.content || 'Click to edit text'}</div>
            )}

            {component.type === 'Button' && (
                <button className="px-5 py-2 bg-white text-black rounded-lg font-medium text-sm pointer-events-none">
                    {component.content || 'Button'}
                </button>
            )}

            {component.type === 'Image' && (
                <div className="w-full h-32 bg-neutral-900 flex items-center justify-center border border-dashed border-neutral-800 text-neutral-600 rounded-lg">
                    <span className="text-xs uppercase tracking-wide font-medium">Image</span>
                </div>
            )}

            {component.type === 'Section' && (
                <div className="w-full min-h-[80px] border border-dashed border-neutral-800 rounded-lg flex items-center justify-center text-neutral-600 text-sm">
                    Section
                </div>
            )}

            {component.type === 'Hero' && (
                <div className="w-full text-center py-16 bg-neutral-900 rounded-lg border border-neutral-800 relative overflow-hidden">
                    <h1 className="text-3xl font-bold text-white mb-2">{component.content?.split('|')[0] || 'Build Something Epic'}</h1>
                    <p className="text-neutral-400">{component.content?.split('|')[1] || 'Open Source is the future.'}</p>
                </div>
            )}

            {component.type === 'MemberCard' && (
                <div className="w-56 p-5 bg-neutral-900 rounded-lg border border-neutral-800 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 mb-3 overflow-hidden border border-neutral-700">
                        <div className="w-full h-full bg-neutral-700"></div>
                    </div>
                    <h3 className="text-sm font-semibold text-white">{component.content?.split('|')[0] || 'Member Name'}</h3>
                    <p className="text-xs text-neutral-500 font-mono">{component.content?.split('|')[1] || 'Contributor'}</p>
                </div>
            )}

            {component.type === 'EventCard' && (
                <div className="w-full max-w-sm bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800">
                    <div className="h-24 bg-neutral-800 relative">
                        <div className="absolute top-2 right-2 bg-white text-black text-[10px] font-semibold px-2 py-0.5 rounded">UPCOMING</div>
                    </div>
                    <div className="p-4">
                        <h3 className="text-base font-semibold text-white mb-1">{component.content?.split('|')[0] || 'Hackathon 2024'}</h3>
                        <p className="text-xs text-neutral-500 mb-3">Join us for 48 hours of coding.</p>
                        <button className="w-full py-2 bg-neutral-800 text-white rounded-lg font-medium text-xs pointer-events-none">
                            RSVP
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}