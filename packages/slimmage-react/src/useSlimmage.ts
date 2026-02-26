import { useEffect, useRef, useCallback } from 'react';
import { createSlimmage } from 'slimmage-core';
import type { SlimmageConfig } from 'slimmage-core';

/**
 * Hook for attaching slimmage behavior to a custom image component.
 *
 * @example
 * ```tsx
 * function MyImage({ src }) {
 *   const imgRef = useSlimmage({ src, container: '.card' });
 *   return <img ref={imgRef} alt="" />;
 * }
 * ```
 */
export function useSlimmage(config: SlimmageConfig) {
  const imgRef = useRef<HTMLImageElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const stableConfig = useRef(config);
  stableConfig.current = config;

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    cleanupRef.current?.();
    cleanupRef.current = createSlimmage(img, stableConfig.current);

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [config.src, config.container, config.widthStep, config.maxWidth]);

  return imgRef;
}
