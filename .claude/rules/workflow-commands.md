# Workflow Commands — Usage Guide

Reference for which slash command to invoke per task. Commands live in `.claude/commands/`.

---

## Decision tree

```
What are you doing?
│
├── Building a Shopify section/snippet from Figma?
│   │
│   ├── Want one command, full build end-to-end?
│   │   → /build-section <name> <figma-url>    (umbrella)
│   │
│   └── Want step-by-step control or debugging partial?
│       → /plan-feature <name> <figma-url>     (brief only)
│       → /build-ui <name>                     (liquid + tailwind)
│       → /test-ui <name>                      (ui specs + run) 
│       → /visual-qa <name>                    (qa report)
│       → /build-js <name>                     (only if brief needs JS)
│       → /test-full <name>                    (functional + integration)
│       → /review-files features/<name>/       (code review)
│
├── Non-Figma engineering work (refactor, bug fix, config)?
│   → /plan                                    (align on approach, confirm, then proceed)
│
├── Cleaning up code after implementing?
│   → /refactor-clean                          (remove dead code)
│   → /simplify                                (reduce over-engineering — via Skill tool)
│
└── Reviewing before commit?
    → /review-files [<paths>]                  (spawn code-reviewer; no args = staged + unstaged diff)
```

---

## Per-command quick reference

### Section build commands

| Command | When | Example |
|---|---|---|
| `/plan-feature` | New section, Figma link in hand, want brief first | `/plan-feature testimonials https://figma.com/design/abc/?node-id=1:42` |
| `/build-ui` | brief.md exists, ready to write liquid | `/build-ui testimonials` |
| `/test-ui` | component-structure.md exists, want DOM/responsive specs | `/test-ui testimonials` |
| `/visual-qa` | specs ran, want PASS/NEEDS_FIX report vs Figma | `/visual-qa testimonials` |
| `/build-js` | visual QA passed, brief says JS needed | `/build-js testimonials` |
| `/test-full` | component-api.md exists, want functional + integration specs | `/test-full testimonials` |
| `/review-files` | all files written, want quality review | `/review-files features/testimonials/` |
| `/build-section` | want everything chained automatically | `/build-section testimonials https://figma.com/design/abc/?node-id=1:42` |

### General workflow commands

| Command | When | Example |
|---|---|---|
| `/plan` | Any non-Figma task you want aligned before coding | `/plan migrate the webpack config to support SSR` |
| `/refactor-clean` | Just merged something, want to remove unused exports/imports | `/refactor-clean` |
| `/review-files` | Review uncommitted changes or specific files before commit | `/review-files` or `/review-files js/sections/cart-drawer.js` |

---

## `/plan` vs `/plan-feature` — don't confuse these

| Command | Scope | Mechanism | Use when |
|---|---|---|---|
| `/plan` | **Any engineering task** | Main does inline planning, asks user to confirm before code | Bug fix, refactor, config change, build system tweak, non-Figma work |
| `/plan-feature` | **Shopify section/snippet builds from Figma** | Main prefetches Figma data + spawns planner **agent** that writes `brief.md` + `test-scenarios.md` | Any time you point at a Figma node and say "build this" |

Enforcement: `.claude/rules/planner-first.md` redirects `/plan` to `/plan-feature` if a Figma URL is involved.

---

## Common real-world workflows

### "Build the whole section, I trust the pipeline"
```
/build-section testimonials https://figma.com/design/abc/?node-id=1:42
```
One command. Answers 5 intake questions. Walks the whole pipeline. Stops on any failure.

### "I want to see the brief before committing to build"
```
/plan-feature testimonials https://figma.com/design/abc/?node-id=1:42
# review brief.md + test-scenarios.md
/build-ui testimonials
/test-ui testimonials
/visual-qa testimonials
# and so on
```

### "Visual QA failed, I want to debug before re-running"
```
# After /build-section fails at visual-qa
# Inspect features/<name>/qa/visual-qa-report.md
# Manually edit sections/<name>.liquid
/test-ui <name>
/visual-qa <name>   # re-run just QA
```

### "I changed one liquid file, just re-run QA"
```
/test-ui <name>
/visual-qa <name>
```

### "I'm adding a new webpack plugin, not a section"
```
/plan add chrome-devtools MCP to the build pipeline
# align, confirm, proceed — no agent needed
```

### "I just wrote code, want review before commit"
```
/review-files                                        # all uncommitted
/review-files js/sections/cart-drawer.js             # specific files
/review-files features/cart-drawer/                  # whole feature folder
```

---

## Three shortcuts to remember

1. **Default entry for Shopify section build** → `/build-section`
2. **Default entry for non-Figma work** → `/plan`
3. **Default entry for review** → `/review-files` (no args = staged + unstaged; pass paths for specific)

Everything else is for partial runs / debugging / fine control.

---

## Prerequisites before running any build command

- `.env` has `STORE_URL`, `THEME_ID`, `STORE_PASSWORD`, `GLOBAL_PAGE_PATH`, `DEFAULT_PRODUCT_PATH`, `DEFAULT_COLLECTION_PATH`, and the `TEST_*_TEMPLATE` vars for the template types in use
- Figma Desktop running (`figma` MCP listens on `127.0.0.1:3845`)
- Dev theme synced — `yarn start` running in another terminal, or `shopify theme push` done once
- Playwright installed — `yarn playwright:install` once per machine
- Figma URL obtained via Figma's "Copy link to selection" on the exact frame/node
