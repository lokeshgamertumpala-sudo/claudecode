import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Rocket, Home, Satellite } from 'lucide-react'

export default function NotFound() {
  const location = useLocation()

  useEffect(() => {
    document.title = 'Page Not Found | ORBITFORGE AI'
  }, [])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-6 border-4 border-accent/30 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Satellite className="w-12 h-12 text-primary/50 animate-float" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-foreground mb-2 font-mono">404</h1>
        <p className="text-xs font-mono text-muted-foreground mb-6 break-all">
          TARGET_NOT_FOUND: {location.pathname}
        </p>

        <h2 className="text-xl font-semibold text-foreground mb-2">Trajectory off course</h2>
        <p className="text-muted-foreground mb-8">
          The requested orbital path could not be resolved. It may have been decommissioned, or the coordinates are incorrect.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary inline-flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Return to Dashboard
          </Link>
          <Link to="/mission-designer" className="btn-secondary inline-flex items-center justify-center gap-2">
            <Rocket className="w-4 h-4" /> Mission Designer
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="font-mono text-foreground">VELOCITY</p>
            <p className="mt-1">7.66 km/s</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="font-mono text-foreground">ALTITUDE</p>
            <p className="mt-1">408 km LEO</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="font-mono text-foreground">STATUS</p>
            <p className="mt-1 text-warning">OFF TARGET</p>
          </div>
        </div>
      </div>
    </div>
  )
}