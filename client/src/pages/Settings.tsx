import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Globe, Zap, Lock, Eye } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-6 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Platform configuration and security</p>
      </div>

      <div className="flex-1 p-6 max-w-2xl space-y-6">
        <Card className="p-5 border-border/60">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-semibold">Security Model</h3>
          </div>
          <div className="space-y-4">
            {[
              {
                icon: Lock,
                color: "text-green-400",
                bg: "bg-green-400/10",
                title: "AES-256-GCM Encryption",
                desc: "Your Anthropic API key is encrypted using industry-standard AES-256-GCM with a unique IV per key before being stored in our database.",
              },
              {
                icon: Eye,
                color: "text-blue-400",
                bg: "bg-blue-400/10",
                title: "Frontend Blind",
                desc: "The encrypted key is never returned to the browser. Decryption happens exclusively server-side during proxy forwarding.",
              },
              {
                icon: Key,
                color: "text-purple-400",
                bg: "bg-purple-400/10",
                title: "Proxy Key Isolation",
                desc: "Your proxy key (cti_...) is a separate credential from your Anthropic key. Even if your proxy key is leaked, it cannot be used to retrieve your Anthropic key.",
              },
              {
                icon: Globe,
                color: "text-cyan-400",
                bg: "bg-cyan-400/10",
                title: "SDK Mode Alternative",
                desc: "Don't want to store your key with us? Use SDK mode — report only token counts after each call. Your Anthropic key never leaves your server.",
              },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <div className="text-sm font-medium mb-0.5">{item.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 border-border/60">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Proxy Endpoint</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Proxy Base URL</div>
              <div className="font-mono text-xs bg-muted/50 border border-border/60 rounded-md px-3 py-2">
                {window.location.origin}/proxy/v1
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">SDK Track Endpoint</div>
              <div className="font-mono text-xs bg-muted/50 border border-border/60 rounded-md px-3 py-2">
                {window.location.origin}/api/track
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-border/60">
          <h3 className="text-sm font-semibold mb-4">Supported Models</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { model: "claude-3-5-sonnet-20241022", tier: "Sonnet", cost: "$3/$15" },
              { model: "claude-3-5-haiku-20241022", tier: "Haiku", cost: "$0.8/$4" },
              { model: "claude-3-opus-20240229", tier: "Opus", cost: "$15/$75" },
              { model: "claude-3-haiku-20240307", tier: "Haiku", cost: "$0.25/$1.25" },
              { model: "claude-opus-4-5", tier: "Opus 4", cost: "$15/$75" },
              { model: "claude-sonnet-4-5", tier: "Sonnet 4", cost: "$3/$15" },
              { model: "claude-haiku-4-5", tier: "Haiku 4", cost: "$0.8/$4" },
            ].map(m => (
              <div key={m.model} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                <div>
                  <div className="font-medium">{m.tier}</div>
                  <div className="text-muted-foreground">{m.model.slice(0, 20)}…</div>
                </div>
                <Badge className="text-xs border-0 bg-primary/10 text-primary">{m.cost}</Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Prices in USD per MTok (input/output). Updated for 2025 models.</p>
        </Card>
      </div>
    </div>
  );
}
