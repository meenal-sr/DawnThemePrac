---
description: Prefetch diagnostics + PR context, spawn code-reviewer on the specified files. Argument — $1 file paths (space-separated) or feature folder. No argument = staged + unstaged changes.
---

# Review Files: $ARGUMENTS

You are main conversation. Execute verbatim.

## Step 1 — Parse arguments
- `$1` = space-separated file paths, OR a feature folder like `features/<name>/`, OR empty

If `$1` is empty → default to `git diff --name-only HEAD`, then FILTER to SOURCE files only (see Source-only filter below).
If `$1` is a feature folder (`features/<name>/`) → DO NOT expand to every file. Instead, read `features/<name>/ui-plan.md` and extract the "File targets" listed under the Phase 2 as-built section — those are the SOURCE files to review (section `.liquid`, optional `.js/.jsx`, optional `.scss`). Never review files inside `features/<name>/` itself (those are planning + test docs, out of scope).
Otherwise → treat `$1` as explicit file paths. Still apply the Source-only filter.

### Source-only filter
Only send these paths to code-reviewer:
- `sections/**/*.liquid`, `snippets/**/*.liquid`, `blocks/**/*.liquid`
- `js/sections/**/*.{js,jsx}`, `js/components/**/*.{js,jsx}`
- `scss/sections/**/*.scss`, `scss/components/**/*.scss`
- `templates/**/*.liquid` (NOT `*.test.json` — those are test fixtures)
- `tailwind.config.js`, `webpack.config.js`, `playwright.config.js` (only when changed)

Reject (do NOT send):
- `features/**/*.md` (briefs, architecture, ui-plan, test-scenarios, visual-qa-report)
- `features/**/*.spec.js` (Playwright specs — test-agent's territory)
- `features/**/qa/**` (test artifacts)
- `templates/*.test.json` (test fixtures)
- `.claude/**/*` (agent/command specs)

If the filter leaves no reviewable paths, report "No source files in scope — review skipped" and stop. Do not invent work.

## Step 2 — Diagnostics + PR prefetch
- `ide.getDiagnostics` on each file being reviewed
- If current branch has an open PR (check `gh pr view --json number`), fetch:
  - `github.get_pull_request` → PR body + metadata
  - `github.get_pull_request_comments` → existing review comments
  - `github.list_commits` → commit history since branch diverged from main

## Step 3 — Skill + memory prefetch
Per Main Prefetch Contract → code-reviewer row:
- Skills:
  - `modern-javascript-patterns` if reviewing `.js`/`.jsx`
  - `vercel-react-best-practices` only if files use React (`.jsx` with JSX/hooks)
  - `web-design-guidelines` if reviewing `.liquid`/`.scss`
- Memory subset: JS patterns, Shopify architecture, Tailwind organization, Playwright structure

## Step 4 — Spawn code-reviewer
Call `Agent({ subagent_type: "code-reviewer", prompt: <embed> })`.

Embed in prompt (stable-first ordering per cache-friendly rule in `.claude/rules/agents.md`):

**STABLE PREFIX (cacheable):**
1. Skill outputs (`modern-javascript-patterns`, `vercel-react-best-practices` gated, `web-design-guidelines`)
2. Memory subset (JS patterns, Shopify architecture, Tailwind organization, Playwright structure)

**SEMI-STABLE (per-session):**
3. PR context if applicable (body, metadata, prior review comments)

**DYNAMIC (this invocation only):**
4. Files to review (paths)
5. Diagnostics output per file
6. Commit history since divergence from main (for PR reviews)

Expected output: structured review with CRITICAL/HIGH/MEDIUM/LOW findings + verdict.

## Step 5 — Report
Surface the verdict to human:
- `Approve` → commit allowed
- `Warning` → HIGH issues; resolve before merge
- `Block` → CRITICAL issues; must fix before merge
