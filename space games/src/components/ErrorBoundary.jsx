import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleHome = () => {
    window.location.href = '/dashboard'
  }

  handleReport = () => {
    const { error, errorInfo } = this.state
    const report = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }
    navigator.clipboard.writeText(JSON.stringify(report, null, 2))
    alert('Error report copied to clipboard. Please share with support.')
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              We encountered an unexpected error. Your mission data is safe.
            </p>

            <details className="text-left mb-6 p-4 bg-muted rounded-lg text-xs font-mono text-muted-foreground">
              <summary className="cursor-pointer mb-2 font-medium text-foreground">Error Details</summary>
              <pre className="overflow-auto max-h-40">{this.state.error?.message}</pre>
              <pre className="overflow-auto max-h-40 mt-2">{this.state.errorInfo?.componentStack}</pre>
            </details>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={this.handleHome}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> Dashboard
              </button>
              <button
                onClick={this.handleReport}
                className="btn-outline flex items-center justify-center gap-2"
              >
                <Bug className="w-4 h-4" /> Report Bug
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary