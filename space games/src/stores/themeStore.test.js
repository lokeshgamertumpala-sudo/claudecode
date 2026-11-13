import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useThemeStore } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'dark' })
  })

  describe('setTheme', () => {
    it('sets a specific theme', () => {
      const { setTheme } = useThemeStore.getState()
      setTheme('light')
      expect(useThemeStore.getState().theme).toBe('light')
    })
  })

  describe('toggleTheme', () => {
    it('toggles from dark to light', () => {
      const { toggleTheme } = useThemeStore.getState()
      expect(useThemeStore.getState().theme).toBe('dark')
      toggleTheme()
      expect(useThemeStore.getState().theme).toBe('light')
    })

    it('toggles from light to dark', () => {
      const { toggleTheme } = useThemeStore.getState()
      toggleTheme() // dark -> light
      toggleTheme() // light -> dark
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('returns a function reference that reads latest state (no stale closure)', () => {
      const { toggleTheme } = useThemeStore.getState()
      toggleTheme()
      toggleTheme()
      toggleTheme()
      expect(useThemeStore.getState().theme).toBe('light')
    })
  })

  describe('persistence', () => {
    it('uses localStorage under the orbitforge-theme key', () => {
      const key = useThemeStore.persist.getOptions().name
      expect(key).toBe('orbitforge-theme')
    })
  })

  describe('DOM side effects', () => {
    it('toggles the dark class on documentElement', () => {
      const { setTheme } = useThemeStore.getState()
      setTheme('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      setTheme('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })
})