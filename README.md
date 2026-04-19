# Module update

JavaScript Shopify theme — webpack build with tree-shaking (app code + node_modules).

## Global variables & paths

- **JsComponents/** → `js/components`
- **StyleComponents/** → `scss/components`
- **js/sections/** — JS/JSX entry points (one bundle per file)
- **assets/** — build output (`[name].js`, `vendors.js`, `shared.js`, `[name].css`)

## Shopify theme folders

| Folder | Purpose |
|--------|--------|
| **assets** | Theme assets; webpack outputs built JS and CSS here. |
| **blocks** | Theme app blocks (JSON). |
| **config** | `settings_schema.json`, `settings_data.json`. |
| **layout** | Layout files (e.g. `theme.liquid`). |
| **locales** | Translations (e.g. `en.default.json`). |
| **sections** | Theme sections (`.liquid` + `.json`). |
| **snippets** | Reusable Liquid snippets. |
| **templates** | Theme templates (e.g. `index.json`, `page.json`). |
| **js** | JS/JSX source: `js/sections/` (entries), `js/components/` (JsComponents alias). |
| **scss** | SCSS: `scss/sections/` (e.g. `common-imports.scss` → `assets/common-imports.css`), `scss/components/` (StyleComponents). |

## How to get started

1. Clone or move this repo; install [Yarn](https://formulae.brew.sh/formula/yarn/) and [asdf](https://asdf-vm.com/guide/getting-started.html) if needed.
2. Run `asdf install` then `yarn`.
3. Copy `sampleenv` to `.env` and fill in `STORE_URL`, `THEME_ID`, `STORE_PASSWORD`, the `*_PATH` vars, and `TEST_*_TEMPLATE` vars.
4. **`yarn start`** — webpack watch (development).
5. **`yarn deploy`** — production webpack build then `shopify theme push`.
6. **`yarn lint`** — ESLint on `js/`.
7. **`yarn playwright:install`** — once per machine; then `yarn playwright:test` (headless) or `yarn playwright:ui` (UI mode).

## Config files

| File | Purpose |
|------|--------|
| **yarn.lock** | Lockfile (use `yarn`, not npm). |
| **webpack.config.js** | Entry (scss + js/sections), Babel, SCSS, ESLint, output to `assets/`. |
| **.babelrc** | Babel: preset-env, preset-react, transform-runtime. |
| **.eslintrc.cjs** | ESLint for `js/` (used in webpack build). |
| **postcss.config.js** | PostCSS: tailwindcss, postcss-preset-env (autoprefixer). |
| **tailwind.config.js** | Tailwind content paths and theme. |
| **playwright.config.js** | Playwright runner config; shared setup in `playwright-config/`. |

## Claude Code workflow

This repo is set up with the CrossCode Shopify agent pipeline. See `install-new.md` for install and `.claude/rules/workflow-commands.md` for which slash command to run per task. Figma PNG export helper lives at `pixelmatch-config/figma-mcp-screenshot.js` (talks to local Figma Desktop MCP server — no token needed).

## More docs

- **ARCHITECTURE.md** — project layout, build pipeline, tree-shaking, scripts.
- **REFERENCE.md** — comparison with New-theme, deep dives (tree-shaking, adding aliases).
- **install-new.md** — Claude Code setup (agents, commands, rules, memory).
