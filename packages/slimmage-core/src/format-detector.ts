/**
 * Detect browser support for modern image formats via data-URI probes.
 * Runs once at import time, caches results.
 */

import type { FormatSupport } from './types.js';

// 1x1 WebP (from original slimmage.js)
const WEBP_PROBE = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

// 1x1 AVIF
const AVIF_PROBE = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLanAyaAAAAAAAAgABAAAAAAAAAAAAAAAAAAACEElDQyAAAAAlAAAAAAIQAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADYAAAAXY29scm5jbHgAAQANAAYABgAGAAAAAAAAEGlwbWEAAAAAAAAAAQABBYGCA4QFAAAAHm1kYXQSAAoIGBYSEAAAAcQgBgEx';

let _support: FormatSupport | null = null;
let _promise: Promise<FormatSupport> | null = null;

function probeFormat(dataUri: string): Promise<boolean> {
  if (typeof Image === 'undefined') return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.height === 2 || img.height === 1);
    img.onerror = () => resolve(false);
    img.src = dataUri;
  });
}

/**
 * Detect format support. Returns a cached promise on subsequent calls.
 */
export function detectFormats(): Promise<FormatSupport> {
  if (_support) return Promise.resolve(_support);
  if (_promise) return _promise;

  _promise = Promise.all([
    probeFormat(WEBP_PROBE),
    probeFormat(AVIF_PROBE),
  ]).then(([webp, avif]) => {
    _support = { webp, avif };
    return _support;
  });

  return _promise;
}

/**
 * Get cached format support synchronously. Returns {webp: false, avif: false}
 * if detection hasn't completed yet.
 */
export function getFormatSupport(): FormatSupport {
  return _support ?? { webp: false, avif: false };
}

/**
 * Reset detection (for testing).
 */
export function _resetFormatDetection(): void {
  _support = null;
  _promise = null;
}

/**
 * Set format support directly (for testing or SSR).
 */
export function _setFormatSupport(support: FormatSupport): void {
  _support = support;
}
