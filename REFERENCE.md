# Module update — Reference & guide

This document compares Module update with the main theme (New-theme), lists what must stay different for TypeScript and tree-shaking, and gives step-by-step deep dives for tree-shaking and adding aliases. For architecture and build pipeline, see **ARCHITECTURE.md**.

---

# Part 1 — New-theme vs Module update

Side-by-side of the main theme (New-theme) and the TypeScript setup (Module update).

---

## 1. Stack & purpose

|                     | New-theme                | Module update                                   |
| ------------------- | ------------------------ | ----------------------------------------------- |
| **Purpose**         | Main Shopify theme build | Same theme build + TypeScript, stricter tooling |
| **JS**              | JS/JSX only              | JS/JSX + **TS/TSX** (Babel)                     |
| **Package manager** | npm or yarn              | **Yarn** (`packageManager`, no lock for npm)    |
| **Node**            | No engines               | `engines: node >= 18, yarn >= 1.22`             |
| **Browserslist**    | (optional)               | Explicit `last 2 versions, not dead`            |

---

## 2. Webpack

| Area                   | New-theme                                                        | Module update                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Entry**              | `...scssEntryPoint`, `...jsEntryPoints`                          | Same + **`...tsEntryPoints`** from `src/sections/**/*.{ts,tsx}` (one truth, no fallback) |
| **Resolve extensions** | `.js`, `.jsx`, `.json`                                           | + **`.ts`, `.tsx`**                                                                                                                        |
| **Aliases**            | `StyleComponents`, `JsComponents`                                | Same + **SvelteComponents** (→ `src/svelte`) |
| **JS rule**            | `(js\|jsx)$` → babel-loader                                      | `(js\|jsx\|ts\|tsx)$` → babel-loader                                                                                                       |
| **Output**             | `assets/`, `[name].js`, `[name].js?[chunkhash]`                  | Same                                                                                                                                       |
| **Optimization**       | Separate blocks for dev and prod (same shape)                    | Same (separate dev/prod blocks; dev adds `devtool: false` + shell plugin)                                                                  |
| **Plugins**            | RemoveEmptyScripts, MiniCssExtract, (dev) WebpackShellPluginNext | Same                                                                                                                                       |

---

## 3. Babel

|             | New-theme                                            | Module update                |
| ----------- | ---------------------------------------------------- | ---------------------------- |
| **Presets** | preset-react, preset-env (esmodules, modules: false) | Same + **preset-typescript** |
| **Plugins** | transform-runtime                                    | Same                         |

---

## 4. PostCSS

|              | New-theme                                                                       | Module update                                                                        |
| ------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Plugins**  | postcss-preset-env (browsers, stage 0, autoprefixer), tailwindcss, autoprefixer | postcss-preset-env (stage 0, autoprefixer), tailwindcss only (no extra autoprefixer) |
| **Browsers** | In postcss `browsers: 'last 2 versions'`                                        | From package.json **browserslist**                                                   |

---

## 5. Tailwind

|              | New-theme                                         | Module update                           |
| ------------ | ------------------------------------------------- | --------------------------------------- |
| **Content**  | sections, blocks, snippets, `./js/**/*`, flowbite | Same + **`./src/**/*.{ts,tsx,js,jsx}`** |
| **Theme**    | Same (screens, colors, spacing, etc.)             | Same                                    |
| **Flowbite** | `prefix: 'tw-'`                                   | Same                                    |
| **prefix**   | `tw-`                                             | Same                                    |

---

## 6. Package.json

|                     | New-theme                                                                            | Module update                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **main**            | `webpack.config.js`                                                                  | `assets/main.js`                                                                                                   |
| **Scripts**         | build, start, deploy, shopify:push/pull + **Playwright tests**                       | build, start, deploy, shopify:push/pull + **typecheck**, **emit-declarations**                                     |
| **sideEffects**     | `*.css`, `*.scss`, `*.vue`                                                           | Same                                                                                                               |
| **Dependencies**    | Theme/runtime (React, Swiper, etc.)                                                  | **@babel/runtime** only                                                                                            |
| **DevDependencies** | Babel (no TS), webpack, sass, postcss, tailwind, flowbite, glob ^7, Playwright, etc. | Babel + **preset-typescript**, webpack, sass, postcss, tailwind, flowbite, **typescript**, glob ^11, no Playwright |

---

## 7. Source & output layout

|                       | New-theme                                    | Module update                                                                                                                             |
| --------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **JS/TS entry dirs**  | `js/sections/**/*.js`                        | `js/sections/**/*.js` + **`src/sections/**/*.{ts,tsx}`**                                                                                  |
| **Component aliases** | `js/components`, `scss/components`           | Same + **`src/svelte`** (SvelteComponents)                                                                                                |
| **SCSS**              | `scss/sections/*.scss` (e.g. common-imports) | Same; Tailwind in `common-imports.scss`                                                                                                   |
| **Output**            | `assets/` (JS, CSS, shared, vendors)         | Same                                                                                                       |
| **TypeScript**        | —                                            | **`src/`** (index, sections, lib, components, svelte); **`tsconfig.json`** (noEmit, paths); **`dist/`** only for `yarn emit-declarations` |

---

## 8. Config files only in Module update

- **tsconfig.json** — strict TS, path aliases, `noEmit: true`; declarations via `yarn emit-declarations`.
- **.gitignore** — `.env`, etc.

---

## 9. Summary

- **Shared:** Entry pattern (scss + js/sections), output to `assets/`, same Tailwind/Flowbite/PostCSS/Babel (except TS), same optimization idea (usedExports, Vendors + common chunks, CssMinimizer only), same dev shell plugin.
- **New-theme only:** JS/JSX, more app deps, Playwright, inline comments in webpack, duplicate dev/prod optimization blocks.
- **Module update only:** TypeScript (Babel), `src/sections` entries, SvelteComponents + SCSS aliases, Yarn/engines/browserslist, typecheck and emit-declarations scripts, lighter deps.

---

## 10. Same as New-theme vs required for TS + tree-shaking

### Should be the same as New-theme

These are either already identical or can be aligned so both projects behave and look the same except where TS/tree-shaking force a difference.

| Area | New-theme | Module update | Status |
|------|-----------|---------------|--------|
| **Entry pattern** | `...scssEntryPoint`, `...jsEntryPoints` | Same + `...tsEntryPoints` | TS adds one spread (required). |
| **Output** | `assets/`, `[name].js`, `[name].css`, `[name].js?[chunkhash]` | Same | Same. |
| **Optimization** | Separate dev/prod blocks (usedExports, splitChunks, minimizer) | Same | Same. |
| **PostCSS** | postcss-preset-env (browsers, stage 0, autoprefixer), tailwindcss, autoprefixer | Same | Same. |
| **Tailwind** | content, theme, flowbite prefix `tw-` | Same + `./src/**/*` in content | Same; extra path for TS. |
| **sideEffects** | `["*.css", "*.scss", "*.vue"]` | Same | Same. |
| **Scripts (core)** | build, start, deploy, shopify:push, shopify:pull | Same | Same. |
| **Shell plugin (dev)** | onBuildStart/onBuildEnd, parallel: true | Same | Same. |
| **Webpack glob reduce** | reduce pattern (variable `path` shadows Node) | Same; `p` / `filePath` (no shadow) | Same. |

### Required for TS + tree-shaking (must stay different)

These differences are needed to support TypeScript and your tree-shaking setup. Do not remove them to “match” New-theme.

| Area | Why it must differ |
|------|--------------------|
| **Entry** | `...tsEntryPoints` from `src/sections/**/*.{ts,tsx}` is required so TS section files are entry points. |
| **resolve.extensions** | `.ts`, `.tsx` must be present so webpack resolves TypeScript files. |
| **resolve.alias** | `SvelteComponents` → `src/svelte` for TS/svelte resolution; keep. |
| **JS rule** | `test: /\.(js\|jsx\|ts\|tsx)$/` and babel-loader are required to compile TS/TSX. |
| **Babel** | `@babel/preset-typescript` is required for TypeScript. |
| **package.json** | `typecheck`, `emit-declarations`; `@babel/runtime`; `@babel/preset-typescript`, `typescript` in devDependencies; optional `engines`/`browserslist` for consistency. |
| **Tailwind content** | `./src/**/*.{ts,tsx,js,jsx}` is needed so Tailwind sees classes in TS/TSX. |
| **Config only in Module update** | `tsconfig.json` (type-check, paths, noEmit); `.gitignore` for `.env`, etc. |
| **Source layout** | `src/` (sections, lib, components, svelte) and optional `dist/` for declarations. |

### Minimal changes to “be the same as New-theme” where possible

1. **PostCSS** — In Module update, set `browsers: 'last 2 versions'` on `postcss-preset-env` and add `autoprefixer: {}` so the plugin list and options match New-theme.
2. **Shell plugin** — Use the same onBuildStart/onBuildEnd strings (and emoji) as New-theme so dev UX is identical.
3. **Webpack optimization** — Optionally replace the single `sharedOptimization` with separate `if (mode === 'development')` and `if (mode === 'production')` blocks that mirror New-theme’s blocks (same options, just two blocks). Behavior stays the same; only structure aligns with New-theme.

---

# Part 2 — Deep dives

---

## 11. How tree-shaking drops `unusedExport`

### The source

- **`src/lib/utils.ts`** exports: `GreetOptions`, `greet`, `unusedExport`.
- **`src/index.ts`** only imports `greet` (and re-exports `greet` + type `GreetOptions`). It never imports `unusedExport`.

So from the entry point, `unusedExport` is **never used**.

### The mechanism (step by step)

1. **`package.json`: `"sideEffects": ["*.css", "*.scss"]`**  
   Tells webpack: only CSS/SCSS are side-effectful; JS/TS can be tree-shaken. So webpack is allowed to remove whole exports if nothing uses them.

2. **Webpack: `optimization.usedExports: true`**  
   Webpack analyzes the dependency graph from the entry (`src/index.ts`):
   - It sees `index.ts` → imports `greet` from `./lib/utils`.
   - It marks `greet` (and `GreetOptions`, used by `greet`) as **used**.
   - It marks `unusedExport` as **unused** (no import path leads to it).

3. **Webpack: `optimization.sideEffects: true`**  
   Webpack respects each package’s `sideEffects` (and your app’s `sideEffects`). So it doesn’t have to keep `unusedExport` “just in case” it had side effects.

4. **Production: `mode: 'production'` → minification**  
   With `minimize: true`, webpack’s minimizer actually **removes** the dead code. `usedExports` only *marks* unused code; the minimizer **deletes** it from the bundle.

**Chain:** sideEffects → usedExports (mark unused) → sideEffects: true (allow removal) → minimize (delete unused) → **`unusedExport` is not in `dist/main.js`**.

### Verification

After `yarn build`:

- `grep unusedExport dist/main.js` → no match.
- `grep greet dist/main.js` → match (it’s used).

So tree-shaking did drop `unusedExport`.

### If it weren’t dropped

- If you did `import { greet, unusedExport } from './lib/utils'` in `index.ts`, then `unusedExport` would be marked used and would stay in the bundle.
- If you set `"sideEffects": true` (or omitted it) in `package.json`, webpack would be more conservative and might keep more code.
- In **development** (`yarn start`), `minimize` is false, so the bundle often still contains unused code for faster builds; tree-shaking is most visible in **production** builds.

---

## 12. How to add a new alias

Aliases let you write shorter or stable imports (e.g. `import X from 'Components/Button'` instead of `../../../components/Button`). You must add them in **two** places so both the build and TypeScript/editor understand the same paths.

### Step 1: Webpack (`webpack.config.js`)

In `resolve.alias`, add a new key (alias name) and value (absolute path):

```js
resolve: {
  extensions: ['.ts', '.tsx', '.js', '.json'],
  extensionAlias: { '.js': ['.ts', '.tsx', '.js'] },
  alias: {
    JsComponents: path.resolve(__dirname, 'src/components'),
    StyleComponents: path.resolve(__dirname, 'scss/components'),
    SvelteComponents: path.resolve(__dirname, 'src/svelte'),
    // New alias example: "Components" -> "src/components"
    Components: path.resolve(__dirname, 'src/components'),
  },
},
```

- **Key** = what you write in imports (e.g. `Components` or `Components/Button`).
- **Value** = `path.resolve(__dirname, 'src/components')` so `Components/Button` resolves to `src/components/Button`.

### Step 2: TypeScript (`tsconfig.json`)

In `compilerOptions.paths`, add a matching pattern so types and IDE resolve the same way:

```json
"paths": {
  "JsComponents/*": ["src/components/*"],
  "StyleComponents/*": ["scss/components/*"],
  "SvelteComponents/*": ["src/svelte/*"],
  "Components/*": ["src/components/*"]
}
```

- **Key** = same “alias” name with `/*` (one segment) or `/*/*` (nested) if you need it.
- **Value** = array of path patterns relative to `baseUrl` (here `"."`), so `Components/Button` → `src/components/Button`.

### Step 3: Use it in code

```ts
// Before (relative)
import { Button } from './components/Button';

// After (alias) — only works if the alias is in both webpack and tsconfig
import { Button } from 'Components/Button';
```

### Checklist

| Step | File | What to add |
|------|------|-------------|
| 1 | `webpack.config.js` | `resolve.alias.AliasName: path.resolve(__dirname, 'path/to/dir')` |
| 2 | `tsconfig.json` | `"paths": { "AliasName/*": ["path/to/dir/*"] }` |
| 3 | Code | `import … from 'AliasName/...'` |

If you add the alias only in webpack, the build may succeed but TypeScript/IDE will show “cannot find module.” If you add it only in tsconfig, types may work but webpack won’t resolve the path. So both are required.
