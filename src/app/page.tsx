import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

type Project = {
  title: string;
  category: string;
  coords: string; // signature detail — a nod to the drone/aerial practice
  year: string;
  size: "large" | "small";
  imageUrl?: string; // swap in real Drive-sourced thumbnails
};

const projects: Project[] = [
  {
    title: "Adunni",
    category: "Editorial Portraits",
    coords: "01°17′S 36°49′E",
    year: "2025",
    size: "large",
  },
  {
    title: "Kicks Kenya",
    category: "Product Photography",
    coords: "01°17′S 36°49′E",
    year: "2025",
    size: "small",
  },
  {
    title: "Tatu Boys Secondary",
    category: "Aerial / Drone",
    coords: "01°22′S 36°55′E",
    year: "2024",
    size: "small",
  },
  {
    title: "Community & Environment",
    category: "Documentary",
    coords: "01°17′S 36°49′E",
    year: "2024",
    size: "large",
  },
];

function ProjectCard({ project }: { project: Project }) {
  const isLarge = project.size === "large";
  return (
    <Link
      href="#"
      className={`group relative block overflow-hidden border border-[#2A2822] ${
        isLarge ? "md:col-span-2 aspect-[16/10]" : "aspect-[4/5]"
      }`}
    >
      {/* Placeholder surface — replace with real gallery cover images */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1c1a15] to-[#0e0d0b] transition-transform duration-700 ease-out group-hover:scale-105" />

      <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
        <div className="flex items-start justify-between font-mono text-[11px] uppercase tracking-wider text-[#948C7C]">
          <span>{project.coords}</span>
          <span>{project.year}</span>
        </div>

        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-[#C4923D]">
            {project.category}
          </p>
          <h3
            className={`font-[family-name:var(--font-display)] italic text-[#F3EFE6] ${
              isLarge ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"
            }`}
          >
            {project.title}
          </h3>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-px w-0 bg-[#C4923D] transition-all duration-500 group-hover:w-full" />
    </Link>
  );
}

export default function WorkPage() {
  return (
    <div
      className={`${fraunces.variable} ${inter.variable} ${mono.variable} min-h-screen bg-[#0B0B0A] font-[family-name:var(--font-body)] text-[#F3EFE6]`}
    >
      {/* NAV */}
      <header className="flex items-center justify-between border-b border-[#2A2822] px-6 py-5 md:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg italic"
        >
          Sombo Kipsang
        </Link>
        <nav className="hidden gap-8 font-mono text-[11px] uppercase tracking-wider text-[#948C7C] md:flex">
          <Link href="/work" className="text-[#F3EFE6]">
            Work
          </Link>
          <Link href="/about" className="hover:text-[#F3EFE6]">
            About
          </Link>
          <Link href="/services" className="hover:text-[#F3EFE6]">
            Services
          </Link>
          <Link href="/contact" className="hover:text-[#F3EFE6]">
            Contact
          </Link>
        </nav>
        <Link
          href="/sign-in"
          className="font-mono text-[11px] uppercase tracking-wider text-[#948C7C] hover:text-[#F3EFE6]"
        >
          Client Login
        </Link>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 md:px-10 md:pb-24 md:pt-28">
        {/* faint aerial-grid motif behind the headline */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#F3EFE6 1px, transparent 1px), linear-gradient(90deg, #F3EFE6 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <p className="relative mb-6 font-mono text-[11px] uppercase tracking-wider text-[#948C7C]">
          Nairobi · Creative Direction &amp; Visual Storytelling
        </p>
        <h1 className="relative max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] md:text-7xl">
          Stories, shot
          <br />
          <span className="italic text-[#C4923D]">from the ground up.</span>
        </h1>
        <p className="relative mt-6 max-w-md text-sm text-[#948C7C] md:text-base">
          Editorial portraiture, product photography, aerial documentation,
          and documentary work — across East Africa&rsquo;s startup and
          creative ecosystems.
        </p>
        <a
          href="#grid"
          className="relative mt-10 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#F3EFE6]"
        >
          View the work
          <span className="translate-y-px">↓</span>
        </a>
      </section>

      {/* PORTFOLIO GRID */}
      <section id="grid" className="grid grid-cols-1 gap-px bg-[#2A2822] px-6 md:grid-cols-2 md:px-10">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </section>

      {/* CLOSING CTA */}
      <section className="border-t border-[#2A2822] px-6 py-24 text-center md:px-10">
        <h2 className="font-[family-name:var(--font-display)] text-3xl italic md:text-5xl">
          Have a project in mind?
        </h2>
        <Link
          href="/contact"
          className="mt-8 inline-block border border-[#C4923D] px-8 py-3 font-mono text-[11px] uppercase tracking-wider text-[#C4923D] transition-colors hover:bg-[#C4923D] hover:text-[#0B0B0A]"
        >
          Start a conversation
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-col gap-4 border-t border-[#2A2822] px-6 py-10 font-mono text-[11px] uppercase tracking-wider text-[#948C7C] md:flex-row md:items-center md:justify-between md:px-10">
        <span>© {new Date().getFullYear()} Sombo Kipsang — Nairobi, Kenya</span>
        <div className="flex gap-6">
          <Link href="/work" className="hover:text-[#F3EFE6]">
            Work
          </Link>
          <Link href="/about" className="hover:text-[#F3EFE6]">
            About
          </Link>
          <Link href="/contact" className="hover:text-[#F3EFE6]">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
