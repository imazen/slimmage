/** Supported image formats for format negotiation. */
export type ImageFormat = 'avif' | 'webp' | 'jpeg' | 'png' | 'auto';

/** Configuration for a slimmage-managed image. */
export interface SlimmageConfig {
  /** Template URL with RIAPI params (e.g. ?width=160&quality=85). */
  src: string;
  /** CSS selector or Element for the container to observe. Default: parentElement. */
  container?: string | Element;
  /** CDN cache step size in pixels. Default: 160. */
  widthStep?: number;
  /** Maximum pixel width to request. Default: 4096. */
  maxWidth?: number;
  /** Multiply container width by devicePixelRatio. Default: true. */
  dprAware?: boolean;
  /** Cap devicePixelRatio at this value. Default: 3. */
  maxDpr?: number;
  /** Base JPEG quality (1-100). Default: 85. */
  quality?: number;
  /** Quality reduction per DPR step above 1. Default: 10. */
  qualityDprStep?: number;
  /** Preferred format if browser supports it. Default: 'avif'. */
  preferredFormat?: ImageFormat;
  /** Use IntersectionObserver for lazy loading. Default: true. */
  lazy?: boolean;
  /** IntersectionObserver rootMargin. Default: '200px'. */
  lazyMargin?: string;
  /** width/height ratio for CLS prevention via aspect-ratio. */
  aspectRatio?: number;
  /** Fetch priority hint for the image element. */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Called before each URL update. Return modified info or void. */
  onBeforeLoad?: (info: ImageLoadInfo) => ImageLoadInfo | void;
  /** Called after each successful image load. */
  onLoad?: (info: ImageLoadInfo) => void;
}

/** Information about an image load operation. */
export interface ImageLoadInfo {
  /** The container's CSS pixel width. */
  containerWidth: number;
  /** The effective devicePixelRatio used. */
  dpr: number;
  /** The stepped pixel width being requested. */
  requestedWidth: number;
  /** The JPEG quality being requested. */
  quality: number;
  /** The image format being requested. */
  format: ImageFormat;
  /** The computed URL to load. */
  url: string;
  /** The previous URL (null on first load). */
  previousUrl: string | null;
  /** The previous requested width (0 on first load). */
  previousWidth: number;
}

/** Resolved config with all defaults applied. */
export interface ResolvedConfig {
  src: string;
  container: string | Element | undefined;
  widthStep: number;
  maxWidth: number;
  dprAware: boolean;
  maxDpr: number;
  quality: number;
  qualityDprStep: number;
  preferredFormat: ImageFormat;
  lazy: boolean;
  lazyMargin: string;
  aspectRatio: number | undefined;
  fetchPriority: 'high' | 'low' | 'auto';
  onBeforeLoad: ((info: ImageLoadInfo) => ImageLoadInfo | void) | undefined;
  onLoad: ((info: ImageLoadInfo) => void) | undefined;
}

/** Result of format detection. */
export interface FormatSupport {
  webp: boolean;
  avif: boolean;
}
