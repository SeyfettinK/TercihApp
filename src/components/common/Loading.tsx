export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="text-6xl animate-bounce">🤖</div>
          <div className="w-16 h-16 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin absolute -top-2 -left-2 opacity-50"></div>
        </div>
        <p className="mt-6 text-[var(--color-text-secondary)] text-sm font-medium">Robot hazırlanıyor...</p>
      </div>
    </div>
  )
}
