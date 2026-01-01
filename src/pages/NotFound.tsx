import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg-primary)]">
      <div className="text-center max-w-md">
        <div className="mb-8 animate-bounce-slow">
          <span className="text-9xl">🤖</span>
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold text-white mb-4">
          Sayfa Bulunamadı
        </h2>
        
        <p className="text-[var(--color-text-secondary)] mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir. 
          Lütfen URL'yi kontrol edin veya ana sayfaya dönün.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="btn-primary px-6 py-3"
          >
            🏠 Ana Sayfaya Dön
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-[var(--color-bg-tertiary)] text-white rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-all font-medium"
          >
            ← Geri Git
          </button>
        </div>

        <div className="mt-8 p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
          <p className="text-sm text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-accent)] font-medium">İpucu:</span> Eğer bir hata olduğunu düşünüyorsanız, lütfen yöneticinize bildirin.
          </p>
        </div>
      </div>
    </div>
  )
}

