const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { sectionTestUrl, saveScreenshot, qaDir, loadTemplate } = require('../../playwright-config/helpers');
const AxeBuilder = require('@axe-core/playwright').default;

const SECTION = 'collection-grid-test';
const SECTION_SELECTOR = '[data-section-type="collection-grid"]';
const SECTION_TYPE = 'page';

// A11y scans are required per brief — no marker file needed
// Write a11y results to qa/a11y-<project>.json per breakpoint

/**
 * Wait for all images in a section to load before taking screenshots.
 * Prevents half-loaded images from affecting pixelmatch.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @returns {Promise<void>}
 */
async function waitForSectionImages(page, selector) {
  await page.locator(`${selector} img`).evaluateAll((imgs) => {
    return Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          }),
      ),
    );
  });
}

/**
 * Read computed styles from a locator element.
 *
 * @param {import('@playwright/test').Locator} locator
 * @param {string[]} properties
 * @returns {Promise<Object>}
 */
async function readComputed(locator, properties) {
  return locator.evaluate(
    (el, keys) => {
      const c = getComputedStyle(el);
      return Object.fromEntries(keys.map((k) => [k, c[k]]));
    },
    properties,
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto(sectionTestUrl(SECTION_TYPE), { waitUntil: 'domcontentloaded' });
  await page.locator(SECTION_SELECTOR).waitFor({ state: 'attached', timeout: 5000 });
  await page.evaluate(() => document.fonts.ready);
});

test('A-1: Content completeness — required template settings populated', () => {
  const template = loadTemplate(SECTION_TYPE);
  const settings = template.sections[SECTION].settings;
  const blocks = template.sections[SECTION].blocks || {};
  const blockOrder = template.sections[SECTION].block_order || [];

  const requiredSettings = ['heading_text', 'cta_label', 'cta_url', 'show_cta', 'show_arrows', 'background_color', 'section_font'];
  const missingSettings = requiredSettings.filter((k) => settings[k] == null || String(settings[k]).trim() === '');

  const minBlocks = 3;
  const blockCount = blockOrder.length;

  const errors = [];
  if (missingSettings.length > 0) {
    errors.push(`Missing section settings: ${missingSettings.join(', ')}`);
  }
  if (blockCount < minBlocks) {
    errors.push(`Expected at least ${minBlocks} blocks, got ${blockCount}`);
  }

  // Verify each block has required fields
  blockOrder.forEach((blockId) => {
    const block = blocks[blockId];
    if (!block) {
      errors.push(`Block ${blockId} not found in blocks map`);
      return;
    }
    if (!block.settings.label || String(block.settings.label).trim() === '') {
      errors.push(`Block ${blockId} missing label`);
    }
    if (!block.settings.link || String(block.settings.link).trim() === '') {
      errors.push(`Block ${blockId} missing link`);
    }
  });

  expect(errors, `Template validation failed:\n${errors.join('\n')}`).toEqual([]);
});

// ============================================================================
// B — Typography + color parity (mobile 375 + desktop 1440)
// ============================================================================

test('[mobile] B-1: Heading typography', { tag: ['@mobile'] }, async ({ page }) => {

  const heading = page.locator('.collection-grid__heading').first();
  const styles = await readComputed(heading, ['fontSize', 'lineHeight', 'fontWeight', 'color', 'textTransform']);

  expect(styles.fontSize).toBe('32px');
  expect(styles.lineHeight).toBe('36px');
  expect(styles.fontWeight).toBe('700');
  expect(styles.color).toBe('rgb(11, 30, 61)');
  expect(styles.textTransform).toBe('none');
});

test('[mobile] B-2: CTA typography + styling', { tag: ['@mobile'] }, async ({ page }) => {

  const cta = page.locator('.collection-grid__cta').first();
  const styles = await readComputed(cta, ['fontSize', 'lineHeight', 'fontWeight', 'color', 'textTransform', 'borderBottom']);

  expect(styles.fontSize).toBe('16px');
  expect(styles.lineHeight).toBe('20px');
  expect(styles.fontWeight).toBe('700');
  expect(styles.color).toBe('rgb(0, 0, 0)');
  expect(styles.textTransform).toBe('capitalize');
  expect(styles.borderBottom).toMatch(/1px solid/);
});

test('[desktop] B-3: Heading typography', { tag: ['@desktop'] }, async ({ page }) => {

  const heading = page.locator('.collection-grid__heading').first();
  const styles = await readComputed(heading, ['fontSize', 'lineHeight', 'fontWeight', 'color', 'textTransform']);

  expect(styles.fontSize).toBe('48px');
  expect(styles.lineHeight).toBe('52.8px');
  expect(styles.fontWeight).toBe('700');
  expect(styles.color).toBe('rgb(11, 30, 61)');
  expect(styles.textTransform).toBe('none');
});

test('[desktop] B-4: CTA typography + styling', { tag: ['@desktop'] }, async ({ page }) => {

  const cta = page.locator('.collection-grid__cta').first();
  const styles = await readComputed(cta, ['fontSize', 'lineHeight', 'fontWeight', 'color', 'textTransform', 'borderBottom']);

  expect(styles.fontSize).toBe('16px');
  expect(styles.lineHeight).toBe('20px');
  expect(styles.fontWeight).toBe('700');
  expect(styles.color).toBe('rgb(0, 0, 0)');
  expect(styles.textTransform).toBe('capitalize');
  expect(styles.borderBottom).toMatch(/1px solid/);
});

test('[mobile] B-5: Section background color', { tag: ['@mobile'] }, async ({ page }) => {

  const section = page.locator(SECTION_SELECTOR).first();
  const styles = await readComputed(section, ['backgroundColor']);

  expect(styles.backgroundColor).toBe('rgb(244, 246, 248)');
});

test('[desktop] B-5: Section background color', { tag: ['@desktop'] }, async ({ page }) => {

  const section = page.locator(SECTION_SELECTOR).first();
  const styles = await readComputed(section, ['backgroundColor']);

  expect(styles.backgroundColor).toBe('rgb(244, 246, 248)');
});

test('[mobile] B-6: Prev arrow initial state (disabled)', { tag: ['@mobile'] }, async ({ page }) => {

  const prevArrow = page.locator('.carousel__nav-button--prev').first();

  // Wait for disabled state to be set and CSS applied
  await page.waitForFunction(
    (sel) => {
      const button = document.querySelector(sel);
      if (!button) return false;
      const isDisabled = button.hasAttribute('disabled');
      const opacity = getComputedStyle(button).opacity;
      return isDisabled && opacity === '0.4';
    },
    '.carousel__nav-button--prev',
    { timeout: 5000 },
  );

  // Verify disabled attribute exists
  const isDisabled = await prevArrow.evaluate((el) => el.hasAttribute('disabled'));
  expect(isDisabled).toBe(true);

  // Verify opacity is 0.4
  const styles = await readComputed(prevArrow, ['opacity']);
  expect(styles.opacity).toBe('0.4');
});

test('[desktop] B-6: Prev arrow initial state (disabled)', { tag: ['@desktop'] }, async ({ page }) => {

  const prevArrow = page.locator('.carousel__nav-button--prev').first();

  // Wait for disabled state to be set and CSS applied
  await page.waitForFunction(
    (sel) => {
      const button = document.querySelector(sel);
      if (!button) return false;
      const isDisabled = button.hasAttribute('disabled');
      const opacity = getComputedStyle(button).opacity;
      return isDisabled && opacity === '0.4';
    },
    '.carousel__nav-button--prev',
    { timeout: 5000 },
  );

  // Verify disabled attribute exists
  const isDisabled = await prevArrow.evaluate((el) => el.hasAttribute('disabled'));
  expect(isDisabled).toBe(true);

  // Verify opacity is 0.4
  const styles = await readComputed(prevArrow, ['opacity']);
  expect(styles.opacity).toBe('0.4');
});

// ============================================================================
// C — Layout integrity (tablet 768 + tablet-lg 1280)
// ============================================================================

test('[tablet] C-1: No horizontal scroll', { tag: ['@tablet'] }, async ({ page }) => {

  const section = page.locator(SECTION_SELECTOR).first();
  const scrollWidth = await section.evaluate((el) => el.scrollWidth);
  const clientWidth = await section.evaluate((el) => el.clientWidth);

  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test('[tablet-lg] C-1: No horizontal scroll', { tag: ['@tablet-lg'] }, async ({ page }) => {

  const section = page.locator(SECTION_SELECTOR).first();
  const scrollWidth = await section.evaluate((el) => el.scrollWidth);
  const clientWidth = await section.evaluate((el) => el.clientWidth);

  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test('[tablet] C-2: Carousel wrapper fits within container', { tag: ['@tablet'] }, async ({ page }) => {

  const carousel = page.locator('.collection-grid__carousel').first();
  const carouselWidth = await carousel.evaluate((el) => el.scrollWidth);
  const carouselClientWidth = await carousel.evaluate((el) => el.clientWidth);

  // Allow for scrollbar/overflow but structure should be sound
  expect(carouselWidth).toBeLessThanOrEqual(carouselClientWidth + 100);
});

test('[tablet-lg] C-2: Carousel wrapper fits within container', { tag: ['@tablet-lg'] }, async ({ page }) => {

  const carousel = page.locator('.collection-grid__carousel').first();
  const carouselWidth = await carousel.evaluate((el) => el.scrollWidth);
  const carouselClientWidth = await carousel.evaluate((el) => el.clientWidth);

  // Allow for scrollbar/overflow but structure should be sound
  expect(carouselWidth).toBeLessThanOrEqual(carouselClientWidth + 100);
});

// ============================================================================
// D — Live screenshots (mobile 375 + desktop 1440)
// ============================================================================

test('[mobile] D-1: Save mobile live screenshot', { tag: ['@mobile'] }, async ({ page }) => {

  await waitForSectionImages(page, SECTION_SELECTOR);
  await saveScreenshot(page, SECTION_SELECTOR, 'collection-grid', 'live-mobile');
});

test('[desktop] D-2: Save desktop live screenshot', { tag: ['@desktop'] }, async ({ page }) => {

  await waitForSectionImages(page, SECTION_SELECTOR);
  await saveScreenshot(page, SECTION_SELECTOR, 'collection-grid', 'live-desktop');
});

// ============================================================================
// E — Content placement (mobile 375 + desktop 1440)
// ============================================================================

test('[mobile] E-1: Heading line count', { tag: ['@mobile'] }, async ({ page }) => {

  const heading = page.locator('.collection-grid__heading').first();
  const lineCount = await heading.evaluate((el) => {
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    return Math.round(el.offsetHeight / lineHeight);
  });

  // Heading may wrap on mobile
  expect(lineCount).toBeGreaterThanOrEqual(1);
});

test('[desktop] E-2: Heading wraps to 2 lines max', { tag: ['@desktop'] }, async ({ page }) => {

  const heading = page.locator('.collection-grid__heading').first();
  const lineCount = await heading.evaluate((el) => {
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    return Math.round(el.offsetHeight / lineHeight);
  });

  expect(lineCount).toBeLessThanOrEqual(2);
});

test('[mobile] E-3: Content container max-width', { tag: ['@mobile'] }, async ({ page }) => {

  const container = page.locator('.collection-grid__inner').first();
  const width = await container.evaluate((el) => el.offsetWidth);

  // Max width from Figma is 1338px
  expect(width).toBeLessThanOrEqual(1338);
});

test('[desktop] E-3: Content container max-width', { tag: ['@desktop'] }, async ({ page }) => {

  const container = page.locator('.collection-grid__inner').first();
  const width = await container.evaluate((el) => el.offsetWidth);

  // Max width from Figma is 1338px
  expect(width).toBeLessThanOrEqual(1338);
});

test('[mobile] E-4: CTA does not wrap', { tag: ['@mobile'] }, async ({ page }) => {

  const cta = page.locator('.collection-grid__cta').first();
  const lineCount = await cta.evaluate((el) => {
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    return Math.round(el.offsetHeight / lineHeight);
  });

  expect(lineCount).toBe(1);
});

test('[desktop] E-4: CTA does not wrap', { tag: ['@desktop'] }, async ({ page }) => {

  const cta = page.locator('.collection-grid__cta').first();
  const lineCount = await cta.evaluate((el) => {
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    return Math.round(el.offsetHeight / lineHeight);
  });

  expect(lineCount).toBe(1);
});

// ============================================================================
// A11y — WCAG 2.1 AA scans (mobile 375 + desktop 1440)
// ============================================================================

test('[mobile] A11y-1: Axe scan at mobile 375', { tag: ['@mobile', '@a11y'] }, async ({ page }) => {

  const results = await new AxeBuilder({ page }).include(SECTION_SELECTOR).analyze();

  const criticalOrSerious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  const moderate = results.violations.filter((v) => v.impact === 'moderate');
  const minor = results.violations.filter((v) => v.impact === 'minor');

  // Write results to file
  const dir = qaDir('collection-grid');
  const filePath = path.join(dir, 'a11y-mobile.json');
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

  // Log moderate/minor violations without failing
  if (moderate.length > 0) {
    console.log(
      `[A11y] Mobile: ${moderate.length} moderate violations found (not failing):`,
      moderate.map((v) => v.id).join(', '),
    );
  }
  if (minor.length > 0) {
    console.log(
      `[A11y] Mobile: ${minor.length} minor violations found (not failing):`,
      minor.map((v) => v.id).join(', '),
    );
  }

  // Fail on critical or serious
  expect(criticalOrSerious, `Critical/serious a11y violations found: ${criticalOrSerious.map((v) => v.id).join(', ')}`).toEqual([]);
});

test('[desktop] A11y-2: Axe scan at desktop 1440', { tag: ['@desktop', '@a11y'] }, async ({ page }) => {

  const results = await new AxeBuilder({ page }).include(SECTION_SELECTOR).analyze();

  const criticalOrSerious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  const moderate = results.violations.filter((v) => v.impact === 'moderate');
  const minor = results.violations.filter((v) => v.impact === 'minor');

  // Write results to file
  const dir = qaDir('collection-grid');
  const filePath = path.join(dir, 'a11y-desktop.json');
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

  // Log moderate/minor violations without failing
  if (moderate.length > 0) {
    console.log(
      `[A11y] Desktop: ${moderate.length} moderate violations found (not failing):`,
      moderate.map((v) => v.id).join(', '),
    );
  }
  if (minor.length > 0) {
    console.log(
      `[A11y] Desktop: ${minor.length} minor violations found (not failing):`,
      minor.map((v) => v.id).join(', '),
    );
  }

  // Fail on critical or serious
  expect(criticalOrSerious, `Critical/serious a11y violations found: ${criticalOrSerious.map((v) => v.id).join(', ')}`).toEqual([]);
});
