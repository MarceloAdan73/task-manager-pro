"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import TaskList from "@/components/TaskList/TaskList";
import TaskForm from "@/components/TaskForm/TaskForm";
import TaskEditModal from "@/components/TaskEditModal/TaskEditModal";
import { DarkModeToggle } from "@/components/DarkModeToggle/DarkModeToggle";
import { useTasks } from "@/hooks/useTasks";
import type { TaskFormData, Task } from "@/lib/types";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  LogOut,
  User,
  Github,
  Linkedin,
  CalendarDays,
  Sparkles,
  Zap,
  Menu,
  Code2,
  Database,
  Layers,
  Cpu,
  ArrowUpRight,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const {
    tasks,
    isLoading: tasksLoading,
    isError,
    error,
    createTask,
    isCreating,
    updateTask,
    deleteTask,
  } = useTasks();

  const [search, setSearch] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "pending">(
    "all",
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (activeTab === "completed") result = result.filter((t) => t.completed);
    if (activeTab === "pending") result = result.filter((t) => !t.completed);
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(lowerSearch) ||
          (task.description &&
            task.description.toLowerCase().includes(lowerSearch)),
      );
    }
    return result;
  }, [tasks, search, activeTab]);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    const total = tasks.length;
    return {
      total,
      completed,
      pending: total - completed,
      highPriority: tasks.filter(
        (t) => t.priority?.toLowerCase() === "high" && !t.completed,
      ).length,
      completionPercentage:
        total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleCreateTask = async (data: TaskFormData) => {
    await createTask(data);
  };

  const handleToggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) await updateTask({ id, updates: { completed: !task.completed } });
  };

  const handleEdit = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) setEditingTask(task);
  };

  const handleSaveEdit = async (updatedTask: Partial<Task>) => {
    if (updatedTask.id) {
      await updateTask({ id: updatedTask.id, updates: updatedTask });
      setEditingTask(null);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col justify-between p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-lg tracking-tight">Tasker Pro</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <NavItem
              icon={LayoutDashboard}
              label="All Tasks"
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              count={tasks.length}
            />
            <NavItem
              icon={Clock}
              label="Pending"
              active={activeTab === "pending"}
              onClick={() => setActiveTab("pending")}
              count={stats.pending}
            />
            <NavItem
              icon={CheckCircle2}
              label="Completed"
              active={activeTab === "completed"}
              onClick={() => setActiveTab("completed")}
              count={stats.completed}
            />
          </nav>
        </div>

        {/* User Footer Sidebar */}
        <div>
          <div className="flex items-center justify-between px-2 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
            <DarkModeToggle />
            <div className="flex gap-2">
              <SocialLink
                href="https://github.com/MarceloAdan73"
                icon={Github}
                label="GitHub"
              />
              <SocialLink href="#" icon={Linkedin} label="LinkedIn" />
            </div>
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
              <User className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name || "User"}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3 h-3 transition-transform group-hover/logout:-translate-x-0.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto p-6 lg:p-12 w-full flex-1">
          {/* Header Mobile Only */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <span className="font-bold text-lg">Tasker Pro</span>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-white dark:bg-zinc-900 border rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-20 right-6 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {user?.name || "Usuario"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {user?.email}
                </p>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    toggleTheme?.();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}

          {/* Top Bar */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Application Demo v1.0
                </span>
                <span className="text-zinc-400 dark:text-zinc-500 text-xs flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {today}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Welcome back, {user?.name?.split(" ")[0] || "Guest"}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 max-w-md">
                This dashboard demonstrates full CRUD operations, authentication
                flows, and responsive UI architecture.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all shadow-sm placeholder:text-zinc-400"
                />
              </div>
            </div>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Total Tasks"
              value={stats.total}
              icon={LayoutDashboard}
            />
            <StatCard
              label="Completed"
              value={stats.completed}
              icon={CheckCircle2}
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={Clock}
              highlight={stats.pending > 5}
            />
            <StatCard
              label="High Priority"
              value={stats.highPriority}
              icon={AlertCircle}
              alert={stats.highPriority > 0}
            />
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left: Task List (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[500px] flex flex-col">
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <h2 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-400" />
                    Task Overview
                  </h2>
                  <span className="text-xs text-zinc-500">Live Updates</span>
                </div>

                <div className="flex-1">
                  {tasksLoading ? (
                    <div className="h-full flex items-center justify-center p-12 text-zinc-400 text-sm">
                      Loading workspace data...
                    </div>
                  ) : filteredTasks.length > 0 ? (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                      <TaskList
                        tasks={filteredTasks}
                        isLoading={tasksLoading}
                        isError={isError}
                        error={error}
                        onToggleComplete={handleToggleComplete}
                        onDelete={deleteTask}
                        onEdit={handleEdit}
                        onToggleExpand={setExpandedTaskId}
                        expandedTaskId={expandedTaskId}
                      />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">
                      <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-5 h-5 text-zinc-400" />
                      </div>
                      <h3 className="text-zinc-900 dark:text-white font-medium mb-1">
                        No tasks found
                      </h3>
                      <p className="text-zinc-500 text-sm">
                        Create a new task to test the database connection.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Add & Tech Stack (4 cols) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
              {/* Add Task Card */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg shadow-zinc-200/50 dark:shadow-none">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-zinc-900 dark:bg-white rounded-lg">
                    <Plus className="w-4 h-4 text-white dark:text-zinc-900" />
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    Quick Add
                  </span>
                </div>
                <TaskForm
                  onSubmit={handleCreateTask}
                  isSubmitting={isCreating}
                />
              </div>

              {/* Tech Stack Card for Recruiters */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-zinc-500" />
                    Tech Stack
                  </h3>
                  <a
                    href="https://github.com/MarceloAdan73"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors group"
                  >
                    View Repo{" "}
                    <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                      Frontend
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <TechBadge label="Next.js 14" icon={Zap} />
                      <TechBadge label="React" icon={Cpu} />
                      <TechBadge label="Tailwind" icon={Layers} />
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                      Backend & Data
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <TechBadge label="Prisma" icon={Database} />
                      <TechBadge label="PostgreSQL" icon={Layers} />
                      <TechBadge label="Auth" icon={ShieldCheck} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-8 px-6 lg:ml-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                Tasker Pro{" "}
                <span className="text-zinc-400 font-normal">
                  {" "}
                  — Portfolio Project
                </span>
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Designed and built by{" "}
                <span className="text-zinc-700 dark:text-zinc-300">
                  Marcelo Adán
                </span>
                .
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Cpu className="w-3 h-3" />
                <span>v1.0.2 Stable</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Database className="w-3 h-3" />
                <span>Connected</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <TaskEditModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

/* --- Subcomponents --- */

function NavItem({ icon: Icon, label, active, onClick, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
        active
          ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm"
          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={`w-4 h-4 ${active ? "text-white dark:text-black" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"}`}
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count !== undefined && (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
            active
              ? "bg-white/20 text-white dark:bg-black/10 dark:text-black"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function StatCard({ label, value, icon: Icon, highlight, alert }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-2 rounded-lg ${
            alert
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              : highlight
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <span className="text-2xl font-bold text-zinc-900 dark:text-white block tracking-tight">
          {value}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          {label}
        </span>
      </div>
    </div>
  );
}

/* --- Subcomponente Corregido --- */
function TechBadge({ label, icon: Icon }: { label: string; icon?: any }) {
  return (
    <span className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors cursor-default">
      {/* Si pasamos un icono, lo renderizamos con un tamaño pequeño */}
      {Icon && <Icon className="w-3 h-3 text-zinc-400" />}
      {label}
    </span>
  );
}

function SocialLink({ href, icon: Icon, label }: any) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}
