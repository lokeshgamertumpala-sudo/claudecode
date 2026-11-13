import { useState, useEffect } from 'react'
import { Loader2, Rocket, Star } from 'lucide-react'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div
            className="absolute inset-0 border-4 border-primary rounded-full"
            style={{
              clipPath: `polygon(50% 0%, 100% 0%, 100% ${progress}%, 50% ${progress}%)`,
              transform: 'rotate(-90deg)'
            }}
          />
          <div className="absolute inset-4 flex items-center justify-center">
            <Rocket className="w-12 h-12 text-primary animate-float" />
          </div>
          {[0, 120, 240].map(angle => (
            <Star
              key={angle}
              className="absolute w-4 h-4 text-primary/50"
              style={{
                transform: `rotate(${angle}deg) translateY(-60px) rotate(${-angle}deg)`,
                animation: `orbit ${8 + angle / 100}s linear infinite`
              }}
            />
          ))}
        </div>
        <p className="text-lg font-medium text-foreground mb-4">Initializing ORBITFORGE AI...</p>
        <div className="w-64 mx-auto h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground font-mono">{Math.floor(progress)}%</p>
      </div>
      <style jsx global>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateY(-60px) rotate(0deg); }
          to { transform: rotate(360deg) translateY(-60px) rotate(-360deg); }
        }
      `}</style>
    </div>
  )
}