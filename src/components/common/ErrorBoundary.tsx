import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg-primary)]">
          <div className="text-center max-w-lg">
            <div className="mb-8">
              <span className="text-9xl">💥</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Bir Hata Oluştu
            </h1>
            
            <p className="text-[var(--color-text-secondary)] mb-6">
              Üzgünüz, beklenmedik bir hata meydana geldi. 
              Lütfen sayfayı yenileyin veya ana sayfaya dönün.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
                <p className="text-sm font-mono text-red-400 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="btn-primary px-6 py-3"
              >
                🏠 Ana Sayfaya Dön
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[var(--color-bg-tertiary)] text-white rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-all font-medium"
              >
                🔄 Sayfayı Yenile
              </button>
            </div>

            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-400">
                <strong>Not:</strong> Eğer bu hata devam ederse, lütfen yöneticinize bildirin.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

