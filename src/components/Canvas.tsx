import { useDroppable } from '@dnd-kit/core';
import type { UIComponent } from '../types/builder';
import { RenderNode } from './RenderNode';

interface CanvasProps {
    components: UIComponent[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function Canvas({ components, selectedId, onSelect }: CanvasProps) {
    // This hook registers this div as a valid drop target for dnd-kit
    const { setNodeRef, isOver } = useDroppable({
        id: 'main-canvas',
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-full p-12 flex flex-col items-center transition-colors duration-200 ${isOver ? 'bg-blue-50/50' : 'bg-slate-100'
                }`}
            onClick={() => onSelect('')} // Deselects when clicking the background
        >
            {/* The "Artboard" or Page Page Sheet */}
            <div
                className="w-full max-w-4xl min-h-[842px] bg-white shadow-2xl rounded-sm p-8 ring-1 ring-slate-200 transition-all flex flex-col gap-2"
            >
                {/* Empty State UI */}
                {components.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 py-20">
                        <svg
                            className="w-12 h-12 mb-4 opacity-20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="font-medium">Drop components here</p>
                        <p className="text-xs opacity-60">Select from the left palette</p>
                    </div>
                )}

                {/* Component Mapping */}
                {components.map((comp) => (
                    <RenderNode
                        key={comp.id}
                        component={comp}
                        isSelected={selectedId === comp.id}
                        onClick={() => onSelect(comp.id)}
                    />
                ))}

                {/* Indicator when dragging over */}
                {isOver && (
                    <div className="border-2 border-blue-400 border-dashed rounded-lg h-20 animate-pulse bg-blue-50 flex items-center justify-center">
                        <span className="text-blue-500 text-sm font-bold uppercase tracking-widest">Release to Drop</span>
                    </div>
                )}
            </div>
        </div>
    );
}