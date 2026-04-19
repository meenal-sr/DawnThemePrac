# Claude Code Setup — CrossCode Shopify Starter

Based on [everything-claude-code](https://github.com/affaan-m/everything-claude-code), refined for this Shopify JavaScript theme.

---

## Global Install (run once per machine)

Copy `.claude/` contents into `~/.claude/` so agents, commands, and rules are available globally. Then seed project memory.

> **Note:** Overwrites files with the same name in `~/.claude/`. Back up custom configs first.

```bash
# 1. Copy agents, commands, rules globally
cp -r .claude/agents/    ~/.claude/agents/
cp -r .claude/commands/  ~/.claude/commands/
cp -r .claude/rules/     ~/.claude/rules/

# 2. Seed project memory into Claude's per-project memory store
PROJECT_HASH=$(pwd | sed 's|/|-|g' | sed 's|^-||')
MEMORY_DIR="$HOME/.claude/projects/$PROJECT_HASH/memory"
mkdir -p "$MEMORY_DIR"
cp .claude/memory/*.md "$MEMORY_DIR/"
```

After install:
- Rules load automatically in every conversation
- Agents + slash commands are available in any project
- Claude auto-loads project memory at session start

---

## Environment prerequisites

- `.env` populated from `sampleenv` — `STORE_URL`, `THEME_ID`, `STORE_PASSWORD`, `GLOBAL_PAGE_PATH`, `DEFAULT_PRODUCT_PATH`, `DEFAULT_COLLECTION_PATH`, `TEST_*_TEMPLATE`
- Figma Desktop running (MCP listens on `127.0.0.1:3845`)
- Dev theme synced — `yarn start` running, or `yarn shopify:push` done once
- Playwright installed — `yarn playwright:install` once per machine

---

## Build commands

```bash
yarn start              # webpack watch (development)
yarn lint               # ESLint on js/ directory
yarn deploy             # webpack build + shopify theme push
yarn shopify:push       # Push theme to Shopify store
yarn shopify:pull       # Pull templates/*.json from Shopify
yarn playwright:test    # Run Playwright specs headless
```

---

## What gets installed — pointers (not duplicates)

This section points at the authoritative docs in `.claude/rules/`. Do not duplicate tables here — they drift.

| Concern | Source of truth |
| --- | --- |
| Which slash command to use per task | `.claude/rules/workflow-commands.md` |
| Agent orchestration + Main Prefetch Contract | `.claude/rules/agents.md` |
| Shopify-specific patterns (Tailwind, sections, MCP servers) | `.claude/rules/crosscode-instructions.md` |
| Planner-first enforcement | `.claude/rules/planner-first.md` |
| Page build checklist | `.claude/rules/page-build-checklist.md` |
| Coding style (immutability, file size, error handling) | `.claude/rules/coding-style.md` |
| Git workflow (commit format) | `.claude/rules/git-workflow.md` |
| Security (secrets, XSS, response protocol) | `.claude/rules/security.md` |
| Model selection + context budget | `.claude/rules/performance.md` |
| Caveman communication mode | `.claude/rules/caveman-mode.md` |

Agents live in `.claude/agents/`. Commands live in `.claude/commands/`. Run `ls` in those dirs for the current set.

---

## Memory

Claude auto-loads per-project memory from `~/.claude/projects/<project-hash>/memory/`. Hash = absolute project path with `/` → `-`.

The `.claude/memory/` folder in this repo is the **committed reference copy** seeded by the install step.

**Adding new memory:**
1. Write `.md` file in `.claude/memory/` with frontmatter:
   ```markdown
   ---
   name: Short name
   description: One-line description
   type: reference | project | user | feedback
   ---
   ```
2. Add a pointer line to `.claude/memory/MEMORY.md`
3. Re-run the seed step to sync into the global memory folder
