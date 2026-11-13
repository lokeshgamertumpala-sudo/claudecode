# Common Bugs Reference

Language-specific bugs and anti-patterns to catch during code review.

## Universal Issues

### Logic Errors
- [ ] Off-by-one errors in loops and array access
- [ ] Incorrect boolean logic (De Morgan's law violations)
- [ ] Missing null/undefined checks
- [ ] Race conditions in concurrent code
- [ ] Incorrect comparison operators (`==` vs `===`, `=` vs `==`)
- [ ] Integer overflow/underflow
- [ ] Floating point comparison issues

### Resource Management
- [ ] Memory leaks (unclosed connections, listeners)
- [ ] File handles not closed
- [ ] Database connections not released
- [ ] Event listeners not removed
- [ ] Timers/intervals not cleared

### Error Handling
- [ ] Swallowed exceptions (empty catch blocks)
- [ ] Generic exception handling hiding specific errors
- [ ] Missing error propagation
- [ ] Incorrect error types thrown
- [ ] Missing finally/cleanup blocks

---

## TypeScript / JavaScript

### Type Issues
```typescript
// Using any defeats type safety
function process(data: any) { return data.value; }    // BAD
function process(data: Data) { return data.value; }    // GOOD
```

### Async/Await Pitfalls
```typescript
// Missing await
const data = fetchData();        // BAD — returns Promise, not data
const data = await fetchData();  // GOOD

// Unhandled promise rejection — always try-catch async functions
// Sequential when could be parallel
const a = await fetchA();
const b = await fetchB();        // BAD — waits for A first
const [a, b] = await Promise.all([fetchA(), fetchB()]);  // GOOD
```

### Common Mistakes
- [ ] `==` instead of `===`
- [ ] Modifying array/object during iteration
- [ ] `this` context lost in callbacks
- [ ] Closure capturing loop variable
- [ ] `parseInt` without radix parameter

---

## React

### Hooks Rules
```tsx
// BAD — Conditional hook call
if (show) {
  const [value, setValue] = useState(0);  // Violates rules of hooks
}

// GOOD — Always call at top level
const [value, setValue] = useState(0);
if (!show) return null;
```

### useEffect Errors
```tsx
// BAD — Missing dependency (stale closure)
useEffect(() => {
  fetchData(userId).then(onSuccess);
}, [userId]);  // Missing onSuccess

// BAD — Infinite loop
useEffect(() => {
  setCount(count + 1);
}, [count]);

// BAD — Missing cleanup (memory leak)
useEffect(() => {
  const ws = new WebSocket('wss://...');
  ws.onmessage = handleMessage;
}, []);
// GOOD
useEffect(() => {
  const ws = new WebSocket('wss://...');
  ws.onmessage = handleMessage;
  return () => ws.close();
}, []);

// BAD — useEffect for derived state
useEffect(() => {
  setTotal(items.reduce((a, b) => a + b.price, 0));
}, [items]);
// GOOD — useMemo
const total = useMemo(() => items.reduce((a, b) => a + b.price, 0), [items]);

// BAD — useEffect for event response
useEffect(() => {
  if (query) logSearch(query);
}, [query]);
// GOOD — Do it in the event handler
const handleSearch = (q) => { setQuery(q); logSearch(q); };
```

### useMemo / useCallback Mistakes
```tsx
// BAD — Over-optimization (constants don't need memo)
const config = useMemo(() => ({ api: '/v1' }), []);

// BAD — useMemo/useCallback without React.memo on child
// The optimization is pointless if the child doesn't use memo

// GOOD — Complete optimization chain
const MemoChild = React.memo(Child);
const handler = useCallback(() => {}, [dep]);
return <MemoChild onClick={handler} />;
```

### Component Design
```tsx
// BAD — Component defined inside component (re-mounts every render)
function Parent() {
  const Child = () => <div>child</div>;    // New function every render
  return <Child />;
}
// GOOD — Define outside
const Child = () => <div>child</div>;

// BAD — Props always new reference (breaks memo)
<MemoComponent
  style={{ color: 'red' }}           // New object every render
  onClick={() => handle()}           // New function every render
  items={data.filter(x => x)}       // New array every render
/>
```

### React 19+ Specific
```tsx
// BAD — useState/useEffect in Server Component
// app/page.tsx (default Server Component)
export default function Page() {
  const [count, setCount] = useState(0);   // Error in Server Component
}
// GOOD — Use 'use client' for interactive components

// BAD — useFormStatus in same component as <form>
function Form() {
  const { pending } = useFormStatus();     // Always undefined!
  return <form><button disabled={pending}>Submit</button></form>;
}
// GOOD — Use in child component
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Submit</button>;
}
```

### TanStack Query
```tsx
// BAD — queryKey missing parameters
useQuery({ queryKey: ['users'], queryFn: () => fetchUsers(userId, filters) });
// GOOD
useQuery({ queryKey: ['users', userId, filters], queryFn: () => fetchUsers(userId, filters) });

// BAD — Mutation without invalidation
const mutation = useMutation({ mutationFn: updateUser });
// GOOD
const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
});

// BAD — useSuspenseQuery with enabled (not supported)
useSuspenseQuery({ queryKey: ['user', id], queryFn: fetchUser, enabled: !!id });
```

### React Review Checklist
- [ ] Hooks not called conditionally or in loops
- [ ] useEffect has complete dependency array
- [ ] useEffect has cleanup function where needed
- [ ] useEffect not used for derived state (use useMemo)
- [ ] useMemo/useCallback paired with React.memo
- [ ] No component definitions inside components
- [ ] Props to memo components are stable references
- [ ] Callbacks in useEffect deps are stable (useCallback) — unstable inline arrows cause teardown/re-add churn
- [ ] No expensive computations inline in JSX (`.filter()`, `.sort()`, `.reverse()`, `.map().filter()` — use useMemo)
- [ ] Hardcoded DOM IDs in reusable components use `useId()` to avoid collisions (SVG `<defs>`, `htmlFor`, `aria-describedby`)
- [ ] Modals have focus trap + Escape key handler (not just `aria-modal="true"`)
- [ ] Interactive non-button elements (`<tr>`, `<div>`, `<span>` with onClick) have `tabIndex={0}`, `role`, `onKeyDown`
- [ ] Loading spinners/skeletons have `role="status"` and `aria-label`
- [ ] List items have unique, stable keys (not index)
- [ ] Server Components don't use client APIs
- [ ] Tests use `screen` queries and `userEvent`, not `container` and `fireEvent`

---

## Python

### Common Pitfalls
```python
# BAD — Mutable default argument
def add_item(item, items=[]):    # Shared across calls!
    items.append(item)
    return items

# GOOD
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

# BAD — Late binding closures
funcs = [lambda: i for i in range(5)]
# All return 4!

# GOOD
funcs = [lambda i=i: i for i in range(5)]
```

### ORM Write Path
```python
# BAD — flush without commit (data silently rolls back on session close)
db.add(record)
await db.flush()
# session closes → record lost

# GOOD — always commit after flush
db.add(record)
await db.flush()
await db.commit()

# BAD — delete without commit
await db.delete(record)
# GOOD
await db.delete(record)
await db.commit()
```

### Async Python
```python
# BAD — Blocking I/O in async function
async def handler():
    data = requests.get(url)           # Blocks event loop!

# GOOD
async def handler():
    async with httpx.AsyncClient() as client:
        data = await client.get(url)
# or
    data = await asyncio.get_event_loop().run_in_executor(None, requests.get, url)
```

---

## SQL

### Performance Issues
- [ ] Missing indexes on filtered/joined columns
- [ ] `SELECT *` instead of specific columns
- [ ] N+1 query patterns (loop with individual queries)
- [ ] Missing LIMIT on large tables
- [ ] Inefficient subqueries vs JOINs

### Common Mistakes
- [ ] Not handling NULL comparisons correctly (`= NULL` vs `IS NULL`)
- [ ] Missing transactions for related operations
- [ ] Incorrect JOIN types
- [ ] Date/timezone handling errors

---

## API Design

### REST Issues
- [ ] Inconsistent resource naming
- [ ] Wrong HTTP methods (POST for idempotent operations)
- [ ] Missing pagination for list endpoints
- [ ] Pagination `offset` parameter unbounded (add `le=` max to prevent large skip scans)
- [ ] Incorrect status codes
- [ ] Missing rate limiting
- [ ] Missing `response_model` on endpoints (no response validation or OpenAPI docs)

### Frontend/Backend Contract Alignment
- [ ] Response field names match (e.g., backend returns `rows` but frontend expects `customers`)
- [ ] Response nesting matches (backend returns flat list but frontend expects `{data: [...], has_more: bool}`)
- [ ] Query param values match backend validation (e.g., `'shipped'` vs `'mtd_shipped'`)
- [ ] HTTP methods match (GET vs POST)
- [ ] Error response shapes handled by frontend

### Data Validation
- [ ] Missing input validation
- [ ] Missing length/range checks on string fields (especially those sent to external APIs like LLMs)
- [ ] Not sanitizing user input
- [ ] Trusting client-side validation only
- [ ] Email fields accept any string (use EmailStr or equivalent)

---

## Testing Anti-Patterns

- [ ] Testing implementation details instead of behavior
- [ ] Missing edge case tests
- [ ] Flaky tests (non-deterministic, timing-dependent)
- [ ] Tests with external dependencies (no mocking)
- [ ] Missing negative tests (error cases)
- [ ] Overly complex test setup
- [ ] No tests for new code

### Red Flags in Code
```
console.log / print() left in production code
// TODO without tracking issue
Commented-out code blocks
any type in TypeScript
Empty catch blocks
.unwrap() in Rust production code
Magic numbers/strings
Hardcoded URLs/credentials
```
