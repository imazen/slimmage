import { describe, expect, test, beforeEach } from 'bun:test';
import {
  getFormatSupport,
  _resetFormatDetection,
  _setFormatSupport,
} from '../src/format-detector.js';

describe('format-detector', () => {
  beforeEach(() => {
    _resetFormatDetection();
  });

  test('getFormatSupport returns defaults before detection', () => {
    const support = getFormatSupport();
    expect(support.webp).toBe(false);
    expect(support.avif).toBe(false);
  });

  test('_setFormatSupport sets cached support', () => {
    _setFormatSupport({ webp: true, avif: false });
    const support = getFormatSupport();
    expect(support.webp).toBe(true);
    expect(support.avif).toBe(false);
  });

  test('_setFormatSupport with both formats', () => {
    _setFormatSupport({ webp: true, avif: true });
    const support = getFormatSupport();
    expect(support.webp).toBe(true);
    expect(support.avif).toBe(true);
  });

  test('_resetFormatDetection clears cache', () => {
    _setFormatSupport({ webp: true, avif: true });
    _resetFormatDetection();
    const support = getFormatSupport();
    expect(support.webp).toBe(false);
    expect(support.avif).toBe(false);
  });

  test('getFormatSupport is synchronous', () => {
    // Should return immediately without awaiting
    const start = Date.now();
    const support = getFormatSupport();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5);
    expect(typeof support.webp).toBe('boolean');
    expect(typeof support.avif).toBe('boolean');
  });

  test('_setFormatSupport overrides previous set', () => {
    _setFormatSupport({ webp: true, avif: true });
    _setFormatSupport({ webp: false, avif: true });
    const support = getFormatSupport();
    expect(support.webp).toBe(false);
    expect(support.avif).toBe(true);
  });
});
