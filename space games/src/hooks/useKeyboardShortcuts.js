import { useEffect, useRef } from 'react'

const isInputTarget = (el) =>
  el &&
  (el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    el.isContentEditable)

/**
 * Bind keyboard shortcuts.
 * @param {Record<string, (e: KeyboardEvent) => void>} map
 *   Keys like 'mod+k', 'ctrl+/', '?', 'escape', 'g d'
 */
export function useHotkeys(map) {
  const mapRef = useRef(map)
  mapRef.current = map

  useEffect(() => {
    const handler = (e) => {
      if (isInputTarget(e.target)) return

      const parts = []
      if (e.metaKey || e.ctrlKey) parts.push('mod')
      if (e.altKey) parts.push('alt')
      if (e.shiftKey) parts.push('shift')

      let key = e.key.toLowerCase()
      if (key === ' ') key = 'space'
      if (key === 'arrowup') key = 'up'
      if (key === 'arrowdown') key = 'down'
      if (key === 'arrowleft') key = 'left'
      if (key === 'arrowright') key = 'right'
      parts.push(key)

      const combo = parts.join('+')
      const action = mapRef.current[combo] || mapRef.current[key]

      if (action) {
        e.preventDefault()
        action(e)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}

/**
 * Sequence shortcuts: press 'g' then 'd' within 800ms.
 */
export function useSequentialHotkeys(sequences) {
  const last = useRef(0)
  const pending = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (isInputTarget(e.target)) return
      const now = Date.now()
      const key = e.key.toLowerCase()

      if (pending.current && now - last.current < 800) {
        const combo = `${pending.current} ${key}`
        const action = sequences[combo]
        if (action) {
          e.preventDefault()
          action()
        }
        pending.current = null
        return
      }

      if (Object.keys(sequences).some(s => s.startsWith(key + ' '))) {
        pending.current = key
        last.current = now
        setTimeout(() => {
          if (Date.now() - last.current >= 800) pending.current = null
        }, 850)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [sequences])
}

export default useHotkeys