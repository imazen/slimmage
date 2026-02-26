import { describe, expect, test } from 'bun:test';
import { buildUrl, computeImageParams } from '../src/url-builder.js';
import type { ResolvedConfig, FormatSupport } from '../src/types.js';

const defaultConfig: ResolvedConfig = {
  src: 'https://cdn.example.com/photo.jpg?width=160&quality=85',
  container: undefined,
  widthStep: 160,
  maxWidth: 4096,
  dprAware: false, // Disable DPR for predictable tests
  maxDpr: 3,
  quality: 85,
  qualityDprStep: 10,
  preferredFormat: 'jpeg',
  lazy: false,
  lazyMargin: '200px',
  aspectRatio: undefined,
  fetchPriority: 'auto',
  onBeforeLoad: undefined,
  onLoad: undefined,
};

const noFormats: FormatSupport = { webp: false, avif: false };
const webpOnly: FormatSupport = { webp: true, avif: false };
const avifOnly: FormatSupport = { webp: false, avif: true };
const allFormats: FormatSupport = { webp: true, avif: true };

describe('buildUrl', () => {
  test('updates width parameter', () => {
    const result = buildUrl('https://cdn.example.com/photo.jpg?width=160&quality=85', 320, 85, 'jpeg');
    const url = new URL(result);
    expect(url.searchParams.get('width')).toBe('320');
  });

  test('updates quality parameter', () => {
    const result = buildUrl('https://cdn.example.com/photo.jpg?width=160&quality=85', 320, 75, 'jpeg');
    const url = new URL(result);
    expect(url.searchParams.get('quality')).toBe('75');
  });

  test('maintains aspect ratio with height', () => {
    const result = buildUrl('https://cdn.example.com/photo.jpg?width=16&height=9', 160, 85, 'jpeg');
    const url = new URL(result);
    expect(url.searchParams.get('width')).toBe('160');
    expect(url.searchParams.get('height')).toBe('90');
  });

  test('accounts for zoom parameter', () => {
    const result = buildUrl('https://cdn.example.com/photo.jpg?width=16&height=9&zoom=2', 160, 85, 'jpeg');
    const url = new URL(result);
    // width=80 because 160/zoom(2)=80
    expect(url.searchParams.get('width')).toBe('80');
    expect(url.searchParams.get('height')).toBe('45');
    expect(url.searchParams.get('zoom')).toBe('2');
  });

  test('sets format=webp when webp requested', () => {
    const result = buildUrl('https://cdn.example.com/photo.jpg?width=160&quality=85&format=jpeg', 320, 85, 'webp');
    const url = new URL(result);
    expect(url.searchParams.get('format')).toBe('webp');
  });

  test('sets format=avif when avif requested', () => {
    const result = buildUrl('https://cdn.example.com/photo.jpg?width=160&quality=85&format=jpeg', 320, 85, 'avif');
    const url = new URL(result);
    expect(url.searchParams.get('format')).toBe('avif');
  });

  test('preserves path and hash', () => {
    const result = buildUrl('https://cdn.example.com/path/photo.jpg?width=160#anchor', 320, 85, 'jpeg');
    expect(result).toContain('/path/photo.jpg');
    expect(result).toContain('#anchor');
  });

  test('handles relative URLs', () => {
    const result = buildUrl('/images/photo.jpg?width=160&quality=85', 320, 75, 'jpeg');
    expect(result).toContain('/images/photo.jpg');
    expect(result).toContain('width=320');
    expect(result).toContain('quality=75');
    expect(result).not.toContain('_slimmage_');
  });

  test('preserves unrelated query params', () => {
    const result = buildUrl('https://cdn.example.com/photo.jpg?width=160&william=130&harry=90', 160, 85, 'jpeg');
    const url = new URL(result);
    expect(url.searchParams.get('william')).toBe('130');
    expect(url.searchParams.get('harry')).toBe('90');
    expect(url.searchParams.get('width')).toBe('160');
  });
});

describe('computeImageParams', () => {
  test('returns info with stepped width', () => {
    const info = computeImageParams(100, defaultConfig, noFormats, 0, null);
    expect(info).not.toBeNull();
    expect(info!.requestedWidth).toBe(160); // 100 stepped up to 160
  });

  test('returns null when ratcheted (new width <= previous)', () => {
    const info = computeImageParams(100, defaultConfig, noFormats, 160, 'prev.jpg');
    expect(info).toBeNull();
  });

  test('returns info when growing past previous width', () => {
    const info = computeImageParams(200, defaultConfig, noFormats, 160, 'prev.jpg');
    expect(info).not.toBeNull();
    expect(info!.requestedWidth).toBe(320); // 200 stepped up to 320
    expect(info!.previousWidth).toBe(160);
    expect(info!.previousUrl).toBe('prev.jpg');
  });

  test('returns null for zero container width', () => {
    const info = computeImageParams(0, defaultConfig, noFormats, 0, null);
    expect(info).toBeNull();
  });

  test('applies format preference with support', () => {
    const config = { ...defaultConfig, preferredFormat: 'avif' as const };
    const info = computeImageParams(100, config, allFormats, 0, null);
    expect(info!.format).toBe('avif');
  });

  test('falls back format when preferred not supported', () => {
    const config = { ...defaultConfig, preferredFormat: 'avif' as const };
    const info = computeImageParams(100, config, webpOnly, 0, null);
    expect(info!.format).toBe('webp');
  });

  test('uses jpeg when no modern formats supported', () => {
    const config = { ...defaultConfig, preferredFormat: 'avif' as const };
    const info = computeImageParams(100, config, noFormats, 0, null);
    expect(info!.format).toBe('jpeg');
  });

  test('auto format prefers avif > webp > jpeg', () => {
    const config = { ...defaultConfig, preferredFormat: 'auto' as const };
    expect(computeImageParams(100, config, allFormats, 0, null)!.format).toBe('avif');
    expect(computeImageParams(100, config, webpOnly, 0, null)!.format).toBe('webp');
    expect(computeImageParams(100, config, avifOnly, 0, null)!.format).toBe('avif');
    expect(computeImageParams(100, config, noFormats, 0, null)!.format).toBe('jpeg');
  });

  test('matches original getImageInfo always-round-up behavior', () => {
    // From original test: getImageInfo(159/dpr, ...) => 160
    const info1 = computeImageParams(159, defaultConfig, noFormats, 0, null);
    expect(info1!.requestedWidth).toBe(160);

    // getImageInfo(1, ...) => 160
    const info2 = computeImageParams(1, defaultConfig, noFormats, 0, null);
    expect(info2!.requestedWidth).toBe(160);

    // getImageInfo(160, ...) => 160
    const info3 = computeImageParams(160, defaultConfig, noFormats, 0, null);
    expect(info3!.requestedWidth).toBe(160);

    // getImageInfo(161, ...) => 320
    const info4 = computeImageParams(161, defaultConfig, noFormats, 0, null);
    expect(info4!.requestedWidth).toBe(320);
  });
});
