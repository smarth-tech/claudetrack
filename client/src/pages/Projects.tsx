import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useState } from "react";
import { Plus, Copy, Check, Trash2, FolderOpen, DollarSign, Key, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Project } from "@shared/schema";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  anthropicKey: z.string().optional(),
  monthlyBudget: z.string().optional(),
  alertThreshold: z.coerce.number().min(1).max(100).default(80),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button size="icon" variant="ghost" onClick={copy} className="h-7 w-7" data-testid="button-copy">
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </Button>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { toast } = useToast();
  const [showKey, setShowKey] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/projects/${project.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project deleted" });
    },
  });

  const maskedKey = project.proxyKey.slice(0, 8) + "••••••••••••••••" + project.proxyKey.slice(-4);

  return (
    <Card className="p-5 border-border/60 hover-elevate" data-testid={`card-project-${project.id}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <Link href={`/projects/${project.id}`}>
              <h3 className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors" data-testid={`link-project-${project.id}`}>
                {project.name}
              </h3>
            </Link>
            {project.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          data-testid={`button-delete-project-${project.id}`}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded-md">
          <div className="flex items-center gap-2 min-w-0">
            <Key className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs font-mono text-muted-foreground truncate">
              {showKey ? project.proxyKey : maskedKey}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowKey(!showKey)}
              className="h-6 w-6"
              data-testid={`button-toggle-key-${project.id}`}
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
            <CopyButton text={project.proxyKey} />
          </div>
        </div>

        {project.monthlyBudget && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <DollarSign className="w-3 h-3" />
            <span>Budget: ${Number(project.monthlyBudget).toFixed(2)}/mo · Alert at {project.alertThreshold}%</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created {new Date(project.createdAt!).toLocaleDateString()}</span>
          <Badge className="text-xs border-0 bg-green-400/10 text-green-400">Active</Badge>
        </div>
      </div>
    </Card>
  );
}

function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "", anthropicKey: "", monthlyBudget: "", alertThreshold: 80 },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectForm) => apiRequest("POST", "/api/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project created!", description: "Copy your proxy key and configure your SDK." });
      setOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Error", description: "Failed to create project", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-create-project">
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Claude App" {...field} data-testid="input-project-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description <span className="text-muted-foreground">(optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="What is this project?" {...field} data-testid="input-project-description" />
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="anthropicKey" render={({ field }) => (
              <FormItem>
                <FormLabel>Anthropic API Key <span className="text-muted-foreground">(optional)</span></FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-ant-api03-..."
                      {...field}
                      data-testid="input-anthropic-key"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1 h-7 w-7"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Required for proxy mode. Encrypted with AES-256-GCM before storage. Or use SDK-only mode without a key.
                </p>
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="monthlyBudget" render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Budget ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100.00" {...field} data-testid="input-budget" />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="alertThreshold" render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert at (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="100" placeholder="80" {...field} data-testid="input-threshold" />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-project">
              {createMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Projects() {
  const { data: projects, isLoading } = useQuery<Project[]>({ queryKey: ["/api/projects"] });

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
        <div>
          <h1 className="text-xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage your Claude API integrations</p>
        </div>
        <CreateProjectDialog />
      </div>

      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : projects?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first project to start tracking Claude API usage</p>
            <CreateProjectDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects?.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}

        <Card className="mt-6 p-5 border-border/60 bg-card/40">
          <h3 className="text-sm font-semibold mb-3">Quick Integration Guide</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Python / anthropic SDK</Label>
              <div className="mt-1 bg-muted/60 rounded-md px-3 py-2 font-mono text-xs text-muted-foreground">
                {`client = anthropic.Anthropic(\n  api_key="cti_your_proxy_key",\n  base_url="${window.location.origin}/proxy/v1"\n)`}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Node.js / @anthropic-ai/sdk</Label>
              <div className="mt-1 bg-muted/60 rounded-md px-3 py-2 font-mono text-xs text-muted-foreground">
                {`const client = new Anthropic({\n  apiKey: "cti_your_proxy_key",\n  baseURL: "${window.location.origin}/proxy/v1"\n})`}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
