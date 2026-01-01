import { Link } from 'react-router-dom'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-white mb-4">Kullanım Şartları</h1>
          <p className="text-[var(--color-text-secondary)] mb-8">Son Güncelleme: 2 Ocak 2025</p>

          <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 mb-8">
            <p className="text-amber-400 font-bold text-lg mb-2">⚠️ ÖNEMLİ UYARI</p>
            <p className="text-amber-400">
              <strong>BU UYGULAMA RESMİ BİR HİZMET DEĞİLDİR!</strong> Tercih Robotu, ünvan değişikliği 
              sınavı yerleştirme sürecini <strong>simüle etmek</strong> amacıyla geliştirilmiş{' '}
              <strong>bağımsız</strong>, <strong>gayri resmi</strong> ve <strong>açık kaynak</strong> bir yazılımdır.
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Hizmetin Niteliği</h2>
              
              <h3 className="text-xl font-semibold text-white mb-2">1.1 Simülasyon ve Tahmin</h3>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2 mb-4">
                <li>Bu uygulama <strong className="text-white">sadece simülasyon ve tahmin</strong> amaçlıdır</li>
                <li>Hiçbir resmi kurum veya kuruluşla bağlantısı yoktur</li>
                <li>Üretilen sonuçlar <strong className="text-white">bağlayıcı değildir</strong></li>
                <li>Resmi sonuçlar için ilgili kamu kurumuna başvurunuz</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2">1.2 Açık Kaynak</h3>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2">
                <li>Kaynak kodu açıktır ve GitHub'da mevcuttur</li>
                <li>Topluluk katkılarına açıktır</li>
                <li>Ticari amaçla kullanılmamaktadır</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Kullanıcı Sorumlulukları</h2>
              
              <h3 className="text-xl font-semibold text-white mb-2">2.1 Doğru Bilgi Girişi</h3>
              <p className="text-[var(--color-text-secondary)] mb-2">Kullanıcılar olarak:</p>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2 mb-4">
                <li>✅ Kendi puanlarınızı doğru girmelisiniz</li>
                <li>✅ Tercihlerinizi kendi isteğinizle yapmalısınız</li>
                <li>❌ Başkalarının bilgilerini girmemelisiniz</li>
                <li>❌ Sistemde manipülasyon yapmamalısınız</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2">2.2 Şeffaflık</h3>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2 mb-4">
                <li>Tüm kullanıcılar birbirlerinin puanlarını ve tercihlerini görebilir</li>
                <li>Bu şeffaf bir sistemdir ve amaçlanmıştır</li>
                <li>Gizlilik beklememelisiniz (puanlar ve tercihler herkese açık)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2">2.3 Yasal Kullanım</h3>
              <p className="text-[var(--color-text-secondary)] mb-2">Bu uygulamayı kullanarak:</p>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2">
                <li>Türkiye Cumhuriyeti yasalarına uymayı kabul edersiniz</li>
                <li>Uygulamayı kötü amaçlı kullanmamayı taahhüt edersiniz</li>
                <li>Diğer kullanıcıların haklarına saygı gösterirsiniz</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Sorumluluk Reddi</h2>
              
              <h3 className="text-xl font-semibold text-white mb-2">3.1 Sonuçlar İçin Sorumluluk</h3>
              <p className="text-[var(--color-text-secondary)] mb-2">Geliştiriciler ve uygulama işleticileri:</p>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2 mb-4">
                <li>❌ Simülasyon sonuçlarının doğruluğunu garanti etmez</li>
                <li>❌ Resmi sonuçlarla uyum sağlanacağını taahhüt etmez</li>
                <li>❌ Kararlarınızdan sorumlu değildir</li>
                <li>❌ Maddi veya manevi zararlardan sorumlu tutulamaz</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2">3.2 Teknik Sorumluluk</h3>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2">
                <li>Uygulamanın kesintisiz çalışacağı garanti edilmez</li>
                <li>Veri kaybı oluşabilir (yedek alınması önerilir)</li>
                <li>Hatalar ve buglar bulunabilir</li>
                <li>"OLDUĞU GİBİ" (AS-IS) sunulur</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Veri İşleme ve Gizlilik</h2>
              <p className="text-[var(--color-text-secondary)] mb-4">
                Kişisel verilerinizin işlenmesi hakkında detaylı bilgi için{' '}
                <Link to="/privacy-policy" target="_blank" className="text-[var(--color-accent)] hover:underline">
                  Gizlilik Politikası
                </Link>{' '}
                belgesine bakınız.
              </p>
              <p className="text-[var(--color-text-secondary)] font-semibold mb-2">Özet:</p>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-2">
                <li>Email, ad soyad, ve puanlarınız işlenir</li>
                <li>Veriler şeffaf şekilde tüm kullanıcılara gösterilir</li>
                <li>KVKK haklarınız saklıdır</li>
                <li>Verilerinizi silme hakkınız vardır</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. İletişim Bilgileri</h2>
              <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg p-4 space-y-2">
                <p className="text-white"><strong>Proje Sahibi:</strong> Seyfettin Kılınç</p>
                <p className="text-white"><strong>Email:</strong> kilincseyfettin3@gmail.com</p>
                <p className="text-white"><strong>GitHub:</strong> GitHub repository</p>
              </div>
            </section>

            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mt-8">
              <p className="text-red-400 font-bold">
                TEKRAR HATIRLATMA: BU UYGULAMA SADECE SİMÜLASYON AMAÇLIDIR. RESMİ BİR HİZMET DEĞİLDİR. 
                ÜRETİLEN SONUÇLAR BAĞLAYICI DEĞİLDİR.
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

