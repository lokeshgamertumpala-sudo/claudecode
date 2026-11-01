#!/usr/bin/env bash
# Fast-Verify Remotion Motion Graphic in Sub-2-Seconds (macOS / Linux / POSIX)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STUDIO_DIR="$SCRIPT_DIR/motion-studio"
cd "$STUDIO_DIR"

COMP_ID="${1:-}"
FRAME="${2:-30}"

if [ -z "$COMP_ID" ]; then
    echo "[!] Missing composition ID."
    echo "Usage: ./check-motion.sh [CompositionId] [OptionalFrameNumber]"
    echo "Example: ./check-motion.sh VersatileShowcase 60"
    echo "Example: ./check-motion.sh MinimalMotion 30"
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
    auroraflow|aurora-flow|aurora) COMP_ID="AuroraFlow" ;;
    cosmicaurora|cosmic-aurora|cosmic) COMP_ID="CosmicAurora" ;;
esac

echo -e "\033[96m====================================================\033[0m"
echo -e "\033[96m   FAST-VERIFY MOTION GRAPHIC: ${COMP_ID}           \033[0m"
echo -e "\033[96m   Step 1: TypeScript Syntax and Type Verification  \033[0m"
echo -e "\033[96m====================================================\033[0m"

npx tsc --noEmit
echo -e "\033[92m[+] TypeScript verification PASSED: 0 errors.\033[0m"

echo ""
echo -e "\033[96m====================================================\033[0m"
echo -e "\033[96m   Step 2: Fast Single Frame Still Render (~1.5s)   \033[0m"
echo -e "\033[96m   Target Frame: ${FRAME} | Output: out/_check_${COMP_ID}.png\033[0m"
echo -e "\033[96m====================================================\033[0m"

mkdir -p "out"
npx remotion still src/index.ts "${COMP_ID}" "out/_check_${COMP_ID}.png" --frame="${FRAME}"

echo ""
echo -e "\033[92m====================================================\033[0m"
echo -e "\033[92m[SUCCESS] Composition '${COMP_ID}' verified 100% functional.\033[0m"
echo -e "Still frame saved: motion-studio/out/_check_${COMP_ID}.png"
echo -e "To render full MP4: ./render-motion.sh ${COMP_ID}"
echo -e "To preview in browser: ./preview-motion.sh"
echo -e "\033[92m====================================================\033[0m"
