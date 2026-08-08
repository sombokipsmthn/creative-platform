'use client';
import { motion } from "framer-motion";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

// Bulletproof Icon SVGs
const ArrowUpRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
);

export default function Home() {
  const projects = [
    { id: 1, title: "Nordic Interior", cat: "Architecture", img: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=2070" },
    { id: 2, title: "Modernist Movement", cat: "Editorial", img: "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?q=80&w=2070" },
    { id: 3, title: "Abstract Forms", cat: "Motion", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964" },
    { id: 4, title: "The Silent Studio", cat: "Photography", img: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067" },
  ];

  return (
    <div className="bg-white text-black selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-8 bg-white/80 backdrop-blur-md">
        <div className="text-xl font-bold tracking-tighter uppercase">Ashley.</div>
        <div className="flex items-center space-x-8 text-[10px] uppercase tracking-[0.3em]">
          <Link href="#work" className="hover:line-through transition">Portfolio</Link>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="border-b border-black pb-1">Portal</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link href="/client" className="font-bold">Dashboard</Link>
            <UserButton />
          </Show>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-[0.5em] text-gray-400 mb-8">Digital Creative Studio</p>
          <h1 className="text-[14vw] md:text-[10vw] leading-[0.8] font-serif tracking-tighter mb-12">
            Visual <br /> <span className="italic ml-[10vw]">Story.</span>
          </h1>
          <div className="flex items-center space-x-6 max-w-md">
            <div className="h-px w-12 bg-black"></div>
            <p className="text-sm uppercase tracking-widest leading-relaxed text-gray-500">
              High-end creative delivery for photography, film, and brand identity.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Staggered Portfolio Grid */}
      <section id="work" className="px-6 md:px-12 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 staggered-grid">
          {projects.map((p) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="aspect-3/4 overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={p.img} 
                  alt={p.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="mt-8 flex justify-between items-end">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400">{p.cat}</span>
                  <h3 className="text-3xl font-serif mt-2">{p.title}</h3>
                </div>
                <div className="mb-1"><ArrowUpRight /></div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-white px-6 md:px-12 py-24">
        <h2 className="text-[8vw] font-serif italic leading-none mb-20">Start a project.</h2>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-10 border-t border-white/10 gap-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">© 2026 Ashley Studio</p>
          <div className="flex space-x-8 text-[10px] uppercase tracking-[0.3em]">
            <a href="#" className="hover:text-gray-400">Instagram</a>
            <a href="#" className="hover:text-gray-400">Twitter</a>
            <a href="#" className="hover:text-gray-400">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}