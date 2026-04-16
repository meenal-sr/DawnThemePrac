const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { sectionTestUrl, saveScreenshot, saveOnFailure } = require('../../tests/helpers');

const SECTION = 'hero-banner';
const SECTION_TYPE = 'page';

test.describe('Hero Banner — UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(sectionTestUrl(SECTION_TYPE));
    await page.waitForLoadState('domcontentloaded');
    await page.locator('.hero-banner').first().waitFor({ state: 'visible', timeout: 15000 });
  });

  test.afterEach(async ({ page }, testInfo) => {
    await saveOnFailure(page, testInfo, SECTION);
  });

  test('default state renders correctly', async ({ page }) => {
    const section = page.locator('.hero-banner').first();
    await expect(section).toBeVisible();

    await expect(section.locator('.hero-banner__bg-img')).toBeVisible();
    await expect(section.locator('.hero-banner__subtitle')).toBeVisible();
    await expect(section.locator('.hero-banner__heading')).toBeVisible();
    await expect(section.locator('.hero-banner__description')).toBeVisible();
    await expect(section.locator('.hero-banner__cta')).toBeVisible();
  });

  test('heading typography matches spec', async ({ page }) => {
    const heading = page.locator('.hero-banner__heading').first();
    const styles = await heading.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        color: cs.color,
      };
    });

    const projectName = test.info().project.name;

    if (projectName === 'desktop') {
      expect(styles.fontSize).toBe('60px');
    } else {
      expect(styles.fontSize).toBe('32px');
    }

    expect(styles.color).toMatch(/rgb\(255,\s*255,\s*255\)/);
  });

  test('CTA button styles match spec', async ({ page }) => {
    const cta = page.locator('.hero-banner__cta').first();
    await expect(cta).toBeVisible();

    const styles = await cta.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        borderRadius: cs.borderRadius,
      };
    });

    expect(styles.backgroundColor).toMatch(/rgb\(2,\s*125,\s*179\)/);
    expect(styles.color).toMatch(/rgb\(255,\s*255,\s*255\)/);
  });

  test('background image has eager loading and high fetchpriority', async ({ page }) => {
    const img = page.locator('.hero-banner__bg-img').first();
    await expect(img).toHaveAttribute('loading', 'eager');
    await expect(img).toHaveAttribute('fetchpriority', 'high');
  });

  test('CTA hover state changes background', async ({ page }) => {
    const cta = page.locator('.hero-banner__cta').first();
    const bgBefore = await cta.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    await cta.hover();
    await page.locator('.hero-banner__cta:hover').first().waitFor({ state: 'visible' });

    const bgAfter = await cta.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    expect(bgBefore).not.toBe(bgAfter);
  });

  test('responsive — no horizontal scroll on mobile', async ({ page }) => {
    if (test.info().project.name !== 'mobile') {
      test.skip();
    }

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('capture mobile screenshot', async ({ page }) => {
    if (test.info().project.name !== 'mobile') {
      test.skip();
    }
    const filePath = await saveScreenshot(page, '.hero-banner', SECTION, 'live-mobile');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('capture desktop screenshot', async ({ page }) => {
    if (test.info().project.name !== 'desktop') {
      test.skip();
    }
    const filePath = await saveScreenshot(page, '.hero-banner', SECTION, 'live-desktop');
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
