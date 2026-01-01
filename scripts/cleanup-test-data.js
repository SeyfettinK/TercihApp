import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const supabaseUrl = 'https://fxpfjgmvhgwrsnhprolr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'SERVICE_ROLE_KEY_BURAYA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function cleanupTestData() {
  console.log('🧹 TEST VERİLERİNİ TEMİZLEME\n');
  console.log('⚠️  DİKKAT: Bu işlem GERİ ALINAMAZ!\n');

  try {
    // 1. Mevcut kullanıcıları listele
    console.log('📊 Mevcut kullanıcılar yükleniyor...\n');
    
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, is_admin, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    if (!profiles || profiles.length === 0) {
      console.log('✅ Hiç kullanıcı bulunamadı. Veritabanı zaten temiz!\n');
      rl.close();
      return;
    }

    console.log(`Toplam ${profiles.length} kullanıcı bulundu:\n`);
    
    const adminUsers = profiles.filter(p => p.is_admin);
    const normalUsers = profiles.filter(p => !p.is_admin);

    console.log(`👑 Admin: ${adminUsers.length} kişi`);
    adminUsers.forEach(u => {
      console.log(`   - ${u.full_name} (${u.email})`);
    });

    console.log(`\n👥 Normal Kullanıcı: ${normalUsers.length} kişi`);
    normalUsers.forEach(u => {
      console.log(`   - ${u.full_name} (${u.email})`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 2. Kullanıcıdan onay al
    const answer = await question('❓ Normal kullanıcıları silmek istiyor musunuz? (admin korunur) [y/N]: ');

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'evet') {
      console.log('\n❌ İşlem iptal edildi.\n');
      rl.close();
      return;
    }

    console.log('\n🗑️  Silme işlemi başlıyor...\n');

    // 3. Atamaları sil
    console.log('1/4 - Atamalar siliniyor...');
    const { error: assignmentsError } = await supabaseAdmin
      .from('assignments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (assignmentsError) throw assignmentsError;
    console.log('   ✅ Atamalar silindi\n');

    // 4. Tercihleri sil
    console.log('2/4 - Tercihler siliniyor...');
    const { error: preferencesError } = await supabaseAdmin
      .from('preferences')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (preferencesError) throw preferencesError;
    console.log('   ✅ Tercihler silindi\n');

    // 5. Normal kullanıcıları sil (admin hariç)
    console.log('3/4 - Normal kullanıcılar siliniyor...');
    
    for (const user of normalUsers) {
      // Auth'tan sil (bu otomatik olarak profiles'tan da siler - CASCADE)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.log(`   ⚠️  ${user.email} silinemedi: ${deleteError.message}`);
      } else {
        console.log(`   ✅ ${user.full_name} (${user.email}) silindi`);
      }
      
      // Rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log('\n');

    // 6. Ayarları sıfırla
    console.log('4/4 - Ayarlar sıfırlanıyor...');
    const { error: settingsError } = await supabaseAdmin
      .from('settings')
      .update({
        results_published: false,
        preference_period_open: false
      })
      .eq('id', 1);

    if (settingsError) throw settingsError;
    console.log('   ✅ Ayarlar sıfırlandı\n');

    // 7. Sonuç özeti
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✨ TEMİZLEME TAMAMLANDI!\n');
    console.log(`🗑️  Silinen kullanıcı: ${normalUsers.length}`);
    console.log(`👑 Korunan admin: ${adminUsers.length}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ HATA:', error.message);
  } finally {
    rl.close();
  }
}

// Script'i çalıştır
cleanupTestData();

