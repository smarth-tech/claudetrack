import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Bell, Plus, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Project, BudgetAlert } from "@shared/schema";

const createAlertSchema = z.object({
  projectId: z.string().min(1, "Project required"),
  alertType: z.enum(["monthly", "daily"]),
  thresholdPercent: z.coerce.number().min(1).max(100),
});

type CreateAlertForm = z.infer<typeof createAlertSchema>;

function AlertCard({ alert, projects }: { alert: BudgetAlert; projects: Project[] }) {
  const { toast } = useToast();
  const project = projects.find(p => p.id === alert.projectId);

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/alerts/${alert.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({ title: "Alert deleted" });
    },
  });

  const isTriggered = alert.lastTriggeredAt && new Date(alert.lastTriggeredAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);

  return (
    <Card className={`p-4 border-border/60 ${isTriggered ? "border-red-400/30" : ""}`} data-testid={`card-alert-${alert.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${alert.isActive ? "bg-orange-400/15" : "bg-muted"}`}>
            <Bell className={`w-4 h-4 ${alert.isActive ? "text-orange-400" : "text-muted-foreground"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-medium">
                {alert.alertType === "monthly" ? "Monthly" : "Daily"} Budget Alert
              </span>
              <Badge className={`text-xs border-0 ${alert.isActive ? "bg-green-400/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                {alert.isActive ? "Active" : "Disabled"}
              </Badge>
              {isTriggered && (
                <Badge className="text-xs border-0 bg-red-400/10 text-red-400">
                  Triggered Recently
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {project?.name || "Unknown Project"} · Alert at {alert.thresholdPercent}% of budget
            </div>
            {alert.lastTriggeredAt && (
              <div className="text-xs text-muted-foreground mt-0.5">
                Last triggered: {new Date(alert.lastTriggeredAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground flex-shrink-0"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          data-testid={`button-delete-alert-${alert.id}`}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
}

function CreateAlertDialog({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateAlertForm>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: { projectId: projects[0]?.id || "", alertType: "monthly", thresholdPercent: 80 },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAlertForm) => apiRequest("POST", "/api/alerts", { ...data, isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({ title: "Alert created!" });
      setOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Error", description: "Failed to create alert", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-create-alert">
          <Plus className="w-4 h-4" /> New Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Budget Alert</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
            <FormField control={form.control} name="projectId" render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger data-testid="select-alert-project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="alertType" render={({ field }) => (
              <FormItem>
                <FormLabel>Alert Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger data-testid="select-alert-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Budget</SelectItem>
                    <SelectItem value="daily">Daily Limit</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            <FormField control={form.control} name="thresholdPercent" render={({ field }) => (
              <FormItem>
                <FormLabel>Alert Threshold (%)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={100} placeholder="80" {...field} data-testid="input-threshold-percent" />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  You'll be alerted when you reach this % of your project's budget.
                </p>
              </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-alert">
              {createMutation.isPending ? "Creating..." : "Create Alert"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Alerts() {
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: alerts, isLoading } = useQuery<BudgetAlert[]>({ queryKey: ["/api/alerts"] });

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
        <div>
          <h1 className="text-xl font-bold">Budget Alerts</h1>
          <p className="text-sm text-muted-foreground">Get notified before you exceed your budget</p>
        </div>
        {projects && projects.length > 0 && <CreateAlertDialog projects={projects} />}
      </div>

      <div className="flex-1 p-6 space-y-4">
        <Card className="p-5 border-border/60 bg-card/40">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold mb-1">How Budget Alerts Work</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Alerts trigger when your project's spend reaches a threshold of its monthly budget.
                Configure a budget on your project, then set alert thresholds here (e.g., 80% of budget).
                Alerts are checked on every proxied request.
              </p>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : alerts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold mb-1">No alerts configured</h3>
            <p className="text-sm text-muted-foreground mb-4">Create an alert to be notified when you're approaching your budget</p>
            {projects && projects.length > 0
              ? <CreateAlertDialog projects={projects} />
              : <p className="text-sm text-muted-foreground">Create a project first</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {alerts?.map(a => (
              <AlertCard key={a.id} alert={a} projects={projects || []} />
            ))}
          </div>
        )}

        <Card className="p-5 border-border/60">
          <h3 className="text-sm font-semibold mb-3">Upcoming Alert Features</h3>
          <div className="space-y-2">
            {[
              "Email notifications when threshold is crossed",
              "Slack / Discord webhook integration",
              "Automatic request pause at hard limits",
              "Per-session budget limits",
              "Team-wide spend controls",
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-muted-foreground/40" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
