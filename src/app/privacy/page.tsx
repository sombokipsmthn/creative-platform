import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy policy — KIPSMTHN',
  description: 'Our privacy practices and how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">Privacy policy</h1>
        <p className="mt-4 text-sm text-slate-600 dark:text-zinc-400">
          This page explains how we collect, use and store personal data. Replace this text with the full privacy policy content required for your jurisdiction.
        </p>
      </div>
    </main>
  );
}
