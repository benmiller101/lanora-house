import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const url = process.env.DATABASE_URL;
const ssl = url.includes("neon.tech") || url.includes("sslmode=require")
  ? "require"
  : undefined;

const client = postgres(url, { ssl, max: 10 });
export const db = drizzle(client, { schema });

export const pool = {
  query: async (text: string, params?: any[]) => {
    try {
      const result = await client.unsafe(text, params as any[]);
      return { rows: result };
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },
  end: () => client.end(),
  on: (_event: string, _handler: Function) => {},
};
