#!/bin/bash
# NVIDIA Multi-Model Motion Graphics System Launcher
# Sets up environment and runs the main CLI

echo "=========================================="
echo "NVIDIA Multi-Model Motion Graphics System"
echo "=========================================="
echo

# Load environment variables
if [ -f .env ]; then
    echo "Loading environment from .env..."
    export $(grep -v '^#' .env | xargs)
else
    echo "WARNING: .env not found. Copy .env.example to .env and add your API key."
fi

# Verify NVIDIA_API_KEY
if [ -z "$NVIDIA_API_KEY" ]; then
    echo "ERROR: NVIDIA_API_KEY not set!"
    echo "Please edit .env and add your NVIDIA API key from https://build.nvidia.com"
    exit 1
fi

echo "NVIDIA_API_KEY: ${NVIDIA_API_KEY:0:10}..."
echo

# Run the CLI with passed arguments
python main.py "$@"