---
description: Single-phase ui-agent run. Reads brief.md (frozen plan from planner), writes Liquid files + test-scenarios.md (selectors + deviations + JS handoff stub + A/B/C/D/E scenarios). Does NOT modify brief.md. Main validates Liquid. Argument — $1 feature name.
---

# Build UI: $ARGUMENTS

You are main conversation. Execute this recipe verbatim.

## Step 1 — Parse arguments + check prerequisites
- `$1` = feature name (kebab-case)

Verify prerequisite artifacts:
- `features/<feature-name>/brief.md` (planner's upfront doc — intent + `## Design tokens` + `## Copy` + schema + file plan + reuse scan + a11y + JS decision)
- `features/<feature-name>/qa/figma-*.png` (visual reference)

If ANY missing: `BLOCKED: Run /plan-feature <name> <figma-url> first.`

## Step 2 — Memory + skill prefetch
Per the Main Prefetch Contract in `.claude/rules/agents.md` → ui-agent row:
- Skill: `web-design-guidelines`
- Memory: filter `MEMORY.md` + `.claude/memory/reference_*.md` entries tagged Tailwind organization, Liquid best practices, responsive + a11y patterns, image stack

## Step 3 — Spawn ui-agent (single phase)
Call `Agent({ subagent_type: "ui-agent", prompt: <embed> })`.

Embed (stable-first per cache-friendly rule):

**STABLE PREFIX:**
1. Skill output (`web-design-guidelines`)
2. Memory subset + full reference docs in scope

**SEMI-STABLE:**
3. Feature name + workspace path
4. Full contents of `brief.md` (planner's upfront sections — intent + `## Design tokens` + `## Copy` + schema + file plan + reuse scan + a11y + JS decision)
5. Pointer: "`brief.md` is the sole design SOT — §Design tokens has every typography/color/spacing value, §Copy has every verbatim string. Read `features/<feature-name>/qa/figma-*.png` for visual reference. Scan any reused snippets cited in brief §File plan → REUSE rows to verify call signatures."

**DYNAMIC:**
6. Fix-cycle errors from `shopify-dev-mcp.validate_theme` (if re-invoked after validation failure)

Expected outputs per brief §File plan → CREATE rows:
- `sections/<name>.liquid`
- `snippets/<name>-<variant>.liquid` (one per variant — dual-DOM typically means `-desktop` + `-mobile` per card)
- `scss/sections/<name>.scss` — ONLY if ui-agent's SCSS decision = YES (default is NO; inline `<style>` scoped to `#shopify-section-{{ section.id }}` is the escape hatch)
- `features/<feature-name>/test-scenarios.md` — self-contained build-execution doc: Section under test + Required template content + Selector catalogue + Block fixture data + Design tokens + A/B/C/D/E scenarios + Accessibility mode + Design content reference + DEVIATIONS + JS handoff (stub if brief §JavaScript=YES, full content if NO)

ui-agent does NOT modify `brief.md` — it stays frozen as planner's upfront plan.

If ui-agent returns with blocking ambiguity (surfaced in return message), resolve with human conversationally, then re-invoke.

## Step 4 — Validate Liquid (loop, max 3 cycles)
Per `.claude/rules/agents.md` Mandatory Liquid Validation:
1. `shopify-dev-mcp.learn_shopify_api(api: "liquid")` → get `conversationId`
2. `shopify-dev-mcp.validate_theme` with all created/updated `.liquid` files
3. If errors:
   - Re-invoke ui-agent with errors + file paths embedded as DYNAMIC input
   - Re-run validate_theme
4. Loop until clean or 3 cycles. Escalate to human if still failing after 3.

## Step 5 — Report
> "UI built. Liquid at `sections/<name>.liquid` + <N> snippets. test-scenarios.md written. Ready for `/test-ui <feature-name>`."
