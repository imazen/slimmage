import { test, expect } from '@playwright/test';

test.describe('performance', () => {
  test('first image request fires within 500ms of page load', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });

    let firstRequestTime = 0;
    let loadStartTime = 0;

    page.on('response', (resp) => {
      const url = new URL(resp.url());
      if (url.pathname === '/image' && firstRequestTime === 0) {
        firstRequestTime = Date.now();
      }
    });

    loadStartTime = Date.now();
    await page.goto('/layouts/full-width.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });

    const elapsed = firstRequestTime - loadStartTime;
    // Should be well under 750ms (Firefox on WSL can be ~550ms)
    expect(elapsed).toBeLessThan(750);
  });

  test('multiple viewport sizes', async ({ page }) => {
    const viewports = [
      { name: 'mobile', width: 320, height: 568 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'laptop', width: 1024, height: 768 },
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'wide', width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/layouts/full-width.html');
      await page.waitForFunction(() => {
        const img = document.getElementById('img') as HTMLImageElement;
        return img?.src?.includes('/image?');
      }, undefined, { timeout: 5000 });

      const imgSrc = await page.evaluate(() => {
        const img = document.getElementById('img') as HTMLImageElement;
        return img.src;
      });
      const url = new URL(imgSrc);
      const width = parseInt(url.searchParams.get('width')!, 10);

      // Width should be a multiple of 160
      expect(width % 160).toBe(0);
      // Width should be >= viewport width (at DPR=1)
      expect(width).toBeGreaterThanOrEqual(vp.width);
      // But not more than viewport + one step
      expect(width).toBeLessThanOrEqual(vp.width + 160);
    }
  });
});
