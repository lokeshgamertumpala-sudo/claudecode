---
name: react-nextjs-pro
description: Build modern React 19 and Next.js App Router applications using React Server Components (RSC), Server Actions, Suspense boundaries, streaming SSR, and custom hooks.
---

# React & Next.js Pro Skill

This skill guides the architecture and development of scalable, high-performance React and Next.js applications using modern idioms.

## Architectural Guidelines

1. **Server vs. Client Components (RSC Boundary)**:
   - **Default to Server Components**: Fetch data, access backend services, and render static structures directly on the server with zero client JavaScript bundle.
   - **Push Client Components to the Leaves**: Use `'use client'` only where interactivity is needed (`useState`, `useEffect`, event listeners, browser APIs).
   - Pass Server Components as `children` into Client Components to avoid unnecessary client bundling.
2. **Data Fetching & Server Actions**:
   - Fetch data directly in async Server Components (`const data = await db.query(...)`).
   - Use Next.js Server Actions for mutations with progressive enhancement and type-safe validation (Zod).
   - Use `revalidatePath` or `revalidateTag` for on-demand cache revalidation.
3. **Streaming & Suspense**:
   - Wrap slow-loading UI chunks in `<Suspense fallback={<Skeleton />}>` to unlock progressive page rendering.
   - Use `loading.tsx` and `error.tsx` route segments for predictable layout fallbacks.
4. **Hooks Best Practices**:
   - Extract complex component logic into focused custom hooks (`useDebounce`, `useLocalStorage`, `useMediaQuery`).
   - Keep effect hooks (`useEffect`) dedicated to external system synchronization, never for calculating derived state.

## Component Pattern Example

```tsx
// app/dashboard/page.tsx (Server Component)
import { Suspense } from 'react';
import { MetricsGrid } from '@/components/MetricsGrid';
import { SkeletonLoader } from '@/components/ui/Skeleton';

export default async function DashboardPage() {
  return (
    <main className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
      <Suspense fallback={<SkeletonLoader count={4} />}>
        <MetricsGrid />
      </Suspense>
    </main>
  );
}
```

## Invocation Examples
- `/react-nextjs-pro Refactor this client component tree to utilize React Server Components`
- "Implement a secure Next.js Server Action for user profile updates with Zod validation."
- "Create a reusable custom hook for infinite scroll with IntersectionObserver."
