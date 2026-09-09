---
name: state-flow
description: Model frontend and backend state machines, complex UI state, data flows, asynchronous caching (TanStack Query), and client stores (Zustand, XState) with optimistic updates.
---

# State Flow Skill

This skill guides state modeling, avoiding duplicate/stale state, orchestrating asynchronous server caches, and managing client stores with predictable state machines.

## State Hierarchy Classification

1. **Server State (Remote Cache)**:
   - Owned by the server, asynchronous, requires revalidation, caching, and deduping.
   - **Tool**: TanStack Query (React Query) / SWR.
   - **Key Pattern**: Separate loading, error, and cached data states; use mutations with optimistic updates and rollback on failure.
2. **Client Global State**:
   - Truly global UI state (e.g., active user theme, shopping cart drawer open/closed, audio player state).
   - **Tool**: Zustand / Jotai.
   - **Rule**: Keep stores small and atomic. Never duplicate server state in client stores.
3. **Local Component State**:
   - Isolated to a single component or immediate subtree (e.g., input values, toggle open/close).
   - **Tool**: `useState`, `useReducer`.
4. **URL State**:
   - Filters, pagination, search queries, active tab.
   - **Rule**: The URL is the single source of truth for shareable state. Use searchParams.

## Zustand Store Blueprint

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.id === item.id);
        if (existing) {
          return {
            items: state.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
          };
        }
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),
      removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
      clearCart: () => set({ items: [] }),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    }),
    { name: 'shopping-cart-storage' }
  )
);
```

## Invocation Examples
- `/state-flow Design a Zustand store with persistence for user audio playback`
- "Set up TanStack Query with optimistic updates for upvoting blog posts."
- "Model a checkout wizard using a finite state machine (XState/reducer)."
