import { createSlimmage } from 'slimmage-core';
import type { SlimmageConfig, ImageLoadInfo, ImageFormat } from 'slimmage-core';

const template = document.createElement('template');
template.innerHTML = `
<style>
  :host {
    display: block;
    overflow: hidden;
  }
  img {
    display: block;
    width: 100%;
    height: auto;
    background: var(--slimmage-placeholder-bg, transparent);
    transition: var(--slimmage-transition, none);
  }
</style>
<img part="img">
`;

/**
 * Parse a string attribute into a boolean.
 * "false", "0", "" → false; everything else (including absent) → defaultVal.
 */
function parseBool(value: string | null, defaultVal: boolean): boolean {
  if (value === null) return defaultVal;
  if (value === 'false' || value === '0') return false;
  return true;
}

/**
 * `<slimmage-img>` — Web Component for container-responsive images.
 *
 * Attributes:
 *   src, container, width-step, max-width, dpr-aware, max-dpr,
 *   quality, quality-dpr-step, preferred-format, lazy, lazy-margin,
 *   aspect-ratio, fetchpriority
 *
 * CSS Custom Properties:
 *   --slimmage-placeholder-bg: background color while loading
 *   --slimmage-transition: CSS transition for the <img>
 *
 * Events:
 *   slimmage-load: CustomEvent<ImageLoadInfo>
 *
 * Parts:
 *   img: the inner <img> element
 */
export class SlimmageImgElement extends HTMLElement {
  static observedAttributes = [
    'src', 'container', 'width-step', 'max-width', 'dpr-aware', 'max-dpr',
    'quality', 'quality-dpr-step', 'preferred-format', 'lazy', 'lazy-margin',
    'aspect-ratio', 'fetchpriority',
  ];

  private _cleanup: (() => void) | null = null;
  private _img: HTMLImageElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    this._img = shadow.querySelector('img')!;
  }

  connectedCallback() {
    this._setup();
  }

  disconnectedCallback() {
    this._teardown();
  }

  attributeChangedCallback() {
    // Re-setup on any attribute change
    this._teardown();
    this._setup();
  }

  private _setup() {
    const src = this.getAttribute('src');
    if (!src) return;

    const config: SlimmageConfig = {
      src,
      container: this.getAttribute('container') ?? this.parentElement ?? undefined,
      widthStep: this._numAttr('width-step', 160),
      maxWidth: this._numAttr('max-width', 4096),
      dprAware: parseBool(this.getAttribute('dpr-aware'), true),
      maxDpr: this._numAttr('max-dpr', 3),
      quality: this._numAttr('quality', 85),
      qualityDprStep: this._numAttr('quality-dpr-step', 10),
      preferredFormat: (this.getAttribute('preferred-format') ?? 'avif') as ImageFormat,
      lazy: parseBool(this.getAttribute('lazy'), true),
      lazyMargin: this.getAttribute('lazy-margin') ?? '200px',
      aspectRatio: this._numAttrOpt('aspect-ratio'),
      fetchPriority: (this.getAttribute('fetchpriority') ?? 'auto') as 'high' | 'low' | 'auto',
      onLoad: (info: ImageLoadInfo) => {
        this.dispatchEvent(new CustomEvent('slimmage-load', {
          detail: info,
          bubbles: true,
          composed: true,
        }));
      },
    };

    // If container attribute is not set, use the host's parent
    if (!this.getAttribute('container')) {
      config.container = this.parentElement ?? undefined;
    }

    this._cleanup = createSlimmage(this._img, config);
  }

  private _teardown() {
    this._cleanup?.();
    this._cleanup = null;
  }

  private _numAttr(name: string, defaultVal: number): number {
    const val = this.getAttribute(name);
    if (val === null) return defaultVal;
    const n = parseFloat(val);
    return isNaN(n) ? defaultVal : n;
  }

  private _numAttrOpt(name: string): number | undefined {
    const val = this.getAttribute(name);
    if (val === null) return undefined;
    const n = parseFloat(val);
    return isNaN(n) ? undefined : n;
  }
}
