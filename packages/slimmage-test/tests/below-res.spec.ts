import { test, expect, type Page } from '@playwright/test';

/** Collect /image requests from the page. Must be called BEFORE page.goto(). */
function collectImageRequests(page: Page): { width: number; url: string }[] {
  const requests: { width: number; url: string }[] = [];
  page.on('response', (resp) => {
    const url = new URL(resp.url());
    if (url.pathname === '/image') {
      const width = parseInt(url.searchParams.get('width') ?? '0', 10);
      requests.push({ width, url: resp.url() });
    }
  });
  return requests;
}

/** Wait for img.src to be set to an /image URL. */
async function waitForImageSrc(page: Page) {
  await page.waitForFunction(() => {
    const img = document.getElementById('img') as HTMLImageElement | null;
    return img?.src?.includes('/image?');
  }, undefined, { timeout: 5000 });
  await page.waitForTimeout(200);
}

test.describe('below-resolution (maxWidth)', () => {
  test('maxWidth caps requested width when container exceeds it', async ({ page }) => {
    const requests = collectImageRequests(page);
    // Set viewport wider than maxWidth (800)
    await page.setViewportSize({ width: 1200, height: 768 });
    await page.goto('/layouts/below-res.html');
    await waitForImageSrc(page);

    expect(requests.length).toBeGreaterThan(0);
    // maxWidth is 800, so all requests should be capped at 800
    for (const req of requests) {
      expect(req.width).toBeLessThanOrEqual(800);
    }
    // The request should be exactly 800 (maxWidth), since 1200 > 800
    expect(requests[0].width).toBe(800);
  });

  test('container smaller than maxWidth works normally', async ({ page }) => {
    const requests = collectImageRequests(page);
    // Set viewport smaller than maxWidth (800)
    await page.setViewportSize({ width: 600, height: 768 });
    await page.goto('/layouts/below-res.html');
    await waitForImageSrc(page);

    expect(requests.length).toBeGreaterThan(0);
    // Width should be stepped up from ~600 → 640 (ceil(600/160)*160)
    expect(requests[0].width).toBe(640);
    expect(requests[0].width).toBeLessThan(800);
  });

  test('onBeforeLoad receives requestedWidth reflecting the cap', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 768 });
    await page.goto('/layouts/below-res.html');
    await waitForImageSrc(page);

    const calls = await page.evaluate(() =>
      (window as any).__slimmageCallbacks.beforeLoadCalls
    );

    expect(calls.length).toBeGreaterThan(0);
    const first = calls[0];
    // Container is ~1200px but maxWidth caps the request
    expect(first.containerWidth).toBeGreaterThan(800);
    expect(first.requestedWidth).toBe(800);
  });

  test('growing container past maxWidth does not exceed it', async ({ page }) => {
    const requests = collectImageRequests(page);
    // Start small
    await page.setViewportSize({ width: 400, height: 768 });
    await page.goto('/layouts/below-res.html');
    await waitForImageSrc(page);

    // Grow past maxWidth
    await page.setViewportSize({ width: 1600, height: 768 });
    await page.waitForTimeout(500);

    // All requests should respect maxWidth
    for (const req of requests) {
      expect(req.width).toBeLessThanOrEqual(800);
    }
  });
});
