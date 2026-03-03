<div align="center">

<h1>🔍 ClaudeTrack</h1>

<p><strong>Real-time token tracking, cost forecasting, and rate limit prediction for the Anthropic Claude API.</strong><br/>
Self-hosted · Open source · Zero code changes · Free forever.</p>

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/your-org/claudetrack?style=social)](https://github.com/your-org/claudetrack)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker&logoColor=white)](https://hub.docker.com)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=node.js)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

<!-- Replace with a screen recording exported as GIF: npm install -g terminalizer -->
![ClaudeTrack Dashboard](https://raw.githubusercontent.com/your-org/claudetrack/main/docs/demo.gif)

</div>

---

## Why ClaudeTrack?

Claude's API has no built-in dashboard. You're flying blind on cost, token burn, rate limits, and per-session usage. ClaudeTrack fixes that — it's a **transparent proxy + analytics layer** that sits between your code and Anthropic, giving you full visibility with zero changes to your application code.

No SaaS subscription. No data leaving your infrastructure. No vendor lock-in.

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/claudetrack.git
cd claudetrack

# 2. Configure (one env var)
echo "SESSION_SECRET=$(openssl rand -hex 32)" > .env

# 3. Run
docker compose up -d

# → Dashboard at http://localhost:5000
```

That's it. Three commands.

---

## Zero Code Changes Integration

The Anthropic SDK reads `ANTHROPIC_BASE_URL` from your environment automatically. Add two lines to your `.env` and your **existing code is tracked without modification**:

```bash
# In your application's .env (not ClaudeTrack's)
ANTHROPIC_API_KEY="cti_your_proxy_key_from_dashboard"
ANTHROPIC_BASE_URL="http://localhost:5000/proxy/v1"

# Run your app exactly as before — every Claude call is now tracked.
```

Works with every platform that uses the Anthropic SDK:

| Platform | How |
|----------|-----|
| **Python** | `ANTHROPIC_BASE_URL=... python app.py` |
| **Node / TypeScript** | Add to `.env` or `process.env` before imports |
| **Docker** | `environment:` block in `docker-compose.yml` |
| **Railway / Render / Fly.io** | Set env vars in dashboard — no redeploy needed |
| **Vercel** | Environment Variables settings page |
| **LangChain / LlamaIndex** | Inherited automatically from `anthropic` SDK |

If you'd rather keep your Anthropic key on your own server, use **SDK-only mode** — your app calls Anthropic directly, then posts only token counts to ClaudeTrack. Your key never touches our proxy.

---

## Features

| Feature | Description |
|---------|-------------|
| **Real-time request log** | Every Claude call logged with model, tokens, cost, latency |
| **Cost forecasting** | Daily/monthly spend projections with trend lines |
| **Budget alerts** | Set per-project spend limits; get notified before you overshoot |
| **Rate limit prediction** | Live window tracking — know before you hit 429s |
| **Per-session analytics** | Group requests by session ID for agentic pipeline tracing |
| **Model breakdown** | Compare cost and latency across Haiku / Sonnet / Opus |
| **Multi-project** | Separate proxy keys per app, team, or environment |
| **SDK-only mode** | Proxy-free tracking — your key never leaves your server |
| **AES-256-GCM encryption** | Stored Anthropic keys encrypted at rest, never returned to browser |
| **Dark mode** | Because of course |

---

## Architecture

```
Your App
   │
   │  ANTHROPIC_BASE_URL="http://your-claudetrack/proxy/v1"
   │  ANTHROPIC_API_KEY="cti_your_proxy_key"
   ▼
┌─────────────────────────────────────────────────────┐
│                    ClaudeTrack                      │
│                                                     │
│  Express proxy  ──►  Token counter  ──►  Postgres   │
│       │                                     │       │
│       ▼                                     ▼       │
│  api.anthropic.com              React dashboard     │
└─────────────────────────────────────────────────────┘
```

**Tech stack:** Node.js · Express · React · Vite · PostgreSQL · Drizzle ORM · Recharts · shadcn/ui · Tailwind CSS

---

## Self-Hosting Options

### Docker Compose (recommended)

```bash
git clone https://github.com/your-org/claudetrack.git
cd claudetrack
cp .env.example .env
# Edit .env — set SESSION_SECRET at minimum
docker compose up -d
```

### Replit (one click, zero config)

[![Run on Replit](https://replit.com/badge/github/your-org/claudetrack)](https://replit.com/github/your-org/claudetrack)

Database is auto-provisioned. Share the URL with your team and you're done.

### Manual (Node.js 20+)

```bash
git clone https://github.com/your-org/claudetrack.git
cd claudetrack
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and SESSION_SECRET
npm run dev          # development
npm run build && npm start  # production
```

---

## Claude Code + OTEL Support

Track [Claude Code](https://docs.anthropic.com/en/docs/claude-code) sessions by pointing its OpenTelemetry exporter at ClaudeTrack:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:5000"
claude  # sessions now appear in your ClaudeTrack dashboard
```

---

## Companion Tools *(coming soon)*

Inspired by the Resend / React Email playbook — standalone tools released separately to build community before the ecosystem matures:

- **[`claude-cost`](https://github.com/your-org/claude-cost)** — CLI cost estimator. `npx claude-cost --model sonnet --tokens 50000`. No account, no proxy, just math.
- **[`claude-ratelimit`](https://github.com/your-org/claude-ratelimit)** — CLI rate limit calculator. Paste your usage tier, get a live window gauge.

If either of these sounds useful, [upvote the issue](https://github.com/your-org/claudetrack/issues) or open a PR — they're designed to be beginner-friendly.

---

## Contributing

ClaudeTrack is community-driven. Every contributor becomes a maintainer-in-spirit.

### Good first issues

Look for issues tagged [`good first issue`](https://github.com/your-org/claudetrack/labels/good%20first%20issue) — these are explicitly scoped, documented, and mentor-supported:

- [ ] Add Slack / Discord webhook for budget alerts
- [ ] CSV export for request log
- [ ] Per-model cost configuration (custom pricing)
- [ ] Claude Code OTEL receiver implementation
- [ ] `claude-cost` standalone CLI (new repo)
- [ ] `claude-ratelimit` standalone CLI (new repo)

### How to contribute

```bash
git clone https://github.com/your-org/claudetrack.git
cd claudetrack
cp .env.example .env      # fill in DATABASE_URL + SESSION_SECRET
npm install
npm run dev               # http://localhost:5000
```

Then open a PR. We review within 48 hours.

### Areas we need help

| Area | Skills needed |
|------|--------------|
| Claude Code OTEL receiver | Node.js, OpenTelemetry |
| Slack / webhook alerts | Node.js, REST APIs |
| Python SDK companion | Python |
| Documentation | Writing, diagrams |
| UI improvements | React, Tailwind |

---

## GitHub Topics

If you're adding this repo to GitHub, use these topics for discoverability:

`claude` · `anthropic` · `llm-observability` · `api-proxy` · `cost-tracking` · `token-tracking` · `rate-limiting` · `opentelemetry` · `self-hosted` · `developer-tools`

---

## Roadmap

- [x] Proxy endpoint with token tracking
- [x] Real-time dashboard with Recharts
- [x] Budget alerts + rate limit prediction
- [x] Per-session analytics
- [x] AES-256-GCM key encryption
- [x] Docker Compose self-hosting
- [ ] Slack / Discord alert webhooks
- [ ] Claude Code OTEL receiver
- [ ] `claude-cost` CLI (standalone)
- [ ] `claude-ratelimit` CLI (standalone)
- [ ] Prometheus metrics endpoint
- [ ] Team access / multi-user

---

## License

MIT — use it, fork it, sell it, build on it. Just keep the copyright notice.

---

<div align="center">

**If ClaudeTrack saves you money or debugging time, the best thank-you is a ⭐ star.**<br/>
It helps other developers find this.

[Star on GitHub](https://github.com/your-org/claudetrack) · [Open an Issue](https://github.com/your-org/claudetrack/issues) · [Submit a PR](https://github.com/your-org/claudetrack/pulls)

</div>
