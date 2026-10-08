import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404: Page Not Found – KIPSMTHN',
  description: 'The page you are looking for could not be found. Return to the homepage or contact us for assistance.',
  // Optional: open graph image, etc.
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-slate-900 dark:text-zinc-100">404</h1>
        <p className="mt-4 text-xl text-slate-700 dark:text-zinc-300">
          Page not found
        </p>
        <p className="mt-2 text-slate-500 dark:text-zinc-400 max-w-xl">
          We couldn&apos;t find the page you are looking for. It may have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Button asChild>
            <Link href="/" className="Button--primary">
              Return to homepage
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