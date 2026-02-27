import { test, expect, type Page } from '@playwright/test';

/** Get the computed background-image URL's width parameter from the bg-box element. */
async function getBgWidth(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.getElementById('bg-box');
    if (!el) return 0;
    const bg = getComputedStyle(el).backgroundImage;
    // Extract URL from url("...")
    const match = bg.match(/url\("?([^")*]+)"?\)/);
    if (!match) return 0;
    try {
      const url = new URL(match[1], location.href);
      return parseInt(url.searchParams.get('width') ?? '0', 10);
    } catch {
      return 0;
    }
  });
}

test.describe('CSS container query backgrounds', () => {
  test('narrow container uses smallest background image', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 768 });
    await page.goto('/layouts/container-query-bg.html');
    // Allow CSS to settle
    await page.waitForTimeout(200);

    const bgWidth = await getBgWidth(page);
    // Container < 480px → uses default 480px image
    expect(bgWidth).toBe(480);
  });

  test('medium container switches to medium background image', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 768 });
    await page.goto('/layouts/container-query-bg.html');
    await page.waitForTimeout(200);

    const bgWidth = await getBgWidth(page);
    // Container >= 480px but < 800px → uses 800px image
    expect(bgWidth).toBe(800);
  });

  test('wide container switches to large background image', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/layouts/container-query-bg.html');
    await page.waitForTimeout(200);

    const bgWidth = await getBgWidth(page);
    // Container >= 800px → uses 1200px image
    expect(bgWidth).toBe(1200);
  });

  test('resize triggers breakpoint switch', async ({ page }) => {
    // Start narrow
    await page.setViewportSize({ width: 400, height: 768 });
    await page.goto('/layouts/container-query-bg.html');
    await page.waitForTimeout(200);

    let bgWidth = await getBgWidth(page);
    expect(bgWidth).toBe(480);

    // Grow to medium
    await page.setViewportSize({ width: 600, height: 768 });
    await page.waitForTimeout(300);
    bgWidth = await getBgWidth(page);
    expect(bgWidth).toBe(800);

    // Grow to large
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(300);
    bgWidth = await getBgWidth(page);
    expect(bgWidth).toBe(1200);

    // Shrink back to narrow
    await page.setViewportSize({ width: 400, height: 768 });
    await page.waitForTimeout(300);
    bgWidth = await getBgWidth(page);
    expect(bgWidth).toBe(480);
  });
});
