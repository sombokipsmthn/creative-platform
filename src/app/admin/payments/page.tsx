import { WalletCards } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="">
      <div className="">
        <div className="ui-card">
          <WalletCards className="" />
        </div>
        <h1 className="ui-page-title">Payments</h1>
        <p className="ui-body">
          Payment tracking will be available here once a payment provider is
          connected. Invoices remain available while this section is being
          prepared.
        </p>
      </div>
    </div>
  );
}
