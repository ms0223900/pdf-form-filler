'use client';

import { useCallback, useEffect, useRef } from 'react';

interface ResizeState {
  blockId: string;
  startX: number;
  startW: number;
  aspectRatio: number;
}

interface UseAspectRatioResizeOptions {
  scale: number;
  onUpdate: (id: string, updates: { width: number; height: number }) => void;
}

export function useAspectRatioResize({ scale, onUpdate }: UseAspectRatioResizeOptions) {
  const resizeRef = useRef<ResizeState | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const r = resizeRef.current;
      if (!r) return;

      const dx = (e.clientX - r.startX) / scale;
      const newW = Math.max(60, r.startW + dx);
      onUpdateRef.current(r.blockId, {
        width: newW,
        height: newW / r.aspectRatio,
      });
    }

    function handleMouseUp() {
      resizeRef.current = null;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [scale]);

  const handleResizeStart = useCallback(
    (
      e: React.MouseEvent,
      blockId: string,
      clientX: number,
      blockWidth: number,
      aspectRatio: number
    ) => {
      e.stopPropagation();
      resizeRef.current = {
        blockId,
        startX: clientX,
        startW: blockWidth,
        aspectRatio,
      };
    },
    []
  );

  return { handleResizeStart };
}
