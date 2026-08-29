const MIN_RESIZE_WIDTH = 60;
const MIN_RESIZE_HEIGHT = 30;

export type PointerDeltaMode = 'move' | 'resize';

export interface ApplyPointerDeltaInput {
  scale: number;
  startClientX: number;
  startClientY: number;
  clientX: number;
  clientY: number;
  initX: number;
  initY: number;
  initW: number;
  initH: number;
  mode: PointerDeltaMode;
}

export interface ApplyPointerDeltaResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function applyPointerDelta({
  scale,
  startClientX,
  startClientY,
  clientX,
  clientY,
  initX,
  initY,
  initW,
  initH,
  mode,
}: ApplyPointerDeltaInput): ApplyPointerDeltaResult {
  const dx = (clientX - startClientX) / scale;
  const dy = (clientY - startClientY) / scale;

  if (mode === 'move') {
    return {
      x: initX + dx,
      y: initY - dy,
      width: initW,
      height: initH,
    };
  }

  return {
    x: initX,
    y: initY,
    width: Math.max(MIN_RESIZE_WIDTH, initW + dx),
    height: Math.max(MIN_RESIZE_HEIGHT, initH + dy),
  };
}
