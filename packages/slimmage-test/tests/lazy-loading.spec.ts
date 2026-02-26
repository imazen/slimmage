import { test, expect, type Page } from '@playwright/test';

function collectImageRequests(page: Page): { width: number; url: string; id: string }[] {
  const requests: { width: number; url: string; id: string }[] = [];
  page.on('response', (resp) => {
    const url = new URL(resp.url());
    if (url.pathname === '/image') {
      const width = parseInt(url.searchParams.get('width') ?? '0', 10);
      const id = url.searchParams.get('id') ?? '';
      requests.push({ width, url: resp.url(), id });
    }
  });
  return requests;
}

test.describe('lazy loading', () => {
  test('above-fold image loads immediately', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/lazy-loading.html');

    // Wait for eager image
    await page.waitForFunction(() => {
      const img = document.getElementById('img-eager') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(300);

    const eagerReqs = requests.filter(r => r.id === 'eager');
    expect(eagerReqs.length).toBeGreaterThan(0);
  });

  test('below-fold lazy image does NOT load until scrolled', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/lazy-loading.html');

    // Wait for eager to load
    await page.waitForFunction(() => {
      const img = document.getElementById('img-eager') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(500);

    // Lazy image should NOT have loaded yet
    const lazyReqs = requests.filter(r => r.id === 'lazy');
    expect(lazyReqs.length).toBe(0);

    // Now scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Lazy image should now load
    const lazyReqsAfterScroll = requests.filter(r => r.id === 'lazy');
    expect(lazyReqsAfterScroll.length).toBeGreaterThan(0);
  });

  test('fetchPriority=high loads immediately even with lazy=true', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/lazy-loading.html');

    // Wait for eager + priority images
    await page.waitForFunction(() => {
      const img = document.getElementById('img-eager') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(500);

    // Priority image should load even though it's below fold and lazy=true
    const priorityReqs = requests.filter(r => r.id === 'priority');
    expect(priorityReqs.length).toBeGreaterThan(0);
  });
});
