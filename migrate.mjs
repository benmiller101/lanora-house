import postgres from 'postgres';
import { readFileSync } from 'fs';

const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!url) { console.error('No DATABASE_PUBLIC_URL or DATABASE_URL set'); process.exit(1); }

console.log('Connecting to:', url.replace(/:([^:@]+)@/, ':****@'));

const ssl = url.includes('neon.tech') || url.includes('sslmode=require') || url.includes('rlwy.net')
  ? 'require'
  : undefined;

const sql = postgres(url, { ssl, max: 1 });

try {
  const migration = readFileSync('./migrations/0000_pale_stick.sql', 'utf8');
  await sql.unsafe(migration);
  console.log('✅ Migration applied successfully!');
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
} finally {
  await sql.end();
}
