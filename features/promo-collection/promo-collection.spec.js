const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const AxeBuilder = require('@axe-core/playwright').default;
const {
  sectionTestUrl,
  saveScreenshot,
  qaDir,
  loadTemplate,
  requireElement,
} = require('../../playwright-config/helpers');

const SECTION = 'promo-collection-test';
const SECTION_SELECTOR = '[data-section-type="promo-collection"]';
const SECTION_TYPE = 'page';

// A11y gate: required mode — import AxeBuilder and emit a11y tests
// Marker file not needed (opposite of skip mode)

test.describe('promo-collection UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(sectionTestUrl(SECTION_TYPE), { waitUntil: 'domcontentloaded' });
    const sectionRoot = page.locator(SECTION_SELECTOR);
    await sectionRoot.waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
  });

  // ============ A — Content completeness ============
  test('A-1: Content completeness — required template settings populated', () => {
    const template = loadTemplate(SECTION_TYPE);
    const settings = template.sections[SECTION].settings;
    const blocks = template.sections[SECTION].blocks;
    const blockOrder = template.sections[SECTION].block_order;

    const requiredSettings = [
      'heading_text',
      'view_more_label',
      'view_more_link',
      'background_color',
      'section_font',
    ];

    const missingSections = requiredSettings.filter(
      k => settings[k] == null || String(settings[k]).trim() === '',
    );

    const requiredTileLabels = [
      'Indoor Air Quality',
      'Split Systems',
      'Packaged Terminal Systems',
      'Scratch and Dent',
      'Portable Ac System',
      'HVAC Parts - Accessories',
    ];

    const missingTiles = [];
    requiredTileLabels.forEach((label, idx) => {
      const blockId = blockOrder[idx];
      if (!blockId) {
        missingTiles.push(`Block ${idx + 1}: missing (expected "${label}")`);
      } else if (!blocks[blockId]) {
        missingTiles.push(`Block ID "${blockId}": not found in blocks map`);
      } else {
        const tileLabel = blocks[blockId].settings.label || '';
        if (!tileLabel || tileLabel.trim() === '') {
          missingTiles.push(`Block "${blockId}": label is blank`);
        }
      }
    });

    const allMissing = [...missingSections, ...missingTiles];
    expect(
      allMissing,
      `Missing required content in templates/${SECTION_TYPE}.test.json → sections.${SECTION}: ${allMissing.join(', ')}. Populate every design-required setting and all 6 tile labels before running the spec.`,
    ).toEqual([]);
  });

  // ============ B — Typography + color parity (manual-debug) ============
  test('B-1 [mobile]: Heading typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const heading = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__heading`);
    const computed = await heading.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(28, 1);
    expect(computed.lineHeight).toBeCloseTo(33.6, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
  });

  test('B-2 [desktop]: Heading typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const heading = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__heading`);
    const computed = await heading.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(48, 1);
    expect(computed.lineHeight).toBeCloseTo(52.8, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(11, 30, 61)'); // #0b1e3d
  });

  test('B-3 [mobile]: View-more typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const viewMore = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__view-more`);
    const computed = await viewMore.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(15, 1);
    expect(computed.lineHeight).toBeCloseTo(24, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
  });

  test('B-4 [desktop]: View-more typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const viewMore = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__view-more`);
    const computed = await viewMore.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(16, 1);
    expect(computed.lineHeight).toBeCloseTo(20, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
  });

  test('B-5 [mobile]: Tile label typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const label = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__label`);
    const computed = await label.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(13.5, 0.5);
    expect(computed.lineHeight).toBeCloseTo(21.6, 0.5);
    expect(computed.fontWeight).toBe('500');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
  });

  test('B-6 [desktop]: Tile label typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const label = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__label`);
    const computed = await label.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(15, 1);
    expect(computed.lineHeight).toBeCloseTo(24, 0.5);
    expect(computed.fontWeight).toBe('500');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
  });

  test('B-7 [mobile]: Section background color — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const section = await requireElement(page, SECTION_SELECTOR);
    const computed = await section.evaluate(el => {
      const style = window.getComputedStyle(el);
      return { backgroundColor: style.backgroundColor };
    });
    expect(computed.backgroundColor).toBe('rgb(244, 246, 248)'); // #f4f6f8
  });

  test('B-8 [desktop]: Section background color — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const section = await requireElement(page, SECTION_SELECTOR);
    const computed = await section.evaluate(el => {
      const style = window.getComputedStyle(el);
      return { backgroundColor: style.backgroundColor };
    });
    expect(computed.backgroundColor).toBe('rgb(244, 246, 248)'); // #f4f6f8
  });

  test('B-9 [mobile]: Tile card border-radius — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const card = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__card`);
    const computed = await card.evaluate(el => {
      const style = window.getComputedStyle(el);
      return { borderRadius: parseFloat(style.borderRadius) };
    });
    expect(computed.borderRadius).toBeCloseTo(8, 1);
  });

  test('B-10 [desktop]: Tile card border-radius — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const card = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__card`);
    const computed = await card.evaluate(el => {
      const style = window.getComputedStyle(el);
      return { borderRadius: parseFloat(style.borderRadius) };
    });
    expect(computed.borderRadius).toBeCloseTo(16, 1);
  });

  test('B-11 [mobile]: Tile image-wrap dimensions — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const imageWrap = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__image-wrap`);
    const computed = await imageWrap.evaluate(el => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));
    expect(computed.width).toBe(140);
    expect(computed.height).toBe(140);
  });

  test('B-12 [desktop]: Tile image-wrap dimensions — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const imageWrap = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__image-wrap`);
    const computed = await imageWrap.evaluate(el => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));
    expect(computed.width).toBe(166);
    expect(computed.height).toBe(166);
  });

  // ============ C — Layout integrity (manual-debug) ============
  test('C-1 [tablet]: No horizontal scroll on page', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Tablet-only test');
    const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasScroll).toBe(false);
  });

  test('C-2 [tablet]: Section container fits viewport width', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Tablet-only test');
    const section = await requireElement(page, SECTION_SELECTOR);
    const width = await section.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(768);
  });

  test('C-3 [tablet]: Arrows hidden on tablet', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Tablet-only test');
    const prevArrow = await requireElement(page, `${SECTION_SELECTOR} [data-arrow="prev"]`);
    const nextArrow = await requireElement(page, `${SECTION_SELECTOR} [data-arrow="next"]`);
    const prevDisplay = await prevArrow.evaluate(el => window.getComputedStyle(el).display);
    const nextDisplay = await nextArrow.evaluate(el => window.getComputedStyle(el).display);
    expect(prevDisplay).toBe('none');
    expect(nextDisplay).toBe('none');
  });

  test('C-4 [tablet-lg]: No horizontal scroll on page', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only test');
    const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasScroll).toBe(false);
  });

  test('C-5 [tablet-lg]: Section container fits viewport width', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only test');
    const section = await requireElement(page, SECTION_SELECTOR);
    const width = await section.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(1280);
  });

  test('C-6 [tablet-lg]: Arrows visible on tablet-lg', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only test');
    const prevArrow = await requireElement(page, `${SECTION_SELECTOR} [data-arrow="prev"]`);
    const nextArrow = await requireElement(page, `${SECTION_SELECTOR} [data-arrow="next"]`);
    const prevDisplay = await prevArrow.evaluate(el => window.getComputedStyle(el).display);
    const nextDisplay = await nextArrow.evaluate(el => window.getComputedStyle(el).display);
    expect(prevDisplay).not.toBe('none');
    expect(nextDisplay).not.toBe('none');
  });

  test('C-7 [tablet-lg]: Prev arrow initial disabled state (Swiper-managed)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only test');
    const prevArrow = await requireElement(page, `${SECTION_SELECTOR} [data-arrow="prev"]`);
    await page.waitForFunction(
      sel => document.querySelector(sel)?.classList.contains('swiper-button-disabled'),
      `${SECTION_SELECTOR} [data-arrow="prev"]`,
      { timeout: 5000 },
    );
    const isDisabled = await prevArrow.evaluate(el => el.hasAttribute('disabled'));
    const hasDisabledClass = await prevArrow.evaluate(el => el.classList.contains('swiper-button-disabled'));
    const ariaDisabled = await prevArrow.evaluate(el => el.getAttribute('aria-disabled'));
    expect(isDisabled || hasDisabledClass).toBe(true);
    expect(ariaDisabled).toBe('true');
  });

  test('C-8 [tablet-lg]: Next arrow initial enabled state (Swiper-managed)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only test');
    const nextArrow = await requireElement(page, `${SECTION_SELECTOR} [data-arrow="next"]`);
    await page.waitForFunction(
      sel => {
        const el = document.querySelector(sel);
        return el && !el.hasAttribute('disabled');
      },
      `${SECTION_SELECTOR} [data-arrow="next"]`,
      { timeout: 5000 },
    );
    const isDisabled = await nextArrow.evaluate(el => el.hasAttribute('disabled'));
    const ariaDisabled = await nextArrow.evaluate(el => el.getAttribute('aria-disabled'));
    expect(isDisabled).toBe(false);
    expect(ariaDisabled).not.toBe('true');
  });

  // ============ D — Live screenshots (pipeline-executed) ============
  test('D-1: Save mobile live screenshot', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only screenshot');
    await saveScreenshot(page, SECTION_SELECTOR, SECTION.replace('-test', ''), 'live-mobile');
  });

  test('D-2: Save desktop live screenshot', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only screenshot');
    await saveScreenshot(page, SECTION_SELECTOR, SECTION.replace('-test', ''), 'live-desktop');
  });

  // ============ E — Content placement (manual-debug) ============
  test('E-1 [mobile]: Heading and view-more stack vertically', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const header = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__header`);
    const computed = await header.evaluate(el => {
      const style = window.getComputedStyle(el);
      return { flexDirection: style.flexDirection };
    });
    expect(computed.flexDirection).toBe('column');
  });

  test('E-2 [desktop]: Heading and view-more on same row', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const header = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__header`);
    const computed = await header.evaluate(el => {
      const style = window.getComputedStyle(el);
      return { flexDirection: style.flexDirection, justifyContent: style.justifyContent };
    });
    expect(computed.flexDirection).toBe('row');
    expect(computed.justifyContent).toBe('space-between');
  });

  test('E-3 [mobile]: Exactly 6 tiles rendered', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const tileCount = await page.locator(`${SECTION_SELECTOR} .promo-collection__tile`).count();
    expect(tileCount).toBe(6);
  });

  test('E-4 [desktop]: Exactly 6 tiles rendered', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const tileCount = await page.locator(`${SECTION_SELECTOR} .promo-collection__tile`).count();
    expect(tileCount).toBe(6);
  });

  test('E-5 [mobile]: Tile labels match ground truth', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const expectedLabels = [
      'Indoor Air Quality',
      'Split Systems',
      'Packaged Terminal Systems',
      'Scratch and Dent',
      'Portable Ac System',
      'HVAC Parts - Accessories',
    ];
    const labels = await page.locator(`${SECTION_SELECTOR} .promo-collection__label`).allTextContents();
    expect(labels).toEqual(expectedLabels);
  });

  test('E-6 [desktop]: Tile labels match ground truth', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const expectedLabels = [
      'Indoor Air Quality',
      'Split Systems',
      'Packaged Terminal Systems',
      'Scratch and Dent',
      'Portable Ac System',
      'HVAC Parts - Accessories',
    ];
    const labels = await page.locator(`${SECTION_SELECTOR} .promo-collection__label`).allTextContents();
    expect(labels).toEqual(expectedLabels);
  });

  test('E-7 [mobile]: Inner frame max-width constraint at mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const inner = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__inner`);
    const width = await inner.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(390);
  });

  test('E-8 [desktop]: Inner frame max-width constraint at desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const inner = await requireElement(page, `${SECTION_SELECTOR} .promo-collection__inner`);
    const computedMaxWidth = await inner.evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.maxWidth);
    });
    expect(computedMaxWidth).toBeCloseTo(1338, 5);
  });

  // ============ A11y — WCAG 2.1 AA ============
  test('A11y scan — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only a11y test');
    const builder = new AxeBuilder({ page });
    const results = await builder
      .include([SECTION_SELECTOR])
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const violations = results.violations || [];
    const criticalIssues = violations.filter(v => v.impact === 'critical' || v.impact === 'serious');

    // Write violations to artifact for visual-qa-agent
    const qaPath = qaDir('promo-collection');
    fs.writeFileSync(
      path.join(qaPath, 'a11y-mobile.json'),
      JSON.stringify(violations, null, 2),
    );

    // Log moderate/minor without failing
    const moderateIssues = violations.filter(v => v.impact === 'moderate' || v.impact === 'minor');
    if (moderateIssues.length > 0) {
      console.log(`A11y moderate/minor issues (mobile): ${moderateIssues.length}`);
    }

    expect(
      criticalIssues,
      `A11y critical/serious violations found (mobile): ${criticalIssues.map(v => v.id).join(', ')}`,
    ).toEqual([]);
  });

  test('A11y scan — tablet', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Tablet-only a11y test');
    const builder = new AxeBuilder({ page });
    const results = await builder
      .include([SECTION_SELECTOR])
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const violations = results.violations || [];
    const criticalIssues = violations.filter(v => v.impact === 'critical' || v.impact === 'serious');

    const qaPath = qaDir('promo-collection');
    fs.writeFileSync(
      path.join(qaPath, 'a11y-tablet.json'),
      JSON.stringify(violations, null, 2),
    );

    const moderateIssues = violations.filter(v => v.impact === 'moderate' || v.impact === 'minor');
    if (moderateIssues.length > 0) {
      console.log(`A11y moderate/minor issues (tablet): ${moderateIssues.length}`);
    }

    expect(
      criticalIssues,
      `A11y critical/serious violations found (tablet): ${criticalIssues.map(v => v.id).join(', ')}`,
    ).toEqual([]);
  });

  test('A11y scan — tablet-lg', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only a11y test');
    const builder = new AxeBuilder({ page });
    const results = await builder
      .include([SECTION_SELECTOR])
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const violations = results.violations || [];
    const criticalIssues = violations.filter(v => v.impact === 'critical' || v.impact === 'serious');

    const qaPath = qaDir('promo-collection');
    fs.writeFileSync(
      path.join(qaPath, 'a11y-tablet-lg.json'),
      JSON.stringify(violations, null, 2),
    );

    const moderateIssues = violations.filter(v => v.impact === 'moderate' || v.impact === 'minor');
    if (moderateIssues.length > 0) {
      console.log(`A11y moderate/minor issues (tablet-lg): ${moderateIssues.length}`);
    }

    expect(
      criticalIssues,
      `A11y critical/serious violations found (tablet-lg): ${criticalIssues.map(v => v.id).join(', ')}`,
    ).toEqual([]);
  });

  test('A11y scan — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only a11y test');
    const builder = new AxeBuilder({ page });
    const results = await builder
      .include([SECTION_SELECTOR])
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const violations = results.violations || [];
    const criticalIssues = violations.filter(v => v.impact === 'critical' || v.impact === 'serious');

    const qaPath = qaDir('promo-collection');
    fs.writeFileSync(
      path.join(qaPath, 'a11y-desktop.json'),
      JSON.stringify(violations, null, 2),
    );

    const moderateIssues = violations.filter(v => v.impact === 'moderate' || v.impact === 'minor');
    if (moderateIssues.length > 0) {
      console.log(`A11y moderate/minor issues (desktop): ${moderateIssues.length}`);
    }

    expect(
      criticalIssues,
      `A11y critical/serious violations found (desktop): ${criticalIssues.map(v => v.id).join(', ')}`,
    ).toEqual([]);
  });
});
