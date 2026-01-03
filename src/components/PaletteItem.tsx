import { useDraggable } from '@dnd-kit/core';
import { Type, Square, Image as ImageIcon, MousePointer2, Star, User, Calendar } from 'lucide-react';

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
            className="flex items-center gap-3 p-2.5 mb-1.5 bg-neutral-900 border border-neutral-800 rounded-lg cursor-grab hover:border-neutral-600 hover:bg-neutral-800 transition-all text-neutral-400 hover:text-white text-sm"
        >
            {type === 'Text' && <Type size={16} />}
            {type === 'Button' && <MousePointer2 size={16} />}
            {type === 'Image' && <ImageIcon size={16} />}
            {type === 'Section' && <Square size={16} />}
            {type === 'Hero' && <Star size={16} />}
            {type === 'MemberCard' && <User size={16} />}
            {type === 'EventCard' && <Calendar size={16} />}
            <span className="font-medium">{type}</span>
        </div>
    );
}