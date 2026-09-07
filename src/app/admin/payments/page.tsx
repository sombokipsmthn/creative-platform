import { WalletCards } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-24 text-center">
        <div className="mb-5 rounded-full bg-[var(--color-accent-soft)] p-4">
          <WalletCards className="h-8 w-8 text-[var(--color-accent)]" />
        </div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Payments
        </h1>
        <p className="mt-2 max-w-lg text-sm text-[var(--color-text-muted)]">
          Payment tracking will be available here once a payment provider is
          connected. Invoices remain available while this section is being
          prepared.
        </p>
      </div>
    </div>
  );
}
