import { db } from "./db";
import { sql } from "drizzle-orm";

export async function migrate() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      proxy_key TEXT NOT NULL UNIQUE,
      anthropic_key_encrypted TEXT,
      monthly_budget NUMERIC(10, 4),
      alert_threshold INTEGER DEFAULT 80,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS api_requests (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id VARCHAR NOT NULL,
      session_id TEXT,
      model TEXT NOT NULL,
      input_tokens INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      cache_read_tokens INTEGER DEFAULT 0,
      cache_write_tokens INTEGER DEFAULT 0,
      cost_usd NUMERIC(10, 8) NOT NULL DEFAULT 0,
      latency_ms INTEGER,
      timestamp TIMESTAMP DEFAULT NOW(),
      endpoint TEXT,
      status_code INTEGER,
      request_metadata TEXT
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS budget_alerts (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id VARCHAR NOT NULL,
      alert_type TEXT NOT NULL DEFAULT 'monthly',
      threshold_percent INTEGER NOT NULL DEFAULT 80,
      is_active BOOLEAN NOT NULL DEFAULT true,
      last_triggered_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  console.log("[migrate] Database tables ready");
}
