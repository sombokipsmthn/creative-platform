import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const metadata = {
  title: 'Thank you — KIPSMTHN',
  description: 'Thanks for your inquiry. We will get back to you shortly.',
};

export default function ThanksPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">
      <div className="p-8 text-center">
        <h1 className="text-3xl font-semibold">Thanks — we got your inquiry</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400">
          We will respond within 24 hours. Check your inbox for a confirmation.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/" className="Button--primary">
              Return to homepage
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
