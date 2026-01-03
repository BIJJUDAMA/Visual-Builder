import { useDraggable } from '@dnd-kit/core';
import { Type, Square, Image as ImageIcon, MousePointer2 } from 'lucide-react';

export function PaletteItem({ type }: { type: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `palette-${type}`,
        data: { type }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className="flex items-center gap-3 p-3 mb-2 bg-white border border-slate-200 rounded-lg shadow-sm cursor-grab hover:border-blue-500 hover:text-blue-600 transition-all z-50"
        >
            {type === 'Text' && <Type size={18} />}
            {type === 'Button' && <MousePointer2 size={18} />}
            {type === 'Image' && <ImageIcon size={18} />}
            {type === 'Section' && <Square size={18} />}
            <span className="text-sm font-medium">{type}</span>
        </div>
    );
}