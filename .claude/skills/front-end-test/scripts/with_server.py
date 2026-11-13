#!/usr/bin/env python3
"""
Start one or more servers, wait for them to be ready, run a command, then clean up.

Enhanced from webapp-testing with --env and --wait-text support.

Usage:
    # Single server
    python scripts/with_server.py --server "npm run dev" --port 5173 -- python automation.py

    # Multiple servers
    python scripts/with_server.py \
      --server "cd backend && python server.py" --port 3000 \
      --server "cd frontend && npm run dev" --port 5173 \
      -- python test.py

    # With environment variables
    python scripts/with_server.py --server "npm run dev" --port 5173 \
      --env VITE_DEV_AUTH_BYPASS=true --env NODE_ENV=test \
      -- python automation.py

    # Wait for specific stdout text instead of port
    python scripts/with_server.py --server "npm run dev" --port 5173 \
      --wait-text "ready in" -- python automation.py
"""

import subprocess
import socket
import time
import sys
import os
import argparse
import threading


def is_server_ready(port, timeout=30):
    """Wait for server to be ready by polling the port."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection(('localhost', port), timeout=1):
                return True
        except (socket.error, ConnectionRefusedError):
            time.sleep(0.5)
    return False


def wait_for_text(process, text, timeout=30):
    """Wait for specific text in server stdout."""
    found = threading.Event()
    output_lines = []

    def reader(stream):
        for line in iter(stream.readline, b''):
            decoded = line.decode('utf-8', errors='replace').strip()
            output_lines.append(decoded)
            if not found.is_set() and text in decoded:
                found.set()
            # Keep draining to prevent pipe buffer from filling

    thread = threading.Thread(target=reader, args=(process.stdout,), daemon=True)
    thread.start()
    return found.wait(timeout=timeout)


def parse_env_vars(env_list):
    """Parse KEY=VALUE environment variable strings."""
    env = os.environ.copy()
    if env_list:
        for item in env_list:
            if '=' in item:
                key, value = item.split('=', 1)
                env[key] = value
            else:
                print(f"Warning: Ignoring invalid env var '{item}' (expected KEY=VALUE)")
    return env


def main():
    parser = argparse.ArgumentParser(description='Run command with one or more servers')
    parser.add_argument('--server', action='append', dest='servers', required=True,
                        help='Server command (can be repeated)')
    parser.add_argument('--port', action='append', dest='ports', type=int, required=True,
                        help='Port for each server (must match --server count)')
    parser.add_argument('--timeout', type=int, default=30,
                        help='Timeout in seconds per server (default: 30)')
    parser.add_argument('--env', action='append', dest='env_vars',
                        help='Environment variable as KEY=VALUE (can be repeated)')
    parser.add_argument('--wait-text', dest='wait_text',
                        help='Wait for this text in stdout instead of just polling port')
    parser.add_argument('command', nargs=argparse.REMAINDER,
                        help='Command to run after server(s) ready')

    args = parser.parse_args()

    # Remove the '--' separator if present
    if args.command and args.command[0] == '--':
        args.command = args.command[1:]

    if not args.command:
        print("Error: No command specified to run")
        sys.exit(1)

    if len(args.servers) != len(args.ports):
        print("Error: Number of --server and --port arguments must match")
        sys.exit(1)

    servers = []
    for cmd, port in zip(args.servers, args.ports):
        servers.append({'cmd': cmd, 'port': port})

    env = parse_env_vars(args.env_vars)
    server_processes = []

    try:
        for i, server in enumerate(servers):
            print(f"Starting server {i+1}/{len(servers)}: {server['cmd']}")

            # Only pipe stdout when --wait-text needs it for the last server;
            # otherwise use DEVNULL to prevent pipe buffer blocking
            needs_stdout = args.wait_text and i == len(servers) - 1
            process = subprocess.Popen(
                server['cmd'],
                shell=True,
                stdout=subprocess.PIPE if needs_stdout else subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                env=env
            )
            server_processes.append(process)

            if args.wait_text and i == len(servers) - 1:
                # Use text-based waiting for the last server if --wait-text is set
                print(f"Waiting for text '{args.wait_text}' from server on port {server['port']}...")
                if not wait_for_text(process, args.wait_text, timeout=args.timeout):
                    # Fall back to port check
                    print(f"Text not found, falling back to port check on {server['port']}...")
                    if not is_server_ready(server['port'], timeout=args.timeout):
                        raise RuntimeError(
                            f"Server failed to start on port {server['port']} within {args.timeout}s"
                        )
            else:
                print(f"Waiting for server on port {server['port']}...")
                if not is_server_ready(server['port'], timeout=args.timeout):
                    raise RuntimeError(
                        f"Server failed to start on port {server['port']} within {args.timeout}s"
                    )

            print(f"Server ready on port {server['port']}")

        print(f"\nAll {len(servers)} server(s) ready")

        # Run the command
        print(f"Running: {' '.join(args.command)}\n")
        result = subprocess.run(args.command, env=env)
        sys.exit(result.returncode)

    finally:
        print(f"\nStopping {len(server_processes)} server(s)...")
        for i, process in enumerate(server_processes):
            try:
                process.terminate()
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
            print(f"Server {i+1} stopped")
        print("All servers stopped")


if __name__ == '__main__':
    main()
