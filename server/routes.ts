import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, decryptApiKey } from "./storage";
import { insertProjectSchema, insertBudgetAlertSchema, MODEL_PRICING } from "@shared/schema";
import { z } from "zod";

function computeCost(model: string, inputTokens: number, outputTokens: number, cacheRead = 0, cacheWrite = 0): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING["claude-3-5-sonnet-20241022"];
  return (
    inputTokens * pricing.input +
    outputTokens * pricing.output +
    cacheRead * pricing.cacheRead +
    cacheWrite * pricing.cacheWrite
  );
}

function getMonthStart(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.get("/api/projects", async (_req, res) => {
    const projects = await storage.getProjects();
    const sanitized = projects.map(p => ({ ...p, anthropicKeyEncrypted: undefined }));
    res.json(sanitized);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json({ ...project, anthropicKeyEncrypted: undefined });
  });

  app.post("/api/projects", async (req, res) => {
    const schema = insertProjectSchema.extend({
      anthropicKey: z.string().optional(),
      monthlyBudget: z.preprocess(
        v => (v === "" || v === null || v === undefined ? undefined : v),
        z.string().optional()
      ),
    });
    const body = schema.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: body.error.flatten() });

    const { anthropicKey, ...projectData } = body.data;
    const project = await storage.createProject({ ...projectData, anthropicKey });
    res.json({ ...project, anthropicKeyEncrypted: undefined });
  });

  app.patch("/api/projects/:id", async (req, res) => {
    const project = await storage.updateProject(req.params.id, req.body);
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json({ ...project, anthropicKeyEncrypted: undefined });
  });

  app.delete("/api/projects/:id", async (req, res) => {
    await storage.deleteProject(req.params.id);
    res.json({ ok: true });
  });

  app.get("/api/analytics/overview", async (req, res) => {
    const projectId = req.query.projectId as string | undefined;
    const period = (req.query.period as string) || "month";
    const since = period === "day" ? getDayStart() : period === "week" ? getWeekStart() : getMonthStart();

    const stats = projectId
      ? await storage.getProjectStats(projectId, since)
      : await storage.getAggregateStats(since);

    res.json(stats);
  });

  app.get("/api/analytics/timeseries", async (req, res) => {
    const projectId = (req.query.projectId as string) || null;
    const period = (req.query.period as string) || "week";
    const interval = period === "day" ? "hour" : "day";
    const since = period === "day" ? getDayStart() : period === "week" ? getWeekStart() : getMonthStart();

    const data = await storage.getTokensOverTime(projectId, since, interval);
    res.json(data);
  });

  app.get("/api/analytics/models", async (req, res) => {
    const projectId = (req.query.projectId as string) || null;
    const period = (req.query.period as string) || "month";
    const since = period === "day" ? getDayStart() : period === "week" ? getWeekStart() : getMonthStart();

    const data = await storage.getModelBreakdown(projectId, since);
    res.json(data);
  });

  app.get("/api/requests", async (req, res) => {
    const projectId = req.query.projectId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const requests = await storage.getApiRequests(projectId, limit);
    res.json(requests);
  });

  app.get("/api/alerts", async (req, res) => {
    const projectId = req.query.projectId as string | undefined;
    const alerts = await storage.getBudgetAlerts(projectId);
    res.json(alerts);
  });

  app.post("/api/alerts", async (req, res) => {
    const body = insertBudgetAlertSchema.safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: body.error.flatten() });
    const alert = await storage.createBudgetAlert(body.data);
    res.json(alert);
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    await storage.deleteBudgetAlert(req.params.id);
    res.json({ ok: true });
  });

  app.get("/api/rate-limit/predict", async (req, res) => {
    const projectId = req.query.projectId as string | undefined;
    const windowStart = new Date(Date.now() - 60 * 1000);
    const requests = await storage.getApiRequests(projectId, 200, windowStart);
    const recentCount = requests.length;
    const ANTHROPIC_RPM_LIMIT = 50;
    const pctUsed = (recentCount / ANTHROPIC_RPM_LIMIT) * 100;

    const now = new Date();
    const secondsIntoMinute = now.getSeconds() + now.getMilliseconds() / 1000;
    const secondsRemaining = 60 - secondsIntoMinute;
    const projectedByEOM = recentCount > 0
      ? Math.round((recentCount / secondsIntoMinute) * 60)
      : 0;

    res.json({
      currentWindowRequests: recentCount,
      limitPerMinute: ANTHROPIC_RPM_LIMIT,
      percentUsed: Math.min(pctUsed, 100),
      projectedByEndOfMinute: projectedByEOM,
      secondsRemaining: Math.round(secondsRemaining),
      willExceedLimit: projectedByEOM > ANTHROPIC_RPM_LIMIT,
      status: pctUsed >= 90 ? "critical" : pctUsed >= 70 ? "warning" : "ok",
    });
  });

  app.all("/proxy/v1/*path", async (req: Request, res: Response) => {
    const authHeader = req.headers["authorization"];
    const proxyKey = authHeader?.replace("Bearer ", "").trim();

    if (!proxyKey) {
      return res.status(401).json({ error: { type: "authentication_error", message: "No proxy key provided" } });
    }

    const project = await storage.getProjectByProxyKey(proxyKey);
    if (!project) {
      return res.status(401).json({ error: { type: "authentication_error", message: "Invalid proxy key" } });
    }

    if (!project.anthropicKeyEncrypted) {
      return res.status(400).json({ error: { type: "invalid_request_error", message: "No Anthropic API key configured for this project" } });
    }

    let anthropicKey: string;
    try {
      anthropicKey = decryptApiKey(project.anthropicKeyEncrypted);
    } catch {
      return res.status(500).json({ error: { type: "api_error", message: "Failed to decrypt API key" } });
    }

    const targetPath = Array.isArray(req.params.path) ? req.params.path.join("/") : (req.params.path || "");
    const targetUrl = `https://api.anthropic.com/v1/${targetPath}`;

    const startTime = Date.now();
    let statusCode = 200;

    try {
      const headers: Record<string, string> = {
        "x-api-key": anthropicKey,
        "anthropic-version": (req.headers["anthropic-version"] as string) || "2023-06-01",
        "content-type": "application/json",
      };

      const fetchRes = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
      });

      statusCode = fetchRes.status;
      const latencyMs = Date.now() - startTime;

      const responseBody = await fetchRes.json();

      const usage = responseBody?.usage;
      const model = req.body?.model || responseBody?.model || "claude-3-5-sonnet-20241022";
      const inputTokens = usage?.input_tokens || 0;
      const outputTokens = usage?.output_tokens || 0;
      const cacheRead = usage?.cache_read_input_tokens || 0;
      const cacheWrite = usage?.cache_creation_input_tokens || 0;
      const cost = computeCost(model, inputTokens, outputTokens, cacheRead, cacheWrite);

      const sessionId = req.headers["x-session-id"] as string || null;

      if (fetchRes.ok && inputTokens > 0) {
        await storage.createApiRequest({
          projectId: project.id,
          sessionId,
          model,
          inputTokens,
          outputTokens,
          cacheReadTokens: cacheRead,
          cacheWriteTokens: cacheWrite,
          costUsd: cost.toFixed(8),
          latencyMs,
          endpoint: `/v1/${targetPath}`,
          statusCode,
        });
      }

      res.status(statusCode).json(responseBody);
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      console.error("Proxy error:", err);
      res.status(500).json({ error: { type: "api_error", message: "Proxy error" } });
    }
  });

  app.post("/api/track", async (req, res) => {
    const { proxyKey, model, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, latencyMs, sessionId, endpoint } = req.body;

    if (!proxyKey) return res.status(401).json({ error: "Proxy key required" });

    const project = await storage.getProjectByProxyKey(proxyKey);
    if (!project) return res.status(401).json({ error: "Invalid proxy key" });

    const cost = computeCost(
      model || "claude-3-5-sonnet-20241022",
      inputTokens || 0,
      outputTokens || 0,
      cacheReadTokens || 0,
      cacheWriteTokens || 0
    );

    const apiRequest = await storage.createApiRequest({
      projectId: project.id,
      sessionId: sessionId || null,
      model: model || "claude-3-5-sonnet-20241022",
      inputTokens: inputTokens || 0,
      outputTokens: outputTokens || 0,
      cacheReadTokens: cacheReadTokens || 0,
      cacheWriteTokens: cacheWriteTokens || 0,
      costUsd: cost.toFixed(8),
      latencyMs: latencyMs || null,
      endpoint: endpoint || "/v1/messages",
      statusCode: 200,
    });

    res.json({ ok: true, cost, requestId: apiRequest.id });
  });

  return httpServer;
}
