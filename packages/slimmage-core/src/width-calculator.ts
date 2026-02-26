/**
 * Width stepping, DPR, and quality calculations.
 *
 * Ported from slimmage.js:132-205.
 */

/**
 * Compute the effective DPR, capped at maxDpr.
 * Returns 1 if dprAware is false.
 */
export function effectiveDpr(dprAware: boolean, maxDpr: number): number {
  if (!dprAware) return 1;
  const raw = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  return Math.min(raw, maxDpr);
}

/**
 * Step an ideal pixel width up to the nearest multiple of `step`.
 * Clamps to [step, maxWidth].
 *
 * Matches original formula: Math.min(maxWidth, Math.round(Math.ceil(ideal / step) * step))
 */
export function stepWidth(idealWidth: number, step: number, maxWidth: number): number {
  if (idealWidth <= 0) return 0;
  const stepped = Math.round(Math.ceil(idealWidth / step) * step);
  return Math.min(maxWidth, Math.max(step, stepped));
}

/**
 * Compute JPEG quality for a given DPR.
 * Higher DPR = lower quality (human eye can't see it at higher density).
 */
export function computeQuality(baseQuality: number, dpr: number, qualityDprStep: number): number {
  if (dpr <= 1) return baseQuality;
  // Reduce quality for each DPR step above 1
  const reduction = Math.floor(dpr - 1) * qualityDprStep;
  return Math.max(10, baseQuality - reduction);
}
