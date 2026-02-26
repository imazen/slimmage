function effectiveDpr(dprAware, maxDpr) {
  if (!dprAware) return 1;
  const raw = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  return Math.min(raw, maxDpr);
}
function stepWidth(idealWidth, step, maxWidth) {
  if (idealWidth <= 0) return 0;
  const stepped = Math.round(Math.ceil(idealWidth / step) * step);
  return Math.min(maxWidth, Math.max(step, stepped));
}
function computeQuality(baseQuality, dpr, qualityDprStep) {
  if (dpr <= 1) return baseQuality;
  const reduction = Math.floor(dpr - 1) * qualityDprStep;
  return Math.max(10, baseQuality - reduction);
}
const WIDTH_KEYS = ["width", "w", "maxwidth"];
const HEIGHT_KEYS = ["height", "h", "maxheight"];
function findParam(params, keys) {
  for (const [k, v] of params) {
    if (keys.includes(k.toLowerCase())) {
      return [k, v];
    }
  }
  return null;
}
function resolveFormat(preferredFormat, support) {
  if (preferredFormat === "auto") {
    if (support.avif) return "avif";
    if (support.webp) return "webp";
    return "jpeg";
  }
  if (preferredFormat === "avif" && support.avif) return "avif";
  if (preferredFormat === "webp" && support.webp) return "webp";
  if (preferredFormat === "avif" && !support.avif) {
    return support.webp ? "webp" : "jpeg";
  }
  if (preferredFormat === "webp" && !support.webp) {
    return support.avif ? "avif" : "jpeg";
  }
  return preferredFormat;
}
function computeImageParams(containerWidth, config, formatSupport, previousWidth, previousUrl) {
  const dpr = effectiveDpr(config.dprAware, config.maxDpr);
  const idealWidth = containerWidth * dpr;
  const requestedWidth = stepWidth(idealWidth, config.widthStep, config.maxWidth);
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
    previousWidth
  };
}
function buildUrl(templateUrl, requestedWidth, quality, format) {
  const isRelative = !templateUrl.includes("://");
  const base = isRelative ? "http://_slimmage_" : void 0;
  let url;
  try {
    url = new URL(templateUrl, base);
  } catch {
    return templateUrl;
  }
  const params = url.searchParams;
  const widthEntry = findParam(params, WIDTH_KEYS);
  const heightEntry = findParam(params, HEIGHT_KEYS);
  const zoomStr = params.get("zoom");
  const zoom = zoomStr ? parseFloat(zoomStr) : 1;
  const effectiveZoom = isNaN(zoom) ? 1 : zoom;
  const adjustedWidth = Math.round(requestedWidth / effectiveZoom);
  if (widthEntry) {
    const [key] = widthEntry;
    params.set(key, String(adjustedWidth));
    if (heightEntry) {
      const [hKey] = heightEntry;
      const origW = parseFloat(widthEntry[1]);
      const origH = parseFloat(heightEntry[1]);
      if (origW > 0 && origH > 0) {
        const newH = Math.round(adjustedWidth / origW * origH);
        params.set(hKey, String(newH));
      }
    }
  }
  const qualityEntry = findParam(params, ["quality"]);
  if (qualityEntry) {
    params.set(qualityEntry[0], String(quality));
  }
  const formatEntry = findParam(params, ["format"]);
  if (formatEntry && format !== "jpeg" && format !== "png") {
    params.set(formatEntry[0], format);
  }
  const result = url.toString();
  if (isRelative) {
    return result.replace("http://_slimmage_", "");
  }
  return result;
}
const WEBP_PROBE = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
const AVIF_PROBE = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLanAyaAAAAAAAAgABAAAAAAAAAAAAAAAAAAACEElDQyAAAAAlAAAAAAIQAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADYAAAAXY29scm5jbHgAAQANAAYABgAGAAAAAAAAEGlwbWEAAAAAAAAAAQABBYGCA4QFAAAAHm1kYXQSAAoIGBYSEAAAAcQgBgEx";
let _support = null;
let _promise = null;
function probeFormat(dataUri) {
  if (typeof Image === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.height === 2 || img.height === 1);
    img.onerror = () => resolve(false);
    img.src = dataUri;
  });
}
function detectFormats() {
  if (_support) return Promise.resolve(_support);
  if (_promise) return _promise;
  _promise = Promise.all([
    probeFormat(WEBP_PROBE),
    probeFormat(AVIF_PROBE)
  ]).then(([webp, avif]) => {
    _support = { webp, avif };
    return _support;
  });
  return _promise;
}
function getFormatSupport() {
  return _support ?? { webp: false, avif: false };
}
const resizeCallbacks = /* @__PURE__ */ new WeakMap();
let sharedResizeObserver = null;
function getResizeObserver() {
  if (sharedResizeObserver) return sharedResizeObserver;
  sharedResizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const cbs = resizeCallbacks.get(entry.target);
      if (cbs) {
        for (const cb of cbs) {
          cb(entry);
        }
      }
    }
  });
  return sharedResizeObserver;
}
function observeResize(element, callback) {
  const observer = getResizeObserver();
  let cbs = resizeCallbacks.get(element);
  if (!cbs) {
    cbs = /* @__PURE__ */ new Set();
    resizeCallbacks.set(element, cbs);
    observer.observe(element);
  }
  cbs.add(callback);
  return () => {
    cbs.delete(callback);
    if (cbs.size === 0) {
      observer.unobserve(element);
      resizeCallbacks.delete(element);
    }
  };
}
const ioPool = /* @__PURE__ */ new Map();
function observeIntersection(element, callback, rootMargin = "200px") {
  let pool = ioPool.get(rootMargin);
  if (!pool) {
    const callbacks = /* @__PURE__ */ new WeakMap();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const cbs2 = callbacks.get(entry.target);
          if (cbs2) {
            for (const cb of cbs2) {
              cb(entry);
            }
          }
        }
      },
      { rootMargin }
    );
    pool = { observer, callbacks };
    ioPool.set(rootMargin, pool);
  }
  let cbs = pool.callbacks.get(element);
  if (!cbs) {
    cbs = /* @__PURE__ */ new Set();
    pool.callbacks.set(element, cbs);
    pool.observer.observe(element);
  }
  cbs.add(callback);
  return () => {
    cbs.delete(callback);
    if (cbs.size === 0) {
      pool.observer.unobserve(element);
      pool.callbacks.delete(element);
    }
  };
}
function resolveConfig(config) {
  return {
    src: config.src,
    container: config.container,
    widthStep: config.widthStep ?? 160,
    maxWidth: config.maxWidth ?? 4096,
    dprAware: config.dprAware ?? true,
    maxDpr: config.maxDpr ?? 3,
    quality: config.quality ?? 85,
    qualityDprStep: config.qualityDprStep ?? 10,
    preferredFormat: config.preferredFormat ?? "avif",
    lazy: config.lazy ?? true,
    lazyMargin: config.lazyMargin ?? "200px",
    aspectRatio: config.aspectRatio,
    fetchPriority: config.fetchPriority ?? "auto",
    onBeforeLoad: config.onBeforeLoad,
    onLoad: config.onLoad
  };
}
function resolveContainer(img, config) {
  if (config.container instanceof Element) return config.container;
  if (typeof config.container === "string") {
    const el = img.closest(config.container) ?? document.querySelector(config.container);
    if (el) return el;
  }
  return img.parentElement ?? img;
}
function createSlimmage(img, config) {
  const resolved = resolveConfig(config);
  const container = resolveContainer(img, resolved);
  let previousWidth = 0;
  let previousUrl = null;
  let isVisible = !resolved.lazy;
  const cleanups = [];
  detectFormats();
  if (resolved.fetchPriority !== "auto") {
    img.setAttribute("fetchpriority", resolved.fetchPriority);
  }
  if (resolved.aspectRatio) {
    img.style.aspectRatio = String(resolved.aspectRatio);
  }
  function update(containerWidth) {
    if (!isVisible) return;
    if (containerWidth <= 0) return;
    const formatSupport = getFormatSupport();
    let info = computeImageParams(
      containerWidth,
      resolved,
      formatSupport,
      previousWidth,
      previousUrl
    );
    if (!info) return;
    if (resolved.onBeforeLoad) {
      const modified = resolved.onBeforeLoad(info);
      if (modified) info = modified;
    }
    img.src = info.url;
    previousWidth = info.requestedWidth;
    previousUrl = info.url;
    if (resolved.onLoad) {
      const loadInfo = info;
      img.addEventListener("load", () => resolved.onLoad(loadInfo), { once: true });
    }
  }
  const cleanupResize = observeResize(container, (entry) => {
    var _a, _b;
    const width = ((_b = (_a = entry.contentBoxSize) == null ? void 0 : _a[0]) == null ? void 0 : _b.inlineSize) ?? entry.contentRect.width;
    update(width);
  });
  cleanups.push(cleanupResize);
  if (resolved.lazy) {
    const cleanupIntersection = observeIntersection(
      img,
      (entry) => {
        if (entry.isIntersecting) {
          isVisible = true;
          const rect = container.getBoundingClientRect();
          update(rect.width);
        }
      },
      resolved.lazyMargin
    );
    cleanups.push(cleanupIntersection);
  }
  if (!resolved.lazy || resolved.fetchPriority === "high") {
    isVisible = true;
    const rect = container.getBoundingClientRect();
    if (rect.width > 0) {
      update(rect.width);
    }
  }
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
export {
  buildUrl,
  computeImageParams,
  computeQuality,
  createSlimmage,
  detectFormats,
  effectiveDpr,
  getFormatSupport,
  observeIntersection,
  observeResize,
  stepWidth
};
