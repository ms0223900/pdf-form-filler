import { describe, expect, it } from 'vitest';
import { applyPinchScale } from './pinchScale';

interface PinchScaleArgs {
  startDistance: number;
  currentDistance: number;
  initW: number;
  initH: number;
  lockAspectRatio?: boolean;
}

function callPinch(overrides: Partial<PinchScaleArgs> = {}) {
  return applyPinchScale({
    startDistance: 100,
    currentDistance: 100,
    initW: 160,
    initH: 80,
    ...overrides,
  });
}

function isFiniteSize(result: { width: number; height: number }) {
  return Number.isFinite(result.width) && Number.isFinite(result.height);
}

describe('applyPinchScale', () => {
  it('grows width and height when finger distance increases', () => {
    const result = callPinch({ currentDistance: 150 });

    expect(result).toEqual({ width: 240, height: 120 });
  });

  it('shrinks width and height when finger distance decreases', () => {
    const result = callPinch({ currentDistance: 50 });

    expect(result).toEqual({ width: 80, height: 40 });
  });

  it('keeps width/height ratio when lockAspectRatio is true', () => {
    const result = callPinch({
      currentDistance: 200,
      lockAspectRatio: true,
    });

    expect(result.width / result.height).toBe(2);
    expect(result).toEqual({ width: 320, height: 160 });
  });

  it('clamps width to 60 and height to 30', () => {
    const result = callPinch({
      initW: 70,
      initH: 40,
      currentDistance: 10,
    });

    expect(result).toEqual({ width: 60, height: 30 });
  });

  it('returns finite sizes when start distance is 0', () => {
    const result = callPinch({ startDistance: 0, currentDistance: 80 });

    expect(isFiniteSize(result)).toBe(true);
  });

  it('returns finite sizes when current distance is not a number', () => {
    const result = callPinch({ currentDistance: Number.NaN });

    expect(isFiniteSize(result)).toBe(true);
  });
});
