import { describe, it, expect, vi } from 'vitest'
import {
  cn,
  formatDate,
  formatNumber,
  generateId,
  deepClone,
  isEmpty,
  clamp,
  lerp,
  smoothstep,
  groupBy,
  sortBy,
  uniqueBy,
  parseQueryString,
  buildQueryString,
  getInitials,
  truncate,
  slugify,
  capitalize,
  titleCase,
  bytesToSize,
  getContrastColor,
  debounce,
  throttle,
} from './helpers'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('resolves conflicting tailwind classes with last-wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })
})

describe('formatDate', () => {
  it('returns ISO date by default', () => {
    expect(formatDate('2026-01-15T00:00:00Z')).toBe('2026-01-15')
  })

  it('supports US format', () => {
    expect(formatDate('2026-01-15T00:00:00Z', 'US')).toContain('/')
  })

  it('supports EU format', () => {
    expect(formatDate('2026-01-15T00:00:00Z', 'EU')).toContain('/')
  })

  it('supports MILITARY format', () => {
    expect(formatDate('2026-01-15T00:00:00Z', 'MILITARY')).toMatch(/15.*Jan.*2026/)
  })
})

describe('formatNumber', () => {
  it('formats with locale separators', () => {
    expect(formatNumber(1234567.891)).toContain(',')
  })

  it('respects decimals option', () => {
    expect(formatNumber(3.14159, { decimals: 3 })).toContain('3.142')
  })

  it('appends unit', () => {
    expect(formatNumber(10, { unit: ' km/s' })).toContain('km/s')
  })

  it('supports compact notation', () => {
    expect(formatNumber(2500000, { compact: true })).toBe('2.50M')
  })
})

describe('generateId', () => {
  it('produces a non-empty string of bounded length', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
    expect(id.length).toBeLessThanOrEqual(9)
  })

  it('produces different values on repeated calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBeGreaterThan(90)
  })
})

describe('deepClone', () => {
  it('clones nested objects without shared references', () => {
    const src = { a: 1, nested: { b: { c: [1, 2, 3] } } }
    const clone = deepClone(src)
    expect(clone).toEqual(src)
    expect(clone).not.toBe(src)
    expect(clone.nested.b).not.toBe(src.nested.b)
    clone.nested.b.c.push(4)
    expect(src.nested.b.c).toHaveLength(3)
  })
})

describe('isEmpty', () => {
  it('treats null and undefined as empty', () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
  })

  it('treats empty string/array/object as empty', () => {
    expect(isEmpty('')).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty({})).toBe(true)
  })

  it('treats non-empty values as not empty', () => {
    expect(isEmpty('a')).toBe(false)
    expect(isEmpty([1])).toBe(false)
    expect(isEmpty({ a: 1 })).toBe(false)
    expect(isEmpty(0)).toBe(false)
  })
})

describe('clamp', () => {
  it('clamps below min', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('clamps above max', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('passes through in-range values', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })
})

describe('lerp', () => {
  it('interpolates endpoints', () => {
    expect(lerp(0, 10, 0)).toBe(0)
    expect(lerp(0, 10, 1)).toBe(10)
  })

  it('interpolates midpoint', () => {
    expect(lerp(0, 10, 0.5)).toBe(5)
  })
})

describe('smoothstep', () => {
  it('clamps outside edges', () => {
    expect(smoothstep(0, 10, -5)).toBe(0)
    expect(smoothstep(0, 10, 15)).toBe(1)
  })

  it('is monotonic between edges', () => {
    const a = smoothstep(0, 10, 2)
    const b = smoothstep(0, 10, 5)
    const c = smoothstep(0, 10, 8)
    expect(b).toBeGreaterThan(a)
    expect(c).toBeGreaterThan(b)
  })
})

describe('groupBy', () => {
  it('groups by property key', () => {
    const items = [
      { type: 'a', v: 1 },
      { type: 'b', v: 2 },
      { type: 'a', v: 3 },
    ]
    const grouped = groupBy(items, 'type')
    expect(grouped.a).toHaveLength(2)
    expect(grouped.b).toHaveLength(1)
  })

  it('groups by function key', () => {
    const items = [1, 2, 3, 4, 5]
    const grouped = groupBy(items, n => (n % 2 === 0 ? 'even' : 'odd'))
    expect(grouped.even).toEqual([2, 4])
    expect(grouped.odd).toEqual([1, 3, 5])
  })
})

describe('sortBy', () => {
  const items = [{ v: 3 }, { v: 1 }, { v: 2 }]

  it('sorts ascending by default', () => {
    expect(sortBy(items, 'v').map(i => i.v)).toEqual([1, 2, 3])
  })

  it('sorts descending when specified', () => {
    expect(sortBy(items, 'v', 'desc').map(i => i.v)).toEqual([3, 2, 1])
  })

  it('does not mutate the source array', () => {
    sortBy(items, 'v', 'desc')
    expect(items.map(i => i.v)).toEqual([3, 1, 2])
  })
})

describe('uniqueBy', () => {
  it('removes duplicates by key', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 1 }]
    expect(uniqueBy(items, 'id')).toHaveLength(2)
  })

  it('removes duplicates by function key', () => {
    const items = [{ n: 'a' }, { n: 'A' }, { n: 'b' }]
    expect(uniqueBy(items, i => i.n.toLowerCase())).toHaveLength(2)
  })
})

describe('parseQueryString', () => {
  it('parses key=value pairs', () => {
    expect(parseQueryString('?status=active&destination=Mars')).toEqual({
      status: 'active',
      destination: 'Mars',
    })
  })

  it('returns empty object for empty string', () => {
    expect(parseQueryString('')).toEqual({})
  })
})

describe('buildQueryString', () => {
  it('builds a query string, OMITTING empty/undefined/null values (important: empty filters are dropped)', () => {
    const qs = buildQueryString({ status: 'active', destination: '', other: null })
    expect(qs).toBe('status=active')
  })

  it('url-encodes values', () => {
    expect(buildQueryString({ q: 'a b' })).toBe('q=a+b')
  })
})

describe('getInitials', () => {
  it('returns up to two uppercase initials', () => {
    expect(getInitials('Mission Director')).toBe('MD')
  })

  it('handles a single name', () => {
    expect(getInitials('Director')).toBe('D')
  })
})

describe('truncate', () => {
  it('passes through short strings', () => {
    expect(truncate('abc', 10)).toBe('abc')
  })

  it('truncates with suffix', () => {
    const result = truncate('abcdefghijklmnopqrstuvwxyz', 10)
    expect(result).toBe('abcdefg...')
    expect(result).toHaveLength(10)
  })
})

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Mars Sample Return')).toBe('mars-sample-return')
  })

  it('strips special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('  --Edge Case--  ')).toBe('edge-case')
  })
})

describe('capitalize', () => {
  it('capitalizes first letter only', () => {
    expect(capitalize('mARS')).toBe('Mars')
  })
})

describe('titleCase', () => {
  it('capitalizes each word', () => {
    expect(titleCase('mars sample return')).toBe('Mars Sample Return')
  })
})

describe('bytesToSize', () => {
  it('handles zero', () => {
    expect(bytesToSize(0)).toBe('0 B')
  })

  it('converts to KB', () => {
    expect(bytesToSize(2048)).toBe('2.00 KB')
  })

  it('converts to MB', () => {
    expect(bytesToSize(5 * 1024 * 1024)).toBe('5.00 MB')
  })
})

describe('getContrastColor', () => {
  it('returns black for light backgrounds', () => {
    expect(getContrastColor('#ffffff')).toBe('#000000')
  })

  it('returns white for dark backgrounds', () => {
    expect(getContrastColor('#000000')).toBe('#ffffff')
  })
})

describe('debounce', () => {
  it('delays invocation until the wait elapses', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    debounced()
    expect(fn).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(100)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('passes the latest arguments', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 50)
    debounced('first')
    debounced('second')
    await vi.advanceTimersByTimeAsync(50)
    expect(fn).toHaveBeenCalledWith('second')
    vi.useRealTimers()
  })
})

describe('throttle', () => {
  it('invokes immediately then blocks within the window', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(100)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })
})