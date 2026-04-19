---
description: Prefetch Figma data + skill output + memory subset, spawn planner agent to produce brief.md (with file plan + reuse scan absorbed). Arguments — $1 feature name (kebab-case), $2 desktop Figma URL, $3 mobile Figma URL (optional).
---

# Plan Feature: $ARGUMENTS

You are main conversation. Execute this recipe verbatim — do not skip steps.

## Step 1 — Parse arguments
- `$1` = feature name (kebab-case, e.g. `hero-banner`)
- `$2` = desktop Figma URL (format: `figma.com/design/<fileKey>/<fileName>?node-id=<nodeId>`)
- `$3` = mobile Figma URL (optional — same format). If omitted, ask the human before proceeding whether a mobile frame exists.

Extract per URL:
- `fileKey` from URL
- `nodeId` from URL (convert `-` to `:`)

If `$1` or `$2` is missing, stop and ask.

**Build convention (bake into planner + ui-agent prompts): mobile-first Tailwind.** Base utility classes target mobile; desktop styling via `md-small:` / `md:` / `lg:` / `2xl:` prefix overrides. When desktop + mobile diverge too heavily for overrides, author dual-DOM branches toggled via `hidden md:block` / `md:hidden`, documented in brief §DEVIATIONS by ui-agent.

## Step 2 — Gather human context (batch, one message)
Ask the human via `AskUserQuestion`:
1. Template type: `page` | `product` | `collection`
2. Data sources (product, collection, metafields, section settings only?)
3. Render context (section in editor, snippet, or block?)
4. Purpose — why build this?
5. Reuse — existing components to reuse?
6. If `$3` (mobile URL) was NOT supplied: ask for it OR confirm the desktop node's responsive behavior covers mobile.

Wait for answers before proceeding.

## Step 3 — Figma prefetch + write figma-context.md

Create feature directory: `mkdir -p features/<feature-name>/qa`

For each breakpoint/variant node:
- `figma.get_design_context(fileKey, nodeId)` → layout + typography + colors + copy
- `figma.get_variable_defs(fileKey, nodeId)` → Figma variable tokens

Write `features/<feature-name>/figma-context.md` — canonical design reference. Capture VALUES per breakpoint (typography, colors, spacing, copy strings, tokens, cross-breakpoint delta). Do NOT prescribe DOM structure — ui-agent decides.

Persist reference PNGs via the MCP script at the project's Playwright viewport widths:
```bash
node pixelmatch-config/figma-mcp-screenshot.js <desktopNodeId> features/<feature-name>/qa/figma-desktop.png --width 1440
# Only if $3 mobile URL supplied:
node pixelmatch-config/figma-mcp-screenshot.js <mobileNodeId>  features/<feature-name>/qa/figma-mobile.png  --width 390
```

If both PNGs exist → dual-breakpoint build. If only desktop, responsive inferred from single node — document in brief.

## Step 4 — Memory + skill prefetch
Per the Main Prefetch Contract in `.claude/rules/agents.md` → planner row:
- Skill: `plan` — invoke via Skill tool
- Memory: filter `MEMORY.md` + `.claude/memory/reference_*.md` entries tagged Shopify section/snippet architecture, Tailwind organization, a11y patterns, image stack, shared-snippet conventions

## Step 5 — Spawn planner agent
Call `Agent({ subagent_type: "planner", prompt: <embed> })`.

Embed (stable-first ordering per cache-friendly rule):

**STABLE PREFIX:**
1. Skill output (`plan`)
2. Memory subset + full `.claude/memory/reference_*.md` contents for any doc in scope

**SEMI-STABLE:**
3. Feature name + workspace path
4. Instruction: "Read `features/<feature-name>/figma-context.md` for full design data. Scan codebase for reuse candidates (snippets/, sections/, js/components/, tailwind.config.js, reference docs). Write a single `brief.md` covering intent + schema + **file plan** + **reuse scan** + variants + a11y + JS decision."

**DYNAMIC:**
5. Template type + human answers from Step 2

Expected output: `features/<feature-name>/brief.md` ONLY. Planner now owns the file plan + reuse scan (previously architect's role — architect has been removed from the flow).

## Step 6 — Report
> "Brief at `features/<feature-name>/brief.md`. Ready for `/build-ui <feature-name>`."
