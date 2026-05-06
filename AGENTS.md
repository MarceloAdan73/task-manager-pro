# Task Manager Pro - Agent Instructions

## Project Structure

| Directory | Tech | Entry Point | Port |
|-----------|------|--------------|------|
| `frontend/` | Next.js 16 + React 19 | `npm run dev` | 3004 |
| `backend/` | Express + Prisma | `npm run dev` | 3005 |
| `docker-compose.yml` | PostgreSQL 15 | - | 5433 |

## Run Commands

```bash
# Backend tests (30 tests)
cd backend && npm test

# Frontend tests (56 tests)
cd frontend && npm test

# E2E tests (8 tests, Playwright)
cd frontend && npm run test:e2e

# Docker (recommended for local dev)
docker-compose up -d
# Access: http://localhost:3004 (frontend), http://localhost:3005/api (backend)
```

## Critical Constraints

- **WebSockets**: Socket.io works only in Docker local setup. Production (Vercel+Render) has no WebSocket support.
- **Demo credentials**: `demo@taskmanager.com` / `demo123`
- **Database**: Supabase PostgreSQL in production, local PostgreSQL in Docker
- **CI**: Uses Node.js 24 (set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` in GitHub Actions env)

## Key Files

- `backend/prisma/schema.prisma` - Database models
- `backend/src/server.ts` - Express entry point
- `frontend/src/lib/api/` - API client with React Query
- `.env` files are gitignored (not in repo)