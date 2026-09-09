---
name: perf-optimizer
description: Profile, diagnose, and optimize runtime performance, frontend rendering (Core Web Vitals, re-renders), backend throughput, database bottlenecks, and memory leaks. Use when code is slow or lagging.
---

# Performance Optimizer Skill

This skill guides algorithmic profiling, frontend web vitals optimization, database query tuning, and memory management.

## Key Optimization Vectors

### 1. Algorithmic & Memory Efficiency
- Replace \(O(n^2)\) or \(O(n \times m)\) nested loops with \(O(n)\) HashMaps/Sets for lookups.
- Avoid large array clones inside hot loops or event handlers.
- Clean up event listeners, timers, intervals, and WebSocket connections to avoid memory leaks.

### 2. Frontend & React Performance
- **Minimize Re-renders**: Use fine-grained state (Zustand/Signals) instead of monolithic contexts.
- **Memoization Rules**: Use `useMemo` / `useCallback` only when computation is heavy or dependencies are passed to memoized children (`React.memo`).
- **Virtualization**: Use virtual scrolling (`react-virtual`, TanStack Virtual) for lists over 100 items.
- **Core Web Vitals**:
  - **LCP (Largest Contentful Paint)**: Prioritize hero image loading (`fetchpriority="high"`, WebP/AVIF format).
  - **CLS (Cumulative Layout Shift)**: Explicit width and height attributes on images and aspect-ratio containers.
  - **INP (Interaction to Next Paint)**: Debounce/throttle high-frequency inputs; offload heavy work to Web Workers or `requestIdleCallback`.

### 3. Backend & I/O
- Eliminate N+1 queries with bulk joins, `DataLoader`, or batch fetching.
- Implement HTTP caching headers (`Cache-Control`, `ETag`, `stale-while-revalidate`).
- Add in-memory caching (Redis/LRU) for frequently queried, read-heavy data.

## Invocation Examples
- `/perf-optimizer Why is this React component re-rendering on every keystroke?`
- "Optimize this SQL query that is taking 4 seconds to execute on 500k rows."
- "Audit our Core Web Vitals and propose bundle reduction strategies."
