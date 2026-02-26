import { describe, expect, test } from 'bun:test';
import { stepWidth, effectiveDpr, computeQuality } from '../src/width-calculator.js';

describe('stepWidth', () => {
  const step = 160;
  const maxWidth = 4096;

  test('rounds up to nearest step', () => {
    expect(stepWidth(1, step, maxWidth)).toBe(160);
    expect(stepWidth(159, step, maxWidth)).toBe(160);
    expect(stepWidth(160, step, maxWidth)).toBe(160);
    expect(stepWidth(161, step, maxWidth)).toBe(320);
    expect(stepWidth(320, step, maxWidth)).toBe(320);
    expect(stepWidth(321, step, maxWidth)).toBe(480);
  });

  test('clamps to maxWidth', () => {
    expect(stepWidth(5000, step, maxWidth)).toBe(4096);
    expect(stepWidth(4096, step, maxWidth)).toBe(4096);
    // 4097 would step to 4160, but clamp to 4096
    expect(stepWidth(4097, step, maxWidth)).toBe(4096);
  });

  test('returns 0 for zero or negative input', () => {
    expect(stepWidth(0, step, maxWidth)).toBe(0);
    expect(stepWidth(-1, step, maxWidth)).toBe(0);
  });

  test('never returns less than one step for positive input', () => {
    expect(stepWidth(0.5, step, maxWidth)).toBe(160);
    expect(stepWidth(1, step, maxWidth)).toBe(160);
  });

  test('works with different step sizes', () => {
    expect(stepWidth(50, 100, 2000)).toBe(100);
    expect(stepWidth(101, 100, 2000)).toBe(200);
    expect(stepWidth(200, 200, 2000)).toBe(200);
    expect(stepWidth(201, 200, 2000)).toBe(400);
  });

  test('works with maxWidth=2048 (original default)', () => {
    expect(stepWidth(2000, step, 2048)).toBe(2048);
    expect(stepWidth(2049, step, 2048)).toBe(2048);
  });

  test('matches original slimmage formula', () => {
    // Original: Math.min(maxWidth, Math.round(Math.ceil(ideal / step) * step))
    const original = (ideal: number) =>
      Math.min(maxWidth, Math.round(Math.ceil(ideal / step) * step));

    for (const w of [1, 50, 159, 160, 161, 319, 320, 321, 500, 1000, 2000, 3000, 4000]) {
      expect(stepWidth(w, step, maxWidth)).toBe(original(w));
    }
  });
});

describe('computeQuality', () => {
  test('returns base quality at DPR 1', () => {
    expect(computeQuality(85, 1, 10)).toBe(85);
    expect(computeQuality(90, 1, 10)).toBe(90);
  });

  test('reduces quality at DPR 2', () => {
    expect(computeQuality(85, 2, 10)).toBe(75);
    expect(computeQuality(90, 2, 10)).toBe(80);
  });

  test('reduces quality at DPR 3', () => {
    expect(computeQuality(85, 3, 10)).toBe(65);
  });

  test('never goes below 10', () => {
    expect(computeQuality(20, 3, 10)).toBe(10);
    expect(computeQuality(10, 2, 10)).toBe(10);
  });

  test('respects qualityDprStep', () => {
    expect(computeQuality(85, 2, 5)).toBe(80);
    expect(computeQuality(85, 2, 15)).toBe(70);
  });

  test('at DPR < 1 returns base quality', () => {
    expect(computeQuality(85, 0.5, 10)).toBe(85);
  });

  test('fractional DPR floors the step count', () => {
    // DPR 1.5: floor(1.5-1) = 0, so no reduction
    expect(computeQuality(85, 1.5, 10)).toBe(85);
    // DPR 2.9: floor(2.9-1) = 1, one step reduction
    expect(computeQuality(85, 2.9, 10)).toBe(75);
    // DPR 3.0: floor(3.0-1) = 2, two step reduction
    expect(computeQuality(85, 3.0, 10)).toBe(65);
  });

  test('zero qualityDprStep means no reduction', () => {
    expect(computeQuality(85, 3, 0)).toBe(85);
  });

  test('quality 100 at various DPRs', () => {
    expect(computeQuality(100, 1, 10)).toBe(100);
    expect(computeQuality(100, 2, 10)).toBe(90);
    expect(computeQuality(100, 3, 10)).toBe(80);
  });

  test('large DPR does not crash', () => {
    const q = computeQuality(85, 10, 10);
    expect(q).toBe(10); // floor clamped
  });

  test('DPR exactly 1 returns base', () => {
    expect(computeQuality(50, 1.0, 10)).toBe(50);
  });
});

describe('effectiveDpr', () => {
  test('returns 1 when dprAware is false', () => {
    expect(effectiveDpr(false, 3)).toBe(1);
  });

  test('caps at maxDpr', () => {
    // In test env (non-browser), window.devicePixelRatio may be 1 or undefined
    const dpr = effectiveDpr(true, 1);
    expect(dpr).toBeLessThanOrEqual(1);
    expect(dpr).toBeGreaterThanOrEqual(1);
  });

  test('maxDpr of 0.5 caps even at DPR 1', () => {
    const dpr = effectiveDpr(true, 0.5);
    expect(dpr).toBe(0.5);
  });
});
