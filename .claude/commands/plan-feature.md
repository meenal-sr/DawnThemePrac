---
description: Prefetch Figma data + skill output + memory subset, then spawn planner agent to produce brief.md and test-scenarios.md. Arguments — $1 feature name (kebab-case), $2 Figma URL.
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
Call in parallel:
- `figma.get_design_context(fileKey, nodeId)` → save JSON for embedding
- `figma.get_screenshot(fileKey, nodeId)` → save to `features/<feature-name>/qa/figma-default.png`

Create the feature directory if it doesn't exist: `mkdir -p features/<feature-name>/qa`

## Step 4 — Memory + skill prefetch
Per the Main Prefetch Contract in `.claude/rules/agents.md` → planner row:
- Skill: `plan` — invoke via Skill tool
- Memory subset: filter `MEMORY.md` `type: reference` entries tagged Shopify section/snippet architecture, JS component patterns, Tailwind organization, a11y patterns

## Step 5 — Spawn planner agent
Call `Agent({ subagent_type: "planner", prompt: <embed everything below> })`:

Embed in the prompt:
- Feature name
- Template type + human answers from Step 2
- Figma design context JSON (from Step 3)
- Figma screenshot path
- Memory subset (from Step 4)
- Skill output (from Step 4)

Expected output: `features/<feature-name>/brief.md` + `features/<feature-name>/test-scenarios.md`. Section added to the correct test template.

## Step 6 — Report
Confirm completion to the human:
> "Brief ready at `features/<feature-name>/brief.md`. Test scenarios at `features/<feature-name>/test-scenarios.md`. Ready for `/build-ui <feature-name>`."
