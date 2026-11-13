import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Rocket } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  mission: Rocket,
}

const STYLES = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-primary/30 bg-primary/10 text-primary',
  mission: 'border-accent/30 bg-accent/10 text-accent',
}

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const add = useCallback((message, options = {}) => {
    const { type = 'info', title, duration = 5000, action, actionLabel } = options
    const id = ++idCounter
    const toast = { id, message, type, title, action, actionLabel }

    setToasts(prev => [...prev.slice(-4), toast])

    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  const toast = useCallback({
    success: (message, options) => add(message, { ...options, type: 'success' }),
    error: (message, options) => add(message, { ...options, type: 'error' }),
    warning: (message, options) => add(message, { ...options, type: 'warning' }),
    info: (message, options) => add(message, { ...options, type: 'info' }),
    mission: (message, options) => add(message, { ...options, type: 'mission' }),
    dismiss,
  }, [add, dismiss])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div
          className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
          role="region"
          aria-label="Notifications"
        >
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info
  const style = STYLES[toast.type] || STYLES.info

  return (
    <div
      className={`pointer-events-auto glass border rounded-xl p-4 shadow-xl backdrop-blur-md
        animate-[toast-in_0.3s_ease-out] ${style}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="font-semibold text-sm text-foreground mb-0.5">{toast.title}</p>
          )}
          <p className="text-sm text-muted-foreground break-words">{toast.message}</p>
          {toast.action && (
            <button
              onClick={() => {
                toast.action()
                onDismiss()
              }}
              className="mt-2 text-xs font-medium text-primary hover:underline"
            >
              {toast.actionLabel || 'Action'}
            </button>
          )}
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Safe no-op outside provider
    const noop = () => () => {}
    const api = () => () => {}
    return {
      success: api, error: api, warning: api, info: api, mission: api, dismiss: noop,
    }
  }
  return ctx
}

export default ToastProvider