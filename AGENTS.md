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
- **Database**: Neon PostgreSQL in production, local PostgreSQL in Docker
- **Backend URL**: https://task-manager-pro-37c2.onrender.com
- **Frontend URL**: https://task-manager-pro-drab-seven.vercel.app
- **CI**: Uses Node.js 24 (set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` in GitHub Actions env)

## Key Files

- `backend/prisma/schema.prisma` - Database models
- `backend/src/server.ts` - Express entry point
- `frontend/src/lib/api/` - API client with React Query
- `.env` files are gitignored (not in repo)

## Known Issues & Fixes (Jun 2026)

### Performance - App Freeze with 2000+ Tasks

**Root Causes Found & Fixed:**
1. **Double render**: `TaskList` had `displayedTasks` state mirrored via `useEffect` — each change rendered 2000 cards twice. Fixed by removing duplicated state, using `tasks` prop directly.
2. **Framer Motion `layout`**: `layout` prop on `motion.div` recalculated positions for all 2000 items on every render. Removed.
3. **AuthContext re-renders**: `login`/`logout` without `useCallback`, context value without `useMemo` — re-rendered entire app on every auth state change. Fixed.
4. **WebSocket listener leak**: `socket.on('join:user')` registered new listeners on every reconnect without cleanup. Fixed with `removeAllListeners('join:user')`.
5. **Missing DB index**: No index on `userId` in tasks table — every query did sequential scan. Fixed with `@@index([userId])`.
6. **10min staleTime**: React Query cached data for 10 minutes without invalidation. Reduced to 30s.

7. **Seed duplicaba tareas en cada deploy**: `npm start` corría `npx prisma db seed` en cada inicio. El seed usaba `prisma.task.create()` (no upsert). Cada cold start de Render creaba 5 tareas nuevas → cientos de cold starts = miles de tareas duplicadas (~1772). Fixed: seed verifica si ya existen tareas, y se removió `db seed` del `start` script y Dockerfile.
8. **DB Cleanup (Jun 2026)**: Se eliminaron manualmente las 1772 tareas duplicadas de la DB Neon y se creó 1 tarea de resumen técnico como única nota de ejemplo.

### Fixes Applied (commit: performance-audit-2026)
- `backend/src/config/env.ts` — `dotenv.config()` moved before Zod validation (backend couldn't start locally)
- `backend/src/socket/socket.ts` — JWT secret uses `envConfig` instead of hardcoded fallback
- `backend/src/server.ts` — GraphQL JWT fallback `'secret'` removed
- `backend/src/routes/task.routes.ts` + `task.controller.ts` — Added `PATCH /:id` route for `toggleTaskCompletion` (was returning 404)
- `frontend/src/lib/api/index.ts` — Added missing `Content-Type` header on PATCH request