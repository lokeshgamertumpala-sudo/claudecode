import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'orbitforge-theme' }
  )
)

if (typeof window !== 'undefined') {
  const { theme } = useThemeStore.getState()
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

useThemeStore.subscribe((state) => {
  if (typeof window !== 'undefined') {
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
  }
})