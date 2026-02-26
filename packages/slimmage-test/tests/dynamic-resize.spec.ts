import { test, expect, type Page } from '@playwright/test';

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

test.describe('dynamic resize', () => {
  test('sidebar toggle triggers new request when content grows', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/dynamic-resize.html');

    // Wait for initial load
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    const firstWidth = requests[0].width;

    // Collapse sidebar — main content gets wider
    await page.click('#toggle');

    // Wait for the sidebar transition (300ms) + ResizeObserver
    await page.waitForTimeout(600);

    // Should have a new larger request since content area grew
    const widths = requests.map(r => r.width);
    const largerRequests = widths.filter(w => w > firstWidth);
    expect(largerRequests.length).toBeGreaterThan(0);
  });

  test('window resize triggers update', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/layouts/full-width.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    const firstWidth = requests[0].width;

    // Resize to wider viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForFunction(
      (prevWidth: number) => {
        const img = document.getElementById('img') as HTMLImageElement;
        if (!img?.src) return false;
        const url = new URL(img.src);
        const w = parseInt(url.searchParams.get('width') ?? '0', 10);
        return w > prevWidth;
      },
      firstWidth,
      { timeout: 3000 },
    );

    const widths = requests.map(r => r.width);
    const largerRequests = widths.filter(w => w > firstWidth);
    expect(largerRequests.length).toBeGreaterThan(0);
  });
});
