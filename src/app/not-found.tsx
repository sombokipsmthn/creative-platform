import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold">404</h1>
        <p className="mt-4 text-lg text-slate-700 dark:text-zinc-300">We couldn't find that page.</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Try the homepage or contact us if you think this is an error.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/" className="Button--primary">
              Return home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/contact" className="Button--secondary">
              Contact us
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
