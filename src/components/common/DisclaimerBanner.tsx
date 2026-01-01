import { Link } from 'react-router-dom'

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-500/10 border-l-4 border-amber-500 px-4 py-3 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">⚠️</span>
        <div className="flex-1">
          <p className="text-amber-400 font-semibold mb-1">
            Önemli Uyarı: Bu Resmi Bir Sistem Değildir
          </p>
          <p className="text-amber-400/80 text-sm">
            Bu uygulama <strong>sadece simülasyon ve tahmin amaçlıdır</strong>. 
            Üretilen sonuçlar <strong>bağlayıcı değildir</strong> ve hiçbir resmi kurum ile ilişkisi yoktur. 
            Resmi sonuçlar için lütfen ilgili kamu kurumuna başvurunuz.
          </p>
          <p className="text-amber-400/60 text-xs mt-2">
            Bu uygulamayı kullanarak{' '}
            <Link to="/terms-of-service" className="underline hover:text-amber-300">
              Kullanım Şartları
            </Link>
            {' '}ve{' '}
            <Link to="/privacy-policy" className="underline hover:text-amber-300">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş sayılırsınız.
          </p>
        </div>
      </div>
    </div>
  )
}

