#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    STELLARFORGE AI LAUNCHER                  ║"
echo "║         AI-Filtered Satellite Design Validator               ║"
echo "║              NASA Space Apps Challenge 2024/2025             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo

echo "[1/4] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi
echo "[OK] Node.js found: $(node --version)"

echo
echo "[2/4] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "[WARNING] Python3 not found. Validation will use fallback mode."
else
    echo "[OK] Python3 found: $(python3 --version)"
fi

echo
echo "[3/4] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] npm install failed"
    exit 1
fi
echo "[OK] Dependencies installed"

echo
echo "[4/4] Checking NVIDIA NIM endpoint..."
if curl -s http://127.0.0.1:4000/v1/models > /dev/null 2>&1; then
    echo "[OK] NIM endpoint reachable"
else
    echo "[WARNING] NIM endpoint not reachable at http://127.0.0.1:4000"
    echo "         AI analysis will use fallback mode."
fi

echo
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Starting StellarForge AI Server...                          ║"
echo "║  Open http://localhost:3000 in your browser                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo

npm start