---
description: Prefetch Figma data + skills + memory, spawn ui-agent to write Liquid + Tailwind + component-structure.md, then run validate_theme loop. Argument — $1 feature name.
---

# Build UI: $ARGUMENTS

You are main conversation. Execute this recipe verbatim.

## Step 1 — Parse arguments + check prerequisites
- `$1` = feature name (kebab-case)

Verify:
- `features/<feature-name>/brief.md` exists (planner has run)
- `features/<feature-name>/test-scenarios.md` exists

If either is missing, stop. Tell human: `BLOCKED: Run /plan-feature <name> <figma-url> first.`

## Step 2 — Re-read Figma references from brief.md
Parse `features/<feature-name>/brief.md` → extract Figma node IDs (desktop + mobile if present).

## Step 3 — Figma prefetch
Call for **each** node ID listed in brief:
- `figma.get_design_context(fileKey, nodeId)` → save JSON for embedding
- `figma.get_screenshot(fileKey, nodeId)` → save to `features/<feature-name>/qa/figma-<breakpoint>.png` (e.g. `figma-desktop.png`, `figma-mobile.png`)

## Step 4 — Memory + skill prefetch
Per the Main Prefetch Contract in `.claude/rules/agents.md` → ui-agent row:
- Skills: `web-design-guidelines` — invoke via Skill tool
- Memory subset: filter `MEMORY.md` `type: reference` entries tagged section/snippet architecture, Tailwind organization, Liquid best practices, responsive + a11y patterns

## Step 5 — Spawn ui-agent
Call `Agent({ subagent_type: "ui-agent", prompt: <embed everything> })`:

Embed in prompt:
- Feature name + workspace path (`features/<feature-name>/`)
- Contents of `brief.md`
- Figma design context JSON per breakpoint
- Figma screenshot paths
- Memory subset
- Skill outputs

Expected outputs:
- `sections/<name>.liquid` or `snippets/<name>.liquid` (per brief)
- `scss/sections/<name>.scss` (only if escape-hatch rules apply — default: no SCSS)
- `features/<feature-name>/component-structure.md`

## Step 6 — Validate Liquid (loop, max 3 cycles)
Per `.claude/rules/agents.md` Mandatory Liquid Validation:
1. `shopify-dev-mcp.learn_shopify_api(api: "liquid")` → get `conversationId`
2. `shopify-dev-mcp.validate_theme` with all created/updated `.liquid` files
3. If errors:
   - Re-invoke ui-agent with the errors + file paths embedded
   - Re-run validate_theme
4. Loop until clean or 3 cycles reached.
5. If still failing after 3 cycles: stop, escalate to human.

## Step 7 — Report
Confirm completion:
> "UI built at `sections/<name>.liquid`. Component structure at `features/<feature-name>/component-structure.md`. Ready for `/test-ui <feature-name>`."
