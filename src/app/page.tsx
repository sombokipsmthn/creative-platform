import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, ArrowRight, Menu, Plus } from "lucide-react";

const projects = [
  {
    title: "House of Light",
    type: "Residential · Karen",
    year: "2024",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Kijani Courtyard",
    type: "Hospitality · Naivasha",
    year: "2023",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Atelier No. 09",
    type: "Workplace · Nairobi",
    year: "2022",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
  },
];

const principles = [
  ["01", "Context", "We begin with what is already there: the climate, the light, the landscape, and the people who will inhabit it."],
  ["02", "Material", "Honest materials, carefully detailed. Every surface is chosen to age with grace and tell a story over time."],
  ["03", "Meaning", "The best spaces do more than perform. They create a sense of belonging that lasts long after the first impression."],
];

export const metadata = {
  title: "Hously — Modern Architecture Studio",
  description: "Hously is an architecture and interiors studio creating enduring spaces across East Africa.",
};

export default function HomePage() {
  return (
    <div className="hously-page min-h-screen overflow-hidden">
      <header className="hously-nav">
        <Link href="/" className="hously-brand" aria-label="Hously home">HOUSLY<span>®</span></Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <Link href="#studio">Studio</Link>
          <Link href="#work">Selected work</Link>
          <Link href="#approach">Approach</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link className="hidden text-[11px] font-medium uppercase tracking-[0.18em] md:block" href="/contact">Start a conversation <ArrowRight className="ml-1 inline size-3" /></Link>
          <button className="hously-menu-button md:hidden" aria-label="Open menu"><Menu className="size-4" /></button>
        </div>
      </header>

      <main>
        <section className="hously-hero">
          <div className="hously-hero-copy">
            <p className="hously-kicker">Architecture / Interiors / Landscape</p>
            <h1>Spaces with<br /><em>quiet presence.</em></h1>
            <p className="hously-hero-intro">Hously is a Nairobi-based architecture studio shaping thoughtful places for living, gathering, and working.</p>
            <Link href="#work" className="hously-circle-link" aria-label="Explore selected work"><ArrowDownRight className="size-5" /></Link>
          </div>
          <div className="hously-hero-image">
            <Image src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=90" alt="Warm modern living room with sculptural furniture" fill priority sizes="(max-width: 768px) 100vw, 58vw" className="object-cover" />
            <div className="hously-image-note"><span>01</span><span>House of Light<br />Karen, Kenya</span></div>
          </div>
        </section>

        <section id="studio" className="hously-statement">
          <p className="hously-kicker">The studio</p>
          <div>
            <h2>We design for the way <em>life unfolds.</em></h2>
            <p>Our work is rooted in a belief that architecture should feel inevitable — grounded in its place, generous in its details, and quietly expressive. From a first sketch to the final joinery, we make spaces that invite you to stay a little longer.</p>
            <Link href="/about" className="hously-text-link">Discover Hously <ArrowRight className="size-4" /></Link>
          </div>
        </section>

        <section id="work" className="hously-work">
          <div className="flex items-end justify-between gap-4">
            <div><p className="hously-kicker">Selected work</p><h2>Recent <em>projects.</em></h2></div>
            <Link href="/work" className="hously-text-link hidden sm:flex">View all work <ArrowRight className="size-4" /></Link>
          </div>
          <div className="hously-project-grid">
            {projects.map((project, index) => (
              <Link href="/work" key={project.title} className={`hously-project ${index === 0 ? "hously-project-featured" : ""}`}>
                <div className="relative aspect-[4/5] overflow-hidden"><Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 hover:scale-105" /></div>
                <div className="mt-4 flex items-start justify-between gap-4"><div><h3>{project.title}</h3><p>{project.type}</p></div><span>{project.year}</span></div>
              </Link>
            ))}
          </div>
        </section>

        <section id="approach" className="hously-approach">
          <div><p className="hously-kicker">Our approach</p><h2>Less noise.<br /><em>More feeling.</em></h2></div>
          <div className="hously-principles">{principles.map(([number, title, description]) => <div className="hously-principle" key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><Plus className="size-4" /></div>)}</div>
        </section>

        <section className="hously-cta"><p className="hously-kicker">Have a project in mind?</p><h2>Let&apos;s make<br /><em>room for it.</em></h2><Link href="/contact" className="hously-cta-link">Begin a conversation <ArrowRight className="size-4" /></Link></section>
      </main>

      <footer className="hously-footer"><span>HOUSLY®</span><span>Architecture for considered living</span><span>Nairobi · Kenya</span></footer>
    </div>
  );
}
