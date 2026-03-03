import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Copy, Check, Zap, Shield, Star, ChevronRight, Terminal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SiPython, SiTypescript, SiDocker, SiGo } from "react-icons/si";
import type { Project } from "@shared/schema";

function CodeBlock({ code, language = "bash", highlight = false }: { code: string; language?: string; highlight?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className={`rounded-lg overflow-hidden border ${highlight ? "border-primary/40 shadow-lg shadow-primary/10" : "border-border/60"}`}>
      <div className={`flex items-center justify-between px-4 py-2 border-b border-border/40 ${highlight ? "bg-primary/10" : "bg-muted/40"}`}>
        <Badge className={`text-xs border-0 ${highlight ? "bg-primary/20 text-primary" : "bg-background text-muted-foreground"}`}>
          {language}
        </Badge>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copy} data-testid="button-copy-code">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      <div className={`${highlight ? "bg-primary/5" : "bg-muted/30"}`}>
        <pre className="px-4 py-3 text-xs font-mono text-foreground overflow-x-auto leading-relaxed whitespace-pre">
          {code}
        </pre>
      </div>
    </div>
  );
}

function SectionLabel({ num, label }: { num: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-primary">{num}</span>
      </div>
      <h2 className="text-lg font-semibold">{label}</h2>
    </div>
  );
}

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://your-instance.repl.co";
const PROXY_URL = `${BASE_URL}/proxy/v1`;
const TRACK_URL = `${BASE_URL}/api/track`;

export default function Setup() {
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const firstProject = projects?.[0];
  const proxyKey = firstProject?.proxyKey || "cti_your_proxy_key_here";

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-6 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold">Setup Guide</h1>
            <p className="text-sm text-muted-foreground">One-step integration — no refactoring required</p>
          </div>
          <Badge className="bg-green-400/10 text-green-400 border-green-400/20 text-xs">
            <Star className="w-3 h-3 mr-1" /> Zero code changes
          </Badge>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-3xl space-y-10">

        <Card className="p-5 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Your Proxy Key</span>
          </div>
          <div className="font-mono text-sm bg-background/60 border border-border/50 rounded-md px-3 py-2 break-all">
            {proxyKey}
          </div>
          {!firstProject && (
            <p className="text-xs text-muted-foreground mt-2">
              Go to Projects and create one first to get your proxy key.
            </p>
          )}
        </Card>

        <div>
          <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Star className="w-3 h-3" />
            FASTEST — Zero code changes. Just set two env vars.
          </div>

          <SectionLabel num={1} label="Option A — Environment Variables (Recommended)" />

          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            The Anthropic SDK reads <code className="bg-muted px-1 rounded text-xs">ANTHROPIC_BASE_URL</code> and{" "}
            <code className="bg-muted px-1 rounded text-xs">ANTHROPIC_API_KEY</code> automatically.
            Set these two env vars and <strong className="text-foreground">your existing code tracks without a single line changed.</strong>
          </p>

          <div className="space-y-3">
            <CodeBlock highlight language="Shell — .env or export" code={
`# Add these two lines to your .env (or export in your shell)
ANTHROPIC_API_KEY="${proxyKey}"
ANTHROPIC_BASE_URL="${PROXY_URL}"

# That's it. Run your code exactly as before.
# Every Claude call is now tracked in ClaudeTrack.`
            } />

            <CodeBlock language="Docker / docker-compose.yml" code={
`services:
  your-app:
    environment:
      ANTHROPIC_API_KEY: "${proxyKey}"
      ANTHROPIC_BASE_URL: "${PROXY_URL}"
    # Everything else stays the same`
            } />

            <CodeBlock language="Railway / Render / Fly.io / Vercel" code={
`# In your dashboard, set:
ANTHROPIC_API_KEY  =  ${proxyKey}
ANTHROPIC_BASE_URL =  ${PROXY_URL}

# No redeploy changes needed — just env vars`
            } />
          </div>
        </div>

        <div className="border-t border-border/40 pt-10">
          <SectionLabel num={2} label="Option B — One-Line Python Wrapper" />
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Prefer explicit code? Add one import and one function call at the top of your entry file.
            All downstream <code className="bg-muted px-1 rounded text-xs">anthropic.Anthropic()</code> calls are automatically tracked.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <SiPython className="w-4 h-4 text-blue-400" />
              <span>Add to the top of your <code className="bg-muted px-1 rounded">main.py</code> or <code className="bg-muted px-1 rounded">app.py</code></span>
            </div>
            <CodeBlock language="Python" code={
`import os
os.environ["ANTHROPIC_API_KEY"] = "${proxyKey}"
os.environ["ANTHROPIC_BASE_URL"] = "${PROXY_URL}"

# ↑ That's the only addition. Everything below is your existing code.
import anthropic
client = anthropic.Anthropic()   # picks up env vars automatically`
            } />

            <div className="text-xs text-muted-foreground py-2 px-1">
              Or as a reusable snippet you can paste into any project:
            </div>

            <CodeBlock language="claudetrack.py — drop this file into your project" code={
`"""
ClaudeTrack — drop this file into your project root.
Import it once at the top of your entry point: import claudetrack
"""
import os

PROXY_KEY = os.getenv("CLAUDETRACK_KEY", "${proxyKey}")
BASE_URL  = os.getenv("CLAUDETRACK_URL",  "${PROXY_URL}")

os.environ.setdefault("ANTHROPIC_API_KEY",   PROXY_KEY)
os.environ.setdefault("ANTHROPIC_BASE_URL",  BASE_URL)

print(f"[claudetrack] Tracking enabled → {BASE_URL}")`
            } />
          </div>
        </div>

        <div className="border-t border-border/40 pt-10">
          <SectionLabel num={3} label="Option C — One-Line Node / TypeScript Wrapper" />
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Same pattern for Node.js. Add one line to the top of your entry file before any Anthropic import.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <SiTypescript className="w-4 h-4 text-blue-400" />
              <span>Add to the top of <code className="bg-muted px-1 rounded">index.ts</code> / <code className="bg-muted px-1 rounded">server.ts</code></span>
            </div>
            <CodeBlock language="TypeScript / Node.js" code={
`// Add this block before any anthropic imports
process.env.ANTHROPIC_API_KEY  = "${proxyKey}";
process.env.ANTHROPIC_BASE_URL = "${PROXY_URL}";

// Your existing code below — zero changes
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();  // picks up env vars`
            } />

            <CodeBlock language="claudetrack.ts — drop into your project" code={
`/**
 * ClaudeTrack — drop this into your project and import once.
 * import "./claudetrack";  // at the top of your entry file
 */
const key = process.env.CLAUDETRACK_KEY ?? "${proxyKey}";
const url = process.env.CLAUDETRACK_URL ?? "${PROXY_URL}";

process.env.ANTHROPIC_API_KEY  ??= key;
process.env.ANTHROPIC_BASE_URL ??= url;

console.log(\`[claudetrack] tracking → \${url}\`);`
            } />
          </div>
        </div>

        <div className="border-t border-border/40 pt-10">
          <SectionLabel num={4} label="Option D — SDK-Only Mode (Key Never Leaves Your Server)" />

          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400 font-medium">Your Anthropic key is never sent to ClaudeTrack</span>
          </div>

          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Keep your own Anthropic key and call your existing client directly.
            After each call, post the token counts to ClaudeTrack. The key stays on your server.
          </p>

          <div className="space-y-3">
            <CodeBlock language="Python — report usage after each call" code={
`import anthropic, requests, time

client = anthropic.Anthropic()  # your real key, stays on your server

start = time.time()
msg = client.messages.create(model="claude-3-5-sonnet-20241022",
                              max_tokens=1024,
                              messages=[{"role":"user","content":"Hi"}])
ms = int((time.time() - start) * 1000)

# Report — only token counts, no key
requests.post("${TRACK_URL}", json={
    "proxyKey":     "${proxyKey}",
    "model":        msg.model,
    "inputTokens":  msg.usage.input_tokens,
    "outputTokens": msg.usage.output_tokens,
    "latencyMs":    ms,
    "sessionId":    "optional-session-label",
})`
            } />

            <CodeBlock language="Node.js — report usage after each call" code={
`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();  // your real key, stays local
const start = Date.now();

const msg = await client.messages.create({
  model: "claude-3-5-sonnet-20241022", max_tokens: 1024,
  messages: [{ role: "user", content: "Hi" }],
});

// Report — only token counts, no key
await fetch("${TRACK_URL}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    proxyKey:     "${proxyKey}",
    model:        msg.model,
    inputTokens:  msg.usage.input_tokens,
    outputTokens: msg.usage.output_tokens,
    latencyMs:    Date.now() - start,
    sessionId:    "optional-session-label",
  }),
});`
            } />
          </div>
        </div>

        <div className="border-t border-border/40 pt-10">
          <SectionLabel num={5} label="Self-Host in One Command" />
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Want your own instance? Fork the repo and deploy. No config files, just env vars.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <SiDocker className="w-4 h-4 text-blue-400" />
              <span>Docker</span>
            </div>
            <CodeBlock language="Shell" code={
`git clone https://github.com/your-org/claudetrack
cd claudetrack

# Set your secrets
cp .env.example .env
# Edit .env with your DATABASE_URL and SESSION_SECRET

npm install && npm run dev
# → http://localhost:5000`
            } />

            <CodeBlock language="Replit (one click)" code={
`# Fork this Repl → Click Run → Done.
# Database is auto-provisioned, no config needed.
# Share the URL with your team.`
            } />
          </div>
        </div>

        <div className="border-t border-border/40 pt-10">
          <SectionLabel num={6} label="Session Grouping" />
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Group related requests into sessions. Perfect for multi-turn conversations, Claude Code
            sessions, or agentic pipelines. Add one header.
          </p>
          <CodeBlock language="Python / Node.js" code={
`# Python
msg = client.messages.create(
    ...,
    extra_headers={"x-session-id": "pipeline-run-abc123"}
)

// Node.js
const msg = await client.messages.create(
    { ... },
    { headers: { "x-session-id": "pipeline-run-abc123" } }
)`
          } />
        </div>

        <Card className="p-5 border-border/60 bg-card/40">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Verify it's working</h3>
          </div>
          <CodeBlock language="cURL" code={
`curl ${PROXY_URL}/messages \\
  -H "Authorization: Bearer ${proxyKey}" \\
  -H "Content-Type: application/json" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-3-haiku-20240307",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "ping"}]
  }'
# Then check the Request Log in your dashboard`
          } />
        </Card>

      </div>
    </div>
  );
}
