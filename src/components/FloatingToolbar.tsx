import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronUp, ChevronDown, Settings, Layers, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import type { UIComponent } from '../types/builder';
import { ColorPicker } from './ColorPicker';

interface Props {
    component: UIComponent;
    onUpdateStyles: (id: string, styles: any) => void;
    onDelete: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    onBringForward?: (id: string) => void;
    onSendBackward?: (id: string) => void;
    isFreeMove?: boolean;
}

export function FloatingToolbar({
    component,
    onUpdateStyles,
    onDelete,
    onMoveUp,
    onMoveDown,
    onBringForward,
    onSendBackward,
    isFreeMove
}: Props) {
    const [showStyles, setShowStyles] = useState(false);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-2 right-2 z-[100] flex items-center gap-1 bg-neutral-900/95 backdrop-blur-sm border border-neutral-700 rounded-lg p-1 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Stack order for non-free-move elements */}
                {!isFreeMove && (
                    <>
                        <button
                            onClick={() => onMoveUp(component.id)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                            title="Move up"
                        >
                            <ChevronUp size={14} />
                        </button>
                        <button
                            onClick={() => onMoveDown(component.id)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                            title="Move down"
                        >
                            <ChevronDown size={14} />
                        </button>
                        <div className="w-px h-4 bg-neutral-700"></div>
                    </>
                )}

                {/* Layer controls for free-move elements */}
                {isFreeMove && onBringForward && onSendBackward && (
                    <>
                        <button
                            onClick={() => onBringForward(component.id)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                            title="Bring forward"
                        >
                            <ArrowUp size={14} />
                        </button>
                        <button
                            onClick={() => onSendBackward(component.id)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                            title="Send backward"
                        >
                            <ArrowDown size={14} />
                        </button>
                        <div className="w-px h-4 bg-neutral-700"></div>
                    </>
                )}

                {/* Style toggle */}
                <button
                    onClick={() => setShowStyles(!showStyles)}
                    className={`p-1.5 rounded transition-colors ${showStyles ? 'text-white bg-neutral-700' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                    title="Style options"
                >
                    <Settings size={14} />
                </button>

                <div className="w-px h-4 bg-neutral-700"></div>

                {/* Delete */}
                <button
                    onClick={() => onDelete(component.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            </motion.div>

            {/* Style panel */}
            {showStyles && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-12 right-2 z-[100] bg-neutral-900/95 backdrop-blur-sm border border-neutral-700 rounded-lg p-3 shadow-xl w-56"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-neutral-500 block mb-1">Padding</label>
                                <input
                                    type="text"
                                    value={component.styles.padding || ''}
                                    onChange={(e) => onUpdateStyles(component.id, { padding: e.target.value })}
                                    placeholder="0px"
                                    className="w-full p-1.5 bg-black border border-neutral-700 rounded text-white text-xs"
                                />
                            </div>
                            <div>
                                <label className="text-neutral-500 block mb-1">Radius</label>
                                <input
                                    type="text"
                                    value={component.styles.borderRadius || ''}
                                    onChange={(e) => onUpdateStyles(component.id, { borderRadius: e.target.value })}
                                    placeholder="0px"
                                    className="w-full p-1.5 bg-black border border-neutral-700 rounded text-white text-xs"
                                />
                            </div>
                        </div>

                        <ColorPicker
                            label="Background"
                            value={component.styles.backgroundColor || '#000000'}
                            onChange={(color) => onUpdateStyles(component.id, { backgroundColor: color })}
                        />

                        <ColorPicker
                            label="Text Color"
                            value={component.styles.color || '#ffffff'}
                            onChange={(color) => onUpdateStyles(component.id, { color: color })}
                        />
                    </div>

                    {/* Layer indicator for free-move */}
                    {isFreeMove && (
                        <div className="mt-2 pt-2 border-t border-neutral-800 flex items-center gap-2 text-xs text-neutral-500">
                            <Layers size={12} />
                            <span>Layer: {component.styles.zIndex || 1}</span>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
