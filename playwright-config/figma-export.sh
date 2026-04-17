#!/usr/bin/env bash
# Export a Figma node as PNG via the Figma REST API.
# Usage:  scripts/figma-export.sh <fileKey> <nodeId> <outputPath> [scale]
#   <fileKey>      e.g. g3gxO3mhrniJOYTHNmotAu (from figma.com/design/<fileKey>/...)
#   <nodeId>       e.g. 5654:4196 (convert "-" to ":" when copied from URL)
#   <outputPath>   destination PNG, e.g. features/hero-banner/qa/figma-desktop.png
#   [scale]        optional, default 2  (1=exact, 2=retina, 4=print)
# Requires FIGMA_TOKEN in .env (or exported in the environment).

set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <fileKey> <nodeId> <outputPath> [scale]" >&2
  exit 2
fi

FILE_KEY="$1"
NODE_ID="$2"
OUT_PATH="$3"
SCALE="${4:-2}"

if [[ -z "${FIGMA_TOKEN:-}" && -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [[ -z "${FIGMA_TOKEN:-}" ]]; then
  echo "ERR: FIGMA_TOKEN not set. Add it to .env or export it." >&2
  exit 3
fi

mkdir -p "$(dirname "$OUT_PATH")"

RESP=$(curl -sS -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/${FILE_KEY}?ids=${NODE_ID}&format=png&scale=${SCALE}")

IMG_URL=$(printf '%s' "$RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
u = (d.get('images') or {}).get('$NODE_ID')
err = d.get('err') or d.get('error')
print(u or ('' if not err else f'ERR:{err}'))
")

if [[ "$IMG_URL" == ERR:* ]]; then
  echo "Figma REST error: ${IMG_URL#ERR:}" >&2
  exit 4
fi

if [[ -z "$IMG_URL" ]]; then
  echo "No image URL returned. Response: $RESP" >&2
  exit 5
fi

curl -sSL "$IMG_URL" -o "$OUT_PATH"

if [[ ! -s "$OUT_PATH" ]]; then
  echo "Download wrote empty file: $OUT_PATH" >&2
  exit 6
fi

echo "Saved: $OUT_PATH ($(wc -c < "$OUT_PATH" | tr -d ' ') bytes, scale=${SCALE})"
