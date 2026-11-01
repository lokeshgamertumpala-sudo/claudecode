#!/usr/bin/env bash
# High-Speed Remotion 60FPS Video Renderer (macOS / Linux / POSIX)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STUDIO_DIR="$SCRIPT_DIR/motion-studio"
cd "$STUDIO_DIR"

COMP_ID="${1:-}"
OUT_FILE="${2:-}"

if [ -z "$COMP_ID" ]; then
    echo "[!] Missing composition ID."
    echo "Usage: ./render-motion.sh [CompositionId] [OutputFile]"
    echo "Example: ./render-motion.sh VersatileShowcase out/versatile.mp4"
    echo "Example: ./render-motion.sh MinimalMotion out/minimal-motion.mp4"
    exit 1
fi

# Normalize aliases
COMP_ID_LOWER=$(echo "$COMP_ID" | tr '[:upper:]' '[:lower:]')
case "$COMP_ID_LOWER" in
    versatile|showcase|versatileshowcase|versatile-showcase) COMP_ID="VersatileShowcase" ;;
    minimal|minimalmotion|minimal-motion) COMP_ID="MinimalMotion" ;;
    earth|earthrotation|earth-rotation) COMP_ID="EarthRotation" ;;
    goodmorning|good-morning) COMP_ID="GoodMorning" ;;
    goodevening|good-evening) COMP_ID="GoodEvening" ;;
    higreeting|hi-greeting) COMP_ID="HiGreeting" ;;
    cyberpunkhud|cyberpunk-hud) COMP_ID="CyberpunkHUD" ;;
    neonportal|neon-portal) COMP_ID="NeonPortal" ;;
    particlevortex|particle-vortex) COMP_ID="ParticleVortex" ;;
    logoreveal|logo-reveal) COMP_ID="LogoReveal" ;;
    verticalreel|vertical-reel) COMP_ID="VerticalReel" ;;
    kinetictypography|kinetic-typography) COMP_ID="KineticTypography" ;;
    beyondearth|beyond-earth|space) COMP_ID="BeyondEarth" ;;
    openclaudex|open-claudex|claudex) COMP_ID="OpenClaudeX" ;;
    hourlongvideo|hour-long-video|one-hour|onehour) COMP_ID="HourLongVideo" ;;
    hourlongpreview|hour-long-preview|hour-preview) COMP_ID="HourLongPreview" ;;
    aiexplainer|ai-explainer|ai|neuralnetwork|aineuralnetwork|explainer) COMP_ID="AiExplainer" ;;
    itisai|it-is-ai) COMP_ID="ItIsAi" ;;
esac

if [ -z "$OUT_FILE" ]; then
    OUT_FILE="out/${COMP_ID}.mp4"
fi

# Strip redundant motion-studio/ prefix
OUT_FILE="${OUT_FILE#motion-studio/}"
mkdir -p "out"

echo -e "\033[90m[*] Pre-checking TypeScript integrity...\033[0m"
npx tsc --noEmit

# Determine GPU / GL acceleration flag
# macOS natively uses Metal via Chromium; ANGLE is designed for Windows/DirectX
GL_FLAG="--gl=angle"
if [ "$(uname -s)" = "Darwin" ]; then
    GL_FLAG=""
fi

echo -e "\033[96m====================================================\033[0m"
echo -e "\033[96m   Rendering Remotion Composition: ${COMP_ID}       \033[0m"
echo -e "\033[96m   Output: ${OUT_FILE}                              \033[0m"
echo -e "\033[96m   Concurrency: 12x Threads | GPU Acceleration      \033[0m"
echo -e "\033[96m====================================================\033[0m"

# Render with hardware acceleration
npx remotion render src/index.ts "${COMP_ID}" "${OUT_FILE}" --concurrency=12 ${GL_FLAG} --bundle-cache

echo ""
echo -e "\033[92m====================================================\033[0m"
echo -e "\033[92m[SUCCESS] Video rendered to: motion-studio/${OUT_FILE}\033[0m"
echo -e "\033[92m====================================================\033[0m"
