/**
 * Shared ResizeObserver + IntersectionObserver pools.
 *
 * ResizeObserver watches the container (not the image) — the core shift
 * from original slimmage's "poll on resize" approach.
 *
 * One shared ResizeObserver instance, callbacks tracked via WeakMap.
 * IntersectionObserver instances pooled by rootMargin.
 */

type ResizeCallback = (entry: ResizeObserverEntry) => void;
type IntersectionCallback = (entry: IntersectionObserverEntry) => void;

// --- ResizeObserver pool ---

const resizeCallbacks = new WeakMap<Element, Set<ResizeCallback>>();
let sharedResizeObserver: ResizeObserver | null = null;

function getResizeObserver(): ResizeObserver {
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

/**
 * Observe an element's size changes. Returns a cleanup function.
 */
export function observeResize(element: Element, callback: ResizeCallback): () => void {
  const observer = getResizeObserver();
  let cbs = resizeCallbacks.get(element);
  if (!cbs) {
    cbs = new Set();
    resizeCallbacks.set(element, cbs);
    observer.observe(element);
  }
  cbs.add(callback);

  return () => {
    cbs!.delete(callback);
    if (cbs!.size === 0) {
      observer.unobserve(element);
      resizeCallbacks.delete(element);
    }
  };
}

// --- IntersectionObserver pool ---

interface IOPool {
  observer: IntersectionObserver;
  callbacks: WeakMap<Element, Set<IntersectionCallback>>;
}

const ioPool = new Map<string, IOPool>();

/**
 * Observe an element's intersection (visibility). Returns a cleanup function.
 */
export function observeIntersection(
  element: Element,
  callback: IntersectionCallback,
  rootMargin: string = '200px',
): () => void {
  let pool = ioPool.get(rootMargin);
  if (!pool) {
    const callbacks = new WeakMap<Element, Set<IntersectionCallback>>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const cbs = callbacks.get(entry.target);
          if (cbs) {
            for (const cb of cbs) {
              cb(entry);
            }
          }
        }
      },
      { rootMargin },
    );
    pool = { observer, callbacks };
    ioPool.set(rootMargin, pool);
  }

  let cbs = pool.callbacks.get(element);
  if (!cbs) {
    cbs = new Set();
    pool.callbacks.set(element, cbs);
    pool.observer.observe(element);
  }
  cbs.add(callback);

  return () => {
    cbs!.delete(callback);
    if (cbs!.size === 0) {
      pool!.observer.unobserve(element);
      pool!.callbacks.delete(element);
    }
  };
}
