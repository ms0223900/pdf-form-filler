'use client';

import { useCallback, useEffect, useRef } from 'react';
import { applyPinchScale } from '@/lib/pinchScale';
import { applyPointerDelta } from '@/lib/pointerDelta';
import type { PointerLikeEvent } from '@/hooks/useDragResize';

interface ResizeState {
  blockId: string;
  startX: number;
  startW: number;
  aspectRatio: number;
  lastW: number;
  lastH: number;
  pointers: Map<number, { x: number; y: number }>;
  startDistance: number | null;
  pinchInitW: number;
  pinchInitH: number;
  captureEl: Element | null;
}

interface UseAspectRatioResizeOptions {
  scale: number;
  onUpdate: (id: string, updates: { width: number; height: number }) => void;
}

function pointerIdOf(e: PointerLikeEvent | PointerEvent): number {
  if ('pointerId' in e && typeof e.pointerId === 'number') {
    return e.pointerId;
  }
  return 1;
}

function tryCapture(target: EventTarget | null, pointerId: number) {
  if (target instanceof Element) {
    target.setPointerCapture(pointerId);
  }
}

function tryRelease(target: Element | null, pointerId: number) {
  if (target?.hasPointerCapture(pointerId)) {
    target.releasePointerCapture(pointerId);
  }
}

export function useAspectRatioResize({ scale, onUpdate }: UseAspectRatioResizeOptions) {
  const resizeRef = useRef<ResizeState | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const endGesture = useCallback(() => {
    const r = resizeRef.current;
    if (!r) return;

    for (const id of r.pointers.keys()) {
      tryRelease(r.captureEl, id);
    }
    document.body.style.touchAction = '';
    resizeRef.current = null;
  }, []);

  const handlePointerDown = useCallback(
    (
      e: PointerLikeEvent,
      blockId: string,
      clientX: number,
      blockWidth: number,
      aspectRatio: number
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const id = pointerIdOf(e);
      const captureEl = e.currentTarget instanceof Element ? e.currentTarget : null;
      tryCapture(captureEl, id);
      document.body.style.touchAction = 'none';

      const height = blockWidth / aspectRatio;
      resizeRef.current = {
        blockId,
        startX: clientX,
        startW: blockWidth,
        aspectRatio,
        lastW: blockWidth,
        lastH: height,
        pointers: new Map([[id, { x: e.clientX, y: e.clientY }]]),
        startDistance: null,
        pinchInitW: blockWidth,
        pinchInitH: height,
        captureEl,
      };
    },
    []
  );

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      const r = resizeRef.current;
      if (!r || !r.pointers.has(e.pointerId)) return;

      e.preventDefault();
      r.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (r.pointers.size >= 2 && r.startDistance !== null) {
        const [a, b] = [...r.pointers.values()];
        const next = applyPinchScale({
          startDistance: r.startDistance,
          currentDistance: Math.hypot(a.x - b.x, a.y - b.y),
          initW: r.pinchInitW,
          initH: r.pinchInitH,
          lockAspectRatio: true,
        });
        r.lastW = next.width;
        r.lastH = next.height;
        onUpdateRef.current(r.blockId, next);
        return;
      }

      const next = applyPointerDelta({
        scale,
        startClientX: r.startX,
        startClientY: 0,
        clientX: e.clientX,
        clientY: 0,
        initX: 0,
        initY: 0,
        initW: r.startW,
        initH: r.startW / r.aspectRatio,
        mode: 'resize',
      });
      const width = next.width;
      const height = width / r.aspectRatio;
      r.lastW = width;
      r.lastH = height;
      onUpdateRef.current(r.blockId, { width, height });
    }

    function handleSecondPointerDown(e: PointerEvent) {
      const r = resizeRef.current;
      if (!r || r.pointers.has(e.pointerId) || r.pointers.size >= 2) {
        return;
      }

      e.preventDefault();
      tryCapture(r.captureEl, e.pointerId);
      r.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (r.pointers.size === 2) {
        const [a, b] = [...r.pointers.values()];
        r.startDistance = Math.hypot(a.x - b.x, a.y - b.y);
        r.pinchInitW = r.lastW;
        r.pinchInitH = r.lastH;
      }
    }

    function handlePointerUp(e: PointerEvent) {
      const r = resizeRef.current;
      if (!r || !r.pointers.has(e.pointerId)) return;
      endGesture();
    }

    document.addEventListener('pointerdown', handleSecondPointerDown);
    document.addEventListener('pointermove', handlePointerMove, { passive: false });
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.removeEventListener('pointerdown', handleSecondPointerDown);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [scale, endGesture]);

  return {
    handlePointerDown,
    handleResizeStart: handlePointerDown,
  };
}
