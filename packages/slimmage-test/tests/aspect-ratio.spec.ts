import { test, expect, type Page } from '@playwright/test';

function collectImageRequests(page: Page): { width: number; height: number; url: string }[] {
  const requests: { width: number; height: number; url: string }[] = [];
  page.on('response', (resp) => {
    const url = new URL(resp.url());
    if (url.pathname === '/image') {
      requests.push({
        width: parseInt(url.searchParams.get('width') ?? '0', 10),
        height: parseInt(url.searchParams.get('height') ?? '0', 10),
        url: resp.url(),
      });
    }
  });
  return requests;
}

test.describe('aspect ratio', () => {
  test('maintains 16:9 aspect ratio in URL params', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/aspect-ratio.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    expect(requests.length).toBeGreaterThan(0);
    const req = requests[0];
    // Width and height should maintain 16:9 ratio
    const ratio = req.width / req.height;
    expect(ratio).toBeCloseTo(16 / 9, 1);
  });

  test('sets aspect-ratio CSS on img element', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/aspect-ratio.html');
    await page.waitForTimeout(500);

    const aspectRatio = await page.evaluate(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.style.aspectRatio;
    });

    // Should be set to "1.7777777777777777" (16/9)
    expect(aspectRatio).toBeTruthy();
    expect(parseFloat(aspectRatio!)).toBeCloseTo(16 / 9, 2);
  });
});
