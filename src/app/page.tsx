import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-8 py-20 max-w-7xl mx-auto">
      {/* Header/Nav */}
      <nav className="flex justify-between items-center mb-32">
        <div className="text-xl font-bold tracking-tighter underline decoration-2 underline-offset-8">PORTFOLIO.</div>
        <div className="flex items-center space-x-8 text-sm uppercase tracking-widest">
          <a href="#work" className="hover:opacity-50 transition">Work</a>
          
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-5 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition">
                Client Access
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <Link href="/client" className="hover:opacity-50 transition font-bold">My Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </Show>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mb-40">
        <h1 className="text-6xl md:text-9xl leading-[0.9] mb-12 max-w-4xl font-light tracking-tighter">
          Capturing <br />
          <span className="italic font-serif">the essence.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-md border-l border-gray-200 pl-6">
          Premium creative delivery for photographers and designers.
        </p>
      </section>

      {/* Portfolio Grid Placeholder */}
      <section id="work" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="aspect-square bg-gray-100"></div>
          <div className="aspect-video bg-gray-100 mt-12"></div>
      </section>
    </main>
  );
}