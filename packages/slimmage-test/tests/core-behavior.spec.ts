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
  // Allow network round-trip
  await page.waitForTimeout(200);
}

test.describe('core behavior', () => {
  test('loads image with correct stepped width', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/full-width.html');
    await waitForImageSrc(page);

    expect(requests.length).toBeGreaterThan(0);
    const imgReq = requests[0];
    // Width should be a multiple of 160
    expect(imgReq.width % 160).toBe(0);
    // Full-width at 1024px viewport (DPR=1): ceil(1024/160)*160 = 1120
    expect(imgReq.width).toBeGreaterThanOrEqual(1024);
  });

  test('half-width container requests smaller image', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/half-width.html');
    await waitForImageSrc(page);

    expect(requests.length).toBeGreaterThan(0);
    const imgReq = requests[0];
    // 50% of 1024 = 512 → ceil(512/160)*160 = 640 at DPR=1
    expect(imgReq.width % 160).toBe(0);
    expect(imgReq.width).toBeLessThanOrEqual(800);
    expect(imgReq.width).toBeGreaterThanOrEqual(480);
  });

  test('ratchet: shrinking viewport does NOT trigger smaller request', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/layouts/full-width.html');
    await waitForImageSrc(page);

    const firstWidth = requests[0].width;
    const countBefore = requests.length;

    // Shrink viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Should NOT have a new request with smaller width
    const newRequests = requests.slice(countBefore);
    const smallerRequests = newRequests.filter(r => r.width < firstWidth);
    expect(smallerRequests.length).toBe(0);
  });

  test('ratchet: growing viewport DOES trigger larger request', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/layouts/full-width.html');
    await waitForImageSrc(page);

    const firstWidth = requests[0].width;

    // Grow viewport significantly
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Wait for img.src to update to a larger width
    await page.waitForFunction(
      (prevWidth: number) => {
        const img = document.getElementById('img') as HTMLImageElement | null;
        if (!img?.src) return false;
        const url = new URL(img.src);
        const w = parseInt(url.searchParams.get('width') ?? '0', 10);
        return w > prevWidth;
      },
      firstWidth,
      { timeout: 3000 },
    );
    await page.waitForTimeout(200);

    const widths = requests.map(r => r.width);
    const largerRequests = widths.filter(w => w > firstWidth);
    expect(largerRequests.length).toBeGreaterThan(0);
  });

  test('width is always a multiple of widthStep', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      const requests = collectImageRequests(page);
      await page.setViewportSize(vp);
      await page.goto('/layouts/full-width.html');
      await waitForImageSrc(page);

      for (const req of requests) {
        expect(req.width % 160).toBe(0);
      }
    }
  });

  test('no duplicate requests for same stepped width', async ({ page }) => {
    const requests = collectImageRequests(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/full-width.html');
    await waitForImageSrc(page);

    const countAfterLoad = requests.length;
    // Resize to slightly different size that still maps to same step
    await page.setViewportSize({ width: 1050, height: 768 });
    await page.waitForTimeout(500);

    // Any new requests should have a LARGER width (ratchet blocks same/smaller)
    const newRequests = requests.slice(countAfterLoad);
    for (const req of newRequests) {
      expect(req.width).toBeGreaterThan(requests[0].width);
    }
  });
});
