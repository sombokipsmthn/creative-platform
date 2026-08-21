"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Mail,
  MessageCircle,
  MoreHorizontal,
  PackageCheck,
  PlayCircle,
  Plus,
  Receipt,
  Send,
  TrendingUp,
  Users,
  Video,
  Wallet,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Priority = "high" | "medium" | "low";

type Activity = {
  id: string;
  type:
    | "email"
    | "quote"
    | "invoice"
    | "gallery"
    | "project"
    | "meeting";
  title: string;
  description: string;
  client: string;
  time: string;
  priority?: Priority;
};

type Project = {
  id: string;
  client: string;
  project: string;
  status:
    | "Quote"
    | "Approved"
    | "Production"
    | "Editing"
    | "Proofing"
    | "Delivered";
  due: string;
  value: string;
};

type SocialAccount = {
  platform: string;
  handle: string;
  followers: string;
  growth: string;
  engagement: string;
};

/* =========================================================
   MOCK DATA
========================================================= */

const activities: Activity[] = [
  {
    id: "1",
    type: "email",
    title: "New quotation request",
    description:
      "Client is requesting coverage for a two-day corporate event.",
    client: "Acme Africa",
    time: "12 min ago",
    priority: "high",
  },
  {
    id: "2",
    type: "email",
    title: "Client replied to your quote",
    description:
      "They would like to proceed and have asked about the production timeline.",
    client: "Bandari Beauty",
    time: "34 min ago",
    priority: "high",
  },
  {
    id: "3",
    type: "meeting",
    title: "Pre-production meeting",
    description: "Reviewing creative direction and shot list.",
    client: "Mastercard Foundation",
    time: "10:30 AM",
    priority: "medium",
  },
  {
    id: "4",
    type: "gallery",
    title: "Proofing completed",
    description: "Client has selected 48 images from the proofing gallery.",
    client: "Vivo Fashion",
    time: "1 hr ago",
    priority: "medium",
  },
  {
    id: "5",
    type: "invoice",
    title: "Invoice ready to send",
    description: "Approved project is ready for final invoicing.",
    client: "BURN Manufacturing",
    time: "2 hrs ago",
    priority: "high",
  },
];

const projects: Project[] = [
  {
    id: "1",
    client: "Bandari Beauty",
    project: "Swahili Day Campaign",
    status: "Production",
    due: "Today",
    value: "KES 185,000",
  },
  {
    id: "2",
    client: "Vivo Fashion",
    project: "Q3 Product Campaign",
    status: "Editing",
    due: "Aug 24",
    value: "KES 240,000",
  },
  {
    id: "3",
    client: "BURN Manufacturing",
    project: "ECOA Launch Content",
    status: "Proofing",
    due: "Aug 22",
    value: "KES 320,000",
  },
  {
    id: "4",
    client: "Mastercard Foundation",
    project: "EdTech Fellowship",
    status: "Approved",
    due: "Aug 28",
    value: "KES 450,000",
  },
];

const socialAccounts: SocialAccount[] = [
  {
    platform: "Instagram",
    handle: "@creator",
    followers: "24.8K",
    growth: "+8.4%",
    engagement: "6.8%",
  },
  {
    platform: "LinkedIn",
    handle: "Creator Profile",
    followers: "12.4K",
    growth: "+12.1%",
    engagement: "5.2%",
  },
  {
    platform: "TikTok",
    handle: "@creator",
    followers: "18.6K",
    growth: "+15.7%",
    engagement: "8.9%",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getActivityIcon(type: Activity["type"]) {
  switch (type) {
    case "email":
      return <Mail size={17} />;
    case "quote":
      return <FileText size={17} />;
    case "invoice":
      return <Receipt size={17} />;
    case "gallery":
      return <PackageCheck size={17} />;
    case "project":
      return <Video size={17} />;
    case "meeting":
      return <CalendarDays size={17} />;
    default:
      return <MessageCircle size={17} />;
  }
}

function statusClasses(status: Project["status"]) {
  switch (status) {
    case "Quote":
      return "bg-gray-100 text-gray-700";
    case "Approved":
      return "bg-blue-50 text-blue-700";
    case "Production":
      return "bg-purple-50 text-purple-700";
    case "Editing":
      return "bg-orange-50 text-orange-700";
    case "Proofing":
      return "bg-yellow-50 text-yellow-700";
    case "Delivered":
      return "bg-green-50 text-green-700";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function CommandCenterPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-500">
              <Link
                href="/admin"
                className="transition hover:text-black"
              >
                Admin
              </Link>

              <ChevronRight size={14} />

              <span>Command Center</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Command Center
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Everything that needs your attention today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex h-10 items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-4 text-sm font-medium transition hover:bg-gray-50">
              <CalendarDays size={16} />
              Calendar
            </button>

            <button className="flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-medium text-white transition hover:bg-black/80">
              <Plus size={16} />
              New
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        {/* ===================================================
            ATTENTION CARDS
        =================================================== */}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Mail size={19} />}
            label="Needs attention"
            value="7"
            detail="emails & requests"
            href="#inbox"
          />

          <MetricCard
            icon={<FileText size={19} />}
            label="Quotes"
            value="3"
            detail="waiting to be sent"
            href="#money"
          />

          <MetricCard
            icon={<Wallet size={19} />}
            label="Invoices"
            value="KES 485K"
            detail="ready to send"
            href="#money"
          />

          <MetricCard
            icon={<PlayCircle size={19} />}
            label="Active projects"
            value="8"
            detail="currently in production"
            href="#projects"
          />
        </section>

        {/* ===================================================
            MAIN GRID
        =================================================== */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="space-y-6">
            {/* TODAY */}

            <section className="rounded-xl border border-black/[0.07] bg-white">
              <SectionHeader
                title="Today"
                subtitle="Your next actions"
                action="View calendar"
              />

              <div className="divide-y divide-black/[0.06]">
                <TodayItem
                  time="09:00"
                  title="Send revised quotation"
                  client="Acme Africa"
                  type="Quote"
                  urgent
                />

                <TodayItem
                  time="10:30"
                  title="Pre-production meeting"
                  client="Mastercard Foundation"
                  type="Meeting"
                />

                <TodayItem
                  time="13:00"
                  title="Shoot — Swahili Day"
                  client="Bandari Beauty"
                  type="Production"
                />

                <TodayItem
                  time="16:30"
                  title="Send final gallery"
                  client="Vivo Fashion"
                  type="Delivery"
                />
              </div>
            </section>

            {/* INBOX */}

            <section
              id="inbox"
              className="rounded-xl border border-black/[0.07] bg-white"
            >
              <SectionHeader
                title="Inbox"
                subtitle="Communication that needs action"
                action="Open inbox"
              />

              <div className="divide-y divide-black/[0.06]">
                {activities.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                  />
                ))}
              </div>
            </section>

            {/* PROJECTS */}

            <section
              id="projects"
              className="rounded-xl border border-black/[0.07] bg-white"
            >
              <SectionHeader
                title="Active work"
                subtitle="Where your projects currently stand"
                action="View projects"
              />

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                      <th className="px-6 py-3">Client</th>
                      <th className="px-6 py-3">Project</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Due</th>
                      <th className="px-6 py-3 text-right">
                        Value
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {projects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-b border-black/[0.05] last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">
                            {project.client}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {project.project}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(
                              project.status
                            )}`}
                          >
                            {project.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {project.due}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-medium">
                          {project.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div className="space-y-6">
            {/* MONEY */}

            <section
              id="money"
              className="rounded-xl border border-black/[0.07] bg-white"
            >
              <SectionHeader
                title="Money"
                subtitle="Quotes, invoices & payments"
                action="View finances"
              />

              <div className="grid grid-cols-2 gap-3 p-5">
                <FinanceCard
                  label="Quotes to send"
                  value="3"
                  amount="KES 740K"
                  icon={<Send size={16} />}
                />

                <FinanceCard
                  label="Awaiting approval"
                  value="2"
                  amount="KES 510K"
                  icon={<Clock3 size={16} />}
                />

                <FinanceCard
                  label="Invoices to send"
                  value="4"
                  amount="KES 485K"
                  icon={<Receipt size={16} />}
                />

                <FinanceCard
                  label="Outstanding"
                  value="5"
                  amount="KES 920K"
                  icon={<Wallet size={16} />}
                />
              </div>
            </section>

            {/* GALLERIES */}

            <section className="rounded-xl border border-black/[0.07] bg-white">
              <SectionHeader
                title="Client delivery"
                subtitle="Gallery & proofing activity"
                action="View galleries"
              />

              <div className="space-y-3 p-5">
                <DeliveryRow
                  label="Proofing outstanding"
                  value="3"
                  detail="clients"
                  icon={<PackageCheck size={17} />}
                />

                <DeliveryRow
                  label="Galleries sent"
                  value="8"
                  detail="this month"
                  icon={<Send size={17} />}
                />

                <DeliveryRow
                  label="Client selections"
                  value="126"
                  detail="images"
                  icon={<CheckCircle2 size={17} />}
                />

                <DeliveryRow
                  label="Downloads"
                  value="842"
                  detail="this month"
                  icon={<Download size={17} />}
                />
              </div>
            </section>

            {/* CLIENTS */}

            <section className="rounded-xl border border-black/[0.07] bg-white">
              <SectionHeader
                title="Client activity"
                subtitle="Recent relationship signals"
                action="View clients"
              />

              <div className="divide-y divide-black/[0.06]">
                <ClientActivity
                  client="Bandari Beauty"
                  message="Approved revised quotation"
                  time="12 min"
                  status="positive"
                />

                <ClientActivity
                  client="Vivo Fashion"
                  message="Selected 48 images"
                  time="1 hr"
                  status="positive"
                />

                <ClientActivity
                  client="Acme Africa"
                  message="Waiting for quotation"
                  time="2 hrs"
                  status="warning"
                />

                <ClientActivity
                  client="BURN Manufacturing"
                  message="Invoice payment overdue"
                  time="Yesterday"
                  status="danger"
                />
              </div>
            </section>

            {/* SOCIAL */}

            <section className="rounded-xl border border-black/[0.07] bg-white">
              <SectionHeader
                title="Social performance"
                subtitle="Creator & client accounts"
                action="View analytics"
              />

              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Overall reach
                    </p>

                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      184.6K
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    <TrendingUp size={13} />
                    +14.8%
                  </div>
                </div>

                <div className="space-y-3">
                  {socialAccounts.map((account) => (
                    <SocialRow
                      key={`${account.platform}-${account.handle}`}
                      account={account}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ===================================================
            WORKFLOW
        =================================================== */}

        <section className="mt-6 rounded-xl border border-black/[0.07] bg-white">
          <SectionHeader
            title="Creator workflow"
            subtitle="The complete lifecycle of a client job"
            action="Manage workflow"
          />

          <div className="overflow-x-auto p-5">
            <div className="flex min-w-[1000px] items-center gap-2">
              <WorkflowStage
                number="01"
                title="Lead"
                count="12"
              />

              <WorkflowArrow />

              <WorkflowStage
                number="02"
                title="Quote"
                count="5"
              />

              <WorkflowArrow />

              <WorkflowStage
                number="03"
                title="Approved"
                count="3"
              />

              <WorkflowArrow />

              <WorkflowStage
                number="04"
                title="Production"
                count="4"
              />

              <WorkflowArrow />

              <WorkflowStage
                number="05"
                title="Editing"
                count="3"
              />

              <WorkflowArrow />

              <WorkflowStage
                number="06"
                title="Proofing"
                count="3"
              />

              <WorkflowArrow />

              <WorkflowStage
                number="07"
                title="Delivered"
                count="18"
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            FOOTER INSIGHT
        =================================================== */}

        <div className="mt-6 flex items-center justify-between rounded-xl border border-black/[0.07] bg-white px-6 py-5">
          <div>
            <p className="text-sm font-semibold">
              Command Center insight
            </p>

            <p className="mt-1 text-sm text-gray-500">
              You have 7 items requiring attention today. 3 are
              directly connected to revenue.
            </p>
          </div>

          <button className="flex items-center gap-2 text-sm font-medium transition hover:opacity-60">
            Review all
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function MetricCard({
  icon,
  label,
  value,
  detail,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-xl border border-black/[0.07] bg-white p-5 transition hover:-translate-y-0.5 hover:border-black/[0.12] hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
          {icon}
        </div>

        <ArrowUpRight
          size={16}
          className="text-gray-300 transition group-hover:text-black"
        />
      </div>

      <p className="mt-5 text-sm text-gray-500">{label}</p>

      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-2xl font-semibold tracking-tight">
          {value}
        </p>

        <p className="text-xs text-gray-400">{detail}</p>
      </div>
    </a>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>

        <p className="mt-1 text-xs text-gray-500">
          {subtitle}
        </p>
      </div>

      <button className="flex items-center gap-1 text-xs font-medium text-gray-500 transition hover:text-black">
        {action}
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function TodayItem({
  time,
  title,
  client,
  type,
  urgent,
}: {
  time: string;
  title: string;
  client: string;
  type: string;
  urgent?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="w-14 shrink-0 text-xs font-medium text-gray-400">
        {time}
      </div>

      <div className="h-8 w-px bg-black/[0.08]" />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{title}</p>

          {urgent && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
              Action needed
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-gray-500">
          {client}
        </p>
      </div>

      <span className="hidden rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 sm:block">
        {type}
      </span>

      <ChevronRight
        size={15}
        className="text-gray-300"
      />
    </div>
  );
}

function ActivityRow({
  activity,
}: {
  activity: Activity;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 transition hover:bg-gray-50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        {getActivityIcon(activity.type)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">
            {activity.title}
          </p>

          {activity.priority === "high" && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          )}
        </div>

        <p className="mt-1 truncate text-xs text-gray-500">
          {activity.client} · {activity.description}
        </p>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-gray-400">
          {activity.time}
        </p>
      </div>

      <button className="text-gray-300 transition hover:text-black">
        <MoreHorizontal size={17} />
      </button>
    </div>
  );
}

function FinanceCard({
  label,
  value,
  amount,
  icon,
}: {
  label: string;
  value: string;
  amount: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-black/[0.06] p-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-400">{icon}</span>

        <span className="text-xl font-semibold tracking-tight">
          {value}
        </span>
      </div>

      <p className="mt-4 text-xs font-medium text-gray-600">
        {label}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {amount}
      </p>
    </div>
  );
}

function DeliveryRow({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>

        <p className="mt-0.5 text-xs text-gray-400">
          {detail}
        </p>
      </div>

      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function ClientActivity({
  client,
  message,
  time,
  status,
}: {
  client: string;
  message: string;
  time: string;
  status: "positive" | "warning" | "danger";
}) {
  const statusDot = {
    positive: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  }[status];

  return (
    <div className="flex items-center gap-3 px-6 py-4">
      <div
        className={`h-2 w-2 shrink-0 rounded-full ${statusDot}`}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{client}</p>

        <p className="mt-0.5 truncate text-xs text-gray-500">
          {message}
        </p>
      </div>

      <span className="shrink-0 text-xs text-gray-400">
        {time}
      </span>
    </div>
  );
}

function SocialRow({
  account,
}: {
  account: SocialAccount;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-black/[0.06] p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold">
        {account.platform.slice(0, 1)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {account.platform}
        </p>

        <p className="truncate text-xs text-gray-400">
          {account.handle}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold">
          {account.followers}
        </p>

        <p className="text-[11px] text-green-600">
          {account.growth}
        </p>
      </div>
    </div>
  );
}

function WorkflowStage({
  number,
  title,
  count,
}: {
  number: string;
  title: string;
  count: string;
}) {
  return (
    <div className="flex-1 rounded-lg border border-black/[0.07] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-wider text-gray-400">
          {number}
        </span>

        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium">
          {count}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium">{title}</p>
    </div>
  );
}

function WorkflowArrow() {
  return (
    <ChevronRight
      size={18}
      className="shrink-0 text-gray-300"
    />
  );
}