import { createClient } from '@supabase/supabase-js';

// Service Role Key kullanarak admin client oluştur
const supabaseUrl = 'https://fxpfjgmvhgwrsnhprolr.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Supabase Dashboard > Settings > API > Service Role Key

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 27 şehir
const cities = [
  'Kırklareli', 'Tekirdağ', 'İstanbul', 'Kocaeli', 'Yalova', 'Bursa', 
  'Balıkesir', 'Kütahya', 'Bilecik', 'Muğla', 'Bolu', 'Zonguldak', 
  'Kırşehir', 'Yozgat', 'Samsun', 'Osmaniye', 'Ordu', 'Gaziantep', 
  'Giresun', 'Trabzon', 'Rize', 'Adıyaman', 'Şanlıurfa', 'Mardin', 
  'Muş', 'Kars', 'Hakkari'
];

// Test kullanıcıları - çeşitli senaryoları kapsayacak şekilde
const testUsers = [
  // İlk 5 - Yüksek puanlı, ilk tercihlerini alacaklar
  { email: 'user1@test.com', password: 'test123456', full_name: 'Ahmet Yılmaz', written_score: 95, interview_score: 90, wants_lottery: false },
  { email: 'user2@test.com', password: 'test123456', full_name: 'Ayşe Demir', written_score: 92, interview_score: 88, wants_lottery: false },
  { email: 'user3@test.com', password: 'test123456', full_name: 'Mehmet Kaya', written_score: 90, interview_score: 87, wants_lottery: false },
  { email: 'user4@test.com', password: 'test123456', full_name: 'Fatma Çelik', written_score: 88, interview_score: 89, wants_lottery: false },
  { email: 'user5@test.com', password: 'test123456', full_name: 'Ali Öztürk', written_score: 87, interview_score: 86, wants_lottery: true },
  
  // 6-15 - Orta sıra, bazı tercihleri alacaklar
  { email: 'user6@test.com', password: 'test123456', full_name: 'Zeynep Aydın', written_score: 85, interview_score: 84, wants_lottery: true },
  { email: 'user7@test.com', password: 'test123456', full_name: 'Mustafa Şahin', written_score: 84, interview_score: 83, wants_lottery: false },
  { email: 'user8@test.com', password: 'test123456', full_name: 'Elif Yıldız', written_score: 82, interview_score: 85, wants_lottery: true },
  { email: 'user9@test.com', password: 'test123456', full_name: 'Hasan Arslan', written_score: 83, interview_score: 80, wants_lottery: false },
  { email: 'user10@test.com', password: 'test123456', full_name: 'Selin Koç', written_score: 80, interview_score: 82, wants_lottery: true },
  { email: 'user11@test.com', password: 'test123456', full_name: 'Emre Polat', written_score: 81, interview_score: 79, wants_lottery: false },
  { email: 'user12@test.com', password: 'test123456', full_name: 'Derya Aksoy', written_score: 79, interview_score: 80, wants_lottery: true },
  { email: 'user13@test.com', password: 'test123456', full_name: 'Burak Güneş', written_score: 78, interview_score: 78, wants_lottery: false },
  { email: 'user14@test.com', password: 'test123456', full_name: 'Gizem Kurt', written_score: 77, interview_score: 77, wants_lottery: true },
  { email: 'user15@test.com', password: 'test123456', full_name: 'Onur Özkan', written_score: 76, interview_score: 76, wants_lottery: false },
  
  // 16-27 - Kritik sıra, bazıları kuraya kalacak
  { email: 'user16@test.com', password: 'test123456', full_name: 'Melis Çetin', written_score: 75, interview_score: 75, wants_lottery: true },
  { email: 'user17@test.com', password: 'test123456', full_name: 'Serkan Acar', written_score: 74, interview_score: 74, wants_lottery: true },
  { email: 'user18@test.com', password: 'test123456', full_name: 'Pınar Taş', written_score: 73, interview_score: 73, wants_lottery: true },
  { email: 'user19@test.com', password: 'test123456', full_name: 'Kemal Yalçın', written_score: 72, interview_score: 72, wants_lottery: false },
  { email: 'user20@test.com', password: 'test123456', full_name: 'Deniz Özer', written_score: 71, interview_score: 71, wants_lottery: true },
  { email: 'user21@test.com', password: 'test123456', full_name: 'Can Doğan', written_score: 70, interview_score: 70, wants_lottery: true },
  { email: 'user22@test.com', password: 'test123456', full_name: 'Esra Karaca', written_score: 69, interview_score: 69, wants_lottery: false },
  { email: 'user23@test.com', password: 'test123456', full_name: 'Cem Yıldırım', written_score: 68, interview_score: 68, wants_lottery: true },
  { email: 'user24@test.com', password: 'test123456', full_name: 'Nur Tekin', written_score: 67, interview_score: 67, wants_lottery: true },
  { email: 'user25@test.com', password: 'test123456', full_name: 'Barış Erdoğan', written_score: 66, interview_score: 66, wants_lottery: false },
  { email: 'user26@test.com', password: 'test123456', full_name: 'İrem Aksoy', written_score: 65, interview_score: 65, wants_lottery: true },
  { email: 'user27@test.com', password: 'test123456', full_name: 'Kaan Demir', written_score: 64, interview_score: 64, wants_lottery: true },
  
  // 28-32 - Sıralamaya giremeyecekler (27'den sonra)
  { email: 'user28@test.com', password: 'test123456', full_name: 'Nazlı Şen', written_score: 63, interview_score: 63, wants_lottery: false },
  { email: 'user29@test.com', password: 'test123456', full_name: 'Mert Aydın', written_score: 62, interview_score: 62, wants_lottery: true },
  { email: 'user30@test.com', password: 'test123456', full_name: 'Sinem Kaplan', written_score: 61, interview_score: 61, wants_lottery: false },
];

// Şehir tercihleri - farklı senaryolar için
function getPreferences(userIndex, cityIds) {
  const prefs = [];
  
  // Her kullanıcı için farklı tercih stratejileri
  if (userIndex < 5) {
    // İlk 5 kullanıcı: Popüler şehirleri tercih eder (İstanbul, Ankara, İzmir benzeri)
    const popularCities = [2, 3, 5, 1, 9, 14, 17, 0, 10, 6]; // İstanbul, Kocaeli, Bursa, Tekirdağ...
    popularCities.slice(0, 10).forEach((cityIdx, i) => {
      prefs.push({ city_id: cityIds[cityIdx], rank: i + 1 });
    });
  } else if (userIndex < 15) {
    // 6-15 arası: Karma tercihler
    const mixedCities = [(userIndex % 27), ((userIndex + 5) % 27), ((userIndex + 10) % 27), 
                        ((userIndex + 15) % 27), ((userIndex + 3) % 27), ((userIndex + 8) % 27),
                        ((userIndex + 13) % 27), ((userIndex + 18) % 27), ((userIndex + 2) % 27),
                        ((userIndex + 7) % 27)];
    mixedCities.forEach((cityIdx, i) => {
      prefs.push({ city_id: cityIds[cityIdx], rank: i + 1 });
    });
  } else if (userIndex < 23) {
    // 16-23 arası: Bazıları çakışacak tercihler (popüler şehirler)
    const competitiveCities = [2, 3, 5, 14, 17, 9, 1, 19, 15, 11]; // İstanbul, Kocaeli, Bursa, Samsun...
    competitiveCities.forEach((cityIdx, i) => {
      prefs.push({ city_id: cityIds[cityIdx], rank: i + 1 });
    });
  } else {
    // 24-27 arası: Az tercih edilen şehirler (kuraya kalma riski yüksek)
    const lessPref = [20, 21, 22, 23, 24, 25, 26, 16, 18, 13]; // Rize, Adıyaman, Şanlıurfa...
    lessPref.forEach((cityIdx, i) => {
      prefs.push({ city_id: cityIds[cityIdx], rank: i + 1 });
    });
  }
  
  return prefs;
}

async function seedData() {
  console.log('🌱 Test verilerini oluşturuyoruz...\n');

  try {
    // 1. Şehir ID'lerini al
    console.log('📍 Şehirler yükleniyor...');
    const { data: citiesData, error: citiesError } = await supabaseAdmin
      .from('cities')
      .select('id, name')
      .order('id');
    
    if (citiesError) throw citiesError;
    console.log(`✅ ${citiesData.length} şehir bulundu\n`);

    // 2. Kullanıcıları oluştur
    console.log('👥 Kullanıcılar oluşturuluyor...');
    const createdUsers = [];
    
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      console.log(`  ${i + 1}/${testUsers.length} - ${user.email} oluşturuluyor...`);
      
      // Kullanıcı oluştur (auth.users)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Email otomatik onaylanmış olsun
        user_metadata: {
          full_name: user.full_name
        }
      });
      
      if (authError) {
        console.error(`    ❌ Hata: ${authError.message}`);
        continue;
      }
      
      const userId = authData.user.id;
      
      // Profil oluştur
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          full_name: user.full_name,
          written_score: user.written_score,
          interview_score: user.interview_score,
          wants_lottery: user.wants_lottery,
          is_admin: false
        });
      
      if (profileError) {
        console.error(`    ❌ Profil hatası: ${profileError.message}`);
        continue;
      }
      
      // Tercihleri oluştur
      const preferences = getPreferences(i, citiesData.map(c => c.id));
      const { error: prefError } = await supabaseAdmin
        .from('preferences')
        .insert(
          preferences.map(p => ({
            user_id: userId,
            city_id: p.city_id,
            priority: p.rank
          }))
        );
      
      if (prefError) {
        console.error(`    ❌ Tercih hatası: ${prefError.message}`);
        continue;
      }
      
      createdUsers.push({ userId, email: user.email, full_name: user.full_name });
      console.log(`    ✅ Başarılı (${preferences.length} tercih)`);
      
      // Rate limiting'den kaçınmak için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n✨ Tamamlandı!`);
    console.log(`📊 ${createdUsers.length} kullanıcı başarıyla oluşturuldu`);
    console.log(`\n🔑 Giriş bilgileri:`);
    console.log(`   Email: user1@test.com - user${testUsers.length}@test.com`);
    console.log(`   Şifre: test123456 (tüm kullanıcılar için)\n`);
    
    console.log('📋 Test senaryoları:');
    console.log('   ✓ 1-5: Yüksek puanlı, ilk tercihlerini alacak');
    console.log('   ✓ 6-15: Orta sıra, bazı tercihleri alacak');
    console.log('   ✓ 16-27: Kritik sıra, bazıları kuraya kalacak');
    console.log('   ✓ 28-30: Sıralamaya giremeyecek (kontenjan dışı)');
    console.log('   ✓ Genel kuraya kalan ve kalmayan kullanıcılar');
    console.log('   ✓ Çakışan tercihler (aynı şehri isteyen kullanıcılar)');
    console.log('   ✓ Az tercih edilen şehirler\n');

  } catch (error) {
    console.error('❌ Genel hata:', error);
  }
}

// Scripti çalıştır
seedData();

