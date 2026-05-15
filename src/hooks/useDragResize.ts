'use client';

import { useCallback, useEffect, useRef } from 'react';

interface DragState {
  blockId: string;
  startX: number;
  startY: number;
  initX: number;
  initY: number;
  initW: number;
  initH: number;
  mode: 'move' | 'resize';
}

interface UseDragResizeOptions {
  scale: number;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, w: number, h: number) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
}

export function useDragResize({
  scale,
  onMove,
  onResize,
  onDragStart,
  onDragEnd,
}: UseDragResizeOptions) {
  const dragRef = useRef<DragState | null>(null);

  const handleMouseDown = useCallback(
    (
      e: React.MouseEvent,
      blockId: string,
      mode: 'move' | 'resize',
      x: number,
      y: number,
      w: number,
      h: number
    ) => {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = {
        blockId,
        startX: e.clientX,
        startY: e.clientY,
        initX: x,
        initY: y,
        initW: w,
        initH: h,
        mode,
      };
      onDragStart?.(blockId);
    },
    [onDragStart]
  );

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = (e.clientX - drag.startX) / scale;
      const dy = (e.clientY - drag.startY) / scale;

      if (drag.mode === 'move') {
        onMove(drag.blockId, drag.initX + dx, drag.initY - dy);
      } else {
        onResize(
          drag.blockId,
          Math.max(60, drag.initW + dx),
          Math.max(30, drag.initH + dy)
        );
      }
    }

    function handleMouseUp() {
      if (dragRef.current) {
        dragRef.current = null;
        onDragEnd?.();
      }
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [scale, onMove, onResize, onDragEnd]);

  return { handleMouseDown, isDragging: !!dragRef.current };
}
