import { db } from "./db";
import { projects, apiRequests, budgetAlerts, users } from "@shared/schema";
import type { Project, InsertProject, ApiRequest, InsertApiRequest, BudgetAlert, InsertBudgetAlert, User, InsertUser } from "@shared/schema";
import { eq, desc, gte, sql, and, lte } from "drizzle-orm";
import { randomUUID, createCipheriv, createDecipheriv, scryptSync, randomBytes } from "crypto";

const ENCRYPTION_KEY = process.env.SESSION_SECRET || "default-dev-key-32chars-minimum!!";

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, "claudetrack-salt", 32);
}

export function encryptApiKey(plaintext: string): string {
  const key = deriveKey(ENCRYPTION_KEY);
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptApiKey(ciphertext: string): string {
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(":");
  const key = deriveKey(ENCRYPTION_KEY);
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

function generateProxyKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "cti_";
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectByProxyKey(proxyKey: string): Promise<Project | undefined>;
  createProject(project: InsertProject & { anthropicKey?: string }): Promise<Project>;
  updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;

  getApiRequests(projectId?: string, limit?: number, since?: Date): Promise<ApiRequest[]>;
  createApiRequest(req: InsertApiRequest): Promise<ApiRequest>;

  getProjectStats(projectId: string, since: Date): Promise<{
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    requestCount: number;
    avgLatency: number;
  }>;

  getAggregateStats(since: Date): Promise<{
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    requestCount: number;
    avgLatency: number;
  }>;

  getTokensOverTime(projectId: string | null, since: Date, interval: "hour" | "day"): Promise<Array<{
    time: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    requests: number;
  }>>;

  getModelBreakdown(projectId: string | null, since: Date): Promise<Array<{
    model: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    requests: number;
  }>>;

  getBudgetAlerts(projectId?: string): Promise<BudgetAlert[]>;
  createBudgetAlert(alert: InsertBudgetAlert): Promise<BudgetAlert>;
  updateBudgetAlert(id: string, data: Partial<InsertBudgetAlert>): Promise<BudgetAlert | undefined>;
  deleteBudgetAlert(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectByProxyKey(proxyKey: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.proxyKey, proxyKey));
    return project;
  }

  async createProject(projectData: InsertProject & { anthropicKey?: string }): Promise<Project> {
    const { anthropicKey, ...rest } = projectData;
    const proxyKey = generateProxyKey();
    const encrypted = anthropicKey ? encryptApiKey(anthropicKey) : null;

    const [project] = await db.insert(projects).values({
      ...rest,
      proxyKey,
      anthropicKeyEncrypted: encrypted,
    }).returning();
    return project;
  }

  async updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db.update(projects).set(data).where(eq(projects.id, id)).returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getApiRequests(projectId?: string, limit = 100, since?: Date): Promise<ApiRequest[]> {
    const conditions = [];
    if (projectId) conditions.push(eq(apiRequests.projectId, projectId));
    if (since) conditions.push(gte(apiRequests.timestamp, since));

    return db.select().from(apiRequests)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(apiRequests.timestamp))
      .limit(limit);
  }

  async createApiRequest(req: InsertApiRequest): Promise<ApiRequest> {
    const [created] = await db.insert(apiRequests).values(req).returning();
    return created;
  }

  async getProjectStats(projectId: string, since: Date) {
    const [result] = await db.select({
      totalInputTokens: sql<number>`COALESCE(SUM(${apiRequests.inputTokens}), 0)`,
      totalOutputTokens: sql<number>`COALESCE(SUM(${apiRequests.outputTokens}), 0)`,
      totalCost: sql<number>`COALESCE(SUM(${apiRequests.costUsd}), 0)`,
      requestCount: sql<number>`COUNT(*)`,
      avgLatency: sql<number>`COALESCE(AVG(${apiRequests.latencyMs}), 0)`,
    }).from(apiRequests).where(
      and(eq(apiRequests.projectId, projectId), gte(apiRequests.timestamp, since))
    );

    return {
      totalInputTokens: Number(result.totalInputTokens),
      totalOutputTokens: Number(result.totalOutputTokens),
      totalCost: Number(result.totalCost),
      requestCount: Number(result.requestCount),
      avgLatency: Number(result.avgLatency),
    };
  }

  async getAggregateStats(since: Date) {
    const [result] = await db.select({
      totalInputTokens: sql<number>`COALESCE(SUM(${apiRequests.inputTokens}), 0)`,
      totalOutputTokens: sql<number>`COALESCE(SUM(${apiRequests.outputTokens}), 0)`,
      totalCost: sql<number>`COALESCE(SUM(${apiRequests.costUsd}), 0)`,
      requestCount: sql<number>`COUNT(*)`,
      avgLatency: sql<number>`COALESCE(AVG(${apiRequests.latencyMs}), 0)`,
    }).from(apiRequests).where(gte(apiRequests.timestamp, since));

    return {
      totalInputTokens: Number(result.totalInputTokens),
      totalOutputTokens: Number(result.totalOutputTokens),
      totalCost: Number(result.totalCost),
      requestCount: Number(result.requestCount),
      avgLatency: Number(result.avgLatency),
    };
  }

  async getTokensOverTime(projectId: string | null, since: Date, interval: "hour" | "day") {
    const truncFn = interval === "hour"
      ? sql`date_trunc('hour', ${apiRequests.timestamp})`
      : sql`date_trunc('day', ${apiRequests.timestamp})`;

    const conditions = [gte(apiRequests.timestamp, since)];
    if (projectId) conditions.push(eq(apiRequests.projectId, projectId));

    const rows = await db.select({
      time: truncFn,
      inputTokens: sql<number>`COALESCE(SUM(${apiRequests.inputTokens}), 0)`,
      outputTokens: sql<number>`COALESCE(SUM(${apiRequests.outputTokens}), 0)`,
      cost: sql<number>`COALESCE(SUM(${apiRequests.costUsd}), 0)`,
      requests: sql<number>`COUNT(*)`,
    }).from(apiRequests)
      .where(and(...conditions))
      .groupBy(truncFn)
      .orderBy(truncFn);

    return rows.map(r => ({
      time: String(r.time),
      inputTokens: Number(r.inputTokens),
      outputTokens: Number(r.outputTokens),
      cost: Number(r.cost),
      requests: Number(r.requests),
    }));
  }

  async getModelBreakdown(projectId: string | null, since: Date) {
    const conditions = [gte(apiRequests.timestamp, since)];
    if (projectId) conditions.push(eq(apiRequests.projectId, projectId));

    const rows = await db.select({
      model: apiRequests.model,
      inputTokens: sql<number>`COALESCE(SUM(${apiRequests.inputTokens}), 0)`,
      outputTokens: sql<number>`COALESCE(SUM(${apiRequests.outputTokens}), 0)`,
      cost: sql<number>`COALESCE(SUM(${apiRequests.costUsd}), 0)`,
      requests: sql<number>`COUNT(*)`,
    }).from(apiRequests)
      .where(and(...conditions))
      .groupBy(apiRequests.model)
      .orderBy(desc(sql`SUM(${apiRequests.costUsd})`));

    return rows.map(r => ({
      model: r.model,
      inputTokens: Number(r.inputTokens),
      outputTokens: Number(r.outputTokens),
      cost: Number(r.cost),
      requests: Number(r.requests),
    }));
  }

  async getBudgetAlerts(projectId?: string): Promise<BudgetAlert[]> {
    if (projectId) {
      return db.select().from(budgetAlerts).where(eq(budgetAlerts.projectId, projectId));
    }
    return db.select().from(budgetAlerts);
  }

  async createBudgetAlert(alert: InsertBudgetAlert): Promise<BudgetAlert> {
    const [created] = await db.insert(budgetAlerts).values(alert).returning();
    return created;
  }

  async updateBudgetAlert(id: string, data: Partial<InsertBudgetAlert>): Promise<BudgetAlert | undefined> {
    const [updated] = await db.update(budgetAlerts).set(data).where(eq(budgetAlerts.id, id)).returning();
    return updated;
  }

  async deleteBudgetAlert(id: string): Promise<void> {
    await db.delete(budgetAlerts).where(eq(budgetAlerts.id, id));
  }
}

export const storage = new DatabaseStorage();
