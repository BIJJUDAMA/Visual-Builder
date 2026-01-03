import { useDroppable } from '@dnd-kit/core';
import type { UIComponent } from '../types/builder';
import { RenderNode } from './RenderNode';

interface CanvasProps {
    components: UIComponent[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function Canvas({ components, selectedId, onSelect }: CanvasProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'main-canvas',
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-full p-8 flex flex-col items-center transition-colors duration-200 ${isOver ? 'bg-neutral-900/50' : 'bg-black'}`}
            onClick={() => onSelect('')}
        >
            {/* Artboard */}
            <div
                className="w-full max-w-3xl min-h-[800px] bg-neutral-950 rounded-lg p-6 ring-1 ring-neutral-900 transition-all flex flex-col gap-2"
            >
                {/* Empty State */}
                {components.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-lg text-neutral-600 py-20">
                        <svg
                            className="w-10 h-10 mb-4 opacity-30"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="font-medium text-sm">Drop components here</p>
                        <p className="text-xs opacity-60 mt-1">Drag from the left panel</p>
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

                {/* Drop Indicator */}
                {isOver && (
                    <div className="border border-neutral-600 border-dashed rounded-lg h-16 flex items-center justify-center">
                        <span className="text-neutral-500 text-xs font-medium">Release to drop</span>
                    </div>
                )}
            </div>
        </div>
    );
}