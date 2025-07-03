
const { Pool } = require('@neondatabase/serverless');

async function wakeDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Veritabanı bağlantısı test ediliyor...');
    const result = await pool.query('SELECT 1 as test');
    console.log('✅ Veritabanı aktif edildi:', result.rows[0]);
    
    // Test tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Mevcut tablolar:', tablesResult.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error.message);
  } finally {
    await pool.end();
  }
}

wakeDatabase();
