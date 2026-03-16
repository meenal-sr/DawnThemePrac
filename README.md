# moduleUpdate

TypeScript build with tree-shaking (app code + node_modules).

# Global Variables

- use **JsComponents/** for `src/components`
- use **SvelteComponents/** for `src/svelte`
- use **StyleComponents/** for `scss/components`
- use **src/sections/** for TS/TSX entry points (one bundle per file); same pattern as **js/sections/** for JS
- use **assets/** for build output (`[name].js`, `vendors.js`, `shared.js`, `[name].css`)

# Shopify theme folders

| Folder | Purpose |
|--------|--------|
| **assets** | Theme assets; webpack outputs built JS and CSS here (same as main theme). |
| **blocks** | Theme app blocks (JSON). |
| **config** | `settings_schema.json`, `settings_data.json`. |
| **layout** | Layout files (e.g. `theme.liquid`). |
| **locales** | Translations (e.g. `en.default.json`). |
| **sections** | Theme sections (`.liquid` + `.json`). |
| **snippets** | Reusable Liquid snippets. |
| **templates** | Theme templates (e.g. `index.json`, `page.json`). |
| **js** | JS entry points or legacy scripts (source in `src/`). |
| **scss** | SCSS (e.g. `scss/sections/`, `scss/components/`). Tailwind in `common-imports.scss` → `assets/common-imports.css`. |
| **src** | TypeScript/JS source (`index.ts`, `sections/`, `components/`). |

# How to get started ?

- Clone or move this repo into your project (or use it standalone)
- Install yarn through homebrew [Install Yarn](https://formulae.brew.sh/formula/yarn/).
- Follow this doc to Install asdf & add asdf into your terminal [asdf doc](https://asdf-vm.com/guide/getting-started.html)
- run `asdf install`
- run `yarn`
- Once all packages are installed, run `yarn build` for a production build or `yarn start` for watch mode
- For type-check only, run `yarn typecheck`


## Config files

| File | Purpose |
|------|--------|
| **yarn.lock** | Lockfile (use `yarn`, not npm). |
| **package-lock.json** | Ignored; do not commit. |
| **postcss.config.js** | PostCSS: tailwindcss, postcss-preset-env (autoprefixer). |
| **tailwind.config.js** | Tailwind content paths (sections, snippets, src, etc.) and theme. |
| **.babelrc** | Babel presets/plugins for JS/TS (preset-env, preset-react, preset-typescript). |
| **tsconfig.json** | TypeScript type-check and path aliases (`yarn typecheck`). |

## Note

- **NOTES.md** and **ARCHITECTURE.md** — how the build and tree-shaking are wired.
- **AWESOME.md** — when you change the existing build system, use it to update this TS build (checklist and mapping).
- Build may emit both `common-import.css` and `common-imports.css` (plugin requests); use `common-imports.css` in the theme. The former is in `.gitignore`.
