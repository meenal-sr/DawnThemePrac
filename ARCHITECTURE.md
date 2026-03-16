# Module update — Architecture & build

This document describes how the project is structured, how the build pipeline works, and how configs and outputs connect. For comparison with the main theme (New-theme) and operational deep dives, see **REFERENCE.md**.

---

## 1. Overview

This project is a **TypeScript + JS/SCSS** build with:

- **Entry pattern:** `...scssEntryPoint`, `...jsEntryPoints`, `...tsEntryPoints` (one bundle per section file).
- **Tree-shaking** of app code and `node_modules` (Vendors chunk).
- **TypeScript** via Babel (type-check with `tsc`, no emit in normal build).

---

## 2. Project layout

```
Module update/
├── package.json          # Scripts, sideEffects, deps (babel, webpack, typescript, sass, postcss, etc.)
├── tsconfig.json         # TypeScript: src, paths (JsComponents, StyleComponents, SvelteComponents), typecheck
├── .babelrc              # Babel: preset-env (modules: false), preset-react, preset-typescript, transform-runtime
├── webpack.config.js     # Entry (scss + js + ts), babel-loader, SCSS, tree-shake + Vendors + shared
├── postcss.config.js     # tailwindcss, postcss-preset-env (autoprefixer)
├── src/
│   ├── index.ts          # Fallback entry when no src/sections files
│   ├── sections/         # Optional: one entry per file (one bundle per section)
│   └── lib/, components/, svelte/
├── scss/sections/        # One CSS bundle per .scss file (e.g. common-imports.css)
├── assets/               # Webpack output: [name].js, vendors.js, shared.js, [name].css
├── dist/                 # Optional: tsc --emitDeclarationOnly only
├── ARCHITECTURE.md       # This file
└── REFERENCE.md         # Comparison with New-theme, deep dives (tree-shaking, aliases)
```

---

## 3. How the build is wired

| Piece | Role | Links to |
|-------|------|----------|
| **package.json** | Scripts `build`, `start`, `typecheck`; `sideEffects`: `["*.css", "*.scss"]`; deps. | Runs `webpack`; Babel uses `.babelrc`. |
| **tsconfig.json** | TypeScript under `src/`; `noEmit: true` (type-check only). | `yarn typecheck`; optional `yarn emit-declarations` writes `.d.ts` to `dist/`. |
| **webpack.config.js** | Entry: scss + js/sections + src/sections. babel-loader, SCSS, aliases, output `assets/`, optimization in dev/prod blocks. | Glob entries; same splitChunks (Vendors + common) as New-theme. |
| **.babelrc** | preset-env (modules: false), preset-react, preset-typescript, transform-runtime. | Used by `babel-loader` for .js, .jsx, .ts, .tsx. |

**Flow:** `package.json` → `webpack` → `babel-loader` + `.babelrc` → `assets/`.

---

## 4. Design diagram (Mermaid)

```mermaid
flowchart TB
  subgraph inputs["Inputs"]
    PKG["package.json\n(sideEffects, scripts, deps)"]
    TSC["tsconfig.json\n(ESNext, strict, src→dist)"]
    ENTRY["src/sections/*.{ts,tsx}\n(entries)"]
    LIBS["src/lib/*.ts\n(modules)"]
    NODE["node_modules\n(dependencies)"]
  end

  subgraph build["Build pipeline"]
    WP["webpack.config.js\n(entry, resolve, rules, optimization)"]
    BABEL["babel-loader\n(compiles JS/TS using .babelrc)"]
    RESOLVE["resolve.extensions\n.ts, .tsx, .js\n+ aliases: JsComponents, StyleComponents, SvelteComponents"]
    OPT["optimization\nusedExports, sideEffects\nsplitChunks: Vendors, common→shared"]
  end

  subgraph output["Output (assets/)"]
    MAIN["main.js\n(app code, tree-shaken)"]
    VENDORS["vendors.js\n(node_modules chunk, tree-shaken)"]
    SHARED["shared.js\n(common chunk, minChunks ≥ 2)"]
    MAP["*.map\n(source maps)"]
    DECL["*.d.ts\n(declarations from tsc)"]
  end

  PKG -->|"yarn build"| WP
  ENTRY --> WP
  LIBS --> ENTRY
  NODE --> RESOLVE

  WP --> BABEL
  WP --> RESOLVE
  WP --> OPT
  BABEL --> MAIN
  OPT --> MAIN
  OPT --> VENDORS
  OPT --> SHARED
  RESOLVE --> MAIN
  RESOLVE --> VENDORS
  MAIN --> MAP
  TSC -.->|"tsc --emitDeclarationOnly (optional)"| DECL
```

---

## 5. Config flow

```mermaid
flowchart LR
  A["package.json\nscripts: build, start"] --> B["webpack"]
  B --> C["webpack.config.js"]
  C --> D["entry: scss + jsEntryPoints + tsEntryPoints"]
  C --> E["module.rules: babel-loader"]
  C --> F["optimization: usedExports,\nsplitChunks (Vendors, common→shared)"]
  E --> G[".babelrc"]
  G --> D
  D --> H["assets/[name].js"]
  F --> H
  F --> I["assets/vendors.js"]
  F --> J["assets/shared.js"]
```

---

## 6. File dependency chain

```mermaid
flowchart LR
  section["src/sections/*.ts"] --> utils["src/lib/utils.ts"]
  section -->|"import"| utils
  utils --> section
  webpack["webpack.config.js"] -->|"entry"| section
  tsconfig["tsconfig.json"] -->|"include, typecheck"| section
  tsconfig -->|"include"| utils
```

---

## 7. Tree-shaking (your code + node_modules) — end-to-end

- **package.json**  
  `"sideEffects": ["*.css", "*.scss"]` — only CSS/SCSS are side-effectful; JS/TS can be tree-shaken.

- **webpack.config.js**  
  - `optimization.usedExports: true` — marks used exports; minimizer drops unused.  
  - `splitChunks.cacheGroups.Vendors` — `node_modules` in one chunk (`vendors.js`); tree-shaken.  
  - `splitChunks.cacheGroups.common` → `shared.js` (minChunks: 2).

**Result:** sideEffects + usedExports + Vendors chunk + common chunk = tree-shaken app code + tree-shaken node_modules in `vendors.js` + shared code in `shared.js`.

### Tree-shaking pipeline (Mermaid)

```mermaid
flowchart TB
  subgraph source["Source"]
    S1["index.ts\n(imports greet only)"]
    S2["utils.ts\nexports: greet, unusedExport"]
  end

  subgraph flags["Config flags"]
    P["package.json\nsideEffects: *.css, *.scss"]
    U["optimization.usedExports: true"]
    V["splitChunks.Vendors\nnode_modules → vendors.js"]
  end

  subgraph result["Bundle result"]
    R1["main.js\ncontains: greet only"]
    R2["unusedExport removed"]
    R3["vendors.js\nonly imported deps"]
  end

  S1 --> U
  S2 --> U
  P --> U
  U --> R1
  U --> R2
  V --> R3
```

---

## 8. TypeScript support — end-to-end

- **Babel:** `.babelrc` includes `@babel/preset-typescript`; `babel-loader` compiles `.ts`/`.tsx` (types stripped; no type-check).
- **Webpack:** `resolve.extensions` includes `.ts`/`.tsx`/`.js`/`.jsx`; `resolve.alias`: JsComponents, StyleComponents, SvelteComponents. One rule: `test: /\.(js|jsx|ts|tsx)$/`, `loader: 'babel-loader'`.
- **tsconfig.json:** Used only for `yarn typecheck` and IDE; Babel does not use it for transpilation. To emit declaration files, run `tsc --emitDeclarationOnly` (optional).

**Flow:** TS/JS in `src/` → babel-loader (.babelrc) → bundle in `assets/`; type-check with `tsc --noEmit`.

---

## 9. Scripts

| Script | Description |
|--------|-------------|
| `yarn build` | Production webpack build (tree-shaken, minified). |
| `yarn start` | Development webpack build + watch. |
| `yarn typecheck` | `tsc --noEmit` (type-check only, no emit). |
| `yarn emit-declarations` | `tsc --emitDeclarationOnly` (optional; writes `.d.ts` to `dist/`). |

---

## 10. Package entry

- **package.json:** `main` is `assets/main.js`; `types` is `dist/index.d.ts` (after `yarn emit-declarations`). Declarations come from `tsc --emitDeclarationOnly` only.

---

## 11. Quick reference

| Link | Description |
|------|-------------|
| **package.json → webpack** | `yarn build` runs `webpack`; `sideEffects` affects tree-shaking. |
| **webpack.config.js → TypeScript** | `babel-loader` compiles `.js`/`.jsx`/`.ts`/`.tsx` using `.babelrc`; `tsconfig.json` is for `yarn typecheck` only. |
| **webpack.config.js → entry** | `entry: { ...scssEntryPoint, ...jsEntryPoints, ...tsEntryPoints }` (one truth: scss + js/sections + src/sections). |
| **webpack.config.js → node_modules** | `splitChunks.cacheGroups.Vendors` with `test: /node_modules/` puts deps in `vendors.js`; only imported modules are included. |
| **webpack.config.js → path aliases** | `resolve.alias`: `JsComponents` → `src/components`, `StyleComponents` → `scss/components`, `SvelteComponents` → `src/svelte`. Matched by `tsconfig.json` `paths`. |
| **webpack optimization → shared** | `splitChunks.cacheGroups.common` (minChunks: 2) produces `shared.js` for code used in two or more chunks. |
| **tsconfig.json** | Used by `yarn typecheck` (`tsc --noEmit`) and IDE; `paths` mirror webpack aliases. JS output is from webpack only. |

---

## 12. Where the project lives

- **Path:** `Module update/` (workspace root).
- To use it elsewhere, copy or move the project folder and run `yarn install`.
- **Package:** `module-update`; entry is `assets/main.js`; types are emitted under `dist/` (e.g. `dist/index.d.ts`, `dist/lib/*.d.ts`) when you run `yarn emit-declarations`.
