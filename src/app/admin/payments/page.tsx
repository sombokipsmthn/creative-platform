import { WalletCards } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-24 text-center">
        <div className="ui-card p-6">
          <WalletCards className="h-8 w-8" />
        </div>
        <h1 className="ui-page-title text-2xl font-semibold">Payments</h1>
        <p className="ui-body max-w-lg text-sm">
          Payment tracking will be available here once a payment provider is
          connected. Invoices remain available while this section is being
          prepared.
        </p>
      </div>
    </div>
  );
}