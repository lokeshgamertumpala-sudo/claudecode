import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import {
  Search,
  LayoutDashboard,
  Rocket,
  Cpu,
  Bot,
  BarChart3,
  Settings,
  CornerDownLeft,
  Command,
} from 'lucide-react'
import { useMissionStore } from '../stores/missionStore'
import { useEngineeringStore } from '../stores/engineeringStore'

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const { missions } = useMissionStore()
  const { runSimulation } = useEngineeringStore()

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const items = useMemo(() => {
    const nav = [
      { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, group: 'Navigation', run: () => navigate('/dashboard') },
      { id: 'nav-mission', label: 'Go to Mission Designer', icon: Rocket, group: 'Navigation', run: () => navigate('/mission-designer') },
      { id: 'nav-sim', label: 'Go to Engineering Sim', icon: Cpu, group: 'Navigation', run: () => navigate('/engineering-sim') },
      { id: 'nav-ai', label: 'Go to AI Copilot', icon: Bot, group: 'Navigation', run: () => navigate('/ai-copilot') },
      { id: 'nav-analytics', label: 'Go to Analytics', icon: BarChart3, group: 'Navigation', run: () => navigate('/analytics') },
      { id: 'nav-settings', label: 'Go to Settings', icon: Settings, group: 'Navigation', run: () => navigate('/settings') },
      {
        id: 'action-simulate', label: 'Run Engineering Simulation', icon: Cpu, group: 'Actions',
        run: async () => { navigate('/engineering-sim'); await runSimulation() },
      },
    ]

    const missionItems = missions.slice(0, 8).map(m => ({
      id: `mission-${m.id}`,
      label: m.name,
      hint: `${m.destination} · ${m.status}`,
      icon: Rocket,
      group: 'Missions',
      run: () => navigate('/mission-designer'),
    }))

    return [...nav, ...missionItems]
  }, [navigate, missions, runSimulation])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(i =>
      i.label.toLowerCase().includes(q) ||
      i.group.toLowerCase().includes(q) ||
      (i.hint && i.hint.toLowerCase().includes(q))
    )
  }, [items, query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose?.() }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter') {
        e.preventDefault()
        const item = filtered[activeIndex]
        if (item) { item.run(); onClose?.() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, filtered, activeIndex, onClose])

  if (!open) return null

  const groups = filtered.reduce((acc, item, i) => {
    acc[item.group] = acc[item.group] || []
    acc[item.group].push({ ...item, flatIndex: i })
    return acc
  }, {})

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-start justify-center pt-[12vh] p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className="w-full max-w-xl glass rounded-2xl border border-border shadow-2xl overflow-hidden animate-[slideUp_0.2s_ease-out]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search missions, navigate, run actions..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded border border-border bg-muted text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="text-center py-8 text-sm text-muted-foreground">No results for "{query}"</p>
          )}
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-2">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </p>
              {items.map(item => (
                <button
                  key={item.id}
                  onMouseEnter={() => setActiveIndex(item.flatIndex)}
                  onClick={() => { item.run(); onClose?.() }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    item.flatIndex === activeIndex ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-sm truncate">{item.label}</span>
                  {item.hint && <span className="text-xs text-muted-foreground/70 truncate max-w-[40%]">{item.hint}</span>}
                  {item.flatIndex === activeIndex && <CornerDownLeft className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Command className="w-3 h-3" /> ORBITFORGE Command Palette
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> select</span>
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}