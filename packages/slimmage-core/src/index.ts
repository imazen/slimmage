/**
 * slimmage-core: Container-query-based responsive image loading.
 *
 * Uses ResizeObserver on the container element to compute the right
 * RIAPI image URL at runtime.
 */

export type { SlimmageConfig, ImageLoadInfo, ImageFormat, FormatSupport } from './types.js';
export { stepWidth, effectiveDpr, computeQuality } from './width-calculator.js';
export { computeImageParams, buildUrl } from './url-builder.js';
export { detectFormats, getFormatSupport } from './format-detector.js';
export { observeResize, observeIntersection } from './observer-manager.js';

import type { SlimmageConfig, ResolvedConfig } from './types.js';
import { computeImageParams } from './url-builder.js';
import { detectFormats, getFormatSupport } from './format-detector.js';
import { observeResize, observeIntersection } from './observer-manager.js';

/** Apply defaults to user config. */
function resolveConfig(config: SlimmageConfig): ResolvedConfig {
  return {
    src: config.src,
    container: config.container,
    widthStep: config.widthStep ?? 160,
    maxWidth: config.maxWidth ?? 4096,
    dprAware: config.dprAware ?? true,
    maxDpr: config.maxDpr ?? 3,
    quality: config.quality ?? 85,
    qualityDprStep: config.qualityDprStep ?? 10,
    preferredFormat: config.preferredFormat ?? 'avif',
    lazy: config.lazy ?? true,
    lazyMargin: config.lazyMargin ?? '200px',
    aspectRatio: config.aspectRatio,
    fetchPriority: config.fetchPriority ?? 'auto',
    onBeforeLoad: config.onBeforeLoad,
    onLoad: config.onLoad,
  };
}

/** Resolve the container element from config. */
function resolveContainer(img: HTMLImageElement, config: ResolvedConfig): Element {
  if (config.container instanceof Element) return config.container;
  if (typeof config.container === 'string') {
    const el = img.closest(config.container) ?? document.querySelector(config.container);
    if (el) return el;
  }
  return img.parentElement ?? img;
}

/**
 * Attach slimmage behavior to an `<img>` element.
 *
 * Observes the container's size via ResizeObserver and updates
 * `img.src` with the optimal RIAPI URL.
 *
 * Returns a cleanup function that disconnects all observers.
 *
 * @example
 * ```js
 * const cleanup = createSlimmage(document.querySelector('img'), {
 *   src: 'https://cdn.example.com/photo.jpg?width=160&quality=85',
 *   container: '.card',
 * });
 * // Later: cleanup();
 * ```
 */
export function createSlimmage(
  img: HTMLImageElement,
  config: SlimmageConfig,
): () => void {
  const resolved = resolveConfig(config);
  const container = resolveContainer(img, resolved);

  let previousWidth = 0;
  let previousUrl: string | null = null;
  let isVisible = !resolved.lazy;
  const cleanups: (() => void)[] = [];

  // Kick off format detection (non-blocking)
  detectFormats();

  // Set fetchpriority
  if (resolved.fetchPriority !== 'auto') {
    img.setAttribute('fetchpriority', resolved.fetchPriority);
  }

  // Set aspect ratio for CLS prevention
  if (resolved.aspectRatio) {
    img.style.aspectRatio = String(resolved.aspectRatio);
  }

  function update(containerWidth: number): void {
    if (!isVisible) return;
    if (containerWidth <= 0) return;

    const formatSupport = getFormatSupport();
    let info = computeImageParams(
      containerWidth,
      resolved,
      formatSupport,
      previousWidth,
      previousUrl,
    );

    if (!info) return; // Ratchet: no change needed

    // Allow user to modify or cancel
    if (resolved.onBeforeLoad) {
      const modified = resolved.onBeforeLoad(info);
      if (modified) info = modified;
    }

    img.src = info.url;
    previousWidth = info.requestedWidth;
    previousUrl = info.url;

    if (resolved.onLoad) {
      const loadInfo = info;
      img.addEventListener('load', () => resolved.onLoad!(loadInfo), { once: true });
    }
  }

  // Observe container size
  const cleanupResize = observeResize(container, (entry) => {
    const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
    update(width);
  });
  cleanups.push(cleanupResize);

  // Lazy loading via IntersectionObserver
  if (resolved.lazy) {
    const cleanupIntersection = observeIntersection(
      img,
      (entry) => {
        if (entry.isIntersecting) {
          isVisible = true;
          // Get current container width and trigger first load
          const rect = container.getBoundingClientRect();
          update(rect.width);
        }
      },
      resolved.lazyMargin,
    );
    cleanups.push(cleanupIntersection);
  }

  // If not lazy, or fetchPriority is high, trigger immediately
  if (!resolved.lazy || resolved.fetchPriority === 'high') {
    isVisible = true;
    // Initial measurement happens via ResizeObserver callback
    // But also do an immediate measurement as ResizeObserver may be async
    const rect = container.getBoundingClientRect();
    if (rect.width > 0) {
      update(rect.width);
    }
  }

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
