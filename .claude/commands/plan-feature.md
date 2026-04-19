---
description: Prefetch Figma data + skill output + memory subset, spawn planner agent to produce brief.md, then spawn architect agent to produce architecture.md. Arguments — $1 feature name (kebab-case), $2 desktop Figma URL, $3 mobile Figma URL (optional).
---

# Plan Feature: $ARGUMENTS

You are main conversation. Execute this recipe verbatim — do not skip steps.

## Step 1 — Parse arguments
- `$1` = feature name (kebab-case, e.g. `hero-banner`)
- `$2` = desktop Figma URL (format: `figma.com/design/<fileKey>/<fileName>?node-id=<nodeId>`)
- `$3` = mobile Figma URL (optional — same format). If omitted, ask the human before proceeding whether a mobile frame exists. Responsive behavior from a single desktop node is a last resort — always prefer explicit mobile nodes.

Extract per URL:
- `fileKey` from URL
- `nodeId` from URL (convert `-` to `:` in nodeId)

If `$1` or `$2` is missing, stop and ask the human for the missing value.

**Build convention (bake into planner + ui-agent prompts): mobile-first Tailwind.** Base utility classes target mobile; desktop styling applied via breakpoint-prefixed overrides (`md-small:`, `md:`, `lg:`, `2xl:`). When desktop + mobile diverge too heavily for overrides (layout flips, element order swaps, structurally distinct content), author two DOM branches toggled via `hidden md:block` / `md:hidden`, documented in ui-plan.md Phase 2 DEVIATIONS.

## Step 2 — Gather human context (batch, one message)
Ask the human in a single message using `AskUserQuestion`:
1. Template type: `page` | `product` | `collection`
2. Data sources (product, collection, metafields, section settings only?)
3. Render context (section in editor, snippet, or block?)
4. Purpose — why build this?
5. Reuse — existing components to reuse?
6. If `$3` (mobile URL) was NOT supplied: ask for it, OR confirm the desktop node's responsive behavior covers mobile. Default expectation = mobile frame exists.

Wait for answers before proceeding.

## Step 3 — Figma prefetch + write figma-context.md (single source of truth)

Create the feature directory first: `mkdir -p features/<feature-name>/qa`

For EVERY distinct breakpoint / variant node the human provided (desktop, mobile, tablet if any), call:
- `figma.get_design_context(fileKey, nodeId)` → returns layout hints + typography + colors + copy
- `figma.get_variable_defs(fileKey, nodeId)` → returns Figma variable tokens

(No `figma.get_screenshot` MCP call — the PNG script below handles persistence.)

Write `features/<feature-name>/figma-context.md` — this is the **canonical design reference** that every downstream agent reads. Capture VALUES (what the design says), NOT structure prescriptions (how to build it). Must contain, per breakpoint:
- Source URL + node ID
- Typography per text layer (font family, weight, size, line-height, letter-spacing, color)
- Colors (section bg, surface bg, text, border, overlay, button bg/label)
- Spacing / sizing values (section padding, card dimensions, internal gaps, image dimensions, border radius)
- Copy strings (exact text from Figma — ground truth for test-agent)
- Figma tokens (from `get_variable_defs` — e.g. `radius/xl: 12`)
- Cross-breakpoint delta notes — what VISUALLY changes between desktop and mobile (typography sizes, colors, element appearance/disappearance, layout mode flips). Do NOT describe DOM nesting or layer hierarchy — ui-agent decides structure independently.

This file is the SINGLE SOURCE OF TRUTH for design data. `brief.md`, `ui-plan.md`, `test-scenarios.md`, and visual-qa reports REFERENCE it by path + node ID — they do NOT duplicate its contents.

**Crucially: `figma-context.md` does NOT prescribe HTML/DOM structure.** Figma's layer tree is a design-tool artifact (absolute-positioned groups, deeply-nested frames, duplicated wrappers). Ui-agent is free to restructure — it targets the visual outcome + the project's layout rules (flex+gap for inner stacks, grid at top level, content-over-image absolute/relative pattern, semantic HTML, BEM naming), not Figma's node tree.

If the designer updates Figma, regenerate only `figma-context.md` — downstream artifacts stay valid.

Then persist reference PNGs to disk via the MCP script (talks to the local Figma Desktop MCP server). Pass `--width` per breakpoint to match Playwright viewport widths so pixelmatch dims align without manual post-processing:
```bash
node pixelmatch-config/figma-mcp-screenshot.js <desktopNodeId> features/<feature-name>/qa/figma-desktop.png --width 1440
# Only if $3 mobile URL supplied — otherwise skip:
node pixelmatch-config/figma-mcp-screenshot.js <mobileNodeId>  features/<feature-name>/qa/figma-mobile.png  --width 390
```
`--width` values mirror the project's Playwright `desktop` viewport (1440) and `mobile` viewport (390) — so figma and live PNGs share width dims out of the box. The script uses macOS `sips` to resample post-export (aspect preserved).

Requires Figma Desktop running with the Dev Mode MCP server enabled (default `http://127.0.0.1:3845/mcp`). Override the endpoint with `FIGMA_MCP_URL` env var if needed. No Figma token required.

If both desktop + mobile PNGs exist, the build is dual-breakpoint (mobile-first Tailwind base + desktop overrides). If only desktop exists, document in brief.md that responsive behavior is inferred and visual-qa will compare desktop only.

## Step 4 — Memory + skill prefetch
Per the Main Prefetch Contract in `.claude/rules/agents.md` → planner row:
- Skill: `plan` — invoke via Skill tool
- Memory subset: filter `MEMORY.md` `type: reference` entries tagged Shopify section/snippet architecture, JS component patterns, Tailwind organization, a11y patterns

## Step 5 — Spawn planner agent
Call `Agent({ subagent_type: "planner", prompt: <embed> })`.

Embed in prompt (stable-first ordering per cache-friendly rule in `.claude/rules/agents.md`):

**STABLE PREFIX (cacheable):**
1. Skill output (`plan`)
2. Memory subset (Shopify section/snippet architecture, JS component patterns, Tailwind organization, a11y patterns)

**SEMI-STABLE (per-feature):**
3. Feature name
4. Instruction: "Read `features/<feature-name>/figma-context.md` for full design data + `features/<feature-name>/qa/figma-*.png` for visual reference. Do NOT duplicate context-file contents in brief.md; reference it by path + node IDs."

**DYNAMIC (this invocation only):**
6. Template type + human answers from Step 2

Expected output: `features/<feature-name>/brief.md` ONLY. Planner does NOT write `test-scenarios.md` or touch `templates/*.test.json` — test-agent handles those after ui-agent finishes.

## Step 6 — Spawn architect agent
Architect is now mandatory on every build — owns the codebase scan and file plan that previously lived in the brief.

Per the Main Prefetch Contract in `.claude/rules/agents.md` → architect row:
- Skills: `plan` — invoke via Skill tool
- Memory subset: filter `MEMORY.md` `type: reference` entries tagged Shopify architecture, proven theme patterns, shared-snippet conventions

Call `Agent({ subagent_type: "architect", prompt: <embed> })`.

Embed in prompt (stable-first ordering per cache-friendly rule in `.claude/rules/agents.md`):

**STABLE PREFIX (cacheable):**
1. Skill output (`plan`)
2. Memory subset (Shopify architecture, proven theme patterns, shared-snippet conventions)

**SEMI-STABLE (per-feature):**
3. Feature name + workspace path (`features/<feature-name>/`)
4. Full contents of `brief.md` (planner just wrote it)

**DYNAMIC (this invocation only):**
5. (Architect usually has none — runs once per feature)

Expected output: `features/<feature-name>/architecture.md` with the file plan (create vs reuse) + reuse precedence notes + cross-section contracts (if any).

If the architect returns open questions, resolve them with the human before proceeding.

## Step 7 — Report
Confirm completion to the human:
> "Brief at `features/<feature-name>/brief.md`. Architecture at `features/<feature-name>/architecture.md`. Ready for `/build-ui <feature-name>`. Test scenarios will be authored by test-agent during `/test-ui`."
