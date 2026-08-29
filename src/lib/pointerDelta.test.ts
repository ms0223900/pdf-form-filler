import { describe, expect, it } from 'vitest';
import { applyPointerDelta } from './pointerDelta';

interface PointerDeltaArgs {
  scale: number;
  startClientX: number;
  startClientY: number;
  clientX: number;
  clientY: number;
  initX: number;
  initY: number;
  initW: number;
  initH: number;
  mode: 'move' | 'resize';
}

const baseBlock = {
  initX: 100,
  initY: 200,
  initW: 160,
  initH: 80,
} as const;

function callDelta(overrides: Partial<PointerDeltaArgs> & Pick<PointerDeltaArgs, 'mode'>) {
  return applyPointerDelta({
    scale: 1,
    startClientX: 0,
    startClientY: 0,
    clientX: 0,
    clientY: 0,
    ...baseBlock,
    ...overrides,
  });
}

describe('applyPointerDelta', () => {
  it('adds dx/scale to x and subtracts dy/scale from y when moving', () => {
    const result = callDelta({
      mode: 'move',
      clientX: 40,
      clientY: 20,
    });

    expect(result).toEqual({
      x: 140,
      y: 180,
      width: 160,
      height: 80,
    });
  });

  it('adds dx/scale to width and dy/scale to height when resizing', () => {
    const result = callDelta({
      mode: 'resize',
      clientX: 30,
      clientY: 10,
    });

    expect(result).toEqual({
      x: 100,
      y: 200,
      width: 190,
      height: 90,
    });
  });

  it('clamps resized width to 60 and height to 30', () => {
    const result = callDelta({
      mode: 'resize',
      initW: 70,
      initH: 40,
      clientX: -50,
      clientY: -50,
    });

    expect(result).toEqual({
      x: 100,
      y: 200,
      width: 60,
      height: 30,
    });
  });

  it('divides pointer delta by scale when scale is not 1', () => {
    const result = callDelta({
      mode: 'move',
      scale: 2,
      clientX: 40,
      clientY: 20,
    });

    expect(result).toEqual({
      x: 120,
      y: 190,
      width: 160,
      height: 80,
    });
  });
});
