import { test, expect } from '@playwright/test';

test.describe('callbacks', () => {
  test('onBeforeLoad is called with correct info', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/callbacks.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    const calls = await page.evaluate(() =>
      (window as any).__slimmageCallbacks.beforeLoadCalls
    );

    expect(calls.length).toBeGreaterThan(0);
    const first = calls[0];
    expect(first.containerWidth).toBeGreaterThan(0);
    expect(first.requestedWidth).toBeGreaterThan(0);
    expect(first.requestedWidth % 160).toBe(0);
    expect(first.quality).toBe(85);
    expect(first.format).toBe('jpeg');
    expect(first.url).toContain('/image?');
    expect(first.previousUrl).toBeNull();
    expect(first.dpr).toBeGreaterThanOrEqual(1);
  });

  test('onLoad is called after image loads', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/callbacks.html');
    // Wait for the image to actually load (not just src set)
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.complete && img?.naturalWidth > 0;
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(300);

    const calls = await page.evaluate(() =>
      (window as any).__slimmageCallbacks.loadCalls
    );

    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0].requestedWidth).toBeGreaterThan(0);
    expect(calls[0].url).toContain('/image?');
  });

  test('cleanup disconnects observers (no new requests after cleanup)', async ({ page }) => {
    const requests: string[] = [];
    page.on('response', (resp) => {
      if (new URL(resp.url()).pathname === '/image') {
        requests.push(resp.url());
      }
    });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/layouts/callbacks.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    const countBefore = requests.length;

    // Call cleanup
    await page.evaluate(() => (window as any).__slimmageCleanup());

    // Resize viewport — should NOT trigger new request
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // No new requests should have been made
    expect(requests.length).toBe(countBefore);
  });
});
