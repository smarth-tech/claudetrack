import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Zap, AlertTriangle, CheckCircle, TrendingUp, Clock, Activity } from "lucide-react";
import type { Project } from "@shared/schema";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "6px",
    fontSize: "12px",
    color: "hsl(var(--foreground))",
  },
};

const ANTHROPIC_LIMITS = [
  { tier: "Free", rpmLimit: 5, tpmLimit: 25_000, description: "5 RPM, 25K TPM" },
  { tier: "Build Tier 1", rpmLimit: 50, tpmLimit: 50_000, description: "50 RPM, 50K TPM" },
  { tier: "Build Tier 2", rpmLimit: 1000, tpmLimit: 100_000, description: "1K RPM, 100K TPM" },
  { tier: "Build Tier 3", rpmLimit: 2000, tpmLimit: 200_000, description: "2K RPM, 200K TPM" },
  { tier: "Build Tier 4", rpmLimit: 4000, tpmLimit: 400_000, description: "4K RPM, 400K TPM" },
];

export default function RateLimits() {
  const [projectId, setProjectId] = useState<string>("all");
  const [history, setHistory] = useState<Array<{ time: string; requests: number; pct: number }>>([]);

  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });

  const pid = projectId === "all" ? undefined : projectId;

  const { data: rateLimit } = useQuery({
    queryKey: ["/api/rate-limit/predict", pid],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (pid) params.set("projectId", pid);
      const res = await fetch(`/api/rate-limit/predict?${params}`);
      return res.json();
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (rateLimit) {
      const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setHistory(prev => {
        const updated = [...prev, {
          time: now,
          requests: rateLimit.currentWindowRequests,
          pct: rateLimit.percentUsed,
        }].slice(-20);
        return updated;
      });
    }
  }, [rateLimit]);

  const statusColor = rateLimit?.status === "critical" ? "text-red-400" : rateLimit?.status === "warning" ? "text-yellow-400" : "text-green-400";
  const statusBg = rateLimit?.status === "critical" ? "bg-red-400/10 border-red-400/30" : rateLimit?.status === "warning" ? "bg-yellow-400/10 border-yellow-400/30" : "bg-green-400/10 border-green-400/30";

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold">Rate Limit Monitor</h1>
            <p className="text-sm text-muted-foreground">Live rate limit tracking and prediction</p>
          </div>
          <Badge className="bg-green-400/10 text-green-400 border-green-400/20 text-xs">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse inline-block" />
            Live
          </Badge>
        </div>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-40 h-9" data-testid="select-project-ratelimit">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {rateLimit && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className={`p-4 border ${statusBg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className={`w-4 h-4 ${statusColor}`} />
                  <span className="text-xs text-muted-foreground">Current Usage</span>
                </div>
                <div className="text-2xl font-bold">{rateLimit.currentWindowRequests}</div>
                <div className="text-xs text-muted-foreground">of {rateLimit.limitPerMinute} RPM</div>
              </Card>

              <Card className="p-4 border-border/60">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground">Projected RPM</span>
                </div>
                <div className="text-2xl font-bold">{rateLimit.projectedByEndOfMinute}</div>
                <div className="text-xs text-muted-foreground">by end of window</div>
              </Card>

              <Card className="p-4 border-border/60">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">Window Resets</span>
                </div>
                <div className="text-2xl font-bold">{rateLimit.secondsRemaining}s</div>
                <div className="text-xs text-muted-foreground">seconds remaining</div>
              </Card>

              <Card className="p-4 border-border/60">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-muted-foreground">Status</span>
                </div>
                <div className={`text-lg font-bold capitalize ${statusColor}`}>{rateLimit.status}</div>
                <div className="text-xs text-muted-foreground">{rateLimit.percentUsed.toFixed(1)}% used</div>
              </Card>
            </div>

            <Card className={`p-5 border ${rateLimit.willExceedLimit ? "border-red-400/30 bg-red-400/5" : "border-border/60"}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {rateLimit.willExceedLimit
                    ? <AlertTriangle className="w-4 h-4 text-red-400" />
                    : <CheckCircle className="w-4 h-4 text-green-400" />}
                  <span className="text-sm font-semibold">Rate Limit Prediction</span>
                </div>
                <span className="text-sm font-bold">{rateLimit.percentUsed.toFixed(1)}%</span>
              </div>

              <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${rateLimit.status === "critical" ? "bg-red-500" : rateLimit.status === "warning" ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(rateLimit.percentUsed, 100)}%` }}
                />
              </div>

              {rateLimit.willExceedLimit ? (
                <div className="flex items-start gap-2 text-sm text-red-400">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Rate limit will be exceeded</span>
                    <span className="text-muted-foreground ml-2">
                      Projected {rateLimit.projectedByEndOfMinute} req vs {rateLimit.limitPerMinute} RPM limit.
                      Consider implementing exponential backoff.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Within safe limits · Projected {rateLimit.projectedByEndOfMinute}/{rateLimit.limitPerMinute} requests this window</span>
                </div>
              )}
            </Card>

            {history.length > 1 && (
              <Card className="p-5 border-border/60">
                <h3 className="text-sm font-semibold mb-4">Request Rate History (Last 20 Polls)</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                    <Tooltip {...CustomTooltipStyle} />
                    <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="url(#rateGrad)" strokeWidth={2} name="Requests" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            )}
          </>
        )}

        <Card className="p-5 border-border/60">
          <h3 className="text-sm font-semibold mb-4">Anthropic Rate Limits by Tier</h3>
          <div className="space-y-2">
            {ANTHROPIC_LIMITS.map((tier) => (
              <div key={tier.tier} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div>
                  <div className="text-sm font-medium">{tier.tier}</div>
                  <div className="text-xs text-muted-foreground">{tier.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono">{tier.rpmLimit.toLocaleString()} RPM</div>
                  <div className="text-xs text-muted-foreground">{(tier.tpmLimit / 1000).toFixed(0)}K TPM</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Limits apply per model family. ClaudeTrack monitors your actual usage against these limits in real-time.
          </p>
        </Card>
      </div>
    </div>
  );
}
