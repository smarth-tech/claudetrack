import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Zap, BarChart3, Shield, AlertTriangle, TrendingUp, Terminal,
  Code2, ArrowRight, CheckCircle, Activity, DollarSign, Clock,
  Lock, Eye, Globe, Cpu, GitBranch, Star, Users, Heart,
  GitPullRequest, BookOpen, Package, Sparkles
} from "lucide-react";
import { SiGithub, SiPython, SiTypescript, SiDocker } from "react-icons/si";

const features = [
  {
    icon: BarChart3,
    title: "Real-Time Token Analytics",
    description: "Track input/output tokens, cache hits, and costs per request with millisecond precision. See exactly where your budget goes.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: TrendingUp,
    title: "Cost Forecasting",
    description: "Spend predictions based on your usage patterns. Know your month-end bill before it arrives.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Zap,
    title: "Rate Limit Prediction",
    description: "The only tool built for Claude subscription users. Predict when you'll hit limits before your requests start failing.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: AlertTriangle,
    title: "Budget Alerts",
    description: "Set thresholds and get notified before you exceed your budget. Configure per-project or global spend limits.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    icon: Activity,
    title: "Per-Session Analytics",
    description: "Group requests by session ID to understand individual workflows. Perfect for Claude Code and agentic pipelines.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: Terminal,
    title: "Claude Code OTEL",
    description: "Monitor Claude Code CLI sessions via OpenTelemetry. First platform to give devs visibility into their AI-assisted coding costs.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
];

const securityPoints = [
  "Your API key is AES-256-GCM encrypted before storage",
  "Keys are never returned to the frontend",
  "SDK-only mode available — key never leaves your server",
  "Decryption only happens server-side during proxy forwarding",
  "No plaintext storage, ever",
];

const steps = [
  {
    num: "01",
    title: "Get your proxy key",
    description: "Create a project and grab your unique proxy key from the Projects page. Takes 30 seconds.",
    code: "cti_a3b7x9k2p9n3m7...",
    note: "Your proxy key",
  },
  {
    num: "02",
    title: "Set two env vars — nothing else",
    description: "The Anthropic SDK reads these automatically. Zero code changes. Works with Python, Node, Go, Ruby, and anything else that uses the Anthropic SDK.",
    code: `ANTHROPIC_API_KEY="cti_your_proxy_key"
ANTHROPIC_BASE_URL="https://your-instance.repl.co/proxy/v1"

# Run your code exactly as before — nothing changes.`,
    note: ".env · Docker · Railway · Render · Vercel · Fly.io",
  },
  {
    num: "03",
    title: "Open the dashboard",
    description: "Every Claude API call is now tracked. Tokens, cost, latency, rate limits — live and per-project.",
    code: "✓ 2,847 tokens  ·  $0.0091  ·  1.2s  ·  claude-3-5-sonnet",
    note: "Real-time request log",
  },
];

const contributionAreas = [
  {
    icon: GitPullRequest,
    title: "Submit Pull Requests",
    description: "Fix bugs, add features, improve the proxy middleware, or enhance the dashboard UI.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: BookOpen,
    title: "Improve Documentation",
    description: "Help write clearer setup guides, add language-specific SDK examples, or translate docs.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: Package,
    title: "Build Integrations",
    description: "Add SDK wrappers for new languages, OTEL connectors, or notification channels for alerts.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Star,
    title: "Report Issues",
    description: "Found a bug or have a feature idea? Open an issue on GitHub. Every piece of feedback helps.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
];

const techStack = [
  "React + TypeScript",
  "Express.js",
  "PostgreSQL + Drizzle ORM",
  "Recharts",
  "Tailwind CSS + shadcn/ui",
  "TanStack Query",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">ClaudeTrack</span>
            <Badge className="text-xs border-0 bg-green-400/10 text-green-400 ml-1">Open Source</Badge>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/anthropics/anthropic-sdk-python/issues" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="link-github">
                <SiGithub className="w-4 h-4" /> GitHub
              </Button>
            </a>
            <Link href="/setup">
              <Button variant="ghost" size="sm" data-testid="link-setup">Docs</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" data-testid="button-get-started">Open Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <Badge className="bg-primary/15 text-primary border-primary/20 text-xs px-3 py-1" data-testid="badge-announcement">
              Claude-native · Rate limit prediction · OTEL support
            </Badge>
            <Badge className="bg-green-400/10 text-green-400 border-green-400/20 text-xs px-3 py-1">
              <Heart className="w-3 h-3 mr-1" /> Free & Open Source
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            Stop Flying Blind with{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Claude API
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
            The first Claude-native observability platform. Real-time token tracking, cost forecasting,
            and rate limit prediction — self-hosted, open source, and free forever.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2" data-testid="button-hero-cta">
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2" data-testid="button-star-github">
                <SiGithub className="w-4 h-4" /> Star on GitHub
              </Button>
            </a>
          </div>

          <div className="relative mx-auto max-w-3xl rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-card/60">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">claudetrack / dashboard</span>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Tokens Today", value: "2.4M", icon: Cpu, color: "text-blue-400" },
                { label: "Cost MTD", value: "$12.40", icon: DollarSign, color: "text-green-400" },
                { label: "Avg Latency", value: "1.2s", icon: Clock, color: "text-yellow-400" },
                { label: "Rate Limit", value: "34%", icon: Zap, color: "text-purple-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card/60 rounded-lg p-3 border border-border/40">
                  <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <div className="h-20 bg-card/40 rounded-lg border border-border/40 flex items-end gap-1 p-3 overflow-hidden">
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/60 rounded-sm"
                    style={{ height: `${20 + Math.sin(i * 0.8) * 15 + Math.random() * 25}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-y border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything you need to ship confidently</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Helicone is great, but it's not Claude-native. ClaudeTrack is built specifically for
              Claude's pricing model, rate limits, and subscription tiers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <Card key={f.title} className="p-5 hover-elevate cursor-default border-border/60">
                <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-3">Up and running in 3 steps</h2>
            <p className="text-muted-foreground mb-6">No refactoring. No SDK swaps. Just two environment variables.</p>
            <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 text-green-400 text-sm font-semibold px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              Works with any language or framework that uses the Anthropic SDK
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {[
              { icon: SiPython, label: "Python", color: "text-blue-400" },
              { icon: SiTypescript, label: "TypeScript", color: "text-blue-300" },
              { icon: SiDocker, label: "Docker", color: "text-cyan-400" },
              { label: "LangChain", color: "text-green-400" },
              { label: "LlamaIndex", color: "text-orange-400" },
              { label: "Vercel AI SDK", color: "text-purple-400" },
              { label: "FastAPI", color: "text-teal-400" },
            ].map((tech) => (
              <div key={tech.label} className="flex items-center gap-1.5 bg-card border border-border/60 rounded-full px-3 py-1.5 text-xs text-muted-foreground">
                {"icon" in tech && tech.icon && <tech.icon className={`w-3.5 h-3.5 ${tech.color}`} />}
                {!("icon" in tech) && <span className={`w-2 h-2 rounded-full bg-current ${tech.color}`} />}
                <span>{tech.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{step.num}</span>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                  <div className={`rounded-lg border overflow-hidden ${step.num === "02" ? "border-green-400/30" : "border-border/60"}`}>
                    {step.note && (
                      <div className={`px-4 py-1.5 border-b text-xs font-medium ${step.num === "02" ? "bg-green-400/10 border-green-400/20 text-green-400" : "bg-muted/40 border-border/40 text-muted-foreground"}`}>
                        {step.note}
                      </div>
                    )}
                    <div className={`px-4 py-3 font-mono text-xs text-muted-foreground whitespace-pre ${step.num === "02" ? "bg-green-400/5" : "bg-card"}`}>
                      {step.code}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-y border-border/40 bg-card/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-green-400" />
                <Badge className="bg-green-400/10 text-green-400 border-green-400/20">Security-First Design</Badge>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                We know you won't hand over your API key without reason.
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                ClaudeTrack is designed with this concern front and center. Since it's open source,
                you can audit every line of code. Self-host it and your data never leaves your infrastructure.
              </p>
              <ul className="space-y-3">
                {securityPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0">
              <div className="w-64 bg-card border border-border/60 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">AES-256-GCM</div>
                    <div className="text-xs text-muted-foreground">Encrypted at rest</div>
                  </div>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-400/20 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Fully auditable</div>
                    <div className="text-xs text-muted-foreground">100% open source code</div>
                  </div>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-400/20 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Self-hostable</div>
                    <div className="text-xs text-muted-foreground">Your infra, your data</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-4">
              <GitBranch className="w-5 h-5 text-primary" />
              <Badge className="bg-primary/10 text-primary border-primary/20">Open Source</Badge>
            </div>
            <h2 className="text-3xl font-bold mb-3">Built in the open. Improved together.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              ClaudeTrack is MIT-licensed. Fork it, self-host it, contribute back. Every PR welcome.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
            {contributionAreas.map((area) => (
              <Card key={area.title} className="p-5 border-border/60 hover-elevate cursor-default">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${area.bg} flex items-center justify-center flex-shrink-0`}>
                    <area.icon className={`w-5 h-5 ${area.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{area.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{area.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="p-5 border-border/60 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">Community-first</div>
              <p className="text-sm text-muted-foreground">Decisions made in the open via GitHub issues and discussions</p>
            </Card>
            <Card className="p-5 border-border/60 text-center">
              <GitBranch className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">MIT Licensed</div>
              <p className="text-sm text-muted-foreground">Use it, fork it, build on it. No strings attached.</p>
            </Card>
            <Card className="p-5 border-border/60 text-center">
              <Heart className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">Free Forever</div>
              <p className="text-sm text-muted-foreground">No paywalls, no tiers, no limits. Self-host for free.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 border-y border-border/40 bg-card/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Tech Stack</h2>
            <p className="text-muted-foreground text-sm">Familiar, modern, easy to contribute to</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {techStack.map((tech) => (
              <Badge key={tech} className="px-3 py-1.5 text-sm border-border/60 bg-card text-muted-foreground">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to contribute or self-host?</h2>
          <p className="text-muted-foreground mb-8">
            Fork the repo, deploy your own instance in minutes, or open a PR. The community is building this together.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2" data-testid="button-footer-github">
                <SiGithub className="w-4 h-4" /> View on GitHub
              </Button>
            </a>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2" data-testid="button-footer-cta">
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">ClaudeTrack</span>
            <span>— MIT Licensed · Claude Usage Intelligence Platform</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link href="/setup"><span className="cursor-pointer hover:text-foreground transition-colors">Docs</span></Link>
            <Link href="/dashboard"><span className="cursor-pointer hover:text-foreground transition-colors">Dashboard</span></Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
