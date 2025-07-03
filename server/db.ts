
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Global connection pool with better configuration
let globalPool: Pool | null = null;

function getPool(): Pool {
  if (!globalPool) {
    globalPool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 10,
      statement_timeout: 30000,
      query_timeout: 30000
    });
  }
  return globalPool;
}

export const pool = getPool();
export const db = drizzle({ client: pool, schema });

// Wake database function for internal use
export async function wakeDatabase(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT 1 as wake_test');
    console.log('✅ Database connection verified');
    return true;
  } catch (error) {
    console.error('❌ Database wake failed:', error);
    return false;
  }
}

// Enhanced database operation wrapper with retry logic
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Try to wake database on first attempt
      if (attempt === 1) {
        await wakeDatabase();
      }
      
      const result = await operation();
      return result;
    } catch (error: any) {
      lastError = error;
      
      const isConnectionError = error.code === 'XX000' && 
        (error.message?.includes('endpoint is disabled') || 
         error.message?.includes('Connection terminated'));
      
      if (isConnectionError && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // exponential backoff
        console.log(`🔄 Database retry ${attempt}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Try to wake database before retry
        await wakeDatabase();
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}
