# 🚀 Task Manager Pro - Full-Stack Application

[![CI](https://github.com/MarceloAdan73/task-manager-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/MarceloAdan73/task-manager-pro/actions/workflows/ci.yml)

[![Next.js](https://img.shields.io/badge/Next.js-16.1.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Query](https://img.shields.io/badge/React_Query-5.90-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query/latest)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.22-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-24.0-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Render](https://img.shields.io/badge/Deploy-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 🌐 Live Application

| Environment | 🔗 URL | 📊 Status |
|:-----------:|:-------|:---------:|
| **🎨 Frontend** <br/> (Vercel) | [![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://task-manager-pro-psi.vercel.app) | 🟢 Active |
| **🗄️ Database** <br/> (Supabase) | [![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com) | 🟢 Active |



---

## 📖 Overview

**Task Manager Pro** is a professional full-stack task management application built with modern technologies and best practices. It features secure JWT authentication, real-time optimistic updates, and a responsive dark-themed UI. The application is fully containerized with Docker and deployed to production with CI/CD pipelines.

> 🧠 **Architected by Marcelo Adán**  
> "Code orchestrated by me with AI support as a development tool, maintaining professional standards and architectural decisions typical of a Full-Stack developer."

---

## 📸 Application Screenshots

| Dark Mode Dashboard | Light Mode Dashboard |
|---------------------|---------------------|
| ![Dark Mode](./frontend/public/DarkMode.png) | ![Dashboard](./frontend/public/Dashboard.png) |

| Task Creation Modal | Mobile Responsive View |
|---------------------|----------------------|
| ![Task Creation](./frontend/public/Task%20Creation.png) | ![Mobile View](./frontend/public/Mobile.png) |

### 🖼️ Screenshots Description

| Image | Description |
|-------|-------------|
| **Dark Mode** | Main dashboard with dark theme, showing task list with priority badges (MEDIUM, HIGH, URGENT) and "In Progress" status indicators |
| **Dashboard** | Light mode overview with task statistics (3 total, 0 completed) and progress bars showing 50% completion rate |
| **Task Creation** | Modal form for creating new tasks with title (8/100 chars), description (0/500 chars), and priority selector (Medium selected) |
| **Mobile View** | Responsive mobile layout with search bar, progress overview (25% complete), and task cards with "Read More" options |

### 🎯 Key UI Features Demonstrated

| Feature | Location |
|---------|----------|
| ✅ Dark/Light theme toggle | Both dashboard views |
| ✅ Priority badges (LOW/MEDIUM/HIGH/URGENT) | Dark Mode screenshot |
| ✅ Progress tracking | Dashboard (50% bar) |
| ✅ Form validation | Task Creation (character counters) |
| ✅ Responsive design | Mobile View |
| ✅ Task metadata (date, status) | All views |
| ✅ Optimistic updates | Task Creation footer |

---

## ✨ Key Features

### 🔐 **Authentication & Security**
- **✅ JWT Authentication** - Secure login with token-based authentication
- **🛡️ Password Hashing** - Bcrypt for secure password storage
- **🔒 Protected Routes** - Middleware for endpoint authorization
- **🚦 Rate Limiting** - Protection against brute-force attacks
- **🛡️ Helmet.js** - Secure HTTP headers configuration

### 📋 **Task Management**
- **➕ Create Tasks** - Add new tasks with title, description, and priority
- **✏️ Edit Tasks** - Modify existing task details
- **✅ Toggle Completion** - Mark tasks as complete/incomplete
- **🗑️ Delete Tasks** - Remove tasks from the system
- **🎯 Priority Levels** - LOW, MEDIUM, HIGH, URGENT

### 🎨 **Modern UI/UX**
- **🌙 Dark Mode** - Toggle between light and dark themes
- **📱 Responsive Design** - Mobile-first approach for all devices
- **⚡ Optimistic Updates** - Instant UI feedback with React Query
- **🎯 Priority Badges** - Color-coded priority indicators
- **🔄 Loading States** - Skeleton loaders and progress indicators

### 🚀 **Technical Excellence**
- **⚡ Next.js 16 App Router** - Modern React framework with server components
- **🎭 TypeScript Strict Mode** - 0 errors, end-to-end type safety
- **📊 React Query v5** - Advanced caching and optimistic updates
- **🗄️ PostgreSQL + Prisma** - Type-safe database ORM with migrations
- **🐳 Docker Multi-stage** - Optimized container builds
- **🔧 CI/CD Pipeline** - Automated deployments via GitHub
- **📊 GraphQL API** - Apollo Server with full CRUD operations
- **📥 CSV Export** - Client-side generation with file-saver
- **📄 PDF Export** - Professional PDF generation with jsPDF

---

## 🛠️ Technology Stack

### **Frontend**
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js-16.1.3-000000?style=flat-square&logo=next.js) | 16.1.3 | React framework with App Router |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript) | 5.9.3 | Type safety, 0 errors |
| **State Management** | ![React Query](https://img.shields.io/badge/React_Query-5.90-FF4154?style=flat-square&logo=react-query) | 5.90.19 | Server state, caching |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwind-css) | 3.4 | Utility-first CSS |
| **UI Components** | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.29-0055FF?style=flat-square&logo=framer) | 12.29 | Animations |
| **Icons** | ![Lucide React](https://img.shields.io/badge/Lucide_React-0.563-F56565?style=flat-square&logo=lucide) | 0.563 | Icon library |
| **Testing** | ![Jest](https://img.shields.io/badge/Jest-30.0-C21325?style=flat-square&logo=jest) + ![RTL](https://img.shields.io/badge/RTL-16.0-FF6B6B?style=flat-square) | - | Unit & integration tests (56 tests) |
| **Date Handling** | ![date-fns](https://img.shields.io/badge/date--fns-4.1-770C56?style=flat-square&logo=date-fns) | 4.1 | Date formatting |
| **File Export** | ![jsPDF](https://img.shields.io/badge/jsPDF-2.5-000000?style=flat-square) | 2.5 | PDF generation |
| **File Export** | ![file-saver](https://img.shields.io/badge/file--saver-2.0-000000?style=flat-square) | 2.0 | CSV generation |

### **Backend**
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | ![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js) | 20.x | JavaScript runtime |
| **Framework** | ![Express](https://img.shields.io/badge/Express-4.22-000000?style=flat-square&logo=express) | 4.22 | Web framework |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript) | 5.9.3 | Type safety |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql) | 15 | Relational database |
| **ORM** | ![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat-square&logo=prisma) | 6.19.2 | Type-safe database client |
| **GraphQL** | ![Apollo](https://img.shields.io/badge/Apollo-5.5-333333?style=flat-square) | 5.5 | GraphQL API |
| **Authentication** | ![JWT](https://img.shields.io/badge/JWT-9.0-000000?style=flat-square&logo=json-web-tokens) + ![Bcrypt](https://img.shields.io/badge/Bcrypt-6.0-003A70?style=flat-square) | - | Secure auth |
| **Validation** | ![Zod](https://img.shields.io/badge/Zod-4.3-3068B7?style=flat-square&logo=zod) | 4.3 | Schema validation |
| **Security** | ![Helmet](https://img.shields.io/badge/Helmet-8.1-000000?style=flat-square) + ![CORS](https://img.shields.io/badge/CORS-2.8-FF6B6B?style=flat-square) | - | Security headers |
| **Testing** | ![Jest](https://img.shields.io/badge/Jest-30.0-C21325?style=flat-square&logo=jest) + ![Supertest](https://img.shields.io/badge/Supertest-7.2-00C7B7?style=flat-square) | - | Integration tests (30 tests) |

### **DevOps & Deployment**
| Category | Technology | Purpose |
|----------|------------|---------|
| **Containerization** | ![Docker](https://img.shields.io/badge/Docker-24.0-2496ED?style=flat-square&logo=docker) | Multi-stage builds |
| **Orchestration** | ![Docker Compose](https://img.shields.io/badge/Docker_Compose-2.24-2496ED?style=flat-square&logo=docker) | Local development stack |
| **Frontend Hosting** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel) | Production deployment |
| **Backend Hosting** | ![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render) | API + PostgreSQL |
| **Version Control** | ![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git) + ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github) | Source code |
| **CI/CD** | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions) | Automated pipelines |

---
## 📁 Project Architecture

<details>
<summary><b>📂 Click to expand full project structure</b></summary>

```
task-manager-pro/
│
├── 📁 frontend/                               # Next.js 16 + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 app/                            # App Router
│   │   │   ├── 📄 layout.tsx                  # Root layout
│   │   │   ├── 📄 page.tsx                    # Dashboard
│   │   │   └── 📁 login/                       # Login page
│   │   │
│   │   ├── 📁 components/                      # UI Components
│   │   │   ├── 📁 TaskCard/                    # Task card
│   │   │   ├── 📁 TaskForm/                    # Create task
│   │   │   ├── 📁 TaskList/                    # Task list
│   │   │   ├── 📁 TaskEditModal/               # Edit modal
│   │   │   └── 📁 DarkModeToggle/              # Theme switcher
│   │   │
│   │   ├── 📁 context/                         # React Context
│   │   │   ├── 📄 AuthContext.tsx              # Auth state
│   │   │   └── 📄 ThemeContext.tsx             # Dark/light theme
│   │   │
│   │   ├── 📁 hooks/                           # Custom Hooks
│   │   │   ├── 📄 useTasks.ts                  # React Query
│   │   │   └── 📄 useTasks.test.tsx
│   │   │
│   │   ├── 📁 lib/                             # Utilities
│   │   │   ├── 📁 api/                         # API client
│   │   │   └── 📁 types/                       # TypeScript types
│   │   │
│   │   └── 📁 __tests__/                        # Frontend tests (56)
│   │
│   └── 📁 config/                               # Configuration files
│       ├── 📄 Dockerfile
│       ├── 📄 vercel.json
│       ├── 📄 next.config.js
│       ├── 📄 tailwind.config.js
│       ├── 📄 jest.config.js
│       └── 📄 package.json
│
├── 📁 backend/                                 # Express + TypeScript + Prisma
│   ├── 📁 src/
│   │   ├── 📁 controllers/                     # Business logic
│   │   │   ├── 📄 auth.controller.ts           # Login/register
│   │   │   └── 📄 task.controller.ts           # Task CRUD
│   │   │
│   │   ├── 📁 middleware/                       # Express middleware
│   │   │   ├── 📄 auth.middleware.ts           # JWT
│   │   │   ├── 📄 validate.ts                  # Zod
│   │   │   ├── 📄 rateLimit.ts                 # Rate limiting
│   │   │   └── 📄 helmet.ts                    # Security
│   │   │
│   │   ├── 📁 routes/                           # API endpoints
│   │   │   ├── 📄 auth.routes.ts
│   │   │   └── 📄 task.routes.ts
│   │   │
│   │   ├── 📁 validators/                       # Zod schemas
│   │   │   ├── 📄 auth.validator.ts
│   │   │   └── 📄 task.validator.ts
│   │   │
│   │   ├── 📁 database/                         # Prisma client
│   │   │   └── 📄 prisma.ts
│   │   │
│   │   ├── 📁 config/                           # Configuration
│   │   │   ├── 📄 env.ts                       # Validation
│   │   │   └── 📄 cors.ts                      # CORS
│   │   │
│   │   └── 📄 server.ts                         # Entry point
│   │
│   ├── 📁 prisma/                               # Database
│   │   ├── 📄 schema.prisma                    # Models
│   │   ├── 📁 migrations/                       # SQL migrations
│   │   └── 📄 seed.js                           # Demo data
│   │
│   ├── 📁 tests/                                # Backend tests (30)
│   │   ├── 📁 unit/
│   │   └── 📁 setup/
│   │
│   └── 📁 config/                               # Configuration files
│       ├── 📄 Dockerfile
│       ├── 📄 render.yaml
│       ├── 📄 jest.config.js
│       ├── 📄 tsconfig.json
│       └── 📄 package.json
│
├── 📄 docker-compose.yml                        # Local development stack
│
├── 📄 .gitignore                                # Git ignored files
│
└── 📄 README.md                                 # This documentation
```
</details>

---

## 📊 Quality Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Frontend Tests** | 56/56 | ![100%](https://img.shields.io/badge/100%25-success) |
| **Backend Tests** | 30/30 | ![100%](https://img.shields.io/badge/100%25-success) |
| **Total Tests** | 86/86 | ![100%](https://img.shields.io/badge/100%25-success) |
| **TypeScript Errors** | 0 | ![Strict](https://img.shields.io/badge/Strict-0%20errors-blue) |
| **Docker Images** | 2 (backend + frontend) | ![Docker](https://img.shields.io/badge/Docker-optimized-blue) |
| **Containers** | 3 (db + backend + frontend) | ![Compose](https://img.shields.io/badge/Compose-ready-green) |
| **Code Comments** | 100% English | ![Docs](https://img.shields.io/badge/Docs-Professional-blue) |
| **Lighthouse Score** | >90 | ![Performance](https://img.shields.io/badge/Performance-90%2B-brightgreen) |

---

## 🚀 Quick Start Guide

### **Option 1: Try Live Demo (No Installation)**
Simply visit:
```
https://task-manager-pro-psi.vercel.app
```
Use demo credentials:
```
Email: demo@taskmanager.com
Password: demo123
```

### **Option 2: Local Development**

#### 📋 **Prerequisites**
- Node.js 20.x or higher
- npm 9.x or higher
- PostgreSQL 15 (optional, if not using Docker)

#### 🛠️ **Setup Instructions**

```bash
# 1. Clone the repository
git clone https://github.com/MarceloAdan73/task-manager-pro.git
cd task-manager-pro

# 2. Backend setup
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
# Backend runs on http://localhost:3005

# 3. Frontend setup (new terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
# Frontend runs on http://localhost:3004

# 4. Open browser
# http://localhost:3004
```

---

### **Option 3: Docker Setup (Recommended)**

```bash
# 1. Clone repository
git clone https://github.com/MarceloAdan73/task-manager-pro.git
cd task-manager-pro

# 2. Start all services
docker-compose up -d

# 3. Access application
# Frontend: http://localhost:3004
# Backend API: http://localhost:3005/api/health

# 4. View logs (optional)
docker-compose logs -f

# 5. Stop services
docker-compose down
```

---

## 🎮 Usage Guide

### **Authentication**
1. Navigate to the login page
2. Use demo credentials or register
3. JWT token auto-stored in localStorage

### **Task Management**

| Action | How to |
|--------|--------|
| **Create Task** | Click "Add Task" → Fill form → Submit |
| **Edit Task** | Click on task card → Modify → Save |
| **Complete Task** | Click checkbox on task card |
| **Delete Task** | Click trash icon on task card |
| **Filter Tasks** | Use tabs (All/Pending/Completed) |
| **Change Priority** | Edit task → Select priority |

### **UI Features**
- 🌙 **Dark Mode** - Click sun/moon icon in header
- 📱 **Responsive** - Works on mobile, tablet, desktop
- ⚡ **Real-time** - Optimistic updates with React Query

---

## 🐳 Docker Commands

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start all services |
| `docker-compose logs -f` | View real-time logs |
| `docker-compose down` | Stop all services |
| `docker-compose down -v` | Stop and delete database |
| `docker-compose build backend` | Rebuild backend only |
| `docker exec -it taskmanager-backend sh` | Access container shell |
| `docker ps` | List running containers |
| `docker stats` | View resource usage |

---

## 🧪 Testing

### **Backend Tests**
```bash
cd backend
npm test          # Run all tests
npm test:watch    # Watch mode
npm test:coverage # Coverage report
```

### **Frontend Tests**
```bash
cd frontend
npm test          # Run all tests
npm test:watch    # Watch mode
npm test:coverage # Coverage report
```

### **Test Coverage**
```
✅ Backend: 30/30 tests
   • Auth Controller
   • Task Controller
   • Middleware
   • Utilities

✅ Frontend: 56/56 tests
   • Components
   • Hooks
   • API Client
   • Contexts
```

---

## 🚧 Future Improvements

| Short Term | Medium Term | Long Term |
|------------|-------------|-----------|
| ✅ CSV/PDF export | 👥 Team collaboration | 📱 Mobile app |
| ✅ GraphQL API | 🔄 WebSockets real-time | 🤖 AI task suggestions |
| 📊 Dashboard with charts | 🏷️ Categories/Tags | 📎 File attachments |
| ⏰ Due dates/Reminders | 📧 Email notifications | 📅 Calendar integration |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### **Development Guidelines**
- ✅ Write tests for new features
- ✅ Maintain 100% TypeScript strictness
- ✅ Follow existing code style
- ✅ Update documentation

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Marcelo Adán** - Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-MarceloAdan73-181717?style=for-the-badge&logo=github)](https://github.com/MarceloAdan73)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Marcelo_Adán-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/marcelo-adan)
[![Portfolio](https://img.shields.io/badge/Portfolio-marcelo.dev-000000?style=for-the-badge&logo=vercel)](https://marcelo.dev)

> 🧠 **Architectural Note**: This project's codebase is orchestrated by Marcelo Adán, with AI assistance as a development tool to accelerate implementation while maintaining professional standards and senior-level architectural decisions.

---

## 🙏 Acknowledgements

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## ⭐ Support

If you find this project useful, please consider giving it a star on GitHub!

[![Star on GitHub](https://img.shields.io/github/stars/MarceloAdan73/task-manager-pro?style=social)](https://github.com/MarceloAdan73/task-manager-pro)

---

<div align="center">
  <sub>Built with ❤️ by Marcelo Adán | © 2026 Task Manager Pro</sub>
</div>
