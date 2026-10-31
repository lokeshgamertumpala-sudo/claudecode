#!/usr/bin/env bash
# Fast Still Frame Renderer (macOS / Linux / POSIX)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STUDIO_DIR="$SCRIPT_DIR/motion-studio"
cd "$STUDIO_DIR"

COMP_ID="${1:-}"
FRAME="${2:-30}"
OUT_FILE="${3:-}"

if [ -z "$COMP_ID" ]; then
    echo "[!] Missing composition ID."
    echo "Usage: ./still-motion.sh [CompositionId] [FrameNumber] [OutputFile]"
    echo "Example: ./still-motion.sh VersatileShowcase 60 out/showcase-f60.png"
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
esac

if [ -z "$OUT_FILE" ]; then
    OUT_FILE="out/${COMP_ID}-f${FRAME}.png"
fi

OUT_FILE="${OUT_FILE#motion-studio/}"
mkdir -p "out"

echo -e "\033[96m====================================================\033[0m"
echo -e "\033[96m   Rendering Single Still Frame: ${COMP_ID}         \033[0m"
echo -e "\033[96m   Frame: ${FRAME} | Output: ${OUT_FILE}            \033[0m"
echo -e "\033[96m====================================================\033[0m"

npx remotion still src/index.ts "${COMP_ID}" "${OUT_FILE}" --frame="${FRAME}"

echo ""
echo -e "\033[92m[SUCCESS] Still frame rendered: motion-studio/${OUT_FILE}\033[0m"
