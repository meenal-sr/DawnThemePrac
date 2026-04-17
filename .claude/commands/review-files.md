---
description: Prefetch diagnostics + PR context, spawn code-reviewer on the specified files. Argument — $1 file paths (space-separated) or feature folder. No argument = staged + unstaged changes.
---

# Review Files: $ARGUMENTS

You are main conversation. Execute verbatim.

## Step 1 — Parse arguments
- `$1` = space-separated file paths, OR a feature folder like `features/<name>/`, OR empty

If `$1` is empty → default to `git diff --name-only HEAD` (staged + unstaged changes).
If `$1` is a folder → expand via `git ls-files $1` or `find $1 -type f`.
Otherwise → treat as explicit file paths.

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
Call `Agent({ subagent_type: "code-reviewer", prompt: <embed> })`:

Embed:
- Files to review (paths)
- Diagnostics output per file
- PR context if applicable
- Skill outputs
- Memory subset

Expected output: structured review with CRITICAL/HIGH/MEDIUM/LOW findings + verdict.

## Step 5 — Report
Surface the verdict to human:
- `Approve` → commit allowed
- `Warning` → HIGH issues; resolve before merge
- `Block` → CRITICAL issues; must fix before merge
