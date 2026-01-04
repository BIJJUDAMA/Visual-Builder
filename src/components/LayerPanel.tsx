import { motion } from 'framer-motion';
import { Layers, GripVertical, Type, Image, Square, MousePointer2, LayoutTemplate, Navigation, Menu } from 'lucide-react';
import type { UIComponent } from '../types/builder';

interface Props {
    components: UIComponent[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onReorder: (oldIndex: number, newIndex: number) => void;
}

const typeIcons: Record<string, any> = {
    Text: Type,
    Image: Image,
    Button: MousePointer2,
    Section: LayoutTemplate,
    Card: Square,
    Navbar: Navigation,
    Footer: Menu,
};

export function LayerPanel({ components, selectedId, onSelect, onReorder }: Props) {
    // Sort by zIndex descending (highest on top)
    const sortedComponents = [...components].sort((a, b) => (b.styles.zIndex || 0) - (a.styles.zIndex || 0));

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('layerIndex', index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('layerIndex'));
        if (dragIndex !== dropIndex) {
            onReorder(dragIndex, dropIndex);
        }
    };

    return (
        <div className="w-48 bg-neutral-950 border-l border-neutral-900 flex flex-col">
            <div className="p-3 border-b border-neutral-900 flex items-center gap-2">
                <Layers size={14} className="text-neutral-500" />
                <span className="text-xs font-semibold text-neutral-400">Layers</span>
                <span className="ml-auto text-[10px] text-neutral-600">{components.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sortedComponents.length === 0 ? (
                    <div className="text-center text-neutral-600 text-xs py-8">
                        No elements yet
                    </div>
                ) : (
                    sortedComponents.map((comp, index) => {
                        const Icon = typeIcons[comp.type] || Square;
                        const isSelected = comp.id === selectedId;

                        return (
                            <motion.div
                                key={comp.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e as any, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e as any, index)}
                                onClick={() => onSelect(comp.id)}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group ${isSelected
                                    ? 'bg-white/10 text-white'
                                    : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-300'
                                    }`}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <GripVertical size={12} className="opacity-0 group-hover:opacity-50 cursor-grab" />
                                <Icon size={12} />
                                <span className="text-xs truncate flex-1">
                                    {comp.content?.split('|')[0]?.slice(0, 15) || comp.type}
                                </span>
                                <span className="text-[9px] text-neutral-600">
                                    {comp.styles.zIndex || 1}
                                </span>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
