
const { Pool } = require('@neondatabase/serverless');

async function wakeDatabase() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 1
  });
  
  try {
    console.log('🔄 Veritabanı bağlantısı test ediliyor...');
    const result = await pool.query('SELECT 1 as test');
    console.log('✅ Veritabanı aktif edildi:', result.rows[0]);
    
    // Test tables exist
    try {
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log('📋 Mevcut tablolar:', tablesResult.rows.map(r => r.table_name));
    } catch (tableError) {
      console.log('⚠️ Tablo bilgisi alınamadı, bu normal olabilir.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error.message);
    if (error.code === 'XX000' && error.message.includes('endpoint is disabled')) {
      console.log('💡 Veritabanı uyku modunda. Birkaç saniye bekleyip tekrar deneyin.');
    }
    return false;
  } finally {
    await pool.end();
  }
}

wakeDatabase()
  .then(success => {
    if (success) {
      console.log('🎉 Veritabanı hazır!');
      process.exit(0);
    } else {
      console.log('❌ Veritabanı aktive edilemedi.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('🚨 Beklenmeyen hata:', error);
    process.exit(1);
  });
