import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizableThProps {
    tableId: string;
    columnId: string;
    initialWidth?: number;
    minWidth?: number;
    className?: string;
    children: ReactNode;
}

export const ResizableTh: React.FC<ResizableThProps> = ({
    tableId,
    columnId,
    initialWidth = 150,
    minWidth = 50,
    className = '',
    children
}) => {
    const storageKey = `prodeco_tables_${tableId}_${columnId}_width`;

    const [width, setWidth] = useState<number>(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? parseInt(saved, 10) : initialWidth;
    });

    const isResizingRef = useRef(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isResizingRef.current = true;

        const startX = e.pageX;
        const startWidth = width;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!isResizingRef.current) return;
            // requestAnimationFrame to smooth resize
            requestAnimationFrame(() => {
                const deltaX = moveEvent.pageX - startX;
                const newWidth = Math.max(minWidth, startWidth + deltaX);
                setWidth(newWidth);
            });
        };

        const handleMouseUp = () => {
            isResizingRef.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            // Save final width
            // Using a hack to get the latest width because of closure, but we can just use the state setting logic
            // Actually, we'll use useEffect to save it.
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Save to local storage whenever width changes and we're not actively moving (or just save all the time, it's cheap)
    useEffect(() => {
        localStorage.setItem(storageKey, width.toString());
    }, [width, storageKey]);

    return (
        <th
            className={`relative group ${className}`}
            style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
        >
            <div className="w-full h-full overflow-hidden text-ellipsis whitespace-nowrap">
                {children}
            </div>

            {/* Grab Handle */}
            <div
                onMouseDown={handleMouseDown}
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-500/80 group-hover:bg-slate-700/50 z-20 transition-colors"
                title="Przeciągnij by zmienić szerokość"
            />
        </th>
    );
};
