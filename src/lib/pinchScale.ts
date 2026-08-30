const MIN_RESIZE_WIDTH = 60;
const MIN_RESIZE_HEIGHT = 30;

export interface ApplyPinchScaleInput {
  startDistance: number;
  currentDistance: number;
  initW: number;
  initH: number;
  lockAspectRatio?: boolean;
}

export interface ApplyPinchScaleResult {
  width: number;
  height: number;
}

function isUsableDistance(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function applyPinchScale({
  startDistance,
  currentDistance,
  initW,
  initH,
  lockAspectRatio = false,
}: ApplyPinchScaleInput): ApplyPinchScaleResult {
  if (!isUsableDistance(startDistance) || !isUsableDistance(currentDistance)) {
    return { width: initW, height: initH };
  }

  const factor = currentDistance / startDistance;
  const scaledWidth = initW * factor;
  const scaledHeight = initH * factor;

  if (lockAspectRatio) {
    const ratio = initW / initH;
    let width = Math.max(MIN_RESIZE_WIDTH, scaledWidth);
    let height = width / ratio;

    if (height < MIN_RESIZE_HEIGHT) {
      height = MIN_RESIZE_HEIGHT;
      width = height * ratio;
    }

    return { width, height };
  }

  return {
    width: Math.max(MIN_RESIZE_WIDTH, scaledWidth),
    height: Math.max(MIN_RESIZE_HEIGHT, scaledHeight),
  };
}
