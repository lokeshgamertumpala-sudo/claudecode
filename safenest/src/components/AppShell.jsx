import React from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './ui/TopBar'
import Dock from './ui/Dock'

const AppShell = () => {
  return (
    <div className="app-shell min-h-screen flex flex-column bg-gradient-to-br from-[var(--background-gradient-start)] to-[var(--background-gradient-end)] text-[var(--text-primary)] font-[var(--font-family)]">
      <TopBar />
      <main className="flex-1 w-full px-6">
        <Outlet />
      </main>
      <Dock />
    </div>
  )
}

export default AppShell
