# Theme Push — Hard Rule (Do Not Run)

Never run any of:
- `yarn deploy`
- `yarn shopify:push`
- `shopify theme push`
- Any wrapper or alias that triggers a theme push

## Why
Theme push is handled by **`yarn start`** (webpack watch) in a separate terminal. That process auto-syncs changes to the dev store. A parallel push from Claude:
- Races with the watcher and can overwrite in-flight work
- Risks pushing unbuilt webpack artifacts
- Wastes an API call and can trip Shopify's rate limits

## How to apply
- Edit section/snippet/JS/SCSS files; wait for the terminal running `yarn start` to emit `synced`
- If the watcher isn't running, ask the user to start it — do NOT run push yourself
- Template-only changes (`templates/*.test.json`): still pushed by the watcher; do not bypass
- Allowed: `yarn shopify:pull` (read-only, pulls templates from Shopify)

## Enforcement
- `.claude/settings.json` `permissions.deny` blocks `yarn deploy`, `yarn shopify:push`, `shopify theme push`
- PreToolUse Bash hook in `.claude/settings.json` prints BLOCKED + exit 2 on any matching command
- If a workflow/command file instructs a push, treat that step as a no-op and rely on the watcher
