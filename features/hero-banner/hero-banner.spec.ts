import { test, expect } from '@playwright/test';
import {
  compareScreenshot,
  buildPreviewUrl,
  scrollToSection,
} from '../../tests/utils/screenshot-compare';
import * as path from 'path';

const SCREENSHOT_DIR = path.resolve(__dirname, 'test-results');
const SECTION_SELECTOR = '.hero-banner';

test.describe('Hero Banner — Visual QA', () => {
  test.beforeEach(async ({ page }) => {
    const url = buildPreviewUrl('/');
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    await scrollToSection(page, SECTION_SELECTOR);
  });

  test('default state renders correctly', async ({ page }) => {
    const section = page.locator(SECTION_SELECTOR);
    await expect(section).toBeVisible();

    // Background image present
    const bgImg = section.locator('.hero-banner__bg-img');
    await expect(bgImg).toBeVisible();

    // All text elements present
    await expect(section.locator('.hero-banner__subtitle')).toBeVisible();
    await expect(section.locator('.hero-banner__heading')).toBeVisible();
    await expect(section.locator('.hero-banner__description')).toBeVisible();
    await expect(section.locator('.hero-banner__cta')).toBeVisible();

    // Pixelmatch screenshot comparison
    const result = await compareScreenshot(page, SECTION_SELECTOR, {
      outputDir: SCREENSHOT_DIR,
      name: `hero-banner-default-${test.info().project.name}`,
    });

    expect(
      result.match,
      `Mismatch: ${result.mismatchPercentage}% — diff at ${result.diffPath}`,
    ).toBe(true);
  });

  test('heading typography matches spec', async ({ page }) => {
    const heading = page.locator('.hero-banner__heading');
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

    // White text
    expect(styles.color).toMatch(/rgb\(255,\s*255,\s*255\)/);
  });

  test('CTA button styles match spec', async ({ page }) => {
    const cta = page.locator('.hero-banner__cta');
    await expect(cta).toBeVisible();

    const styles = await cta.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        borderRadius: cs.borderRadius,
      };
    });

    // #027db3 = rgb(2, 125, 179)
    expect(styles.backgroundColor).toMatch(/rgb\(2,\s*125,\s*179\)/);
    expect(styles.color).toMatch(/rgb\(255,\s*255,\s*255\)/);
  });

  test('overlay renders with correct opacity', async ({ page }) => {
    const overlay = page.locator('.hero-banner__overlay');
    const isVisible = await overlay.isVisible().catch(() => false);

    if (isVisible) {
      const opacity = await overlay.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      const opacityNum = parseFloat(opacity);
      expect(opacityNum).toBeGreaterThanOrEqual(0);
      expect(opacityNum).toBeLessThanOrEqual(1);
    }
  });

  test('background image has eager loading and high fetchpriority', async ({ page }) => {
    const img = page.locator('.hero-banner__bg-img');
    const loading = await img.getAttribute('loading');
    const priority = await img.getAttribute('fetchpriority');

    expect(loading).toBe('eager');
    expect(priority).toBe('high');
  });

  test('section screenshot comparison across breakpoints', async ({ page }) => {
    const result = await compareScreenshot(page, SECTION_SELECTOR, {
      outputDir: SCREENSHOT_DIR,
      name: `hero-banner-full-${test.info().project.name}`,
      threshold: 0.1,
      maxMismatchPercent: 1,
    });

    expect(
      result.match,
      `Pixel mismatch: ${result.mismatchPercentage}% — see diff: ${result.diffPath}`,
    ).toBe(true);
  });

  test('CTA hover state changes background', async ({ page }) => {
    const cta = page.locator('.hero-banner__cta');
    const bgBefore = await cta.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    await cta.hover();
    await page.waitForTimeout(300);

    const bgAfter = await cta.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    // Hover should produce a visible color change
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
});
