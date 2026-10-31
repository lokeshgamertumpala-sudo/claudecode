#!/usr/bin/env bash
# Long-Form Video High-Capacity Renderer (Up to 1 Hour) for macOS & Linux
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/motion-studio"

COMP_ID="${1:-HourLongPreview}"
OUT_FILE="${2:-}"
FRAME_RANGE="${3:-}"

# Normalize aliases
COMP_ID_LOWER=$(echo "$COMP_ID" | tr '[:upper:]' '[:lower:]')
case "$COMP_ID_LOWER" in
    hour|one-hour|1-hour|hourlong|hourlongvideo|hour-long-video) COMP_ID="HourLongVideo" ;;
    hour-preview|preview|hourlongpreview) COMP_ID="HourLongPreview" ;;
    openclaudex|open-claudex|claudex) COMP_ID="OpenClaudeX" ;;
    beyondearth|beyond-earth|space) COMP_ID="BeyondEarth" ;;
esac

if [ -z "$OUT_FILE" ]; then
    OUT_FILE="out/${COMP_ID}.mp4"
fi
OUT_FILE="${OUT_FILE#motion-studio/}"
mkdir -p "out"

echo -e "\033[96m====================================================\033[0m"
echo -e "\033[96m   LONG-FORM REMOTION RENDER PIPELINE (UP TO 1 HR)  \033[0m"
echo -e "\033[96m   Composition: ${COMP_ID}                          \033[0m"
echo -e "\033[96m   Output: motion-studio/${OUT_FILE}                \033[0m"
echo -e "\033[96m====================================================\033[0m"

echo -e "\033[90m[*] Pre-checking TypeScript integrity...\033[0m"
npx tsc --noEmit

# Determine GPU flag
GL_FLAG="--gl=angle"
if [[ "$OSTYPE" == "darwin"* ]]; then
    GL_FLAG=""
fi

EXTRA_FLAGS=""
if [ -n "$FRAME_RANGE" ]; then
    EXTRA_FLAGS="$FRAME_RANGE"
fi

echo -e "\033[92m[*] Starting uninterrupted long-form render stream...\033[0m"
npx remotion render src/index.ts "$COMP_ID" "$OUT_FILE" --concurrency=8 $GL_FLAG --bundle-cache --pixel-format=yuv420p $EXTRA_FLAGS

echo -e "\033[92m[SUCCESS] Long-form video rendered to: motion-studio/${OUT_FILE}\033[0m"
