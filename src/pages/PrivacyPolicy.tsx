import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-white mb-4">Gizlilik Politikası</h1>
          <p className="text-[var(--color-text-secondary)] mb-8">Son Güncelleme: 2 Ocak 2025</p>

          <div className="prose prose-invert max-w-none space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Genel Bilgiler</h2>
              <p className="text-[var(--color-text-secondary)]">
                Tercih Robotu, ünvan değişikliği sınavı için bir simülasyon ve tahmin uygulamasıdır. 
                Bu uygulama resmi bir kurum tarafından işletilmemektedir ve üretilen sonuçlar{' '}
                <strong className="text-white">bağlayıcı değildir</strong>.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Toplanan Veriler</h2>
              <p className="text-[var(--color-text-secondary)] mb-4">Uygulamamız aşağıdaki verileri toplar:</p>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2">
                <li><strong className="text-white">Email Adresi:</strong> Giriş ve hesap yönetimi için</li>
                <li><strong className="text-white">Ad Soyad:</strong> Sıralama listesinde görüntülemek için</li>
                <li><strong className="text-white">Yazılı Puan:</strong> Simülasyon hesaplamaları için</li>
                <li><strong className="text-white">Mülakat Puanı:</strong> Simülasyon hesaplamaları için</li>
                <li><strong className="text-white">Şehir Tercihleri:</strong> Yerleştirme simülasyonu için</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Verilerin Kullanım Amacı</h2>
              <p className="text-[var(--color-text-secondary)] mb-4">Toplanan veriler sadece aşağıdaki amaçlarla kullanılır:</p>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2">
                <li>✅ Yerleştirme simülasyonu çalıştırmak</li>
                <li>✅ Sıralama ve sonuçları göstermek</li>
                <li>✅ Kullanıcı kimlik doğrulaması</li>
                <li>❌ Üçüncü şahıslarla paylaşılmaz</li>
                <li>❌ Ticari amaçla kullanılmaz</li>
                <li>❌ Reklam amaçlı kullanılmaz</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Veri Güvenliği</h2>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Verileriniz{' '}
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
                  Supabase
                </a>{' '}
                altyapısında saklanır ve şu güvenlik önlemleri uygulanır:
              </p>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2">
                <li>✅ HTTPS şifrelemesi</li>
                <li>✅ Row Level Security (RLS) politikaları</li>
                <li>✅ Şifrelerin hash'lenerek saklanması</li>
                <li>✅ Düzenli güvenlik güncellemeleri</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Veri Sahibinin Hakları (KVKK)</h2>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Türkiye Cumhuriyeti vatandaşları olarak aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2 mb-4">
                <li>📋 Verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>📄 İşlenmişse buna ilişkin bilgi talep etme</li>
                <li>🗑️ Verilerinizin silinmesini veya yok edilmesini isteme</li>
                <li>✏️ Verilerinizin düzeltilmesini isteme</li>
                <li>🚫 İşlemeye itiraz etme</li>
              </ul>
              <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-lg p-4">
                <p className="text-[var(--color-accent)] font-semibold mb-1">Haklarınızı kullanmak için:</p>
                <p className="text-[var(--color-accent)]">kilincseyfettin3@gmail.com</p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Çerezler (Cookies)</h2>
              <p className="text-[var(--color-text-secondary)]">
                Uygulamamız sadece oturum yönetimi için gerekli çerezleri kullanır. 
                Reklam veya takip çerezi kullanılmaz.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Üçüncü Taraf Hizmetler</h2>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2 mb-4">
                <li><strong className="text-white">Supabase:</strong> Veritabanı ve kimlik doğrulama</li>
                <li><strong className="text-white">GitHub Pages:</strong> Hosting</li>
              </ul>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Bu hizmetlerin kendi gizlilik politikaları geçerlidir.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Sorumluluk Reddi</h2>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Bu uygulama <strong className="text-white">eğitim ve bilgilendirme amaçlıdır</strong>. Üretilen sonuçlar:
              </p>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2 mb-4">
                <li>❌ Resmi değildir</li>
                <li>❌ Bağlayıcı değildir</li>
                <li>❌ Garanti verilmez</li>
                <li>ℹ️ Sadece tahmindir</li>
              </ul>
              <p className="text-[var(--color-text-secondary)]">
                Resmi sonuçlar için ilgili kamu kurumuna başvurunuz.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Değişiklikler</h2>
              <p className="text-[var(--color-text-secondary)]">
                Bu gizlilik politikası zaman zaman güncellenebilir. Güncellemeler bu sayfada yayınlanacaktır.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. İletişim</h2>
              <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-4">
                <p className="text-white">
                  <strong>Sorularınız için:</strong> kilincseyfettin3@gmail.com
                </p>
              </div>
            </section>

            <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 mt-8">
              <p className="text-amber-400 text-sm">
                <strong>Yasal Uyarı:</strong> Bu uygulama açık kaynak kodlu olarak geliştirilmiştir ve 
                "OLDUĞU GİBİ" sunulmaktadır. Geliştiriciler, uygulamanın kullanımından doğabilecek 
                herhangi bir zarardan sorumlu değildir.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
            <Link
              to="/"
              className="text-[var(--color-accent)] hover:underline font-medium"
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

