import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { DollarSign, Cpu, Clock, Activity, TrendingUp, Zap } from "lucide-react";
import type { Project } from "@shared/schema";
import { format } from "date-fns";

function fmt(n: number | null | undefined, decimals = 2) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(decimals);
}

function fmtCost(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

const MODEL_COLORS: Record<string, string> = {
  "claude-3-5-sonnet-20241022": "#3b82f6",
  "claude-3-5-haiku-20241022": "#a855f7",
  "claude-3-opus-20240229": "#f59e0b",
  "claude-3-haiku-20240307": "#10b981",
  "claude-opus-4-5": "#f43f5e",
  "claude-sonnet-4-5": "#06b6d4",
  "claude-haiku-4-5": "#8b5cf6",
};

function modelColor(model: string): string {
  return MODEL_COLORS[model] || "#6b7280";
}

function modelShort(model: string): string {
  if (model.includes("opus")) return "Opus";
  if (model.includes("sonnet")) return "Sonnet";
  if (model.includes("haiku")) return "Haiku";
  return model;
}

const CustomTooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "6px",
    fontSize: "12px",
    color: "hsl(var(--foreground))",
  },
};

export default function Dashboard() {
  const [period, setPeriod] = useState("month");
  const [projectId, setProjectId] = useState<string>("all");

  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });

  const pid = projectId === "all" ? undefined : projectId;

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["/api/analytics/overview", pid, period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (pid) params.set("projectId", pid);
      const res = await fetch(`/api/analytics/overview?${params}`);
      return res.json();
    },
  });

  const { data: timeseries, isLoading: tsLoading } = useQuery({
    queryKey: ["/api/analytics/timeseries", pid, period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (pid) params.set("projectId", pid);
      const res = await fetch(`/api/analytics/timeseries?${params}`);
      const data: any[] = await res.json();
      return data.map(d => ({
        ...d,
        time: format(new Date(d.time), period === "day" ? "HH:mm" : "MMM d"),
        cost: Number(d.cost),
        inputTokens: Number(d.inputTokens),
        outputTokens: Number(d.outputTokens),
        requests: Number(d.requests),
      }));
    },
  });

  const { data: models } = useQuery({
    queryKey: ["/api/analytics/models", pid, period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (pid) params.set("projectId", pid);
      const res = await fetch(`/api/analytics/models?${params}`);
      const data: any[] = await res.json();
      return data.map(d => ({ ...d, cost: Number(d.cost) }));
    },
  });

  const { data: rateLimit } = useQuery({
    queryKey: ["/api/rate-limit/predict", pid],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (pid) params.set("projectId", pid);
      const res = await fetch(`/api/rate-limit/predict?${params}`);
      return res.json();
    },
    refetchInterval: 15000,
  });

  const totalTokens = (overview?.totalInputTokens || 0) + (overview?.totalOutputTokens || 0);
  const periodLabel = period === "day" ? "Today" : period === "week" ? "This Week" : "This Month";

  const forecast = (() => {
    if (!overview?.totalCost) return null;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    if (period !== "month" || daysPassed === 0) return null;
    return (overview.totalCost / daysPassed) * daysInMonth;
  })();

  const statCards = [
    {
      label: `Total Tokens (${periodLabel})`,
      value: overviewLoading ? null : fmt(totalTokens),
      sub: overviewLoading ? null : `${fmt(overview?.totalInputTokens)} in · ${fmt(overview?.totalOutputTokens)} out`,
      icon: Cpu,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: `Total Cost (${periodLabel})`,
      value: overviewLoading ? null : fmtCost(overview?.totalCost || 0),
      sub: forecast ? `~${fmtCost(forecast)} projected month-end` : null,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Avg Latency",
      value: overviewLoading ? null : `${Math.round(overview?.avgLatency || 0)}ms`,
      sub: "per request",
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      label: `Total Requests`,
      value: overviewLoading ? null : fmt(overview?.requestCount || 0, 0),
      sub: periodLabel,
      icon: Activity,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Claude API usage intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-40 h-9" data-testid="select-project">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36 h-9" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.label} className="p-4 border-border/60" data-testid={`card-stat-${card.label.replace(/\s+/g, "-").toLowerCase()}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              {overviewLoading ? (
                <>
                  <Skeleton className="h-7 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{card.sub}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
                </>
              )}
            </Card>
          ))}
        </div>

        {rateLimit && (
          <Card className={`p-4 border-border/60 ${rateLimit.status === "critical" ? "border-red-500/50 bg-red-500/5" : rateLimit.status === "warning" ? "border-yellow-500/50 bg-yellow-500/5" : ""}`}>
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${rateLimit.status === "critical" ? "text-red-400" : rateLimit.status === "warning" ? "text-yellow-400" : "text-green-400"}`} />
                <span className="text-sm font-semibold">Rate Limit Monitor</span>
                <Badge
                  className={`text-xs border-0 ${rateLimit.status === "critical" ? "bg-red-400/15 text-red-400" : rateLimit.status === "warning" ? "bg-yellow-400/15 text-yellow-400" : "bg-green-400/15 text-green-400"}`}
                >
                  {rateLimit.status.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {rateLimit.currentWindowRequests}/{rateLimit.limitPerMinute} req/min · resets in {rateLimit.secondsRemaining}s
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${rateLimit.status === "critical" ? "bg-red-500" : rateLimit.status === "warning" ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${Math.min(rateLimit.percentUsed, 100)}%` }}
              />
            </div>
            {rateLimit.willExceedLimit && (
              <p className="text-xs text-red-400 mt-2">
                Warning: Projected {rateLimit.projectedByEndOfMinute} requests this minute — exceeds your {rateLimit.limitPerMinute} RPM limit.
              </p>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5 border-border/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Token Usage Over Time</h3>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            {tsLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeseries || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="inputGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outputGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} tickFormatter={(v) => fmt(v)} />
                  <Tooltip {...CustomTooltipStyle} formatter={(v: number) => [fmt(v), ""]} />
                  <Area type="monotone" dataKey="inputTokens" stroke="#3b82f6" fill="url(#inputGrad)" strokeWidth={2} name="Input" />
                  <Area type="monotone" dataKey="outputTokens" stroke="#a855f7" fill="url(#outputGrad)" strokeWidth={2} name="Output" />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-5 border-border/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Model Breakdown</h3>
            </div>
            {!models || models.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={models} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="cost" paddingAngle={2}>
                      {models.map((entry: any) => (
                        <Cell key={entry.model} fill={modelColor(entry.model)} />
                      ))}
                    </Pie>
                    <Tooltip {...CustomTooltipStyle} formatter={(v: number) => [fmtCost(v), "Cost"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {models.map((m: any) => (
                    <div key={m.model} className="flex items-center justify-between text-xs" data-testid={`model-row-${m.model}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: modelColor(m.model) }} />
                        <span className="text-muted-foreground">{modelShort(m.model)}</span>
                      </div>
                      <div className="font-medium">{fmtCost(m.cost)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        <Card className="p-5 border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Daily Cost Trend</h3>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </div>
          {tsLoading ? (
            <Skeleton className="h-36 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={timeseries || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                <Tooltip {...CustomTooltipStyle} formatter={(v: number) => [fmtCost(v), "Cost"]} />
                <Bar dataKey="cost" fill="#3b82f6" fillOpacity={0.8} radius={[3, 3, 0, 0]} name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
