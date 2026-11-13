import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Cube,
  Target,
  Activity,
  BarChart3,
  Image,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Bell,
  HelpCircle,
  Download,
  Upload,
  Save,
  Info
} from 'lucide-react'
import { useUIStore } from '@/stores'
import { useSpacecraftStore } from '@/stores/spacecraftStore'
import { useMissionStore } from '@/stores/missionStore'
import { generateExportData, downloadExportData, generateMissionReport, downloadMissionReport } from '@/services'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Spacecraft', href: '/spacecraft', icon: Cube },
  { name: 'Mission', href: '/mission', icon: Target },
  { name: 'Simulation', href: '/simulation', icon: Activity },
  { name: 'Analysis', href: '/analysis', icon: BarChart3 },
  { name: 'Sketch AI', href: '/sketch', icon: Image },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Layout() {
  const location = useLocation()
  const { sidebarOpen, toggleSidebar, settings, updateSettings, addNotification } = useUIStore()
  const { currentConfig, components } = useSpacecraftStore()
  const { currentMission } = useMissionStore()
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportType, setExportType] = useState<'json' | 'report'>('json')

  const handleExport = async (type: 'json' | 'report') => {
    if (!currentConfig || !currentMission) {
      addNotification({
        type: 'warning',
        title: 'No Data',
        message: 'Create a spacecraft and mission first',
      })
      return
    }

    try {
      const exportData = generateExportData(currentConfig, currentMission, {
        isRunning: false,
        isPaused: false,
        timeScale: 100,
        currentTime: 0,
        orbitalState: null,
        trajectory: [],
        events: []
      })

      if (type === 'json') {
        downloadExportData(exportData, `${currentMission.name}-${Date.now()}.json`)
        addNotification({ type: 'success', title: 'Exported', message: 'Mission data exported as JSON' })
      } else {
        const report = generateMissionReport(exportData)
        downloadMissionReport(report, `${currentMission.name}-report-${Date.now()}.md`)
        addNotification({ type: 'success', title: 'Exported', message: 'Mission report exported as Markdown' })
      }
    } catch (error) {
      addNotification({ type: 'error', title: 'Export Failed', message: String(error) })
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-space-900/80 border-r border-space-800 backdrop-blur-lg transition-all duration-300 flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-space-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-amber-500 flex items-center justify-center">
              <Cube className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg text-white gradient-text">ORBITFORGE</span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-space-400 hover:text-white hover:bg-space-800 transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-500/10 text-accent-400 border-l-2 border-accent-500'
                    : 'text-space-400 hover:text-white hover:bg-space-800/50'
                }`}
                title={sidebarOpen ? undefined : item.name}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-space-800 space-y-2">
          {sidebarOpen && (
            <div className="space-y-2">
              <button
                onClick={() => handleExport('json')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-space-300 hover:text-white hover:bg-space-800 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => handleExport('report')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-space-300 hover:text-white hover:bg-space-800 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>Export Report</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className="p-2 rounded-lg text-space-400 hover:text-white hover:bg-space-800 transition-colors"
              title={settings.theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {settings.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {sidebarOpen && (
              <span className="text-xs text-space-500">{settings.theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex-shrink-0 bg-space-900/80 border-b border-space-800 backdrop-blur-lg flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-space-400 hover:text-white hover:bg-space-800 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-white truncate">
              {navigation.find(n => location.pathname === n.href)?.name || 'ORBITFORGE AI'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-space-800 rounded-lg border border-space-700 text-xs text-space-400">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>System Nominal</span>
            </div>
            <button className="p-2 rounded-lg text-space-400 hover:text-white hover:bg-space-800 transition-colors" title="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg text-space-400 hover:text-white hover:bg-space-800 transition-colors" title="Help">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg text-space-400 hover:text-white hover:bg-space-800 transition-colors" title="Info">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}