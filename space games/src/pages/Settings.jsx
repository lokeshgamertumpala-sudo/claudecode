import { useState } from 'react'
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Globe,
  Key,
  Save,
  Loader2,
  Moon,
  Sun,
  Monitor,
  HardDrive,
  Cloud as CloudIcon,
  Wifi,
  Cpu,
  MemoryStick
} from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'

export default function Settings() {
  const { theme, toggleTheme, setTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    missionUpdates: true,
    simulationComplete: true,
    weeklyReport: false,
  })
  const [preferences, setPreferences] = useState({
    units: 'metric',
    dateFormat: 'ISO',
    autoSave: true,
    telemetry: true,
    animations: true,
  })
  const [account, setAccount] = useState({
    name: 'Mission Director',
    email: 'director@orbitforge.ai',
    organization: 'ORBITFORGE Aerospace',
    role: 'Lead Systems Engineer',
  })

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'advanced', label: 'Advanced', icon: Cpu },
  ]

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your ORBITFORGE experience</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="border-b border-border p-4 overflow-x-auto">
          <nav className="tabs min-w-max" role="tablist">
            {tabs.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab ${activeTab === tab.id ? 'tab-active' : ''} flex items-center gap-2 px-4 py-3`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">Account Information</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" value={account.name} onChange={e => setAccount({...account, name: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={account.email} onChange={e => setAccount({...account, email: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">Organization</label>
                  <input type="text" value={account.organization} onChange={e => setAccount({...account, organization: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select value={account.role} onChange={e => setAccount({...account, role: e.target.value})} className="input">
                    <option value="Lead Systems Engineer">Lead Systems Engineer</option>
                    <option value="Mission Director">Mission Director</option>
                    <option value="Propulsion Engineer">Propulsion Engineer</option>
                    <option value="Orbital Analyst">Orbital Analyst</option>
                    <option value="Project Manager">Project Manager</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <Palette className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Theme</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {['dark', 'light', 'system'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === t ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t === 'dark' ? 'bg-gray-900' : t === 'light' ? 'bg-gray-100' : 'bg-gradient-to-br from-gray-900 to-gray-100'}`}>
                        {t === 'dark' && <Moon className="w-6 h-6 text-yellow-400" />}
                        {t === 'light' && <Sun className="w-6 h-6 text-amber-500" />}
                        {t === 'system' && <Monitor className="w-6 h-6 text-blue-400" />}
                      </div>
                      <span className="font-medium capitalize">{t}</span>
                      <span className="text-xs text-muted-foreground">
                        {t === 'dark' ? 'Dark mode' : t === 'light' ? 'Light mode' : 'Follow system'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <Palette className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">Display Preferences</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Units System</label>
                    <select value={preferences.units} onChange={e => setPreferences({...preferences, units: e.target.value})} className="input">
                      <option value="metric">Metric (SI)</option>
                      <option value="imperial">Imperial</option>
                      <option value="dual">Dual Display</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Date Format</label>
                    <select value={preferences.dateFormat} onChange={e => setPreferences({...preferences, dateFormat: e.target.value})} className="input">
                      <option value="ISO">ISO 8601 (YYYY-MM-DD)</option>
                      <option value="US">US (MM/DD/YYYY)</option>
                      <option value="EU">EU (DD/MM/YYYY)</option>
                      <option value="MILITARY">Military (DD MMM YYYY)</option>
                    </select>
                  </div>
                  <label className="flex items-center justify-between p-4 glass rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                    <div>
                      <p className="font-medium">Enable Animations</p>
                      <p className="text-sm text-muted-foreground">Smooth transitions and micro-interactions</p>
                    </div>
                    <button type="button" role="switch" aria-checked={preferences.animations} onClick={() => setPreferences({...preferences, animations: !preferences.animations})} className={`relative w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${preferences.animations ? 'bg-primary' : 'bg-border'}`}>
                      <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200" style={{ transform: preferences.animations ? 'translateX(20px)' : 'translateX(0)' }} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between p-4 glass rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                    <div>
                      <p className="font-medium">Auto-save Changes</p>
                      <p className="text-sm text-muted-foreground">Automatically persist form changes</p>
                    </div>
                    <button type="button" role="switch" aria-checked={preferences.autoSave} onClick={() => setPreferences({...preferences, autoSave: !preferences.autoSave})} className={`relative w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${preferences.autoSave ? 'bg-primary' : 'bg-border'}`}>
                      <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200" style={{ transform: preferences.autoSave ? 'translateX(20px)' : 'translateX(0)' }} />
                    </button>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">Email Notifications</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between p-4 glass rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                    <div>
                      <p className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</p>
                    </div>
                    <button type="button" role="switch" aria-checked={value} onClick={() => setNotifications({...notifications, [key]: !value})} className={`relative w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${value ? 'bg-primary' : 'bg-border'}`}>
                      <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200" style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }} />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">Data Management</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 glass rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                  <div>
                    <p className="font-medium">Telemetry Collection</p>
                    <p className="text-sm text-muted-foreground">Send anonymous usage data to improve ORBITFORGE</p>
                  </div>
                  <button type="button" role="switch" aria-checked={preferences.telemetry} onClick={() => setPreferences({...preferences, telemetry: !preferences.telemetry})} className={`relative w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${preferences.telemetry ? 'bg-primary' : 'bg-border'}`}>
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200" style={{ transform: preferences.telemetry ? 'translateX(20px)' : 'translateX(0)' }} />
                  </button>
                </label>
                <div className="flex items-center justify-between p-4 glass rounded-xl">
                  <div>
                    <p className="font-medium">Export All Data</p>
                    <p className="text-sm text-muted-foreground">Download a complete backup of your missions and settings</p>
                  </div>
                  <button className="btn-secondary btn-sm flex items-center gap-2"><HardDrive className="w-4 h-4" /> Export</button>
                </div>
                <div className="flex items-center justify-between p-4 glass rounded-xl border-destructive/30">
                  <div>
                    <p className="font-medium text-destructive">Delete All Data</p>
                    <p className="text-sm text-muted-foreground">Permanently remove all missions, simulations, and preferences</p>
                  </div>
                  <button className="btn-destructive btn-sm flex items-center gap-2"><HardDrive className="w-4 h-4" /> Delete</button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4 mt-6">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">Privacy</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Mission data is stored locally in your browser</p>
                <p>• No data is sent to external servers without consent</p>
                <p>• Telemetry is anonymized and aggregated</p>
                <p>• You can request data deletion at any time</p>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">External Services</h3>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'NASA Horizons API', desc: 'Ephemeris data for celestial bodies', icon: Globe, connected: true },
                  { name: 'SPICE Toolkit', desc: 'Geometry and ephemeris computations', icon: Cpu, connected: false },
                  { name: 'GMAT', desc: 'General Mission Analysis Tool', icon: Wifi, connected: false },
                  { name: 'STK', desc: 'Systems Tool Kit integration', icon: CloudIcon, connected: false },
                  { name: 'JPL DE440', desc: 'Planetary ephemeris data', icon: Database, connected: true },
                ].map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-4 glass rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <service.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.desc}</p>
                      </div>
                    </div>
                    <span className={`badge ${service.connected ? 'badge-success' : 'badge-ghost'}`}>
                      {service.connected ? 'Connected' : 'Connect'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-4 mt-6">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">API Keys</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="label">NASA API Key</label>
                  <input type="password" placeholder="Enter API key" className="input" />
                </div>
                <div>
                  <label className="label">SPICE Kernel Path</label>
                  <input type="text" placeholder="/path/to/kernels" className="input" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">Performance</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">3D Render Quality</label>
                  <select className="input">
                    <option value="low">Low (Better Performance)</option>
                    <option value="medium" selected>Medium (Balanced)</option>
                    <option value="high">High (Best Visuals)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Max Simulation Steps</label>
                  <input type="number" value="10000" className="input" />
                </div>
                <div>
                  <label className="label">Cache Size</label>
                  <select className="input">
                    <option value="100">100 MB</option>
                    <option value="500" selected>500 MB</option>
                    <option value="1000">1 GB</option>
                    <option value="2000">2 GB</option>
                  </select>
                </div>
                <div>
                  <label className="label">Worker Threads</label>
                  <input type="number" value="4" min="1" max="16" className="input" />
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4 mt-6">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <MemoryStick className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg">Developer Options</h3>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 glass rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                  <div>
                    <p className="font-medium">Debug Mode</p>
                    <p className="text-sm text-muted-foreground">Show debug panels and console logging</p>
                  </div>
                  <button type="button" role="switch" aria-checked={false} onClick={() => {}} className="relative w-11 h-6 rounded-full bg-border transition-colors"><span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" /></button>
                </label>
                <label className="flex items-center justify-between p-4 glass rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                  <div>
                    <p className="font-medium">Show FPS Counter</p>
                    <p className="text-sm text-muted-foreground">Display frame rate in 3D view</p>
                  </div>
                  <button type="button" role="switch" aria-checked={false} onClick={() => {}} className="relative w-11 h-6 rounded-full bg-border transition-colors"><span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" /></button>
                </label>
                <label className="flex items-center justify-between p-4 glass rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                  <div>
                    <p className="font-medium">Enable Hot Reload</p>
                    <p className="text-sm text-muted-foreground">Auto-refresh on code changes (dev only)</p>
                  </div>
                  <button type="button" role="switch" aria-checked={true} onClick={() => {}} className="relative w-11 h-6 rounded-full bg-primary transition-colors"><span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" style={{ transform: 'translateX(20px)' }} /></button>
                </label>
                <div className="flex items-center justify-between p-4 glass rounded-xl">
                  <div>
                    <p className="font-medium">Clear All Caches</p>
                    <p className="text-sm text-muted-foreground">Free up storage space by clearing cached data</p>
                  </div>
                  <button className="btn-secondary">Clear</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-border">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}