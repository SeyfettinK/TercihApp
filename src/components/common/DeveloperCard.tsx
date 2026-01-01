export default function DeveloperCard() {
  return (
    <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-2xl hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)] transition-all duration-300 hover:scale-105 backdrop-blur-sm">
        <div className="px-5 py-4 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">BM</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--color-bg-secondary)]"></div>
          </div>
          
          {/* Info */}
          <div className="flex flex-col">
            <span className="text-[var(--color-text-tertiary)] text-xs font-medium uppercase tracking-wide">
              Geliştiren
            </span>
            <span className="text-white font-semibold text-sm leading-tight">
              Bilgisayar Mühendisi
            </span>
            <span className="text-[var(--color-accent)] font-bold text-base leading-tight">
              Seyfettin Kılınç
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

