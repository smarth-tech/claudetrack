import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  proxyKey: text("proxy_key").notNull().unique(),
  anthropicKeyEncrypted: text("anthropic_key_encrypted"),
  monthlyBudget: numeric("monthly_budget", { precision: 10, scale: 4 }),
  alertThreshold: integer("alert_threshold").default(80),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiRequests = pgTable("api_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  sessionId: text("session_id"),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  cacheReadTokens: integer("cache_read_tokens").default(0),
  cacheWriteTokens: integer("cache_write_tokens").default(0),
  costUsd: numeric("cost_usd", { precision: 10, scale: 8 }).notNull().default("0"),
  latencyMs: integer("latency_ms"),
  timestamp: timestamp("timestamp").defaultNow(),
  endpoint: text("endpoint"),
  statusCode: integer("status_code"),
  requestMetadata: text("request_metadata"),
});

export const budgetAlerts = pgTable("budget_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  alertType: text("alert_type").notNull().default("monthly"),
  thresholdPercent: integer("threshold_percent").notNull().default(80),
  isActive: boolean("is_active").notNull().default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  proxyKey: true,
  createdAt: true,
});

export const insertApiRequestSchema = createInsertSchema(apiRequests).omit({
  id: true,
  timestamp: true,
});

export const insertBudgetAlertSchema = createInsertSchema(budgetAlerts).omit({
  id: true,
  createdAt: true,
  lastTriggeredAt: true,
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ApiRequest = typeof apiRequests.$inferSelect;
export type InsertApiRequest = z.infer<typeof insertApiRequestSchema>;
export type BudgetAlert = typeof budgetAlerts.$inferSelect;
export type InsertBudgetAlert = z.infer<typeof insertBudgetAlertSchema>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const MODEL_PRICING: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  "claude-opus-4-5": { input: 0.000015, output: 0.000075, cacheRead: 0.0000015, cacheWrite: 0.00001875 },
  "claude-sonnet-4-5": { input: 0.000003, output: 0.000015, cacheRead: 0.0000003, cacheWrite: 0.00000375 },
  "claude-haiku-4-5": { input: 0.0000008, output: 0.000004, cacheRead: 0.00000008, cacheWrite: 0.000001 },
  "claude-3-5-sonnet-20241022": { input: 0.000003, output: 0.000015, cacheRead: 0.0000003, cacheWrite: 0.00000375 },
  "claude-3-5-haiku-20241022": { input: 0.0000008, output: 0.000004, cacheRead: 0.00000008, cacheWrite: 0.000001 },
  "claude-3-opus-20240229": { input: 0.000015, output: 0.000075, cacheRead: 0.0000015, cacheWrite: 0.00001875 },
  "claude-3-sonnet-20240229": { input: 0.000003, output: 0.000015, cacheRead: 0.0000003, cacheWrite: 0.00000375 },
  "claude-3-haiku-20240307": { input: 0.00000025, output: 0.00000125, cacheRead: 0.00000003, cacheWrite: 0.0000003 },
};
