# Contexto del Proyecto: Task Manager Pro

## 🎯 Descripción General
Task Manager Pro es una aplicación full-stack profesional de gestión de tareas. Es el proyecto insignia de Marcelo Adán (GitHub: @MarceloAdan73), demostrando habilidades modernas de desarrollo full-stack con foco en calidad, pruebas y despliegue continuo.

## 🏗️ Arquitectura Actual (Abril 2026)

### Frontend (Next.js 16.1.3 + TypeScript)
- **Hosting:** Vercel (https://task-manager-pro-psi.vercel.app)
- **Componentes Principales:** Dashboard, Login, CRUD tareas, Modo Oscuro, Export CSV/PDF, GraphQL Playground
- **Librerías Clave:** React Query v5, Tailwind CSS, Framer Motion, file-saver, jspdf
- **Testing:** Jest + Playwright (94 tests: 56 frontend + 30 backend + 8 E2E)
- **Estructura:** frontend/src/ (app/, components/, context/, hooks/, lib/api/)

### Backend (Express + TypeScript + Prisma)
- **Estado:** Activo y funcional
- **Base de Datos:** Supabase PostgreSQL (proyecto: mvcshaltunbwsnfgdojb)
- **Autenticación:** JWT con bcrypt
- **APIs:** REST (/api/auth, /api/tasks, /api/export/csv, /api/export/pdf), GraphQL (/graphql)
- **Testing:** Jest (30 tests)
- **WebSockets:** Socket.io funcional SOLO en Docker local
- **Estructura:** backend/src/ (controllers/, middleware/, routes/, graphql/, prisma/, socket/)

### DevOps & Despliegue
- **Frontend:** Vercel (rama main)
- **Backend:** Render (free tier, cold starts)
- **Base de Datos:** Supabase (free tier)
- **CI/CD:** GitHub Actions (ci.yml, test-e2e.yml)
- **Containerización:** Docker (docker-compose.yml)

## 🔑 Credenciales de Prueba (Demo)
- Email: demo@taskmanager.com
- Password: demo123

## 📊 Estado de Características

| Característica | Estado | Entorno |
|----------------|--------|---------|
| Autenticación JWT | ✅ Completo | Todos |
| CRUD de Tareas | ✅ Completo | Todos |
| Modo Oscuro | ✅ Completo | Todos |
| Export CSV/PDF | ✅ Completo | Todos |
| GraphQL API | ✅ Completo | Todos |
| WebSockets | ⚠️ Local-only | Docker |
| Playwright E2E | ✅ Completo | CI/CD |
| Dashboard Gráficos | ✅ Completo | Todos |

## 🚀 Scripts Rápidos

### Docker (Recomendado)
```bash
git clone https://github.com/MarceloAdan73/task-manager-pro.git
cd task-manager-pro
docker-compose up -d
# Frontend: http://localhost:3004
# Backend: http://localhost:3005
```

### Testing
```bash
cd backend && npm test        # 30 tests
cd frontend && npm test       # 44 tests
npm run test:e2e              # 8 tests (Playwright)
```

## ⚠️ Notas Críticas
1. **WebSockets SOLO funcionan en Docker local**, no en producción Vercel/Render
2. Las variables de entorno no están subidas al repositorio (seguridad)
3. Render puede tener cold starts (primer request tarda ~30 segundos)

## 🔍 Auditoría de Performance (Jun 2026)

### Problemas Detectados que Causaban Congelamiento

| Síntoma | Causa Raíz | Severidad | Fix |
|---------|-----------|-----------|-----|
| App congelada con 2000+ tareas | `TaskList` sin virtualización + doble render por `displayedTasks` | 🔴 Crítico | Eliminado `displayedTasks` + `layout` de Framer Motion |
| App congelada al cargar | Sin índice `@@index([userId])` en tabla tasks + sin paginación | 🔴 Crítico | Agregado índice en schema Prisma |
| Re-renders infinitos | `AuthContext` sin `useCallback`/`useMemo` — cada cambio re-renderizaba toda la app | 🟠 Alto | Envueltos en `useCallback`/`useMemo` |
| Listeners WebSocket acumulados | `socket.on('join:user')` sin limpiar listeners previos en reconexión | 🟠 Alto | `removeAllListeners` antes de cada `on` |
| Datos obsoletos 10 min | `staleTime: 10 * 60 * 1000` en React Query, sin WebSocket en prod | 🟡 Medio | Reducido a 30s |
| 1700+ tareas duplicadas en prod | `npm start` corría `db seed` en cada deploy/cold start. Seed usaba `create()` no upsert | 🔴 Crítico | Seed skip si ya hay tareas + removido `db seed` del start script y Dockerfile |
| Backend no arrancaba local | `dotenv.config()` llamado DESPUÉS de validar env vars con Zod | 🔴 Crítico | Movido a `env.ts` antes de la validación |
| Auth bypass potencial | JWT fallback `'secret'` y `'fallback-secret-change-in-production'` hardcodeados | 🔴 Crítico | Usar `envConfig.JWT_SECRET` |
| Toggle task daba 404 | No existía ruta `PATCH /:id` en backend | 🟠 Alto | Agregada ruta + controller `toggleTask` |

### Tests
- Frontend: 56 tests (44 pass, 12 skipped)
- Backend: 30 tests (30 pass)
- E2E: 8 tests (Playwright)

## 📁 Estructura de Ramas
- **main:** Producción (desplegada en Vercel/Render/Supabase)
- **dev:** Desarrollo (mantiene las mismas implementaciones que main + mejoras)

### Diferencias main vs dev:
- **E2E Tests:** Playwright (login, CRUD, dark-mode)
- **API:** Uso directo de API routes en lugar de cliente admin
- **RLS:** Políticas relajadas para tareas

## 🔧 Variables de Entorno Clave

Backend (.env):
```env
DATABASE_URL="postgresql://postgres:TaskPro2026@db.mvcshaltunbwsnfgdojb.supabase.co:5432/postgres?schema=public"
JWT_SECRET="mi_clave_super_segura"
PORT=3005
```

Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL="http://localhost:3005/api"
NEXT_PUBLIC_WS_URL="ws://localhost:3005"
```