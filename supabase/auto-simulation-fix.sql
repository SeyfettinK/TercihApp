-- =====================================================
-- AUTO-SIMULATION FIX: RPC Function ile Güvenli Atama
-- =====================================================
-- Problem: Normal kullanıcılar assignments tablosuna yazamıyor (RLS)
-- Çözüm: SECURITY DEFINER ile admin yetkisiyle çalışan RPC function
-- =====================================================

-- Eski function varsa sil
DROP FUNCTION IF EXISTS save_simulation_results(jsonb);

-- Yeni function: Simülasyon sonuçlarını kaydet
CREATE OR REPLACE FUNCTION save_simulation_results(
  assignments_data jsonb
)
RETURNS jsonb
SECURITY DEFINER  -- ← Bu sayede admin yetkisiyle çalışır!
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_inserted_count integer := 0;
  v_assignment record;
BEGIN
  -- 1. Güvenlik kontrolü: Sadece authenticated kullanıcılar
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Giriş yapmanız gerekiyor'
    );
  END IF;

  -- 2. Auto-simulation açık mı kontrol et
  IF NOT EXISTS (
    SELECT 1 FROM settings 
    WHERE id = 1 AND auto_simulation = true
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Otomatik simülasyon kapalı'
    );
  END IF;

  -- 3. Mevcut tüm atamaları temizle
  DELETE FROM assignments WHERE true;

  -- 4. Yeni atamaları ekle
  IF jsonb_array_length(assignments_data) > 0 THEN
    FOR v_assignment IN 
      SELECT * FROM jsonb_to_recordset(assignments_data) 
      AS x(user_id uuid, city_id integer, assignment_type text)
    LOOP
      -- Her assignment'ı insert et
      INSERT INTO assignments (user_id, city_id, assignment_type)
      VALUES (
        v_assignment.user_id,
        v_assignment.city_id,
        v_assignment.assignment_type
      );
      
      v_inserted_count := v_inserted_count + 1;
    END LOOP;
  END IF;

  -- 5. Sonuçları yayınla
  UPDATE settings 
  SET results_published = true 
  WHERE id = 1;

  -- 6. Başarılı sonuç döndür
  RETURN jsonb_build_object(
    'success', true,
    'assigned', v_inserted_count,
    'error', null
  );

EXCEPTION WHEN OTHERS THEN
  -- Hata durumunda rollback otomatik yapılır
  RETURN jsonb_build_object(
    'success', false,
    'assigned', 0,
    'error', SQLERRM
  );
END;
$$;

-- RPC'yi authenticated kullanıcılara aç
GRANT EXECUTE ON FUNCTION save_simulation_results(jsonb) TO authenticated;

-- =====================================================
-- KULLANIM:
-- =====================================================
-- Frontend'den şu şekilde çağrılır:
-- 
-- const { data, error } = await supabase.rpc('save_simulation_results', {
--   assignments_data: [
--     { user_id: 'uuid1', city_id: 1, assignment_type: 'preference' },
--     { user_id: 'uuid2', city_id: 3, assignment_type: 'lottery' }
--   ]
-- })
-- =====================================================

-- Test (optional - yorumu kaldırıp test edebilirsiniz)
-- SELECT save_simulation_results('[]'::jsonb);

