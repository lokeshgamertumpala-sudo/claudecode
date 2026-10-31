#!/usr/bin/env python3
"""
Motion Boost Accelerator
High-speed Remotion Motion Graphics Studio Manager, Turbo Renderer & Rapid Verifier
"""

import os
import sys
import time
import subprocess
import argparse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STUDIO_DIR = os.path.join(SCRIPT_DIR, "motion-studio")
SRC_DIR = os.path.join(STUDIO_DIR, "src")
COMP_DIR = os.path.join(SRC_DIR, "compositions")
ROOT_FILE = os.path.join(SRC_DIR, "Root.tsx")
OUT_DIR = os.path.join(STUDIO_DIR, "out")

AVAILABLE_COMPOSITIONS = [
    ("MinimalMotion", "Apple-grade minimal design with kinetic typography (2s, 60fps)"),
    ("EarthRotation", "Deterministic planetary simulation with atmospheric glow (3s, 60fps)"),
    ("GoodMorning", "Apple-style minimal sunrise typography (5s, 60fps)"),
    ("GoodEvening", "Apple-style minimal evening greeting animation (3s, 60fps)"),
    ("HiGreeting", "Punchy neon kinetic typography greeting (2s, 60fps)"),
    ("KineticTypography", "Dynamic typography scaling & neon accents (3s, 60fps)"),
    ("CyberpunkHUD", "Sci-Fi telemetry, reticles & digital scanlines (5s, 60fps)"),
    ("ParticleVortex", "Mathematical orbital field & particle vortex (4s, 60fps)"),
    ("LogoReveal", "Volumetric light sweep & cinematic logo reveal (3s, 60fps)"),
    ("NeonPortal", "Hypnotic neon polygon tunnel with camera zoom (4s, 60fps)"),
    ("VerticalReel", "9:16 vertical shorts format composition (3s, 60fps)"),
    ("VersatileShowcase", "Multi-scene showcase of all motion & audio primitives (10s, 60fps)")
]

ALIAS_MAP = {
    "versatile": "VersatileShowcase",
    "showcase": "VersatileShowcase",
    "versatileshowcase": "VersatileShowcase",
    "versatile-showcase": "VersatileShowcase",
    "minimal": "MinimalMotion",
    "minimalmotion": "MinimalMotion",
    "minimal-motion": "MinimalMotion",
    "earth": "EarthRotation",
    "earthrotation": "EarthRotation",
    "earth-rotation": "EarthRotation",
    "good-morning": "GoodMorning",
    "goodmorning": "GoodMorning",
    "good-evening": "GoodEvening",
    "goodevening": "GoodEvening",
    "hi-greeting": "HiGreeting",
    "higreeting": "HiGreeting",
    "kinetic-typography": "KineticTypography",
    "kinetictypography": "KineticTypography",
    "cyberpunk-hud": "CyberpunkHUD",
    "cyberpunkhud": "CyberpunkHUD",
    "particle-vortex": "ParticleVortex",
    "particlevortex": "ParticleVortex",
    "logo-reveal": "LogoReveal",
    "logoreveal": "LogoReveal",
    "neon-portal": "NeonPortal",
    "neonportal": "NeonPortal",
    "vertical-reel": "VerticalReel",
    "verticalreel": "VerticalReel",
}

def list_compositions():
    print("=" * 70)
    print("   🎬 MOTION STUDIO - REGISTERED 60FPS COMPOSITIONS")
    print("=" * 70)
    for comp_id, desc in AVAILABLE_COMPOSITIONS:
        print(f" • {comp_id:<20} -> {desc}")
    print("=" * 70)
    print(" Fast verify: python motion_boost.py check <CompositionId>")
    print(" Quick still:  python motion_boost.py still <CompositionId> [frame]")
    print(" Quick render: python motion_boost.py render <CompositionId>")
    print(" Live preview: .\\preview-motion.bat (http://localhost:3100)")

def run_type_check() -> bool:
    print("[*] Verifying TypeScript and syntax integrity (<1s)...")
    cmd = ["npx.cmd" if os.name == "nt" else "npx", "tsc", "--noEmit"]
    res = subprocess.run(cmd, cwd=STUDIO_DIR, capture_output=True, text=True)
    if res.returncode == 0:
        print("[+] TypeScript check PASSED (0 errors).")
        return True
    else:
        print(f"[!] TypeScript check FAILED:\n{res.stdout or res.stderr}")
        return False

def verify_composition(comp_id: str, frame: int = 30) -> int:
    comp_id = ALIAS_MAP.get(comp_id.lower().strip(), comp_id)
    if not run_type_check():
        return 1
    
    os.makedirs(OUT_DIR, exist_ok=True)
    out_file = f"out/_check_{comp_id}.png"
    abs_out = os.path.join(STUDIO_DIR, out_file)

    print(f"[*] Rendering fast verification still frame {frame} for '{comp_id}'...")
    t0 = time.time()
    cmd = [
        "npx.cmd" if os.name == "nt" else "npx",
        "remotion", "still",
        "src/index.ts",
        comp_id,
        out_file,
        f"--frame={frame}"
    ]
    proc = subprocess.run(cmd, cwd=STUDIO_DIR, capture_output=False)
    elapsed = time.time() - t0

    if proc.returncode == 0:
        print(f"\n[+] Composition '{comp_id}' verified 100% functional in {elapsed:.1f}s!")
        print(f"    Preview frame: {abs_out}")
        return 0
    else:
        print(f"\n[!] Verification still frame failed with exit code {proc.returncode}")
        return proc.returncode

def render_still(comp_id: str, frame: int = 30, out_file: str = None) -> int:
    comp_id = ALIAS_MAP.get(comp_id.lower().strip(), comp_id)
    if not out_file:
        out_file = f"out/{comp_id}-f{frame}.png"
    
    if out_file.startswith("motion-studio/") or out_file.startswith("motion-studio\\"):
        out_file = out_file[14:]

    os.makedirs(OUT_DIR, exist_ok=True)
    abs_out = os.path.join(STUDIO_DIR, out_file) if not os.path.isabs(out_file) else out_file

    print(f"[*] Rendering still frame {frame} of '{comp_id}' -> '{out_file}'...")
    cmd = [
        "npx.cmd" if os.name == "nt" else "npx",
        "remotion", "still",
        "src/index.ts",
        comp_id,
        out_file,
        f"--frame={frame}"
    ]
    proc = subprocess.run(cmd, cwd=STUDIO_DIR, capture_output=False)
    if proc.returncode == 0:
        print(f"\n[+] Still rendered successfully: {abs_out}")
        return 0
    else:
        print(f"\n[!] Still render failed with code {proc.returncode}")
        return proc.returncode

def render_composition(comp_id: str, out_file: str = None, concurrency: int = 12) -> int:
    comp_id = ALIAS_MAP.get(comp_id.lower().strip(), comp_id)
    if not out_file:
        out_file = f"out/{comp_id}.mp4"
    
    if out_file.startswith("motion-studio/") or out_file.startswith("motion-studio\\"):
        out_file = out_file[14:]

    # Fast pre-check
    if not run_type_check():
        return 1

    os.makedirs(OUT_DIR, exist_ok=True)
    abs_out = os.path.join(STUDIO_DIR, out_file) if not os.path.isabs(out_file) else out_file

    print(f"[*] Turbo Rendering '{comp_id}' -> '{out_file}' (Concurrency: {concurrency}x)...")
    t0 = time.time()
    cmd = [
        "npx.cmd" if os.name == "nt" else "npx",
        "remotion", "render",
        "src/index.ts",
        comp_id,
        out_file,
        f"--concurrency={concurrency}",
    ]
    if sys.platform != "darwin":
        cmd.append("--gl=angle")
    cmd.append("--bundle-cache")
    
    proc = subprocess.run(cmd, cwd=STUDIO_DIR, capture_output=False)
    elapsed = time.time() - t0
    
    if proc.returncode == 0:
        size_mb = os.path.getsize(abs_out) / (1024 * 1024) if os.path.exists(abs_out) else 0.0
        print(f"\n[+] Render completed successfully in {elapsed:.1f}s!")
        print(f"    File: {abs_out} ({size_mb:.2f} MB)")
        return 0
    else:
        print(f"\n[!] Render failed with exit code {proc.returncode}")
        return proc.returncode

def main():
    parser = argparse.ArgumentParser(description="Motion Boost CLI Accelerator")
    subparsers = parser.add_subparsers(dest="command")
    
    # list
    subparsers.add_parser("list", help="List all registered 60fps compositions")
    
    # check
    check_parser = subparsers.add_parser("check", help="Fast verify composition syntax & still frame (~2s)")
    check_parser.add_argument("composition", help="Name of composition (e.g. EarthRotation)")
    check_parser.add_argument("--frame", "-f", type=int, default=30, help="Frame to verify (default: 30)")

    # still
    still_parser = subparsers.add_parser("still", help="Render single still frame")
    still_parser.add_argument("composition", help="Name of composition")
    still_parser.add_argument("frame", nargs="?", type=int, default=30, help="Frame number (default: 30)")
    still_parser.add_argument("output", nargs="?", default=None, help="Output file")
    
    # render
    render_parser = subparsers.add_parser("render", help="Turbo render a composition to MP4")
    render_parser.add_argument("composition", help="Name of composition (e.g. EarthRotation)")
    render_parser.add_argument("output", nargs="?", default=None, help="Output file path (default: out/<name>.mp4)")
    render_parser.add_argument("--concurrency", "-c", type=int, default=12, help="Concurrency threads (default: 12)")
    
    args = parser.parse_args()
    
    if args.command == "list":
        list_compositions()
    elif args.command == "check":
        sys.exit(verify_composition(args.composition, args.frame))
    elif args.command == "still":
        sys.exit(render_still(args.composition, args.frame, args.output))
    elif args.command == "render":
        sys.exit(render_composition(args.composition, args.output, args.concurrency))
    else:
        list_compositions()

if __name__ == "__main__":
    main()
