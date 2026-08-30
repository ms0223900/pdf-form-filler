'use client';

import { useCallback, useEffect, useRef } from 'react';
import { applyPinchScale } from '@/lib/pinchScale';
import { applyPointerDelta } from '@/lib/pointerDelta';

export type PointerLikeEvent = React.PointerEvent | React.MouseEvent;

interface DragState {
  blockId: string;
  mode: 'move' | 'resize';
  startX: number;
  startY: number;
  initX: number;
  initY: number;
  initW: number;
  initH: number;
  lastW: number;
  lastH: number;
  pointers: Map<number, { x: number; y: number }>;
  startDistance: number | null;
  pinchInitW: number;
  pinchInitH: number;
  captureEl: Element | null;
}

interface UseDragResizeOptions {
  scale: number;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, w: number, h: number) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  lockAspectRatio?: boolean;
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

export function useDragResize({
  scale,
  onMove,
  onResize,
  onDragStart,
  onDragEnd,
  lockAspectRatio = false,
}: UseDragResizeOptions) {
  const dragRef = useRef<DragState | null>(null);
  const onMoveRef = useRef(onMove);
  const onResizeRef = useRef(onResize);
  const onDragEndRef = useRef(onDragEnd);
  onMoveRef.current = onMove;
  onResizeRef.current = onResize;
  onDragEndRef.current = onDragEnd;

  const endGesture = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;

    for (const id of drag.pointers.keys()) {
      tryRelease(drag.captureEl, id);
    }
    document.body.style.touchAction = '';
    dragRef.current = null;
    onDragEndRef.current?.();
  }, []);

  const handlePointerDown = useCallback(
    (
      e: PointerLikeEvent,
      blockId: string,
      mode: 'move' | 'resize',
      x: number,
      y: number,
      w: number,
      h: number
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const id = pointerIdOf(e);
      const captureEl = e.currentTarget instanceof Element ? e.currentTarget : null;
      tryCapture(captureEl, id);
      document.body.style.touchAction = 'none';

      dragRef.current = {
        blockId,
        mode,
        startX: e.clientX,
        startY: e.clientY,
        initX: x,
        initY: y,
        initW: w,
        initH: h,
        lastW: w,
        lastH: h,
        pointers: new Map([[id, { x: e.clientX, y: e.clientY }]]),
        startDistance: null,
        pinchInitW: w,
        pinchInitH: h,
        captureEl,
      };
      onDragStart?.(blockId);
    },
    [onDragStart]
  );

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || !drag.pointers.has(e.pointerId)) return;

      e.preventDefault();
      drag.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (drag.pointers.size >= 2 && drag.startDistance !== null) {
        const [a, b] = [...drag.pointers.values()];
        const { width, height } = applyPinchScale({
          startDistance: drag.startDistance,
          currentDistance: Math.hypot(a.x - b.x, a.y - b.y),
          initW: drag.pinchInitW,
          initH: drag.pinchInitH,
          lockAspectRatio,
        });
        drag.lastW = width;
        drag.lastH = height;
        onResizeRef.current(drag.blockId, width, height);
        return;
      }

      const next = applyPointerDelta({
        scale,
        startClientX: drag.startX,
        startClientY: drag.startY,
        clientX: e.clientX,
        clientY: e.clientY,
        initX: drag.initX,
        initY: drag.initY,
        initW: drag.initW,
        initH: drag.initH,
        mode: drag.mode,
      });

      if (drag.mode === 'move') {
        onMoveRef.current(drag.blockId, next.x, next.y);
      } else {
        drag.lastW = next.width;
        drag.lastH = next.height;
        onResizeRef.current(drag.blockId, next.width, next.height);
      }
    }

    function handleSecondPointerDown(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || drag.pointers.has(e.pointerId) || drag.pointers.size >= 2) {
        return;
      }

      e.preventDefault();
      tryCapture(drag.captureEl, e.pointerId);
      drag.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (drag.pointers.size === 2) {
        const [a, b] = [...drag.pointers.values()];
        drag.startDistance = Math.hypot(a.x - b.x, a.y - b.y);
        drag.pinchInitW = drag.lastW;
        drag.pinchInitH = drag.lastH;
      }
    }

    function handlePointerUp(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || !drag.pointers.has(e.pointerId)) return;
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
  }, [scale, lockAspectRatio, endGesture]);

  return {
    handlePointerDown,
    handleMouseDown: handlePointerDown,
    isDragging: !!dragRef.current,
  };
}
