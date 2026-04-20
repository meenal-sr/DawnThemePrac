const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { qaDir, loadTemplate } = require('../../playwright-config/helpers');
const AxeBuilder = require('@axe-core/playwright').default;

const VIEW_SUFFIX = process.env.TEST_PAGE_TEMPLATE.split('.').pop();
const PAGE_PATH = `${process.env.GLOBAL_PAGE_PATH}?view=${VIEW_SUFFIX}`;
const SECTION_TYPE = 'page';
const SECTION = 'faq';
const SECTION_SELECTOR = '[data-section-type="faq"]';

const EXPECTED_QUESTIONS = [
  'Wholesale HVAC Equipment for All of Your Cooling & Heating Needs',
  'Find What You Need at Our Online AC Supply Store',
  'We Offer a Wide Variety of HVAC Products',
  'A Combination of Convenience & Customer Support at Wholesale Prices',
];

const EXPECTED_LINKS = [
  'https://www.theacoutlet.com/individual-ac-components.html',
  'https://www.theacoutlet.com/complete-ac-systems.html',
  'https://www.theacoutlet.com/extended-labor-warranty-plans.html',
];

// A11y: brief says "required"
// No marker file needed; import Axe and emit a11y tests

test.describe('FAQ section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_PATH, { waitUntil: 'domcontentloaded' });
    await page.locator(SECTION_SELECTOR).waitFor({ state: 'visible' });
    await page.addStyleTag({
      content: `
        #preview-bar-iframe,
        #preview_bar_iframe,
        .preview-bar-iframe-container,
        #previewBarContainer,
        shopify-dev-mode,
        [id^="shopify-preview"],
        iframe[src*="preview-bar"] { display: none !important; }
        body { padding-bottom: 0 !important; margin-bottom: 0 !important; }
      `,
    });
  });

  // ============================
  // A-content — pipeline gate
  // ============================
  test('[A-content] [desktop] [A-content] section mount + heading + 4 rows + block-1 expanded + 3 links', async ({ page }) => {
    test.skip(page.viewportSize().width !== 1440, 'Desktop-only test');

    const template = loadTemplate(SECTION_TYPE);
    const settings = template.sections[SECTION].settings;
    const blockOrder = template.sections[SECTION].block_order;

    // Validate template
    expect(settings.heading, 'heading non-blank').not.toBe('');
    expect(settings.heading_color, 'heading_color non-blank').not.toBe('');
    expect(blockOrder.length, 'block_order length').toBe(4);

    // A-1: Section mounted
    const section = await page.locator(SECTION_SELECTOR);
    await expect(section).toBeVisible();

    // A-2: Heading visible + correct text
    const heading = await page.locator('.faq-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('The AC Outlet Advantage');

    // A-3: Accordion wrapper
    const accordion = await page.locator('[data-accordion]');
    await expect(accordion).toBeVisible();

    // A-4: 4 toggle buttons
    const buttons = await page.locator('[data-accordion-target]');
    await expect(buttons).toHaveCount(4);

    // A-5 through A-8: Button text for each question
    for (let i = 0; i < 4; i++) {
      const button = buttons.nth(i);
      const questionSpan = button.locator('.faq-question-text');
      await expect(questionSpan).toContainText(EXPECTED_QUESTIONS[i]);
    }

    // A-9: Button 0 expanded
    const button0 = buttons.nth(0);
    await expect(button0).toHaveAttribute('aria-expanded', 'true');

    // A-10: Buttons 1-3 collapsed
    for (let i = 1; i < 4; i++) {
      const button = buttons.nth(i);
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    }

    // A-11: Panel 0 visible (not hidden)
    const panel0 = await page.locator('#faq-panel-faq-1');
    await expect(panel0).not.toHaveAttribute('hidden', '');

    // A-12: Panels 1-3 hidden
    for (let i = 2; i <= 4; i++) {
      const panel = await page.locator(`#faq-panel-faq-${i}`);
      await expect(panel).toHaveAttribute('hidden', '');
    }

    // A-13: Button → Panel pairing (button 0)
    await expect(button0).toHaveAttribute('aria-controls', 'faq-panel-faq-1');
    await expect(panel0).toBeVisible();

    // A-14: 3 inline links in answer panel
    const links = await panel0.locator('a');
    await expect(links).toHaveCount(3);

    // A-15 through A-17: Verify each link
    for (let i = 0; i < 3; i++) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute('href', EXPECTED_LINKS[i]);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = await link.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });

  test('[A-content] [mobile] [A-content] section mount + heading + 4 rows', async ({ page }) => {
    test.skip(page.viewportSize().width !== 390, 'Mobile-only test');

    const template = loadTemplate(SECTION_TYPE);
    const settings = template.sections[SECTION].settings;
    const blockOrder = template.sections[SECTION].block_order;

    expect(settings.heading, 'heading non-blank').not.toBe('');
    expect(blockOrder.length, 'block_order length').toBe(4);

    // Section mounted
    const section = await page.locator(SECTION_SELECTOR);
    await expect(section).toBeVisible();

    // Heading visible
    const heading = await page.locator('.faq-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('The AC Outlet Advantage');

    // Accordion wrapper
    const accordion = await page.locator('[data-accordion]');
    await expect(accordion).toBeVisible();

    // 4 buttons
    const buttons = await page.locator('[data-accordion-target]');
    await expect(buttons).toHaveCount(4);

    // All question texts present
    for (let i = 0; i < 4; i++) {
      const button = buttons.nth(i);
      const questionSpan = button.locator('.faq-question-text');
      await expect(questionSpan).toContainText(EXPECTED_QUESTIONS[i]);
    }

    // Block 1 open on mobile (data-driven, persists across breakpoints)
    const button0 = buttons.nth(0);
    await expect(button0).toHaveAttribute('aria-expanded', 'true');

    // Blocks 2-4 closed
    for (let i = 1; i < 4; i++) {
      const button = buttons.nth(i);
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  });

  // ============================
  // B-typography — manual debug
  // ============================
  test.skip('[B-typography] [desktop] heading font-size + line-height + weight + color', async ({ page }) => {
    test.skip(page.viewportSize().width !== 1440, 'Desktop-only');

    const heading = await page.locator('.faq-heading');
    const computed = await heading.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        fontWeight: styles.fontWeight,
        color: styles.color,
      };
    });

    expect(computed.fontSize).toBe('48px');
    expect(computed.lineHeight).toBe('52.8px');
    expect(computed.fontWeight).toBe('700');
    // color check: #0b1e3d in rgb
    expect(computed.color).toMatch(/rgb\(11,\s*30,\s*61\)/);
  });

  test.skip('[B-typography] [desktop] question font-size + line-height + letter-spacing', async ({ page }) => {
    test.skip(page.viewportSize().width !== 1440, 'Desktop-only');

    const question = await page.locator('.faq-question-text').first();
    const computed = await question.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        letterSpacing: styles.letterSpacing,
        fontWeight: styles.fontWeight,
      };
    });

    expect(computed.fontSize).toBe('18px');
    expect(computed.lineHeight).toBe('20px');
    expect(computed.fontWeight).toBe('500');
    expect(computed.letterSpacing).toBe('-0.72px');
  });

  test.skip('[B-typography] [desktop] answer body font-size + line-height + color', async ({ page }) => {
    test.skip(page.viewportSize().width !== 1440, 'Desktop-only');

    const answer = await page.locator('.faq-answer').first();
    const computed = await answer.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        color: styles.color,
        letterSpacing: styles.letterSpacing,
      };
    });

    expect(computed.fontSize).toBe('16px');
    expect(computed.lineHeight).toBe('20px');
    expect(computed.letterSpacing).toBe('-0.16px');
    // #666 in rgb
    expect(computed.color).toMatch(/rgb\(102,\s*102,\s*102\)/);
  });

  test.skip('[B-typography] [mobile] heading font-size + line-height', async ({ page }) => {
    test.skip(page.viewportSize().width !== 390, 'Mobile-only');

    const heading = await page.locator('.faq-heading');
    const computed = await heading.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
      };
    });

    expect(computed.fontSize).toBe('28px');
    expect(computed.lineHeight).toBe('33.6px');
  });

  test.skip('[B-typography] [mobile] question font-size + line-height', async ({ page }) => {
    test.skip(page.viewportSize().width !== 390, 'Mobile-only');

    const question = await page.locator('.faq-question-text').first();
    const computed = await question.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
      };
    });

    expect(computed.fontSize).toBe('16px');
    expect(computed.lineHeight).toBe('26px');
  });

  // ============================
  // C-layout — manual debug
  // ============================
  test.skip('[C-layout] [tablet] no horizontal scroll', async ({ page }) => {
    test.skip(page.viewportSize().width !== 768, 'Tablet-only');

    const section = await page.locator(SECTION_SELECTOR);
    const box = await section.boundingBox();
    const viewport = page.viewportSize();
    expect(box.width).toBeLessThanOrEqual(viewport.width);
  });

  test.skip('[C-layout] [tablet] row layout vertical stack', async ({ page }) => {
    test.skip(page.viewportSize().width !== 768, 'Tablet-only');

    const rows = await page.locator('[data-accordion] > div').count();
    expect(rows).toBeGreaterThan(0);
  });

  test.skip('[C-layout] [tablet-lg] content container max-width', async ({ page }) => {
    test.skip(page.viewportSize().width !== 1280, 'Tablet-lg-only');

    const section = await page.locator(SECTION_SELECTOR);
    const innerDiv = section.locator('> div').first();
    const box = await innerDiv.boundingBox();
    expect(box.width).toBeLessThanOrEqual(1340);
  });

  test.skip('[C-layout] [tablet-lg] button padding closed state', async ({ page }) => {
    test.skip(page.viewportSize().width !== 1280, 'Tablet-lg-only');

    const closedButton = await page.locator('[data-accordion-target][aria-expanded="false"]').first();
    const computed = await closedButton.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        paddingTop: styles.paddingTop,
        paddingBottom: styles.paddingBottom,
      };
    });

    // At tablet-lg, still using mobile-first defaults unless overridden
    expect(computed.paddingTop).toBe('12px');
    expect(computed.paddingBottom).toMatch(/12\.8px|13px/);
  });

  // ============================
  // D-screenshot — pipeline capture
  // ============================
  test('[D-screenshot] [desktop] live-desktop.png', async ({ page }) => {
    test.skip(page.viewportSize().width !== 1440, 'Desktop-only');

    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }' });

    const section = await page.locator(SECTION_SELECTOR);
    await section.waitFor({ state: 'visible' });

    const qaPath = qaDir('faq');
    const screenshotPath = path.join(qaPath, 'live-desktop.png');
    await section.screenshot({ path: screenshotPath, animations: 'disabled' });

    expect(fs.existsSync(screenshotPath)).toBe(true);
  });

  test('[D-screenshot] [mobile] live-mobile.png', async ({ page }) => {
    test.skip(page.viewportSize().width !== 390, 'Mobile-only');

    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }' });

    const section = await page.locator(SECTION_SELECTOR);
    await section.waitFor({ state: 'visible' });

    const openButton = page.locator('[data-accordion-target][aria-expanded="true"]').first();
    if (await openButton.count() > 0) {
      await openButton.click();
      await page.waitForTimeout(100);
    }

    const qaPath = qaDir('faq');
    const screenshotPath = path.join(qaPath, 'live-mobile.png');
    await section.screenshot({ path: screenshotPath, animations: 'disabled' });

    expect(fs.existsSync(screenshotPath)).toBe(true);
  });

  // ============================
  // E-placement — manual debug
  // ============================
  test.skip('[E-placement] [desktop] heading line count', async ({ page }) => {
    test.skip(page.viewportSize().width !== 1440, 'Desktop-only');

    const heading = await page.locator('.faq-heading');
    const lineCount = await heading.evaluate(el => {
      const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight);
      return Math.round(el.offsetHeight / lineHeight);
    });

    expect(lineCount).toBe(1);
  });

  test.skip('[E-placement] [desktop] answer max-width constraint', async ({ page }) => {
    test.skip(page.viewportSize().width !== 1440, 'Desktop-only');

    const answer = await page.locator('.faq-answer').first();
    const width = await answer.evaluate(el => el.offsetWidth);

    expect(width).toBeLessThanOrEqual(640);
  });

  test.skip('[E-placement] [mobile] heading wraps correctly', async ({ page }) => {
    test.skip(page.viewportSize().width !== 390, 'Mobile-only');

    const heading = await page.locator('.faq-heading');
    const lineCount = await heading.evaluate(el => {
      const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight);
      return Math.round(el.offsetHeight / lineHeight);
    });

    expect(lineCount).toBeGreaterThanOrEqual(1);
  });

  test.skip('[E-placement] [mobile] question text line count (row 1)', async ({ page }) => {
    test.skip(page.viewportSize().width !== 390, 'Mobile-only');

    const question = await page.locator('.faq-question-text').first();
    const lineCount = await question.evaluate(el => {
      const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight);
      return Math.round(el.offsetHeight / lineHeight);
    });

    expect(lineCount).toBeGreaterThanOrEqual(2);
  });

  // ============================
  // A11y — required per brief
  // ============================
  test('[A11y] [desktop] accessibility scan', async ({ page }) => {
    test.skip(page.viewportSize().width !== 1440, 'Desktop-only');

    const section = await page.locator(SECTION_SELECTOR);

    const results = await new AxeBuilder({ page })
      .include(SECTION_SELECTOR)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const violations = results.violations;
    const criticalOrSerious = violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    const moderateOrMinor = violations.filter(v => v.impact === 'moderate' || v.impact === 'minor');

    // Write all violations to JSON for visual-qa-agent
    const qaPath = qaDir('faq');
    const a11yReportPath = path.join(qaPath, 'a11y-desktop.json');
    fs.writeFileSync(a11yReportPath, JSON.stringify(violations, null, 2));

    // Log moderate/minor without failing
    if (moderateOrMinor.length > 0) {
      console.log(`A11y moderate/minor violations (desktop): ${moderateOrMinor.length}`);
      moderateOrMinor.forEach(v => {
        console.log(`  - ${v.id}: ${v.help}`);
      });
    }

    // Fail on critical/serious
    expect(criticalOrSerious, `A11y critical/serious violations (desktop): ${criticalOrSerious.map(v => v.id).join(', ')}`).toHaveLength(0);
  });

  test('[A11y] [mobile] accessibility scan', async ({ page }) => {
    test.skip(page.viewportSize().width !== 390, 'Mobile-only');

    const section = await page.locator(SECTION_SELECTOR);

    const results = await new AxeBuilder({ page })
      .include(SECTION_SELECTOR)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const violations = results.violations;
    const criticalOrSerious = violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    const moderateOrMinor = violations.filter(v => v.impact === 'moderate' || v.impact === 'minor');

    // Write all violations to JSON for visual-qa-agent
    const qaPath = qaDir('faq');
    const a11yReportPath = path.join(qaPath, 'a11y-mobile.json');
    fs.writeFileSync(a11yReportPath, JSON.stringify(violations, null, 2));

    // Log moderate/minor without failing
    if (moderateOrMinor.length > 0) {
      console.log(`A11y moderate/minor violations (mobile): ${moderateOrMinor.length}`);
      moderateOrMinor.forEach(v => {
        console.log(`  - ${v.id}: ${v.help}`);
      });
    }

    // Fail on critical/serious
    expect(criticalOrSerious, `A11y critical/serious violations (mobile): ${criticalOrSerious.map(v => v.id).join(', ')}`).toHaveLength(0);
  });
});
