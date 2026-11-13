# Performance Review Guide

Performance review checklist covering frontend, backend, database, and algorithmic complexity.

## Frontend Performance (Core Web Vitals)

### Key Metrics

| Metric | Target | What It Measures |
|--------|--------|-----------------|
| **LCP** (Largest Contentful Paint) | <= 2.5s | Main content load time |
| **INP** (Interaction to Next Paint) | <= 200ms | Interaction responsiveness |
| **CLS** (Cumulative Layout Shift) | <= 0.1 | Visual stability |
| **FCP** (First Contentful Paint) | <= 1.8s | First render time |
| **TBT** (Total Blocking Time) | <= 200ms | Main thread blocking |

### LCP Optimization

```javascript
// BAD — Lazy loading LCP image delays critical content
<img src="hero.jpg" loading="lazy" />

// GOOD — LCP image loads immediately
<img src="hero.jpg" fetchpriority="high" />

// GOOD — Modern image formats + responsive
<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img src="hero.jpg" alt="Hero" />
</picture>
```

### INP Optimization

```javascript
// BAD — Long task blocks main thread
button.addEventListener('click', () => {
  processLargeData(data);    // 500ms synchronous operation
  updateUI();
});

// GOOD — Break up long tasks
button.addEventListener('click', async () => {
  for (const chunk of chunks) {
    processChunk(chunk);
    await scheduler.yield?.() ?? new Promise(r => setTimeout(r, 0));
  }
  updateUI();
});

// GOOD — Use Web Worker for heavy computation
const worker = new Worker('heavy-computation.js');
worker.postMessage(data);
```

### CLS Prevention

```css
/* BAD — No dimensions on media */
img { width: 100%; }

/* GOOD — Reserve space */
img { width: 100%; aspect-ratio: 16 / 9; }

/* GOOD — Reserve space for dynamic content */
.ad-container { min-height: 250px; }
```

### Code Splitting

```javascript
// BAD — Import everything upfront
import { HeavyChart } from './charts';
import { PDFExporter } from './pdf';

// GOOD — Lazy load
const HeavyChart = lazy(() => import('./charts'));
const PDFExporter = lazy(() => import('./pdf'));

// BAD — Import entire library
import _ from 'lodash';
import moment from 'moment';

// GOOD — Import only what you need
import debounce from 'lodash/debounce';
import { format } from 'date-fns';
```

### Virtual Scrolling

```javascript
// BAD — Render all items (10000 DOM nodes)
function List({ items }) {
  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
}

// GOOD — Virtual list (only visible items rendered)
import { FixedSizeList } from 'react-window';
function VirtualList({ items }) {
  return (
    <FixedSizeList height={400} itemCount={items.length} itemSize={35}>
      {({ index, style }) => <div style={style}>{items[index].name}</div>}
    </FixedSizeList>
  );
}
```

### Memory Leaks

```javascript
// BAD — Event listener not cleaned up
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// GOOD
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// BAD — Timer not cleared
useEffect(() => { setInterval(fetchData, 5000); }, []);

// GOOD
useEffect(() => {
  const timer = setInterval(fetchData, 5000);
  return () => clearInterval(timer);
}, []);

// BAD — Closure holds large object
function createHandler() {
  const largeData = new Array(1000000).fill('x');
  return () => console.log(largeData.length);   // largeData never GC'd
}

// GOOD — Only keep what you need
function createHandler() {
  const length = new Array(1000000).fill('x').length;
  return () => console.log(length);
}
```

### Frontend Checklist

**Blocking:**
- [ ] LCP image not lazy loaded
- [ ] No `transition: all` (animate specific properties)
- [ ] Not animating width/height/top/left (use transform/opacity)
- [ ] Lists >100 items virtualized

**Important:**
- [ ] Code splitting with dynamic imports
- [ ] Large libraries imported selectively
- [ ] Images use WebP/AVIF
- [ ] Bundle size analyzed

---

## Backend Performance

### N+1 Queries

```python
# BAD — N+1 (1 + N queries)
users = User.objects.all()
for user in users:
    print(user.profile.bio)      # Query per user

# GOOD — 2 queries total
users = User.objects.select_related('profile').all()

# GOOD — Many-to-many
posts = Post.objects.prefetch_related('tags').all()
```

```typescript
// TypeORM
// BAD
const users = await userRepository.find();
for (const user of users) { const posts = await user.posts; }

// GOOD
const users = await userRepository.find({ relations: ['posts'] });
```

### Database Query Optimization

```sql
-- BAD: Full table scan
SELECT * FROM orders WHERE status = 'pending';
-- GOOD: Add index
CREATE INDEX idx_orders_status ON orders(status);

-- BAD: Function breaks index usage
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- GOOD: Range query uses index
SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- BAD: SELECT * fetches unnecessary data
SELECT * FROM users WHERE id = 1;
-- GOOD: Select only needed columns
SELECT id, name, email FROM users WHERE id = 1;

-- BAD: No LIMIT on large table
SELECT * FROM logs WHERE type = 'error';
-- GOOD: Paginated
SELECT * FROM logs WHERE type = 'error' LIMIT 100 OFFSET 0;
```

### API Performance

```javascript
// BAD — Return all data
app.get('/users', async (req, res) => {
  const users = await User.findAll();      // Could be 100000 rows
  res.json(users);
});

// GOOD — Pagination with max limit
app.get('/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;
  const { rows, count } = await User.findAndCountAll({ limit, offset });
  res.json({ data: rows, pagination: { page, limit, total: count } });
});
```

### Caching

```javascript
// Redis caching pattern
async function getUser(id) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await db.users.findById(id);
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user));
  return user;
}
```

### Async Event Loop

```python
# BAD — Blocking I/O in async handler
async def handler():
    data = requests.get(url)               # Blocks the event loop!

# GOOD — Use async client or run_in_executor
async def handler():
    data = await asyncio.get_event_loop().run_in_executor(None, requests.get, url)
```

### Backend Checklist

**Blocking:**
- [ ] No N+1 queries
- [ ] List endpoints paginated
- [ ] No `SELECT *` on large tables
- [ ] No blocking I/O in async handlers

**Important:**
- [ ] Hot data has caching
- [ ] WHERE columns have indexes
- [ ] Slow query monitoring configured
- [ ] Rate limiting on all public endpoints
- [ ] Response compression enabled

---

## Algorithm Complexity

### Complexity Quick Reference

| Complexity | 10 items | 1000 items | 1M items |
|-----------|----------|-----------|----------|
| O(1) | 1 | 1 | 1 |
| O(log n) | 3 | 10 | 20 |
| O(n) | 10 | 1,000 | 1,000,000 |
| O(n log n) | 33 | 10,000 | 20,000,000 |
| O(n^2) | 100 | 1,000,000 | 1,000,000,000,000 |

### Common Patterns

```javascript
// BAD — O(n^2) nested loop
function findDuplicates(arr) {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] === arr[j]) duplicates.push(arr[i]);
}
// GOOD — O(n) with Set
function findDuplicates(arr) {
  const seen = new Set();
  return arr.filter(item => seen.has(item) || !seen.add(item));
}

// BAD — O(n^2) includes in loop
for (const item of arr) {
  if (!result.includes(item)) result.push(item);    // includes is O(n)
}
// GOOD — O(n)
const unique = [...new Set(arr)];

// BAD — O(n) lookup
users.find(u => u.id === id);
// GOOD — O(1) lookup
const userMap = new Map(users.map(u => [u.id, u]));
userMap.get(id);
```

### Performance Thresholds

| Metric | Good | Needs Work | Bad |
|--------|------|-----------|-----|
| API response | < 100ms | 100-500ms | > 500ms |
| DB query | < 50ms | 50-200ms | > 200ms |
| JS bundle | < 200KB | 200-500KB | > 500KB |
| Page load | < 3s | 3-5s | > 5s |
