import type { UIComponent } from '../types/builder';

interface Props {
    component: UIComponent;
    isSelected: boolean;
    onClick: () => void;
}

export function RenderNode({ component, isSelected, onClick }: Props) {
    const baseStyles = "relative transition-all duration-200";
    const widthStyles = component.type === 'Button' ? 'w-fit' : 'w-full';
    const selectionStyles = isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "hover:outline hover:outline-2 hover:outline-blue-200 hover:outline-offset-1";

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={component.styles}
            className={`${baseStyles} ${widthStyles} ${selectionStyles}`}
        >
            {component.type === 'Text' && (
                <div className="min-h-[1em]">{component.content || 'Click to edit text'}</div>
            )}

            {component.type === 'Button' && (
                <button className="px-6 py-2 bg-slate-900 text-white rounded pointer-events-none">
                    {component.content || 'Button'}
                </button>
            )}

            {component.type === 'Image' && (
                <div className="w-full h-40 bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400">
                    <span className="text-xs uppercase tracking-widest font-bold">Image</span>
                </div>
            )}

            {component.type === 'Section' && (
                <div className="w-full min-h-[100px] border-2 border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300">
                    Empty Section
                </div>
            )}
        </div>
    );
}