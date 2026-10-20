import { WalletCards } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-24 text-center">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <WalletCards className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-2xl font-semibold">Payments</h1>
        <p className="text-sm text-muted-foreground max-w-lg text-sm">
          Payment tracking will be available here once a payment provider is
          connected. Invoices remain available while this section is being
          prepared.
        </p>
      </div>
    </div>
  );
}