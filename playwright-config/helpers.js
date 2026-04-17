const fs = require('fs');
const path = require('path');

const STORE_URL = (process.env.STORE_URL && process.env.STORE_URL.trim()) || '';
const THEME_ID = (process.env.THEME_ID && process.env.THEME_ID.trim()) || '';
const GLOBAL_PAGE_PATH = (process.env.GLOBAL_PAGE_PATH && process.env.GLOBAL_PAGE_PATH.trim()) || '/pages/contact';
const DEFAULT_PRODUCT_PATH = (process.env.DEFAULT_PRODUCT_PATH && process.env.DEFAULT_PRODUCT_PATH.trim()) || '/products/example-product';
const DEFAULT_COLLECTION_PATH = (process.env.DEFAULT_COLLECTION_PATH && process.env.DEFAULT_COLLECTION_PATH.trim()) || '/collections/all';
const TEST_PAGE_TEMPLATE = (process.env.TEST_PAGE_TEMPLATE && process.env.TEST_PAGE_TEMPLATE.trim()) || 'page.test';
const TEST_PRODUCT_TEMPLATE = (process.env.TEST_PRODUCT_TEMPLATE && process.env.TEST_PRODUCT_TEMPLATE.trim()) || 'product.test';
const TEST_COLLECTION_TEMPLATE = (process.env.TEST_COLLECTION_TEMPLATE && process.env.TEST_COLLECTION_TEMPLATE.trim()) || 'collection.test';

const TEST_CONFIG = {
  page: { basePath: GLOBAL_PAGE_PATH, template: TEST_PAGE_TEMPLATE },
  product: { basePath: DEFAULT_PRODUCT_PATH, template: TEST_PRODUCT_TEMPLATE },
  collection: { basePath: DEFAULT_COLLECTION_PATH, template: TEST_COLLECTION_TEMPLATE },
};

/**
 * Build test URL for section by type.
 * @param {'page'|'product'|'collection'} type
 * @returns {string}
 */
function sectionTestUrl(type) {
  const { basePath, template } = TEST_CONFIG[type];
  const clean = basePath.startsWith('/') ? basePath : `/${basePath}`;
  const view = template.includes('.') ? template.split('.').slice(1).join('.') : template;
  return `https://${STORE_URL}${clean}?view=${view}&preview_theme_id=${THEME_ID}`;
}

/**
 * @param {string} pagePath
 * @returns {string}
 */
function previewUrl(pagePath) {
  const clean = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  return `https://${STORE_URL}${clean}?preview_theme_id=${THEME_ID}`;
}

/**
 * Load a Shopify template JSON file. Shopify auto-prepends a `/* ... *\/`
 * block comment to template JSON files; strip it before JSON.parse.
 *
 * @param {'page'|'product'|'collection'} type
 * @returns {object}
 */
function loadTemplate(type) {
  const { template } = TEST_CONFIG[type];
  const filePath = path.join(process.cwd(), 'templates', `${template}.json`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const stripped = raw.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
  return JSON.parse(stripped);
}

/**
 * @param {string} sectionName
 * @returns {string}
 */
function qaDir(sectionName) {
  const dir = path.join(process.cwd(), 'features', sectionName, 'qa');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {string} sectionName
 * @param {string} name
 * @returns {Promise<string>}
 */
async function saveScreenshot(page, selector, sectionName, name) {
  const dir = qaDir(sectionName);
  const filePath = path.join(dir, `${name}.png`);
  await page.locator(selector).first().screenshot({ path: filePath });
  return filePath;
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').TestInfo} testInfo
 * @param {string} sectionName
 */
/**
 * Fail the test immediately with `element not found: <selector>` when the
 * selector matches nothing. Returns the first match locator otherwise.
 *
 * Every spec should use this instead of `if (count > 0)` guards — silent
 * skipping hides regressions.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
async function requireElement(page, selector) {
  // eslint-disable-next-line global-require
  const { expect } = require('@playwright/test');
  const locator = page.locator(selector);
  const count = await locator.count();
  expect(count, `element not found: ${selector}`).toBeGreaterThan(0);
  return locator.first();
}

module.exports = {
  sectionTestUrl,
  previewUrl,
  qaDir,
  saveScreenshot,
  requireElement,
  loadTemplate,
};
