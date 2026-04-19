---
description: Prefetch Figma data + skill output + memory subset, spawn planner agent to produce brief.md, then spawn architect agent to produce architecture.md. Arguments — $1 feature name (kebab-case), $2 Figma URL.
---

# Plan Feature: $ARGUMENTS

You are main conversation. Execute this recipe verbatim — do not skip steps.

## Step 1 — Parse arguments
- `$1` = feature name (kebab-case, e.g. `hero-banner`)
- `$2` = Figma URL (format: `figma.com/design/<fileKey>/<fileName>?node-id=<nodeId>`)

Extract:
- `fileKey` from URL
- `nodeId` from URL (convert `-` to `:` in nodeId)

If either argument is missing, stop and ask the human for the missing value.

## Step 2 — Gather human context (batch, one message)
Ask the human in a single message:
1. Template type: `page` | `product` | `collection`
2. Data sources (product, collection, metafields, section settings only?)
3. Render context (section in editor, snippet, or block?)
4. Purpose — why build this?
5. Reuse — existing components to reuse?

Wait for answers before proceeding.

## Step 3 — Figma prefetch
Create the feature directory first: `mkdir -p features/<feature-name>/qa`

Call:
- `figma.get_design_context(fileKey, nodeId)` → save JSON for embedding
- `figma.get_screenshot(fileKey, nodeId)` → keep the inline image for visual reference

Then persist the reference PNG to disk via the REST-API helper (MCP `get_screenshot` does NOT write a file):
```bash
playwright-config/figma-export.sh <fileKey> <nodeId> features/<feature-name>/qa/figma-default.png 2
```
Requires `FIGMA_TOKEN` in `.env`. See `reference_figma_export_script.md` in memory for usage notes.

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
4. Figma design context JSON (from Step 3)
5. Figma screenshot path

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
