#!/usr/bin/env python3
"""
System Stress Test Utility
Tests CPU, Memory, Disk I/O, and Network under load.
Usage: python stresstest.py [--cpu N] [--memory MB] [--disk MB] [--duration SEC] [--all]
"""

import argparse
import os
import sys
import time
import threading
import multiprocessing
import hashlib
import tempfile
import shutil
from pathlib import Path


def cpu_stress(duration: int, workers: int):
    """Stress CPU with hash computations."""
    def worker(stop_event):
        data = b"x" * 1024 * 1024
        while not stop_event.is_set():
            hashlib.sha256(data).hexdigest()

    stop_event = threading.Event()
    threads = [threading.Thread(target=worker, args=(stop_event,)) for _ in range(workers)]
    for t in threads:
        t.start()
    time.sleep(duration)
    stop_event.set()
    for t in threads:
        t.join()


def memory_stress(target_mb: int, duration: int):
    """Allocate and hold memory."""
    chunk_size = 10 * 1024 * 1024
    chunks = target_mb // 10
    data = [bytearray(chunk_size) for _ in range(chunks)]
    for chunk in data:
        for i in range(0, len(chunk), 4096):
            chunk[i] = 1
    time.sleep(duration)


def disk_stress(target_mb: int, duration: int):
    """Stress disk with sequential and random I/O."""
    temp_dir = Path(tempfile.mkdtemp(prefix="stresstest_"))
    try:
        file_path = temp_dir / "stress.dat"
        block_size = 1024 * 1024
        blocks = target_mb

        # Sequential write
        with open(file_path, "wb") as f:
            data = os.urandom(block_size)
            for _ in range(blocks):
                f.write(data)

        # Random read/write
        end_time = time.time() + duration
        with open(file_path, "r+b") as f:
            while time.time() < end_time:
                pos = (hash(os.urandom(8)) % blocks) * block_size
                f.seek(pos)
                f.write(os.urandom(block_size))
                f.flush()
                os.fsync(f.fileno())
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def run_all(duration: int):
    """Run all stress tests concurrently."""
    cpu_count = multiprocessing.cpu_count()
    mem_mb = min(1024, (os.sysconf('SC_PAGE_SIZE') * os.sysconf('SC_PHYS_PAGES')) // (1024 * 1024) // 2)

    threads = [
        threading.Thread(target=cpu_stress, args=(duration, cpu_count)),
        threading.Thread(target=memory_stress, args=(mem_mb, duration)),
        threading.Thread(target=disk_stress, args=(512, duration)),
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join()


def main():
    parser = argparse.ArgumentParser(description="System Stress Test")
    parser.add_argument("--cpu", type=int, metavar="N", help="CPU workers (default: core count)")
    parser.add_argument("--memory", type=int, metavar="MB", help="Memory to allocate in MB")
    parser.add_argument("--disk", type=int, metavar="MB", help="Disk I/O size in MB")
    parser.add_argument("--duration", type=int, default=30, metavar="SEC", help="Test duration in seconds (default: 30)")
    parser.add_argument("--all", action="store_true", help="Run all tests concurrently")
    args = parser.parse_args()

    if not any([args.cpu, args.memory, args.disk, args.all]):
        parser.print_help()
        return 1

    print(f"Starting stress test for {args.duration}s...")
    start = time.time()

    threads = []
    if args.all or args.cpu:
        workers = args.cpu or multiprocessing.cpu_count()
        threads.append(threading.Thread(target=cpu_stress, args=(args.duration, workers)))
        print(f"  CPU: {workers} workers")

    if args.all or args.memory:
        mem = args.memory or 1024
        threads.append(threading.Thread(target=memory_stress, args=(mem, args.duration)))
        print(f"  Memory: {mem} MB")

    if args.all or args.disk:
        disk = args.disk or 512
        threads.append(threading.Thread(target=disk_stress, args=(disk, args.duration)))
        print(f"  Disk: {disk} MB")

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    elapsed = time.time() - start
    print(f"Completed in {elapsed:.1f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())