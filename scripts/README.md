# Test Verilerini Oluşturma

Bu script, Supabase veritabanınıza 30 test kullanıcısı ve onların tercihlerini ekler.

## 📋 Test Senaryoları

Script şu senaryoları kapsayacak şekilde tasarlandı:

- ✅ **1-5. Kullanıcılar**: Yüksek puanlı, ilk tercihlerini alacak kullanıcılar
- ✅ **6-15. Kullanıcılar**: Orta sırada, bazı tercihleri alacak kullanıcılar  
- ✅ **16-27. Kullanıcılar**: Kritik sırada, bazıları genel kuraya kalacak
- ✅ **28-30. Kullanıcılar**: Sıralamaya giremeyecek (27 kontenjan dışı)
- ✅ Genel kuraya kalan ve kalmayan kullanıcılar
- ✅ Çakışan tercihler (aynı şehri isteyen birden fazla kullanıcı)
- ✅ Az tercih edilen şehirler

## 🚀 Kullanım

### 1. Adım: Service Role Key'i Bulun

1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **Settings** > **API** seçin
4. **Service Role Key** bölümünü bulun (NOT: Bu **secret** anahtardır!)
5. `service_role` anahtarını kopyalayın (göz simgesine tıklayın)

⚠️ **ÖNEMLİ**: Service Role Key tüm güvenlik kurallarını bypass eder. Bu anahtarı asla GitHub'a yüklemeyin veya paylaşmayın!

### 2. Adım: Script'i Düzenleyin

`scripts/seed-data.js` dosyasını açın ve 7. satırda bulunan `SERVICE_ROLE_KEY_BURAYA` kısmını değiştirin:

```javascript
const supabaseServiceKey = 'eyJhbG...'; // Buraya Service Role Key'inizi yapıştırın
```

### 3. Adım: Script'i Çalıştırın

Terminal'de aşağıdaki komutu çalıştırın:

```bash
npm run seed
```

## 🔑 Giriş Bilgileri

Script çalıştırıldıktan sonra şu bilgilerle giriş yapabilirsiniz:

- **Email**: `user1@test.com`, `user2@test.com`, ... `user30@test.com`
- **Şifre**: `test123456` (tüm kullanıcılar için aynı)

## 📊 Oluşturulan Veriler

Her kullanıcı için:
- ✓ Auth kaydı (`auth.users`)
- ✓ Profil bilgileri (`profiles`)
- ✓ 10 şehir tercihi (`preferences`)

Toplam:
- 30 kullanıcı
- 30 profil
- 300 tercih kaydı

## 🧹 Verileri Temizleme

Test verilerini silmek isterseniz, Supabase SQL Editor'de şu komutu çalıştırın:

```sql
-- Önce bağımlı kayıtları sil
DELETE FROM assignments WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%@test.com'
);

DELETE FROM preferences WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%@test.com'
);

DELETE FROM profiles WHERE email LIKE '%@test.com';

-- Sonra auth kullanıcılarını Dashboard'dan manuel olarak silin
-- (Authentication > Users sayfasından)
```

## ⚠️ Güvenlik Notları

1. Service Role Key'i asla versiyonlamayın (.gitignore'a ekleyin)
2. Production veritabanında bu script'i çalıştırmayın
3. Script çalıştırdıktan sonra Service Role Key'i script'ten silebilirsiniz

