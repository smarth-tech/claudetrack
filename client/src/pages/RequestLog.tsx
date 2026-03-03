import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Activity, Clock, DollarSign, Cpu } from "lucide-react";
import type { Project, ApiRequest } from "@shared/schema";
import { format } from "date-fns";

function modelBadgeColor(model: string): string {
  if (model.includes("opus")) return "bg-amber-400/15 text-amber-400 border-0";
  if (model.includes("sonnet")) return "bg-blue-400/15 text-blue-400 border-0";
  if (model.includes("haiku")) return "bg-green-400/15 text-green-400 border-0";
  return "bg-muted text-muted-foreground border-0";
}

function modelShort(model: string): string {
  if (model.includes("opus")) return "Opus";
  if (model.includes("sonnet")) return "Sonnet";
  if (model.includes("haiku")) return "Haiku";
  return model;
}

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function RequestLog() {
  const [projectId, setProjectId] = useState<string>("all");
  const [limit, setLimit] = useState("50");

  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });

  const pid = projectId === "all" ? undefined : projectId;

  const { data: requests, isLoading } = useQuery<ApiRequest[]>({
    queryKey: ["/api/requests", pid, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ limit });
      if (pid) params.set("projectId", pid);
      const res = await fetch(`/api/requests?${params}`);
      return res.json();
    },
    refetchInterval: 10000,
  });

  const totalCost = requests?.reduce((s, r) => s + Number(r.costUsd), 0) || 0;
  const totalTokens = requests?.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0) || 0;

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
        <div>
          <h1 className="text-xl font-bold">Request Log</h1>
          <p className="text-sm text-muted-foreground">Live API request tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-40 h-9" data-testid="select-project-filter">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="w-28 h-9" data-testid="select-limit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">Last 25</SelectItem>
              <SelectItem value="50">Last 50</SelectItem>
              <SelectItem value="100">Last 100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Requests Shown", value: requests?.length || 0, icon: Activity, color: "text-blue-400" },
            { label: "Total Tokens", value: fmt(totalTokens), icon: Cpu, color: "text-purple-400" },
            { label: "Total Cost", value: totalCost >= 0.01 ? `$${totalCost.toFixed(4)}` : `$${totalCost.toFixed(6)}`, icon: DollarSign, color: "text-green-400" },
          ].map(s => (
            <Card key={s.label} className="p-3 border-border/60">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <div className="text-xl font-bold">{s.value}</div>
            </Card>
          ))}
        </div>

        <Card className="border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Time</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Model</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Tokens</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Cost</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Latency</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Session</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }, (_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      {Array.from({ length: 7 }, (_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : requests?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                      No requests yet. Point your SDK at our proxy to start tracking.
                    </td>
                  </tr>
                ) : (
                  requests?.map(r => (
                    <tr
                      key={r.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                      data-testid={`row-request-${r.id}`}
                    >
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {r.timestamp ? format(new Date(r.timestamp), "MMM d, HH:mm:ss") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${modelBadgeColor(r.model)}`}>
                          {modelShort(r.model)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="text-blue-400">{fmt(r.inputTokens)}</span>
                        <span className="text-muted-foreground mx-1">+</span>
                        <span className="text-purple-400">{fmt(r.outputTokens)}</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono">
                        ${Number(r.costUsd).toFixed(Number(r.costUsd) >= 0.01 ? 4 : 6)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {r.latencyMs ? `${r.latencyMs}ms` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {r.sessionId ? r.sessionId.slice(0, 12) + "…" : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs border-0 ${r.statusCode === 200 ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
                          {r.statusCode || "—"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
