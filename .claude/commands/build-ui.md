---
description: Two-phase ui-agent run on a single consolidated ui-plan.md. Phase 1 writes Intent sections + Questions; main gates on Questions; Phase 2 writes Liquid + optional SCSS + appends As-built + selector catalogue + state contract + JS handoff stub to the same ui-plan.md; main validates Liquid. Argument — $1 feature name.
---

# Build UI: $ARGUMENTS

You are main conversation. Execute this recipe verbatim.

## Step 1 — Parse arguments + check prerequisites
- `$1` = feature name (kebab-case)

Verify both prerequisite artifacts exist:
- `features/<feature-name>/brief.md` (planner)
- `features/<feature-name>/architecture.md` (architect)

Note: `test-scenarios.md` is authored by test-agent AFTER ui-agent finishes — not a prerequisite here.

If ANY is missing, stop. Tell human: `BLOCKED: Run /plan-feature <name> <figma-url> first — it chains planner + architect.`

## Step 2 — Verify prefetch artifacts exist
`/plan-feature` prefetch should have already written:
- `features/<feature-name>/figma-context.md` — canonical Figma extract (ui-agent reads this for tokens + breakpoint deltas)
- `features/<feature-name>/qa/figma-*.png` — one per breakpoint (visual-qa reference)

Verify both exist. If either is missing, halt with `BLOCKED: prefetch artifacts missing — re-run /plan-feature <name> <figma-url>`. Do NOT re-fetch Figma here; that's prefetch's job during `/plan-feature`.

## Step 3 — (No Figma fetch)
Ui-agent reads `figma-context.md` + `qa/figma-*.png` directly. Main does not re-fetch from Figma MCP during `/build-ui`.

## Step 4 — Memory + skill prefetch
Per the Main Prefetch Contract in `.claude/rules/agents.md` → ui-agent rows:
- Skills: `web-design-guidelines` — invoke via Skill tool
- Memory subset: filter `MEMORY.md` `type: reference` entries tagged Tailwind organization, Liquid best practices, responsive + a11y patterns

## Step 5 — Spawn ui-agent Phase 1 (plan)

Call `Agent({ subagent_type: "ui-agent", prompt: <embed everything below with PHASE=1 directive> })`:

Embed in prompt (stable-first ordering per cache-friendly rule in `.claude/rules/agents.md`):

**STABLE PREFIX (cacheable):**
1. Mode directive: `PHASE=1 (plan only — no Liquid yet)`
2. Skill output (`web-design-guidelines`)
3. Memory subset (Tailwind organization, Liquid best practices, responsive + a11y patterns)

**SEMI-STABLE (per-feature):**
4. Feature name + workspace path (`features/<feature-name>/`)
5. Full contents of `brief.md`
6. Full contents of `architecture.md`
7. Pointer: "Read `features/<feature-name>/figma-context.md` and `features/<feature-name>/qa/figma-*.png` directly — single source of truth for all Figma values."

**DYNAMIC (this invocation only):**
8. (Phase 1: none — no prior cycle data)

Expected output: `features/<feature-name>/ui-plan.md` only.

The agent must NOT write any `.liquid` or `.scss` files in this phase.

## Step 6 — Gate on ui-plan.md Questions

Read `features/<feature-name>/ui-plan.md`. Inspect the `## Questions` section:

- **No questions** → proceed to Step 7.
- **Questions present** → surface them to the human. Wait for answers. If answers invalidate anything in `architecture.md` (e.g. a new file is needed), re-invoke architect with the resolution before proceeding. Otherwise, proceed to Step 7 and embed the answers in the Phase 2 prompt.

## Step 7 — Spawn ui-agent Phase 2 (code)

Call `Agent({ subagent_type: "ui-agent", prompt: <embed everything below with PHASE=2 directive> })`:

Embed in prompt (stable-first ordering per cache-friendly rule in `.claude/rules/agents.md`):

**STABLE PREFIX (cacheable):**
1. Mode directive: `PHASE=2 (execute ui-plan.md)`
2. Memory subset (Liquid best practices, section/snippet architecture)
   - (No skill output in Phase 2 — Figma + architecture.md already embedded per prefetch contract)

**SEMI-STABLE (per-feature):**
3. Feature name + workspace path
4. Full contents of `brief.md`
5. Full contents of `architecture.md`
6. Full contents of `ui-plan.md`
7. Pointer: "Read `features/<feature-name>/figma-context.md` and `features/<feature-name>/qa/figma-*.png` directly — single source of truth for all Figma values."

**DYNAMIC (this invocation only):**
8. Answers from Step 6 gate (if any)
9. Fix-cycle mismatches from `qa/visual-qa-report.md` (if re-invoked after NEEDS_FIX)
- Memory subset + skill outputs

Expected outputs (per `architecture.md` → Create + `ui-plan.md` → File targets):
- `sections/<name>.liquid` and/or `snippets/<filename>.liquid` (one per file listed)
- `scss/sections/<name>.scss` (only if `ui-plan.md` Phase 1 declared SCSS: YES)
- `features/<feature-name>/ui-plan.md` — Phase 2 sections appended in place (As-built DOM + BEM/selector catalogue + Data attributes + Schema settings + CSS custom properties + Variants implemented/not + DEVIATIONS + `## JS handoff` stub)

## Step 8 — Validate Liquid (loop, max 3 cycles)
Per `.claude/rules/agents.md` Mandatory Liquid Validation:
1. `shopify-dev-mcp.learn_shopify_api(api: "liquid")` → get `conversationId`
2. `shopify-dev-mcp.validate_theme` with all created/updated `.liquid` files
3. If errors:
   - Re-invoke ui-agent Phase 2 with the errors + file paths embedded
   - Re-run validate_theme
4. Loop until clean or 3 cycles reached.
5. If still failing after 3 cycles: stop, escalate to human.

## Step 9 — Report
Confirm completion:
> "UI built per Phase 1 + Phase 2 of ui-plan.md. Liquid at `sections/<name>.liquid` + snippets. Ready for `/test-ui <feature-name>`."
