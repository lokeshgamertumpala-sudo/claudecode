import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import AppShell from './components/AppShell'
import { AlertProvider } from './state/useAlertStore.jsx'
import Home from './pages/Home'
import GlassCard from './components/ui/GlassCard'
import CircleButton from './components/ui/CircleButton'
import PillButton from './components/ui/PillButton'
import TopBar from './components/ui/TopBar'
import Dock from './components/ui/Dock'

// UI Kit route to display all components (keep for development)
const UIKit = () => {
  return (
    <GlassCard className="w-full max-w-md mx-auto mt-16 p-8">
      <h2 className="text-xl font-weight-semibold mb-8">UI Kit Preview</h2>
      <div className="flex-column gap-8">
        <div>
          <h3 className="font-weight-medium mb-8">GlassCard</h3>
          <GlassCard className="p-8">
            <p className="text-muted">This is a glass card component.</p>
          </GlassCard>
        </div>

        <div>
          <h3 className="font-weight-medium mb-8">CircleButton</h3>
          <div className="flex gap-8">
            <CircleButton variant="default" size="md">
              Default
            </CircleButton>
            <CircleButton variant="primary" size="md">
              Primary
            </CircleButton>
            <CircleButton variant="amber" size="md">
              Amber
            </CircleButton>
            <CircleButton variant="coral" size="md">
              Coral
            </CircleButton>
          </div>
        </div>

        <div>
          <h3 className="font-weight-medium mb-8">PillButton</h3>
          <div className="flex flex-wrap gap-8">
            <PillButton variant="default" size="md">
              Default
            </PillButton>
            <PillButton variant="primary" size="md">
              Primary
            </PillButton>
            <PillButton variant="amber" size="md">
              Amber
            </PillButton>
            <PillButton variant="coral" size="md">
              Coral
            </PillButton>
          </div>
        </div>

        <div>
          <h3 className="font-weight-medium mb-8">TopBar</h3>
          <TopBar onClick={() => alert('Status clicked!')} statusLabel="Check status" />
        </div>

        <div>
          <h3 className="font-weight-medium mb-8">Dock</h3>
          <Dock>
            <CircleButton variant="primary" size="lg">
              <span className="text-xl">⚙️</span>
            </CircleButton>
            <CircleButton variant="amber" size="lg">
              <span className="text-xl">📊</span>
            </CircleButton>
            <CircleButton variant="coral" size="lg">
              <span className="text-xl">🚨</span>
            </CircleButton>
          </Dock>
        </div>
      </div>
    </GlassCard>
  )
}

const App = () => {
  return (
    <AlertProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dev/ui-kit" element={<UIKit />} />
          {/* Placeholder for other routes: /home, /ai, /family */}
          <Route path="*" element={<div className="flex flex-col items-center justify-center flex-1 text-center p-8">
            <h2 className="text-xl font-semibold">404</h2>
            <p className="text-muted">Page not found</p>
          </div>} />
        </Routes>
      </AppShell>
    </AlertProvider>
  )
}

export default App
