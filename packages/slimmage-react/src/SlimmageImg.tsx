import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { createSlimmage } from 'slimmage-core';
import type { SlimmageConfig, ImageLoadInfo, ImageFormat } from 'slimmage-core';

export interface SlimmageImgProps {
  src: string;
  container?: string | Element;
  widthStep?: number;
  maxWidth?: number;
  dprAware?: boolean;
  maxDpr?: number;
  quality?: number;
  qualityDprStep?: number;
  preferredFormat?: ImageFormat;
  lazy?: boolean;
  lazyMargin?: string;
  aspectRatio?: number;
  fetchPriority?: 'high' | 'low' | 'auto';
  onBeforeLoad?: (info: ImageLoadInfo) => ImageLoadInfo | void;
  onSlimmageLoad?: (info: ImageLoadInfo) => void;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * React component for container-responsive images.
 *
 * @example
 * ```tsx
 * <SlimmageImg
 *   src="https://cdn.example.com/photo.jpg?width=160&quality=85"
 *   container=".card"
 *   alt="Photo"
 * />
 * ```
 */
export const SlimmageImg = forwardRef<HTMLImageElement, SlimmageImgProps>(
  function SlimmageImg(props, ref) {
    const {
      src,
      container,
      widthStep,
      maxWidth,
      dprAware,
      maxDpr,
      quality,
      qualityDprStep,
      preferredFormat,
      lazy,
      lazyMargin,
      aspectRatio,
      fetchPriority,
      onBeforeLoad,
      onSlimmageLoad,
      alt = '',
      className,
      style,
    } = props;

    const imgRef = useRef<HTMLImageElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => imgRef.current!);

    useEffect(() => {
      const img = imgRef.current;
      if (!img) return;

      const config: SlimmageConfig = {
        src,
        container: container ?? wrapperRef.current ?? undefined,
        widthStep,
        maxWidth,
        dprAware,
        maxDpr,
        quality,
        qualityDprStep,
        preferredFormat,
        lazy,
        lazyMargin,
        aspectRatio,
        fetchPriority,
        onBeforeLoad,
        onLoad: onSlimmageLoad,
      };

      const cleanup = createSlimmage(img, config);
      return cleanup;
    }, [src, container, widthStep, maxWidth]);

    const wrapperStyle: React.CSSProperties = {
      ...style,
      ...(aspectRatio ? { aspectRatio: String(aspectRatio) } : {}),
    };

    return (
      <div ref={wrapperRef} className={className} style={wrapperStyle}>
        <img
          ref={imgRef}
          alt={alt}
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </div>
    );
  },
);
