"use client";

import { Users, FileText, Camera, Wallet, FolderSimple as FolderKanban, CheckCircle as CheckCircle2, Clock, WarningCircle as AlertCircle, DotsThree as MoreHorizontal, MagnifyingGlass as Search, Funnel as Filter, Plus, Gear as Settings, CaretDown as ChevronDown, CaretRight as ChevronRight, Envelope as Mail, Phone, MapPin, CurrencyDollar as DollarSign, Image as ImageIcon, SquaresFour as LayoutDashboard } from "@phosphor-icons/react";

interface Project {
  id: string;
  name: string;
  client: string;
  status: "active" | "review" | "delivered" | "archived";
  progress: number;
  dueDate: string;
  thumbnail?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  avatar?: string;
  projectCount: number;
  lastContact: string;
}

const mockProjects: Project[] = [
  { id: "1", name: "Brand Identity System", client: "Acme Corp", status: "active", progress: 65, dueDate: "2026-11-15" },
  { id: "2", name: "Product Photography", client: "TechStart Inc", status: "review", progress: 90, dueDate: "2026-10-28" },
  { id: "3", name: "Documentary Series", client: "GreenEarth NGO", status: "delivered", progress: 100, dueDate: "2026-10-10" },
  { id: "4", name: "Social Media Campaign", client: "FashionForward", status: "active", progress: 30, dueDate: "2026-12-01" },
  { id: "5", name: "Website Redesign", client: "HealthPlus", status: "archived", progress: 100, dueDate: "2026-09-20" },
];

const mockClients: Client[] = [
  { id: "1", name: "Sarah Chen", email: "sarah@acmecorp.com", company: "Acme Corp", projectCount: 3, lastContact: "2 days ago" },
  { id: "2", name: "Marcus Johnson", email: "marcus@techstart.io", company: "TechStart Inc", projectCount: 1, lastContact: "1 week ago" },
  { id: "3", name: "Priya Patel", email: "priya@greenearth.org", company: "GreenEarth NGO", projectCount: 2, lastContact: "3 weeks ago" },
  { id: "4", name: "David Kim", email: "david@fashionforward.com", company: "FashionForward", projectCount: 1, lastContact: "5 days ago" },
];

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
  review: { label: "In Review", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  delivered: { label: "Delivered", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle2 },
  archived: { label: "Archived", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400", icon: AlertCircle },
};

export default function ProductPreview({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${className}`} role="img" aria-label="KIPSMTHN platform interface preview showing project dashboard, client management, and gallery delivery workflows">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-zinc-800/50 px-4 py-3 bg-slate-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
            K
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">Workspace</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors" aria-label="Filter">
            <Filter className="h-4 w-4" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors" aria-label="Create new">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[420px]">
        {/* Sidebar */}
        <aside className="w-56 border-r border-slate-200/50 dark:border-zinc-800/50 bg-slate-50/30 dark:bg-zinc-900/30 flex flex-col">
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
            {[
              { href: "#", label: "Dashboard", icon: LayoutDashboard, active: true },
              { href: "#", label: "Projects", icon: FolderKanban, active: false },
              { href: "#", label: "Clients", icon: Users, active: false },
              { href: "#", label: "Quotes", icon: FileText, active: false },
              { href: "#", label: "Invoices", icon: Wallet, active: false },
              { href: "#", label: "Galleries", icon: Camera, active: false },
            ].map((item, index) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                }`}
                aria-current={item.active ? "page" : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-slate-200/50 dark:border-zinc-800/50">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors">
              <Settings className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Panel - Projects View */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-zinc-800/50 px-5 py-4 bg-white dark:bg-zinc-950">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Projects</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Manage and track all your creative projects</p>
            </div>
            <div className="flex items-center gap-2">
              <select className="h-9 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white appearance-none" aria-label="Sort projects">
                <option>Recent first</option>
                <option>Oldest first</option>
                <option>Progress</option>
                <option>Due date</option>
              </select>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors" aria-label="View options">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Projects Table */}
          <div className="flex-1 overflow-auto p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800">
                    <th className="text-left py-3 px-3 font-medium text-slate-500 dark:text-zinc-400">Project</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-500 dark:text-zinc-400 hidden md:table-cell">Client</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-500 dark:text-zinc-400 hidden lg:table-cell">Status</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-500 dark:text-zinc-400 hidden lg:table-cell">Progress</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-500 dark:text-zinc-400 hidden xl:table-cell">Due</th>
                    <th className="text-right py-3 px-3 font-medium text-slate-500 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                  {mockProjects.map((project, index) => {
                    const config = statusConfig[project.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr key={project.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/50">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                              <ImageIcon className="h-5 w-5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{project.name}</p>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">#{project.id} · Creative Project</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <p className="font-medium text-slate-700 dark:text-zinc-300">{project.client}</p>
                        </td>
                        <td className="py-3 px-3 hidden lg:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                            <StatusIcon className="h-3 w-3" aria-hidden="true" />
                            {config.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 hidden lg:table-cell">
                          <div className="w-32">
                            <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${project.progress}%` }}
                                role="progressbar"
                                aria-valuenow={project.progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 text-right">{project.progress}%</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 hidden xl:table-cell text-slate-500 dark:text-zinc-400">
                          {new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors" aria-label={`View ${project.name} details`}>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Illustrative Badge */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-zinc-800/50 text-xs text-slate-500 dark:text-zinc-400">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Info className="h-2.5 w-2.5" />
        </span>
        Illustrative preview — real screenshots coming soon
      </div>
    </div>
  );
}

// Simple Info icon since it's not imported
function Info({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}