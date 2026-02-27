# slimmage

[![Tests](https://github.com/imazen/slimmage/actions/workflows/test.yml/badge.svg)](https://github.com/imazen/slimmage/actions/workflows/test.yml)

Container-responsive images via ResizeObserver. ~3KB gzipped, zero dependencies.

`srcset` and `sizes` select images based on the viewport. Slimmage watches the *container* — the actual element your image lives in — and requests the right resolution for the real layout. Sidebar, grid cell, resizable panel, nested flexbox: the image adapts to whatever space it gets.

**[Live demo](https://imazen.github.io/slimmage/)**

## When to use srcset, and when to use slimmage

If you can reliably calculate the size an image will be at every viewport breakpoint — fixed layouts, simple pages, marketing landing pages — use `srcset` and `sizes`. It's native, requires no JS, and the browser can start fetching before layout completes. [srcset.tips](https://www.srcset.tips/en/introduction/) is a good resource for getting the `sizes` attribute right.

Where `srcset` breaks down is layouts where image size depends on *container* state rather than viewport state: sidebars that collapse, CSS grid with `auto-fit`, resizable panels, tab widgets, accordions, or anything where the image width can't be expressed as a viewport calculation. In those cases, `sizes` can't describe the relationship and the browser picks the wrong file. Slimmage measures the container at runtime instead of predicting it at authoring time.

## Install

```sh
npm install slimmage-core
```

Or with bun/pnpm:

```sh
bun add slimmage-core
pnpm add slimmage-core
```

## Quick start

```js
import { createSlimmage } from 'slimmage-core';

const cleanup = createSlimmage(document.querySelector('img'), {
  src: 'https://cdn.example.com/photo.jpg?width=160&quality=85',
  container: '.card',
});

// Later: cleanup();
```

Slimmage rewrites the `width` and `quality` query parameters in your template URL based on the container's measured width. It works with any [RIAPI-compliant](http://riapi.org) image server — [Imageflow](https://www.imageflow.io), ImageResizer, Imgix, Cloudinary, or anything that reads `?width=` from the URL.

## How it works

1. **Observe** — A shared `ResizeObserver` watches the container element's inline size.
2. **Compute** — Container width x DPR, snapped to the nearest step (default 160px). Fewer unique URLs = better CDN cache hit rates.
3. **Load** — `img.src` is set with the computed RIAPI parameters. The ratchet prevents re-downloading smaller sizes on shrink. Format detection picks WebP or AVIF when supported.

## Framework bindings

### React

```tsx
import { useSlimmage } from 'slimmage-react';

function Photo({ url }) {
  const ref = useSlimmage({ src: url, container: '.card' });
  return <img ref={ref} alt="" />;
}
```

`slimmage-react` also exports a `<SlimmageImg>` component that wraps the img in a container div and forwards all config as props.

### Svelte

```svelte
<script>
  import { SlimmageImg } from 'slimmage-svelte';
</script>

<SlimmageImg src={url} container=".card" />
```

### Web Component

```html
<script type="module">
  import 'slimmage-wc';
</script>

<slimmage-img
  src="https://cdn.example.com/photo.jpg?width=160&quality=85"
  container=".card">
</slimmage-img>
```

Attributes use kebab-case (`width-step`, `max-width`, `dpr-aware`, etc.). Fires a `slimmage-load` CustomEvent on each load. Style the inner `<img>` via `::part(img)` or CSS custom properties `--slimmage-placeholder-bg` and `--slimmage-transition`.

## Configuration

All options are passed to `createSlimmage(img, config)`. The function returns a cleanup callback that disconnects all observers.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `src` | `string` | — | Template URL with RIAPI params (required) |
| `container` | `string \| Element` | parentElement | CSS selector or element to observe |
| `widthStep` | `number` | `160` | Width snap step in px for CDN cache efficiency |
| `maxWidth` | `number` | `4096` | Cap on requested pixel width (set to source image's native width) |
| `dprAware` | `boolean` | `true` | Multiply container width by devicePixelRatio |
| `maxDpr` | `number` | `3` | Cap on devicePixelRatio |
| `quality` | `number` | `85` | Base JPEG quality (1-100) |
| `qualityDprStep` | `number` | `10` | Quality reduction per DPR step above 1x |
| `preferredFormat` | `ImageFormat` | `'avif'` | Preferred format if browser supports it |
| `lazy` | `boolean` | `true` | Defer load until image enters viewport via IntersectionObserver |
| `lazyMargin` | `string` | `'200px'` | IntersectionObserver rootMargin |
| `aspectRatio` | `number` | — | Width/height ratio; sets CSS `aspect-ratio` for CLS prevention |
| `fetchPriority` | `'high' \| 'low' \| 'auto'` | `'auto'` | Fetch priority hint |
| `onBeforeLoad` | `(info) => info \| void` | — | Called before each URL update; return modified info or void |
| `onLoad` | `(info) => void` | — | Called after each successful image load |

`ImageFormat` is `'avif' | 'webp' | 'jpeg' | 'png' | 'auto'`.

## Key behaviors

**Width stepping** — Requested widths are always multiples of `widthStep`. At the default of 160, that's 160, 320, 480, ... 4096. This limits the number of unique URLs so CDN caches stay warm.

**Ratchet** — Once a larger image is loaded, shrinking the container does not trigger a smaller request. The browser renders the cached larger image at the smaller display size for free.

**DPR-aware quality** — At 2x DPR, quality drops from 85 to 75. At 3x, it drops to 65. Higher density means artifacts are less visible; lower quality means smaller files.

**Format negotiation** — Slimmage probes for AVIF and WebP support on load. If your template URL includes a `format=` parameter, it'll be updated to the best supported format.

**maxWidth** — Set this to your source image's native pixel width. Without it, containers wider than the source will request upscaled sizes that add bytes without adding detail.

## Background images

For responsive background images, use CSS container queries instead of slimmage. They apply during the layout pass with zero JS delay — better for LCP on above-the-fold backgrounds.

```css
.hero {
  container-type: inline-size;
  container-name: hero;
}

.hero-bg {
  background-image: url('photo.jpg?width=480');
}

@container hero (min-width: 480px) {
  .hero-bg { background-image: url('photo.jpg?width=800'); }
}

@container hero (min-width: 800px) {
  .hero-bg { background-image: url('photo.jpg?width=1200'); }
}
```

Browser support: Chrome 105+, Firefox 110+, Safari 16+ (>95% global coverage).

Slimmage stays focused on `<img>` elements where CSS has no container-responsive solution. Use CSS container queries for backgrounds, slimmage for `<img>`.

## Utility exports

```ts
import { stepWidth, effectiveDpr, computeQuality, buildUrl } from 'slimmage-core';

stepWidth(idealWidth, step, maxWidth)     // Snap to nearest step, clamp to maxWidth
effectiveDpr(dprAware, maxDpr)            // 1 if !dprAware, else min(devicePixelRatio, maxDpr)
computeQuality(baseQuality, dpr, step)    // Reduce quality for high-DPR displays
buildUrl(templateUrl, width, quality, fmt) // Rewrite RIAPI params in a URL
```

## Packages

| Package | Description |
|---------|-------------|
| `slimmage-core` | Core logic, zero dependencies |
| `slimmage-react` | React hook + component (React 18-19) |
| `slimmage-svelte` | Svelte 5 component |
| `slimmage-wc` | Web Component (`<slimmage-img>`) |

## Development

```sh
bun install
bun run build               # Build all packages
bun test                     # Unit tests (slimmage-core)
bun run test:e2e             # Playwright e2e tests (chromium/firefox/webkit)
```

The test suite runs 72 unit tests and 82 Playwright tests across Chromium, Firefox, and WebKit, plus mobile viewports (Pixel 5, iPhone 13).

## License

MIT/Apache-2.0 dual licensed by [Imazen](https://www.imazen.io).
