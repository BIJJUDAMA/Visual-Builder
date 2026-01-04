import { useDroppable } from '@dnd-kit/core';
import { useState, useRef } from 'react';
import type { UIComponent } from '../types/builder';
import { RenderNode } from './RenderNode';
import { FloatingToolbar } from './FloatingToolbar';

interface CanvasProps {
    components: UIComponent[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onUpdateContent: (id: string, content: string) => void;
    onUpdateStyles: (id: string, styles: any) => void;
    onUpdateImageSrc: (id: string, src: string) => void;
    onDelete: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    onBringForward: (id: string) => void;
    onSendBackward: (id: string) => void;
    isViewMode?: boolean;
}

export function Canvas({
    components,
    selectedId,
    onSelect,
    onUpdateContent,
    onUpdateStyles,
    onUpdateImageSrc,
    onDelete,
    onMoveUp,
    onMoveDown,
    onBringForward,
    onSendBackward,
    isViewMode = false
}: CanvasProps) {
    const { setNodeRef, isOver } = useDroppable({ id: 'main-canvas' });
    const canvasRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState<{ x: number; y: number; compX: number; compY: number } | null>(null);

    const selectedComponent = components.find(c => c.id === selectedId);

    // Handle drag start
    const handlePointerDown = (e: React.PointerEvent, comp: UIComponent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(comp.id);
        onSelect(comp.id);
        setDragStart({
            x: e.clientX,
            y: e.clientY,
            compX: comp.styles.x || 50,
            compY: comp.styles.y || 50
        });
    };

    // Handle drag move
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragging || !dragStart) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        const newX = Math.max(0, dragStart.compX + dx);
        const newY = Math.max(0, dragStart.compY + dy);
        onUpdateStyles(dragging, { x: newX, y: newY });
    };

    // Handle drag end with snap-to-grid
    const GRID_SIZE = 20;
    const handlePointerUp = () => {
        if (dragging) {
            // Snap to grid on release
            const comp = components.find(c => c.id === dragging);
            if (comp) {
                const snappedX = Math.round((comp.styles.x || 0) / GRID_SIZE) * GRID_SIZE;
                const snappedY = Math.round((comp.styles.y || 0) / GRID_SIZE) * GRID_SIZE;
                onUpdateStyles(dragging, { x: snappedX, y: snappedY });
            }
        }
        setDragging(null);
        setDragStart(null);
    };

    // Resize state
    const [resizing, setResizing] = useState<{ id: string; handle: string; startX: number; startY: number; startW: number; startH: number } | null>(null);

    const startResize = (e: React.PointerEvent, compId: string, handle: string, w: number, h: number) => {
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setResizing({ id: compId, handle, startX: e.clientX, startY: e.clientY, startW: w, startH: h });
    };

    const handleResizeMove = (e: React.PointerEvent) => {
        if (!resizing) return;
        const dx = e.clientX - resizing.startX;
        const dy = e.clientY - resizing.startY;

        let newW = resizing.startW;
        let newH = resizing.startH;

        if (resizing.handle.includes('e')) newW = Math.max(50, resizing.startW + dx);
        if (resizing.handle.includes('w')) newW = Math.max(50, resizing.startW - dx);
        if (resizing.handle.includes('s')) newH = Math.max(50, resizing.startH + dy);
        if (resizing.handle.includes('n')) newH = Math.max(50, resizing.startH - dy);

        onUpdateStyles(resizing.id, { width: `${Math.round(newW)}px`, height: `${Math.round(newH)}px` });
    };

    const handleResizeEnd = () => {
        setResizing(null);
    };

    const renderFreeMoveComponent = (comp: UIComponent) => {
        const isDragging = dragging === comp.id;
        const isResizing = resizing?.id === comp.id;
        const isSelected = selectedId === comp.id;
        const width = parseInt(String(comp.styles.width || '200').replace('px', ''));
        const height = parseInt(String(comp.styles.height || '150').replace('px', ''));

        return (
            <div
                key={comp.id}
                className={`absolute transition-shadow ${isDragging
                    ? 'cursor-grabbing border-2 border-dashed border-white/50 shadow-2xl'
                    : ''
                    }`}
                style={{
                    left: comp.styles.x || 50,
                    top: comp.styles.y || 50,
                    zIndex: isDragging || isResizing ? 1000 : (comp.styles.zIndex || 1),
                    boxShadow: isDragging ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' : undefined,
                    width: comp.styles.width || '200px',
                    height: comp.styles.height || '150px',
                }}
            >
                {/* Drag handle area */}
                <div
                    className={`cursor-move w-full h-full ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                    onPointerDown={(e) => handlePointerDown(e, comp)}
                    style={{ touchAction: 'none' }}
                >
                    {isSelected && selectedComponent && (
                        <FloatingToolbar
                            component={selectedComponent}
                            onUpdateStyles={onUpdateStyles}
                            onDelete={onDelete}
                            onMoveUp={onMoveUp}
                            onMoveDown={onMoveDown}
                            onBringForward={onBringForward}
                            onSendBackward={onSendBackward}
                            isFreeMove={true}
                        />
                    )}
                    <RenderNode
                        component={comp}
                        isSelected={isSelected}
                        onClick={() => onSelect(comp.id)}
                        onUpdateContent={onUpdateContent}
                        onUpdateImageSrc={onUpdateImageSrc}
                        isViewMode={isViewMode}
                    />
                </div>

                {/* Resize handles - 8 corners + edges */}
                {isSelected && !isDragging && (
                    <>
                        {/* Corners */}
                        {/* Corners */}
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-neutral-900 rounded-sm cursor-nwse-resize z-50"
                            onPointerDown={(e) => startResize(e, comp.id, 'nw', width, height)} style={{ touchAction: 'none' }} />
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-neutral-900 rounded-sm cursor-nesw-resize z-50"
                            onPointerDown={(e) => startResize(e, comp.id, 'ne', width, height)} style={{ touchAction: 'none' }} />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-neutral-900 rounded-sm cursor-nesw-resize z-50"
                            onPointerDown={(e) => startResize(e, comp.id, 'sw', width, height)} style={{ touchAction: 'none' }} />
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-neutral-900 rounded-sm cursor-nwse-resize z-50"
                            onPointerDown={(e) => startResize(e, comp.id, 'se', width, height)} style={{ touchAction: 'none' }} />
                        {/* Edges */}
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-neutral-900 rounded-sm cursor-ns-resize z-50"
                            onPointerDown={(e) => startResize(e, comp.id, 'n', width, height)} style={{ touchAction: 'none' }} />
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-neutral-900 rounded-sm cursor-ns-resize z-50"
                            onPointerDown={(e) => startResize(e, comp.id, 's', width, height)} style={{ touchAction: 'none' }} />
                        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-neutral-900 rounded-sm cursor-ew-resize z-50"
                            onPointerDown={(e) => startResize(e, comp.id, 'w', width, height)} style={{ touchAction: 'none' }} />
                        <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-neutral-900 rounded-sm cursor-ew-resize z-50"
                            onPointerDown={(e) => startResize(e, comp.id, 'e', width, height)} style={{ touchAction: 'none' }} />

                        {/* Dimension indicator while resizing */}
                        {isResizing && (
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-2 py-1 rounded font-mono whitespace-nowrap z-50">
                                {width} × {height}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    // Separate components by type
    const navbar = components.find(c => c.type === 'Navbar');
    const footer = components.find(c => c.type === 'Footer');
    const sections = components.filter(c => c.type === 'Section');
    const getChildrenForSection = (sectionId: string) => components.filter(c => c.parentId === sectionId);

    return (
        <div
            ref={setNodeRef}
            className={`min-h-full p-4 md:p-8 flex flex-col items-center transition-colors duration-200 ${isOver ? 'bg-neutral-900/50' : 'bg-black'}`}
            onClick={() => onSelect('')}
        >
            {/* Canvas Artboard */}
            <div
                ref={canvasRef}
                className="w-full max-w-4xl min-h-[600px] md:min-h-[800px] bg-neutral-950 rounded-lg ring-1 ring-neutral-900 transition-all overflow-hidden"
                onPointerMove={(e) => { handlePointerMove(e); handleResizeMove(e); }}
                onPointerUp={() => { handlePointerUp(); handleResizeEnd(); }}
                onPointerLeave={() => { handlePointerUp(); handleResizeEnd(); }}
            >
                {/* Navbar - Stacked at top, edge to edge */}
                {navbar && (
                    <div
                        className="relative w-full"
                        style={{
                            height: navbar.styles.height || '60px',
                            backgroundColor: navbar.styles.backgroundColor,
                            boxShadow: selectedId === navbar.id ? 'inset 0 0 0 2px rgba(255,255,255,0.3)' : 'none'
                        }}
                        onClick={(e) => { e.stopPropagation(); onSelect(navbar.id); }}
                    >
                        {selectedId === navbar.id && selectedComponent && (
                            <FloatingToolbar
                                component={selectedComponent}
                                onUpdateStyles={onUpdateStyles}
                                onDelete={onDelete}
                                onMoveUp={onMoveUp}
                                onMoveDown={onMoveDown}
                            />
                        )}
                        <RenderNode
                            component={navbar}
                            isSelected={selectedId === navbar.id}
                            onClick={() => onSelect(navbar.id)}
                            onUpdateContent={onUpdateContent}
                            onUpdateImageSrc={onUpdateImageSrc}
                            isViewMode={isViewMode}
                        />
                    </div>
                )}

                {/* Sections - Stacked tight */}
                {sections.length === 0 && !navbar && !footer && (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-lg text-neutral-600 m-4 min-h-[400px]">
                        <svg className="w-8 h-8 md:w-10 md:h-10 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="font-medium text-sm">Add a Section to get started</p>
                        <p className="text-xs opacity-60 mt-1">Then add elements inside sections</p>
                    </div>
                )}

                {sections.map((section) => {
                    const children = getChildrenForSection(section.id);
                    const isSectionSelected = selectedId === section.id;
                    return (
                        <div
                            key={section.id}
                            className="relative w-full"
                            style={{
                                minHeight: section.styles.height || '300px',
                                backgroundColor: section.styles.backgroundColor,
                                boxShadow: isSectionSelected ? 'inset 0 0 0 2px rgba(255,255,255,0.2)' : 'none'
                            }}
                            onClick={(e) => { e.stopPropagation(); onSelect(section.id); }}
                        >
                            {/* Section toolbar */}
                            {isSectionSelected && selectedComponent && (
                                <FloatingToolbar
                                    component={selectedComponent}
                                    onUpdateStyles={onUpdateStyles}
                                    onDelete={onDelete}
                                    onMoveUp={onMoveUp}
                                    onMoveDown={onMoveDown}
                                />
                            )}

                            {/* Section label */}
                            <div className="absolute top-2 left-2 text-[9px] uppercase tracking-wider text-neutral-600 font-medium">
                                {section.content || 'Section'}
                            </div>

                            {/* Free-move children inside this section */}
                            {children.map(renderFreeMoveComponent)}
                        </div>
                    );
                })}

                {/* Footer - Stacked directly after sections, edge to edge */}
                {footer && (
                    <div
                        className="relative w-full"
                        style={{
                            height: footer.styles.height || '80px',
                            backgroundColor: footer.styles.backgroundColor,
                            boxShadow: selectedId === footer.id ? 'inset 0 0 0 2px rgba(255,255,255,0.3)' : 'none'
                        }}
                        onClick={(e) => { e.stopPropagation(); onSelect(footer.id); }}
                    >
                        {selectedId === footer.id && selectedComponent && (
                            <FloatingToolbar
                                component={selectedComponent}
                                onUpdateStyles={onUpdateStyles}
                                onDelete={onDelete}
                                onMoveUp={onMoveUp}
                                onMoveDown={onMoveDown}
                            />
                        )}
                        <RenderNode
                            component={footer}
                            isSelected={selectedId === footer.id}
                            onClick={() => onSelect(footer.id)}
                            onUpdateContent={onUpdateContent}
                            onUpdateImageSrc={onUpdateImageSrc}
                            isViewMode={isViewMode}
                        />
                    </div>
                )}

                {/* Drop Indicator */}
                {isOver && (
                    <div className="border border-neutral-600 border-dashed rounded-lg h-16 flex items-center justify-center mx-4 my-4">
                        <span className="text-neutral-500 text-xs font-medium">Release to drop</span>
                    </div>
                )}
            </div>
        </div>
    );
}