import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Copy, Check, Terminal, Code2, Zap, Shield, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

function CodeBlock({ code, language = "python" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <div className="bg-muted/50 border border-border/60 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/40">
          <Badge className="text-xs border-0 bg-background text-muted-foreground">{language}</Badge>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copy} data-testid="button-copy-code">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
        <pre className="px-4 py-3 text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed whitespace-pre">
          {code}
        </pre>
      </div>
    </div>
  );
}

const PROXY_URL = typeof window !== "undefined" ? `${window.location.origin}/proxy/v1` : "https://your-app.repl.co/proxy/v1";
const TRACK_URL = typeof window !== "undefined" ? `${window.location.origin}/api/track` : "https://your-app.repl.co/api/track";

export default function Setup() {
  const { data: projects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const firstProject = projects?.[0];
  const proxyKey = firstProject?.proxyKey || "cti_your_proxy_key_here";

  const pythonProxyCode = `import anthropic

# Simply replace the base_url - no other code changes needed!
client = anthropic.Anthropic(
    api_key="${proxyKey}",
    base_url="${PROXY_URL}"
)

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello Claude!"}]
)
print(message.content)
# ClaudeTrack automatically tracks tokens, cost, and latency`;

  const nodeProxyCode = `import Anthropic from "@anthropic-ai/sdk";

// Simply replace the baseURL - no other code changes needed!
const client = new Anthropic({
  apiKey: "${proxyKey}",
  baseURL: "${PROXY_URL}",
});

const message = await client.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello Claude!" }],
});
console.log(message.content);
// ClaudeTrack automatically tracks tokens, cost, and latency`;

  const pythonSDKCode = `import anthropic
import requests

client = anthropic.Anthropic(api_key="your-anthropic-key")  # Your key stays here

start = time.time()
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
latency_ms = int((time.time() - start) * 1000)

# Report usage to ClaudeTrack (key never sent)
requests.post("${TRACK_URL}", json={
    "proxyKey": "${proxyKey}",
    "model": message.model,
    "inputTokens": message.usage.input_tokens,
    "outputTokens": message.usage.output_tokens,
    "latencyMs": latency_ms,
    "sessionId": "optional-session-id",  # Group related requests
})`;

  const otelCode = `# For Claude Code CLI sessions
# Set the OTEL endpoint to your ClaudeTrack instance

export OTEL_EXPORTER_OTLP_ENDPOINT="${window.location.origin}/otel"
export OTEL_SERVICE_NAME="claude-code-session"
export CLAUDE_TRACK_KEY="${proxyKey}"

# Then run Claude Code as normal
claude "implement the login page"
# Usage data automatically flows to your dashboard`;

  const curlCode = `# Test your proxy key works
curl ${PROXY_URL}/messages \\
  -H "Authorization: Bearer ${proxyKey}" \\
  -H "Content-Type: application/json" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-3-haiku-20240307",
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Say hi!"}]
  }'`;

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-6 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
        <h1 className="text-xl font-bold">Setup Guide</h1>
        <p className="text-sm text-muted-foreground">Integrate ClaudeTrack in under 5 minutes</p>
      </div>

      <div className="flex-1 p-6 max-w-3xl space-y-8">
        <Card className="p-5 border-border/60 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Your Proxy Key</span>
          </div>
          <div className="font-mono text-sm bg-background/60 border border-border/40 rounded-md px-3 py-2">
            {proxyKey}
          </div>
          {!firstProject && (
            <p className="text-xs text-muted-foreground mt-2">
              Create a project first to get your proxy key.
            </p>
          )}
        </Card>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <h2 className="text-base font-semibold">Option A: Proxy Mode (Recommended)</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Replace your <code className="bg-muted px-1 rounded text-xs">base_url</code> with our proxy.
            Your Anthropic key is stored encrypted on our servers and used to forward requests.
            Zero code changes beyond two parameters.
          </p>
          <div className="space-y-3">
            <CodeBlock code={pythonProxyCode} language="Python" />
            <CodeBlock code={nodeProxyCode} language="Node.js / TypeScript" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <h2 className="text-base font-semibold">Option B: SDK Mode (Key Never Leaves Your Server)</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Keep your Anthropic key entirely on your infrastructure. After each API call, report token counts
            to ClaudeTrack. Your key is never transmitted to us.
          </p>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400">Your Anthropic key never touches our servers</span>
          </div>
          <CodeBlock code={pythonSDKCode} language="Python (SDK-only mode)" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <h2 className="text-base font-semibold">Claude Code Sessions (OTEL)</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Monitor Claude Code CLI sessions. Set environment variables before your Claude Code session
            to stream telemetry data to your ClaudeTrack dashboard.
          </p>
          <Badge className="mb-3 text-xs bg-yellow-400/10 text-yellow-400 border-yellow-400/20">Coming Soon</Badge>
          <CodeBlock code={otelCode} language="Shell" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Test Your Setup</h2>
          </div>
          <CodeBlock code={curlCode} language="cURL" />
        </div>

        <Card className="p-5 border-border/60">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold">Session Tracking</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Group related requests into sessions by adding the <code className="bg-muted px-1 rounded text-xs">x-session-id</code> header.
            Perfect for tracking multi-turn conversations, agentic pipelines, or Claude Code sessions.
          </p>
          <CodeBlock code={`# Python
message = client.messages.create(
    ...,
    extra_headers={"x-session-id": "my-session-abc123"}
)

# Node.js
const message = await client.messages.create(
    ...,
    { headers: { "x-session-id": "my-session-abc123" } }
)`} language="Python / Node.js" />
        </Card>
      </div>
    </div>
  );
}
