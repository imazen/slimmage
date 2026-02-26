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

test.describe('container layouts', () => {
  test('full-width: image fills viewport', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/full-width.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    expect(requests.length).toBeGreaterThan(0);
    // Full width at 1024 → ceil(1024/160)*160 = 1120
    expect(requests[0].width).toBe(1120);
  });

  test('half-width: image fills half viewport', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/half-width.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    expect(requests.length).toBeGreaterThan(0);
    // Half width at 1024 = 512 → ceil(512/160)*160 = 640
    expect(requests[0].width).toBe(640);
  });

  test('CSS grid: each cell gets independent width', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/grid.html');
    await page.waitForFunction(() => {
      const imgs = document.querySelectorAll('img');
      return [...imgs].every(img => img.src?.includes('/image?'));
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    // 4 images, each in a grid cell
    expect(requests.length).toBe(4);
    // All should have same width (equal grid cells)
    const widths = requests.map(r => r.width);
    expect(new Set(widths).size).toBe(1);
    // Each cell ~250px at 1024 wide → stepped width
    expect(widths[0]).toBeLessThan(1024);
    expect(widths[0] % 160).toBe(0);
  });

  test('flexbox: items get flex-basis width', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/flexbox.html');
    await page.waitForFunction(() => {
      const imgs = document.querySelectorAll('img');
      return [...imgs].every(img => img.src?.includes('/image?'));
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    expect(requests.length).toBe(3);
    // All same width (equal flex items)
    const widths = requests.map(r => r.width);
    expect(new Set(widths).size).toBe(1);
    expect(widths[0]).toBeLessThan(1024);
    expect(widths[0] % 160).toBe(0);
  });

  test('nested container: uses inner container width', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/nested-container.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    expect(requests.length).toBeGreaterThan(0);
    // outer = 80% of 1024 = 819, inner = 50% of 819 ≈ 409 → stepped
    // Actual: ~409 → ceil(409/160)*160 = 480
    expect(requests[0].width).toBeLessThanOrEqual(640);
    expect(requests[0].width % 160).toBe(0);
  });

  test('container-query: uses container-type inline-size', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/container-query.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    expect(requests.length).toBeGreaterThan(0);
    // cq-container = 50% of 1024 = 512 → ceil(512/160)*160 = 640
    expect(requests[0].width).toBe(640);
    expect(requests[0].width % 160).toBe(0);
  });
});
