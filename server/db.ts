import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

// Set up neon config for better compatibility
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use HTTP client instead of WebSocket for more reliable connections
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// For backward compatibility, create a simple pool interface
export const pool = {
  query: async (text: string, params?: any[]) => {
    try {
      const result = await sql(text, params || []);
      return { rows: result };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  end: () => Promise.resolve(),
  on: (event: string, handler: Function) => {
    // No-op for compatibility
  }
};