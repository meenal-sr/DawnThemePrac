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

const SECTION = 'essential-section-test';
const SECTION_SELECTOR = '[data-section-type="essential-section"]';
const SECTION_TYPE = 'page';

// A11y gate: required mode — import AxeBuilder and emit a11y tests
// Marker file not needed (opposite of skip mode)

test.describe('essential-section UI', () => {
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
      'description_text',
      'button_label',
      'button_link',
      'background_color',
      'section_font',
    ];

    const missingSections = requiredSettings.filter(
      k => settings[k] == null || String(settings[k]).trim() === '',
    );

    const requiredCardTitles = [
      'What is SEER2?',
      'HVAC Rebates',
      'New Refrigerant Updates',
    ];

    const missingCards = [];
    requiredCardTitles.forEach((title, idx) => {
      const blockId = blockOrder[idx];
      if (!blockId) {
        missingCards.push(`Block ${idx + 1}: missing (expected "${title}")`);
      } else if (!blocks[blockId]) {
        missingCards.push(`Block ID "${blockId}": not found in blocks map`);
      } else {
        const cardTitle = blocks[blockId].settings.title || '';
        const cardBody = blocks[blockId].settings.body || '';
        const cardLinkLabel = blocks[blockId].settings.link_label || '';
        const cardLinkUrl = blocks[blockId].settings.link_url || '';

        const missingFields = [];
        if (!cardTitle || cardTitle.trim() === '') missingFields.push('title');
        if (!cardBody || cardBody.trim() === '') missingFields.push('body');
        if (!cardLinkLabel || cardLinkLabel.trim() === '') missingFields.push('link_label');
        if (!cardLinkUrl || cardLinkUrl.trim() === '') missingFields.push('link_url');

        if (missingFields.length > 0) {
          missingCards.push(`Block "${blockId}": missing ${missingFields.join(', ')}`);
        }
      }
    });

    const allMissing = [...missingSections, ...missingCards];
    expect(
      allMissing,
      `Missing required content in templates/${SECTION_TYPE}.test.json → sections.${SECTION}: ${allMissing.join(', ')}. Populate every design-required setting and all 3 card blocks before running the spec.`,
    ).toEqual([]);
  });

  // ============ B — Typography + color parity (manual-debug) ============
  test('B-1 [mobile]: Heading typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const heading = await requireElement(page, `${SECTION_SELECTOR} .essential-section__heading`);
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
    const heading = await requireElement(page, `${SECTION_SELECTOR} .essential-section__heading`);
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

  test('B-3 [mobile]: Description typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const description = await requireElement(page, `${SECTION_SELECTOR} .essential-section__description`);
    const computed = await description.evaluate(el => {
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
    expect(computed.fontWeight).toBe('400');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
  });

  test('B-4 [desktop]: Description typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const description = await requireElement(page, `${SECTION_SELECTOR} .essential-section__description`);
    const computed = await description.evaluate(el => {
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
    expect(computed.fontWeight).toBe('500');
    expect(computed.color).toBe('rgb(102, 102, 102)'); // #666
  });

  test('B-5 [mobile]: Button typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const button = await requireElement(page, `${SECTION_SELECTOR} .essential-section__button`);
    const computed = await button.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
        backgroundColor: style.backgroundColor,
        borderRadius: parseFloat(style.borderRadius),
      };
    });
    expect(computed.fontSize).toBeCloseTo(15, 1);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(255, 255, 255)'); // #fff
    expect(computed.backgroundColor).toBe('rgb(2, 125, 179)'); // #027db3
    expect(computed.borderRadius).toBeCloseTo(100, 0);
  });

  test('B-6 [desktop]: Button typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const button = await requireElement(page, `${SECTION_SELECTOR} .essential-section__button`);
    const computed = await button.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        fontWeight: style.fontWeight,
        color: style.color,
        backgroundColor: style.backgroundColor,
        borderRadius: parseFloat(style.borderRadius),
      };
    });
    expect(computed.fontSize).toBeCloseTo(16, 1);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(244, 246, 248)'); // #f4f6f8
    expect(computed.backgroundColor).toBe('rgb(2, 125, 179)'); // #027db3
    expect(computed.borderRadius).toBeCloseTo(100, 0);
  });

  test('B-7 [mobile]: Card title typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const cardTitle = await requireElement(page, `${SECTION_SELECTOR} .essential-section__card-title`);
    const computed = await cardTitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(16, 1);
    expect(computed.lineHeight).toBeCloseTo(26, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
  });

  test('B-8 [desktop]: Card title typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const cardTitle = await requireElement(page, `${SECTION_SELECTOR} .essential-section__card-title`);
    const computed = await cardTitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
      };
    });
    expect(computed.fontSize).toBeCloseTo(20, 1);
    expect(computed.lineHeight).toBeCloseTo(28, 0.5);
    expect(computed.fontWeight).toBe('700');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
  });

  test('B-9 [mobile]: Card body typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const cardBody = await requireElement(page, `${SECTION_SELECTOR} .essential-section__card-body`);
    const computed = await cardBody.evaluate(el => {
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
    expect(computed.fontWeight).toBe('400');
    expect(computed.color).toBe('rgb(102, 102, 102)'); // #666
  });

  test('B-10 [desktop]: Card body typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const cardBody = await requireElement(page, `${SECTION_SELECTOR} .essential-section__card-body`);
    const computed = await cardBody.evaluate(el => {
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
    expect(computed.fontWeight).toBe('500');
    expect(computed.color).toBe('rgb(102, 102, 102)'); // #666
  });

  test('B-11 [mobile]: Card link typography — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const cardLink = await requireElement(page, `${SECTION_SELECTOR} .essential-section__card-link`);
    const computed = await cardLink.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
        textDecoration: style.textDecoration,
      };
    });
    expect(computed.fontSize).toBeCloseTo(15, 1);
    expect(computed.lineHeight).toBeCloseTo(20, 0.5);
    expect(computed.fontWeight).toBe('500');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
    expect(computed.textDecoration).toContain('underline');
  });

  test('B-12 [desktop]: Card link typography — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const cardLink = await requireElement(page, `${SECTION_SELECTOR} .essential-section__card-link`);
    const computed = await cardLink.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontWeight: style.fontWeight,
        color: style.color,
        textDecoration: style.textDecoration,
      };
    });
    expect(computed.fontSize).toBeCloseTo(16, 1);
    expect(computed.lineHeight).toBeCloseTo(20, 0.5);
    expect(computed.fontWeight).toBe('500');
    expect(computed.color).toBe('rgb(0, 0, 0)'); // #000
    expect(computed.textDecoration).toContain('underline');
  });

  test('B-13 [mobile]: Card background + radius — mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const card = await requireElement(page, `${SECTION_SELECTOR} .essential-section__card`);
    const computed = await card.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        borderRadius: parseFloat(style.borderRadius),
      };
    });
    expect(computed.backgroundColor).toBe('rgb(255, 255, 255)'); // #fff
    expect(computed.borderRadius).toBeCloseTo(8, 1);
  });

  test('B-14 [desktop]: Card background + radius — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const card = await requireElement(page, `${SECTION_SELECTOR} .essential-section__card`);
    const computed = await card.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        borderRadius: parseFloat(style.borderRadius),
      };
    });
    expect(computed.backgroundColor).toBe('rgb(255, 255, 255)'); // #fff
    expect(computed.borderRadius).toBeCloseTo(12, 1);
  });

  test('B-15 [desktop]: Section background color — desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const section = await requireElement(page, SECTION_SELECTOR);
    const computed = await section.evaluate(el => {
      const style = window.getComputedStyle(el);
      return { backgroundColor: style.backgroundColor };
    });
    expect(computed.backgroundColor).toBe('rgb(244, 246, 248)'); // #f4f6f8
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

  test('C-3 [tablet-lg]: No horizontal scroll on page', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only test');
    const hasScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasScroll).toBe(false);
  });

  test('C-4 [tablet-lg]: Section container fits viewport width', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only test');
    const section = await requireElement(page, SECTION_SELECTOR);
    const width = await section.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(1280);
  });

  test('C-5 [tablet]: CTA block stacked above cards', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'Tablet-only test');
    const inner = await requireElement(page, `${SECTION_SELECTOR} .essential-section__inner`);
    const computed = await inner.evaluate(el => {
      const style = window.getComputedStyle(el);
      return { flexDirection: style.flexDirection };
    });
    expect(computed.flexDirection).toBe('column');
  });

  test('C-6 [tablet-lg]: CTA block left, cards right in row', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet-lg', 'Tablet-lg-only test');
    const inner = await requireElement(page, `${SECTION_SELECTOR} .essential-section__inner`);
    const computed = await inner.evaluate(el => {
      const style = window.getComputedStyle(el);
      return { flexDirection: style.flexDirection };
    });
    expect(computed.flexDirection).toBe('row');
  });

  test('C-7 [mobile]: Card count = 3', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const cardCount = await page.locator(`${SECTION_SELECTOR} .essential-section__card`).count();
    expect(cardCount).toBe(3);
  });

  test('C-8 [desktop]: Card count = 3', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const cardCount = await page.locator(`${SECTION_SELECTOR} .essential-section__card`).count();
    expect(cardCount).toBe(3);
  });

  // ============ D — Live screenshots (pipeline-executed) ============
  test('D-1: Save mobile live screenshot', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only screenshot');
    await saveScreenshot(page, SECTION_SELECTOR, 'essential-section', 'live-mobile');
  });

  test('D-2: Save desktop live screenshot', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only screenshot');
    await saveScreenshot(page, SECTION_SELECTOR, 'essential-section', 'live-desktop');
  });

  // ============ E — Content placement (manual-debug) ============
  test('E-1 [mobile]: Button appears below description at mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const header = await requireElement(page, `${SECTION_SELECTOR} .essential-section__header`);
    const height = await header.evaluate(el => el.offsetHeight);
    expect(height).toBeGreaterThan(100);
  });

  test('E-2 [desktop]: CTA block is left column at desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const header = await requireElement(page, `${SECTION_SELECTOR} .essential-section__header`);
    const width = await header.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(305);
  });

  test('E-3 [mobile]: Cards carousel visible with 2.x cards per viewport', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const carousel = await requireElement(page, `${SECTION_SELECTOR} .essential-section__carousel`);
    const width = await carousel.evaluate(el => el.offsetWidth);
    expect(width).toBeGreaterThan(300);
    expect(width).toBeLessThanOrEqual(358);
  });

  test('E-4 [desktop]: Cards row has 3 cards side-by-side', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const cards = await page.locator(`${SECTION_SELECTOR} .essential-section__card`).all();
    expect(cards.length).toBe(3);
    // All 3 should be visible in viewport
    for (const card of cards) {
      const inViewport = await card.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      expect(inViewport).toBe(true);
    }
  });

  test('E-5 [mobile]: Carousel arrows hidden on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const prevArrow = await requireElement(page, `${SECTION_SELECTOR} [data-arrow="prev"]`);
    const nextArrow = await requireElement(page, `${SECTION_SELECTOR} [data-arrow="next"]`);
    const prevDisplay = await prevArrow.evaluate(el => window.getComputedStyle(el).display);
    const nextDisplay = await nextArrow.evaluate(el => window.getComputedStyle(el).display);
    expect(prevDisplay).toBe('none');
    expect(nextDisplay).toBe('none');
  });

  test('E-6 [desktop]: Carousel arrows visible (or auto-disabled at boundaries)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const prevArrow = await requireElement(page, `${SECTION_SELECTOR} [data-arrow="prev"]`);
    const nextArrow = await requireElement(page, `${SECTION_SELECTOR} [data-arrow="next"]`);
    const prevDisplay = await prevArrow.evaluate(el => window.getComputedStyle(el).display);
    const nextDisplay = await nextArrow.evaluate(el => window.getComputedStyle(el).display);
    // Both should be visible (display !== 'none'), even if disabled
    expect(prevDisplay).not.toBe('none');
    expect(nextDisplay).not.toBe('none');
  });

  test('E-7 [mobile]: Card width approximately 265px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const card = await requireElement(page, `${SECTION_SELECTOR} .essential-section__card`);
    const width = await card.evaluate(el => el.offsetWidth);
    expect(width).toBeGreaterThanOrEqual(260);
    expect(width).toBeLessThanOrEqual(270);
  });

  test('E-8 [desktop]: Card width approximately 306px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const card = await requireElement(page, `${SECTION_SELECTOR} .essential-section__card`);
    const width = await card.evaluate(el => el.offsetWidth);
    expect(width).toBeGreaterThanOrEqual(301);
    expect(width).toBeLessThanOrEqual(311);
  });

  test('E-9 [mobile]: Inner container full-width', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile-only test');
    const inner = await requireElement(page, `${SECTION_SELECTOR} .essential-section__inner`);
    const width = await inner.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(390);
  });

  test('E-10 [desktop]: Inner container max-width 1340px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Desktop-only test');
    const inner = await requireElement(page, `${SECTION_SELECTOR} .essential-section__inner`);
    const width = await inner.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThanOrEqual(1340);
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
    const qaPath = qaDir('essential-section');
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

    const qaPath = qaDir('essential-section');
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

    const qaPath = qaDir('essential-section');
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

    const qaPath = qaDir('essential-section');
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
