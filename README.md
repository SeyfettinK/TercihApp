# Tercih Robotu 🎲

Ünvan Değişikliği Sınavı için geliştirilmiş şehir tercih ve yerleştirme simülasyon sistemi.

## Özellikler

- 📊 **Sıralama Tablosu**: Tüm adayların yazılı, mülakat ve nihai puanlarını görüntüleyin
- 🎯 **Tercih Sistemi**: Drag & drop ile 10 şehir tercihi yapın
- 🎲 **Genel Kura**: Tercihleriniz gelmezse kura ile yerleşme seçeneği
- ⚙️ **Admin Paneli**: Kullanıcı yönetimi, şehir ekleme/silme, tercih dönemi kontrolü
- 🏆 **Simülasyon**: Yerleştirme algoritmasını çalıştırın ve sonuçları yayınlayın

## Teknolojiler

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit

## Kurulum

### 1. Supabase Projesi Oluşturma

1. [supabase.com](https://supabase.com) adresinde yeni bir proje oluşturun
2. SQL Editor'a gidin ve sırasıyla aşağıdaki SQL dosyalarını çalıştırın:
   - `supabase/schema.sql` - Ana veritabanı şeması
   - `supabase/auto-simulation-fix.sql` - Otomatik simülasyon için RPC function
3. Project Settings > API bölümünden URL ve anon key'i kopyalayın

### 2. Projeyi Klonlama

```bash
git clone https://github.com/your-username/TercihApp.git
cd TercihApp
npm install
```

### 3. Environment Variables

Proje kök dizininde `.env` dosyası oluşturun:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Geliştirme Sunucusu

```bash
npm run dev
```

## GitHub Pages Deployment

1. GitHub repository'nize kodu push edin
2. Repository Settings > Secrets and variables > Actions bölümüne gidin
3. Aşağıdaki secret'ları ekleyin:
   - `VITE_SUPABASE_URL`: Supabase proje URL'i
   - `VITE_SUPABASE_ANON_KEY`: Supabase anon key
4. Settings > Pages bölümünde Source olarak "GitHub Actions" seçin
5. Main branch'e push yaptığınızda otomatik deploy edilecektir

## Erişim Kodu Sistemi 🔐

Bu uygulama **gizli erişim kodu** ile korunmaktadır. Sadece davet edilen kişiler sisteme kayıt olabilir.

### Varsayılan Erişim Kodu
```
justforfun1991
```
*(Linus Torvalds'ın "Just for Fun" kitabı + Linux'un doğuş yılı)*

### Erişim Kodunu Değiştirme

1. Admin olarak giriş yapın
2. Admin Panel > Ayarlar sekmesine gidin
3. "Erişim Kodu Yönetimi" bölümünden yeni kod belirleyin

> ⚠️ **Önemli**: Erişim kodu değiştirildikten sonra, sadece yeni kodu bilenler sisteme kayıt olabilir!

## İlk Admin Kullanıcısı Oluşturma

1. Uygulamada normal kayıt olun (erişim kodu: `justforfun1991`)
2. Supabase Dashboard > Table Editor > profiles tablosuna gidin
3. Kendi kaydınızı bulun ve `is_admin` sütununu `true` yapın
4. Admin panelinden erişim kodunu değiştirin

## Yerleştirme Algoritması

1. Kullanıcılar nihai puana göre sıralanır (yüksekten düşüğe)
2. Her kullanıcı için sırasıyla tercihlerine bakılır
3. İlk boş bulunan tercih edilen şehre yerleştirilir
4. Tercihlerinden hiçbiri boş değilse ve "Genel Kuraya Kal" seçiliyse kura havuzuna eklenir
5. Tüm normal yerleştirmeler bittikten sonra kura havuzu karıştırılır
6. Kalan boş şehirler kura havuzundakilere rastgele atanır

## Lisans

MIT License

