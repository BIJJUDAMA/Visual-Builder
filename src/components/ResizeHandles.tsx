import { useState, useEffect } from 'react';

interface Props {
    width: number;
    height: number;
    onResize: (width: number, height: number) => void;
    isSelected: boolean;
}

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export function ResizeHandles({ width, height, onResize, isSelected }: Props) {
    const [resizing, setResizing] = useState<HandlePosition | null>(null);
    const [startPos, setStartPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const [showDimensions, setShowDimensions] = useState(false);
    const [shiftHeld, setShiftHeld] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setShiftHeld(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setShiftHeld(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        if (!resizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;

            let newW = startPos.w;
            let newH = startPos.h;

            // Calculate new dimensions based on handle
            if (resizing.includes('e')) newW = Math.max(50, startPos.w + dx);
            if (resizing.includes('w')) newW = Math.max(50, startPos.w - dx);
            if (resizing.includes('s')) newH = Math.max(50, startPos.h + dy);
            if (resizing.includes('n')) newH = Math.max(50, startPos.h - dy);

            // Aspect ratio lock with Shift
            if (shiftHeld) {
                const aspectRatio = startPos.w / startPos.h;
                if (['nw', 'ne', 'sw', 'se'].includes(resizing)) {
                    // Corner handles - maintain aspect ratio
                    if (Math.abs(dx) > Math.abs(dy)) {
                        newH = newW / aspectRatio;
                    } else {
                        newW = newH * aspectRatio;
                    }
                }
            }

            onResize(Math.round(newW), Math.round(newH));
        };

        const handleMouseUp = () => {
            setResizing(null);
            setShowDimensions(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizing, startPos, shiftHeld, onResize]);

    const handleMouseDown = (e: React.MouseEvent, handle: HandlePosition) => {
        e.stopPropagation();
        e.preventDefault();
        setResizing(handle);
        setShowDimensions(true);
        setStartPos({ x: e.clientX, y: e.clientY, w: width, h: height });
    };

    if (!isSelected) return null;

    const handleStyle = "absolute w-2.5 h-2.5 bg-white border-2 border-neutral-900 rounded-sm z-50";
    const handlePositions: Record<HandlePosition, string> = {
        nw: '-top-1 -left-1 cursor-nwse-resize',
        n: '-top-1 left-1/2 -translate-x-1/2 cursor-ns-resize',
        ne: '-top-1 -right-1 cursor-nesw-resize',
        e: 'top-1/2 -right-1 -translate-y-1/2 cursor-ew-resize',
        se: '-bottom-1 -right-1 cursor-nwse-resize',
        s: '-bottom-1 left-1/2 -translate-x-1/2 cursor-ns-resize',
        sw: '-bottom-1 -left-1 cursor-nesw-resize',
        w: 'top-1/2 -left-1 -translate-y-1/2 cursor-ew-resize',
    };

    return (
        <>
            {/* Resize handles */}
            {(Object.keys(handlePositions) as HandlePosition[]).map((pos) => (
                <div
                    key={pos}
                    className={`${handleStyle} ${handlePositions[pos]}`}
                    onMouseDown={(e) => handleMouseDown(e, pos)}
                />
            ))}

            {/* Dimension indicator */}
            {showDimensions && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-2 py-1 rounded font-mono whitespace-nowrap z-50">
                    {width} × {height}
                </div>
            )}
        </>
    );
}
