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

async function updateFinalScores() {
  console.log('🔄 Final score\'lar güncelleniyor...\n');

  try {
    // Test kullanıcılarını çek
    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, written_score, interview_score, final_score')
      .like('email', '%@test.com')
      .order('written_score', { ascending: false });

    if (fetchError) throw fetchError;

    console.log(`📊 ${profiles.length} test kullanıcısı bulundu\n`);

    // Her kullanıcı için final_score hesapla ve güncelle
    let updatedCount = 0;
    for (const profile of profiles) {
      const calculatedScore = (profile.written_score + profile.interview_score) / 2.0;
      
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ final_score: calculatedScore })
        .eq('id', profile.id);

      if (updateError) {
        console.error(`❌ ${profile.email} güncellenemedi: ${updateError.message}`);
        continue;
      }

      console.log(`✅ ${profile.full_name.padEnd(20)} | Yazılı: ${profile.written_score} | Mülakat: ${profile.interview_score} | Final: ${calculatedScore.toFixed(2)}`);
      updatedCount++;
    }

    console.log(`\n✨ Tamamlandı! ${updatedCount}/${profiles.length} kullanıcı güncellendi\n`);

    // Güncellenmiş sıralamayı göster
    console.log('📋 Güncellenmiş Sıralama (İlk 10):');
    const { data: topProfiles, error: topError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, written_score, interview_score, final_score')
      .like('email', '%@test.com')
      .order('final_score', { ascending: false })
      .limit(10);

    if (!topError && topProfiles) {
      topProfiles.forEach((p, idx) => {
        console.log(`  ${(idx + 1).toString().padStart(2)}. ${p.full_name.padEnd(20)} - ${p.final_score.toFixed(2)} puan`);
      });
    }

  } catch (error) {
    console.error('❌ Genel hata:', error);
  }
}

// Scripti çalıştır
updateFinalScores();

