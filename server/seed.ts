import { db } from "./db";
import { projects, apiRequests } from "@shared/schema";
import { storage } from "./storage";
import { eq, count } from "drizzle-orm";
import { sql } from "drizzle-orm";

const MODELS = [
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
  "claude-3-opus-20240229",
  "claude-3-haiku-20240307",
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

const PRICING: Record<string, { input: number; output: number }> = {
  "claude-3-5-sonnet-20241022": { input: 0.000003, output: 0.000015 },
  "claude-3-5-haiku-20241022": { input: 0.0000008, output: 0.000004 },
  "claude-3-opus-20240229": { input: 0.000015, output: 0.000075 },
  "claude-3-haiku-20240307": { input: 0.00000025, output: 0.00000125 },
};

export async function seed() {
  const [{ value: existingCount }] = await db.select({ value: count() }).from(projects);
  if (Number(existingCount) > 0) {
    console.log("[seed] Data already exists, skipping seed");
    return;
  }

  console.log("[seed] Seeding database...");

  const seedProjects = [
    {
      name: "Production API",
      description: "Main customer-facing Claude integration",
      monthlyBudget: "500.00",
      alertThreshold: 80,
    },
    {
      name: "Dev Environment",
      description: "Internal developer tooling and experiments",
      monthlyBudget: "100.00",
      alertThreshold: 90,
    },
    {
      name: "Claude Code Sessions",
      description: "Monitoring Claude Code CLI usage via OTEL",
      monthlyBudget: "200.00",
      alertThreshold: 75,
    },
  ];

  const createdProjects: { id: string }[] = [];

  for (const p of seedProjects) {
    const project = await storage.createProject(p);
    createdProjects.push(project);
  }

  const requestsToInsert: any[] = [];

  for (const project of createdProjects) {
    for (let day = 30; day >= 0; day--) {
      const reqs = randInt(5, 40);
      for (let r = 0; r < reqs; r++) {
        const model = randChoice(MODELS);
        const pricing = PRICING[model];
        const inputTokens = randInt(100, 4000);
        const outputTokens = randInt(50, 2000);
        const cost = inputTokens * pricing.input + outputTokens * pricing.output;
        const timestamp = new Date(daysAgo(day).getTime() + randInt(0, 86400000));
        const sessions = ["sess_a1b2c3", "sess_d4e5f6", "sess_g7h8i9", "sess_j0k1l2", null];

        requestsToInsert.push({
          projectId: project.id,
          sessionId: randChoice(sessions),
          model,
          inputTokens,
          outputTokens,
          cacheReadTokens: randInt(0, 200),
          cacheWriteTokens: randInt(0, 50),
          costUsd: cost.toFixed(8),
          latencyMs: randInt(200, 3500),
          timestamp,
          endpoint: "/v1/messages",
          statusCode: 200,
        });
      }
    }
  }

  if (requestsToInsert.length > 0) {
    for (let i = 0; i < requestsToInsert.length; i += 100) {
      await db.insert(apiRequests).values(requestsToInsert.slice(i, i + 100));
    }
  }

  console.log(`[seed] Seeded ${createdProjects.length} projects and ${requestsToInsert.length} requests`);
}
