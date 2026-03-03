# ClaudeTrack — Claude Usage Intelligence Platform

## Overview
A Claude-native API observability and analytics platform that acts as a proxy/middleware layer between developers and the Anthropic Claude API. Provides real-time token tracking, cost forecasting, budget alerts, per-session analytics, and rate limit prediction.

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: Express.js + TypeScript + PostgreSQL (Drizzle ORM)
- **Proxy**: HTTP middleware forwarding to api.anthropic.com
- **Charts**: Recharts
- **Routing**: Wouter
- **Data fetching**: TanStack Query v5

### Key Files
- `server/index.ts` — Express app entry, runs migrations + seed
- `server/migrate.ts` — Raw SQL migrations (CREATE TABLE IF NOT EXISTS)
- `server/seed.ts` — Seeds 3 demo projects + ~2000 historical requests
- `server/routes.ts` — All API routes + proxy endpoint `/proxy/v1/*path`
- `server/storage.ts` — DatabaseStorage class + AES-256-GCM encryption utils
- `server/db.ts` — Drizzle + PostgreSQL pool
- `shared/schema.ts` — Drizzle schema + types + MODEL_PRICING map
- `client/src/App.tsx` — Router with sidebar layout for authenticated pages
- `client/src/components/app-sidebar.tsx` — Navigation sidebar
- `client/src/pages/Landing.tsx` — Marketing landing page
- `client/src/pages/Dashboard.tsx` — Analytics dashboard with recharts
- `client/src/pages/Projects.tsx` — Project management CRUD
- `client/src/pages/RequestLog.tsx` — Live API request log table
- `client/src/pages/RateLimits.tsx` — Live rate limit monitor
- `client/src/pages/Alerts.tsx` — Budget alert configuration
- `client/src/pages/Setup.tsx` — Integration setup guide
- `client/src/pages/Settings.tsx` — Security and configuration info

## Security Model
1. Anthropic API keys are encrypted with AES-256-GCM before DB storage
2. Encrypted keys are never returned to the frontend
3. Decryption only happens server-side during proxy forwarding
4. Proxy keys (cti_xxxxx) are separate credentials from Anthropic keys
5. SDK-only mode available — users report token counts without sharing their key

## Integration Modes
1. **Proxy Mode**: Replace `base_url` in Anthropic SDK with our proxy URL. User adds their Anthropic API key to their project.
2. **SDK Mode**: Keep your key, call `/api/track` after each API call to report usage.

## Database Tables
- `projects` — User projects with proxy keys and encrypted Anthropic keys
- `api_requests` — Individual request logs with token counts, costs, latency
- `budget_alerts` — Budget alert configurations

## Key Routes
- `GET /api/projects` — List all projects
- `POST /api/projects` — Create project (with optional Anthropic key encryption)
- `GET /api/analytics/overview?period=month&projectId=xxx` — Aggregate stats
- `GET /api/analytics/timeseries?period=week&projectId=xxx` — Chart data
- `GET /api/analytics/models?period=month` — Model breakdown
- `GET /api/requests?projectId=xxx&limit=50` — Request log
- `GET /api/rate-limit/predict?projectId=xxx` — Rate limit prediction (live, 15s refresh)
- `GET /api/alerts` — Budget alerts
- `POST /api/track` — SDK-only tracking endpoint
- `ALL /proxy/v1/*path` — Claude API proxy endpoint

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned)
- `SESSION_SECRET` — Used as base for AES-256 key derivation
