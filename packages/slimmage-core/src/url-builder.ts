/**
 * RIAPI URL parsing and mutation.
 *
 * Ported from slimmage.js:119-205 (mutateUrl + getImageInfo URL logic).
 * Uses URL + URLSearchParams instead of regex.
 */

import type { ImageFormat, ImageLoadInfo, ResolvedConfig, FormatSupport } from './types.js';
import { stepWidth, effectiveDpr, computeQuality } from './width-calculator.js';

/** RIAPI width parameter names (case-insensitive matching). */
const WIDTH_KEYS = ['width', 'w', 'maxwidth'];
/** RIAPI height parameter names (case-insensitive matching). */
const HEIGHT_KEYS = ['height', 'h', 'maxheight'];

/**
 * Find a parameter by checking multiple possible key names (case-insensitive).
 * Returns [actualKey, value] or null.
 */
function findParam(params: URLSearchParams, keys: string[]): [string, string] | null {
  for (const [k, v] of params) {
    if (keys.includes(k.toLowerCase())) {
      return [k, v];
    }
  }
  return null;
}

/**
 * Compute the best format to request based on browser support and user preference.
 */
function resolveFormat(preferredFormat: ImageFormat, support: FormatSupport): ImageFormat {
  if (preferredFormat === 'auto') {
    if (support.avif) return 'avif';
    if (support.webp) return 'webp';
    return 'jpeg';
  }
  if (preferredFormat === 'avif' && support.avif) return 'avif';
  if (preferredFormat === 'webp' && support.webp) return 'webp';
  // If preferred format not supported, use best available
  if (preferredFormat === 'avif' && !support.avif) {
    return support.webp ? 'webp' : 'jpeg';
  }
  return preferredFormat;
}

/**
 * Pure function: compute the image params for a given container width.
 * Returns null if the ratchet prevents loading (new width <= previous width).
 */
export function computeImageParams(
  containerWidth: number,
  config: ResolvedConfig,
  formatSupport: FormatSupport,
  previousWidth: number,
  previousUrl: string | null,
): ImageLoadInfo | null {
  const dpr = effectiveDpr(config.dprAware, config.maxDpr);
  const idealWidth = containerWidth * dpr;
  const requestedWidth = stepWidth(idealWidth, config.widthStep, config.maxWidth);

  // Ratchet: never request smaller than what's already loaded
  if (requestedWidth <= previousWidth) return null;

  const quality = computeQuality(config.quality, dpr, config.qualityDprStep);
  const format = resolveFormat(config.preferredFormat, formatSupport);
  const url = buildUrl(config.src, requestedWidth, quality, format);

  return {
    containerWidth,
    dpr,
    requestedWidth,
    quality,
    format,
    url,
    previousUrl,
    previousWidth,
  };
}

/**
 * Build a new URL by updating RIAPI query parameters.
 * Preserves path, hash, and any non-RIAPI params.
 */
export function buildUrl(
  templateUrl: string,
  requestedWidth: number,
  quality: number,
  format: ImageFormat,
): string {
  // Handle relative URLs by giving them a dummy base
  const isRelative = !templateUrl.includes('://');
  const base = isRelative ? 'http://_slimmage_' : undefined;
  let url: URL;
  try {
    url = new URL(templateUrl, base);
  } catch {
    // If URL parsing fails, fall back to simple string manipulation
    return templateUrl;
  }

  const params = url.searchParams;

  // Parse existing width/height to compute aspect ratio
  const widthEntry = findParam(params, WIDTH_KEYS);
  const heightEntry = findParam(params, HEIGHT_KEYS);

  // Parse zoom if present
  const zoomStr = params.get('zoom');
  const zoom = zoomStr ? parseFloat(zoomStr) : 1;
  const effectiveZoom = isNaN(zoom) ? 1 : zoom;

  const adjustedWidth = Math.round(requestedWidth / effectiveZoom);

  if (widthEntry) {
    const [key] = widthEntry;
    params.set(key, String(adjustedWidth));

    // If height is also present, maintain aspect ratio
    if (heightEntry) {
      const [hKey] = heightEntry;
      const origW = parseFloat(widthEntry[1]);
      const origH = parseFloat(heightEntry[1]);
      if (origW > 0 && origH > 0) {
        const newH = Math.round((adjustedWidth / origW) * origH);
        params.set(hKey, String(newH));
      }
    }
  }

  // Set quality
  const qualityEntry = findParam(params, ['quality']);
  if (qualityEntry) {
    params.set(qualityEntry[0], String(quality));
  }

  // Set format if supported and param exists
  const formatEntry = findParam(params, ['format']);
  if (formatEntry && format !== 'jpeg' && format !== 'png') {
    params.set(formatEntry[0], format);
  }

  const result = url.toString();
  // Strip the dummy base for relative URLs
  if (isRelative) {
    return result.replace('http://_slimmage_', '');
  }
  return result;
}
