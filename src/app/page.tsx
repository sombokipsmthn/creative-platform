import { Outfit, JetBrains_Mono } from "next/font/google";
import Link from "next/link";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
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
  date: string;
  imageUrl?: string; // swap in real Drive-sourced thumbnails
};

const projects: Project[] = [
  {
    title: "Adunni",
    category: "Editorial Portraits",
    coords: "01°17′S 36°49′E",
    date: "Mar 2025",
  },
  {
    title: "Kicks Kenya",
    category: "Product Photography",
    coords: "01°17′S 36°49′E",
    date: "Jan 2025",
  },
  {
    title: "Tatu Boys Secondary",
    category: "Aerial / Drone",
    coords: "01°22′S 36°55′E",
    date: "Nov 2024",
  },
  {
    title: "Community & Environment",
    category: "Documentary",
    coords: "01°17′S 36°49′E",
    date: "Aug 2024",
  },
];

// Uniform card, equal size across the grid
function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href="#" className="group block">
      <div className="relative aspect-[4/5] overflow-hidden border border-[#E5E2DA] bg-[#F0EDE4]">
        {/* Placeholder surface — replace with real gallery cover images */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#EFEDE6] to-[#E2DED2] transition-transform duration-700 ease-out group-hover:scale-105" />
        <div className="absolute bottom-0 left-0 h-px w-0 bg-[#A9752C] transition-all duration-500 group-hover:w-full" />
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#A9752C]">
            {project.category}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-medium text-[#141311]">
            {project.title}
          </h3>
        </div>
        <div className="shrink-0 text-right font-mono text-[11px] uppercase tracking-wider text-[#8a8676]">
          <p>{project.date}</p>
          <p className="mt-1">{project.coords}</p>
        </div>
      </div>
    </Link>
  );
}

export default function WorkPage() {
  return (
    <div
      className={`${outfit.variable} ${mono.variable} min-h-screen bg-[#FAFAF8] font-[family-name:var(--font-display)] text-[#141311]`}
    >
      {/* NAV */}
      <header className="flex items-center justify-between border-b border-[#E5E2DA] px-6 py-5 md:px-10">
        <Link href="/" className="text-lg font-semibold">
          KIPSMTHN
        </Link>
        <nav className="hidden gap-8 font-mono text-[11px] uppercase tracking-wider text-[#8a8676] md:flex">
          <Link href="/work" className="text-[#141311]">
            Work
          </Link>
          <Link href="/about" className="hover:text-[#141311]">
            About
          </Link>
          <Link href="/services" className="hover:text-[#141311]">
            Services
          </Link>
          <Link href="/contact" className="hover:text-[#141311]">
            Contact
          </Link>
        </nav>
        <Link
          href="/sign-in"
          className="font-mono text-[11px] uppercase tracking-wider text-[#8a8676] hover:text-[#141311]"
        >
          Client Login
        </Link>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-20 pt-24 md:px-10 md:pb-28 md:pt-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#141311 1px, transparent 1px), linear-gradient(90deg, #141311 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <p className="relative mb-6 font-mono text-[11px] uppercase tracking-wider text-[#8a8676]">
          Nairobi · Creative Direction &amp; Visual Storytelling
        </p>
        <h1 className="relative max-w-4xl text-6xl font-medium leading-[1.05] md:text-8xl">
          Stories, shot
          <br />
          <span className="font-normal text-[#A9752C]">from the ground up.</span>
        </h1>
        <a
          href="#portfolio"
          className="relative mt-10 inline-flex items-center gap-2 border border-[#141311] px-8 py-3 font-mono text-[11px] uppercase tracking-wider text-[#141311] transition-colors hover:border-[#A9752C] hover:text-[#A9752C]"
        >
          Our work
        </a>
      </section>

      {/* PORTFOLIO GRID */}
      <section
        id="portfolio"
        className="grid grid-cols-1 gap-x-8 gap-y-14 px-6 pb-24 sm:grid-cols-2 md:px-10 lg:grid-cols-3"
      >
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </section>

      {/* CLOSING CTA */}
      <section className="border-t border-[#E5E2DA] px-6 py-24 text-center md:px-10">
        <p className="mx-auto max-w-xl text-sm text-[#8a8676] md:text-base">
          Looking to bring a project to life? Let&rsquo;s talk through what
          you need and how it comes together.
        </p>
        <h2 className="mt-4 text-3xl font-medium md:text-5xl">
          Ready when you are.
        </h2>
        <Link
          href="/contact"
          className="mt-8 inline-block border border-[#A9752C] px-8 py-3 font-mono text-[11px] uppercase tracking-wider text-[#A9752C] transition-colors hover:bg-[#A9752C] hover:text-[#FAFAF8]"
        >
          Contact us
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E5E2DA] px-6 py-16 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <p className="text-xl font-semibold">KIPSMTHN</p>
            <p className="mt-4 text-sm text-[#8a8676]">
              Subscribe for new work and availability.
            </p>
            <form className="mt-4 flex border-b border-[#E5E2DA] pb-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-transparent text-sm text-[#141311] placeholder:text-[#b3ae9e] focus:outline-none"
              />
              <button
                type="submit"
                className="font-mono text-[11px] uppercase tracking-wider text-[#A9752C]"
              >
                Send
              </button>
            </form>
          </div>

          <div className="font-mono text-[11px] uppercase tracking-wider text-[#8a8676]">
            <p className="mb-4 text-[#141311]">Menu</p>
            <div className="flex flex-col gap-2">
              <Link href="/work" className="hover:text-[#141311]">Work</Link>
              <Link href="/about" className="hover:text-[#141311]">About</Link>
              <Link href="/services" className="hover:text-[#141311]">Services</Link>
              <Link href="/contact" className="hover:text-[#141311]">Contact</Link>
            </div>
          </div>

          <div className="font-mono text-[11px] uppercase tracking-wider text-[#8a8676]">
            <p className="mb-4 text-[#141311]">Legal</p>
            <div className="flex flex-col gap-2">
              <a href="#" className="hover:text-[#141311]">Privacy Policy</a>
              <a href="#" className="hover:text-[#141311]">Terms</a>
            </div>
          </div>

          <div className="font-mono text-[11px] uppercase tracking-wider text-[#8a8676]">
            <p className="mb-4 text-[#141311]">Nairobi, Kenya</p>
            <p>Available for commissions</p>
            <p className="mt-1">and freelance work</p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-[#E5E2DA] pt-8 font-mono text-[11px] uppercase tracking-wider text-[#b3ae9e] md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} KIPSMTHN. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
