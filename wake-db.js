
const { Pool } = require('@neondatabase/serverless');

// Veritabanını uyandırma fonksiyonu - daha agresif yaklaşım
async function forceWakeDatabase() {
  console.log('🚀 Veritabanını zorla aktive etmeye çalışıyor...');
  
  // Birden fazla bağlantı havuzu oluştur
  const pools = [];
  
  try {
    // 3 farklı havuz oluştur - parallel wake attempts
    for (let i = 0; i < 3; i++) {
      const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
        max: 1,
        statement_timeout: 5000,
        query_timeout: 5000
      });
      pools.push(pool);
    }

    // Parallel olarak wake up denemeleri
    const wakePromises = pools.map(async (pool, index) => {
      try {
        console.log(`🔄 Bağlantı denemesi ${index + 1}/3...`);
        const result = await pool.query('SELECT NOW() as current_time, 1 as wake_test');
        console.log(`✅ Bağlantı ${index + 1} başarılı:`, result.rows[0]);
        return true;
      } catch (error) {
        console.log(`❌ Bağlantı ${index + 1} başarısız:`, error.message);
        return false;
      }
    });

    // En az bir bağlantının başarılı olmasını bekle
    const results = await Promise.allSettled(wakePromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    if (successCount > 0) {
      console.log(`🎉 ${successCount}/3 bağlantı başarılı - Veritabanı aktif!`);
      
      // Tablo kontrolü
      try {
        const firstSuccessfulPool = pools[0];
        const tableCheck = await firstSuccessfulPool.query(`
          SELECT schemaname, tablename 
          FROM pg_tables 
          WHERE schemaname = 'public'
        `);
        console.log('📋 Aktif tablolar:', tableCheck.rows.map(r => r.tablename));
      } catch (tableError) {
        console.log('⚠️ Tablo listesi alınamadı, schema push gerekebilir');
      }
      
      return true;
    } else {
      console.log('❌ Hiçbir bağlantı başarılı olmadı');
      return false;
    }
    
  } catch (globalError) {
    console.error('🚨 Global hata:', globalError.message);
    return false;
  } finally {
    // Tüm pool'ları kapat
    await Promise.allSettled(pools.map(pool => pool.end()));
  }
}

// Ana çalıştırma
async function main() {
  console.log('🔧 PostgreSQL Veritabanı Aktifleştirici');
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? 'Ayarlanmış ✓' : 'Ayarlanmamış ✗');
  
  const maxAttempts = 5;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n🎯 Deneme ${attempt}/${maxAttempts}`);
    
    const success = await forceWakeDatabase();
    
    if (success) {
      console.log('\n🏆 VERİTABANI BAŞARIYLA AKTİVE EDİLDİ!');
      process.exit(0);
    }
    
    if (attempt < maxAttempts) {
      const waitTime = Math.min(2000 * attempt, 10000); // Max 10 saniye bekle
      console.log(`⏳ ${waitTime}ms bekleyip tekrar deneniyor...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  console.log('\n💥 VERİTABANI AKTİVE EDİLEMEDİ - Manuel müdahale gerekli!');
  process.exit(1);
}

main().catch(error => {
  console.error('🚨 Beklenmeyen ana hata:', error);
  process.exit(1);
});
