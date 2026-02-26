import { test, expect, type Page } from '@playwright/test';

function collectImageRequests(page: Page): { width: number; quality: number; url: string }[] {
  const requests: { width: number; quality: number; url: string }[] = [];
  page.on('response', (resp) => {
    const url = new URL(resp.url());
    if (url.pathname === '/image') {
      requests.push({
        width: parseInt(url.searchParams.get('width') ?? '0', 10),
        quality: parseInt(url.searchParams.get('quality') ?? '0', 10),
        url: resp.url(),
      });
    }
  });
  return requests;
}

test.describe('DPR and quality', () => {
  test('DPR 2 doubles requested width', async ({ browser }) => {
    // Create context with DPR=2
    const context = await browser.newContext({
      viewport: { width: 500, height: 500 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    const requests = collectImageRequests(page);

    await page.goto('/layouts/dpr.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    expect(requests.length).toBeGreaterThan(0);
    // 500px container * DPR 2 = 1000px ideal → stepped to 1120
    expect(requests[0].width).toBeGreaterThanOrEqual(960);
    expect(requests[0].width % 160).toBe(0);

    await context.close();
  });

  test('DPR 1 uses base quality', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 500, height: 500 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const requests = collectImageRequests(page);

    await page.goto('/layouts/dpr.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    expect(requests.length).toBeGreaterThan(0);
    // Quality should be base (90) at DPR 1
    expect(requests[0].quality).toBe(90);

    await context.close();
  });

  test('DPR 2 reduces quality', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 500, height: 500 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    const requests = collectImageRequests(page);

    await page.goto('/layouts/dpr.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    expect(requests.length).toBeGreaterThan(0);
    // Quality should be 90 - 10 = 80 at DPR 2
    expect(requests[0].quality).toBe(80);

    await context.close();
  });

  test('DPR 3 reduces quality further', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 500, height: 500 },
      deviceScaleFactor: 3,
    });
    const page = await context.newPage();
    const requests = collectImageRequests(page);

    await page.goto('/layouts/dpr.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    expect(requests.length).toBeGreaterThan(0);
    // Quality should be 90 - 20 = 70 at DPR 3
    expect(requests[0].quality).toBe(70);

    await context.close();
  });

  test('mobile viewport with high DPR', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 3,
    });
    const page = await context.newPage();
    const requests = collectImageRequests(page);

    await page.goto('/layouts/dpr.html');
    await page.waitForFunction(() => {
      const img = document.getElementById('img') as HTMLImageElement;
      return img?.src?.includes('/image?');
    }, undefined, { timeout: 5000 });
    await page.waitForTimeout(200);

    expect(requests.length).toBeGreaterThan(0);
    // 375 * 3 = 1125 → stepped to 1280
    expect(requests[0].width).toBe(1280);
    expect(requests[0].quality).toBe(70);

    await context.close();
  });
});
