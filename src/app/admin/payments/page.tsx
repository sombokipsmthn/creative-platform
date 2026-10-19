import { WalletCards } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';

export default function PaymentsPage() {
  return <div className="ui-page ui-page-padded"><div className="ui-shell">
    <AdminPageHeader title="Payments" description="Track payment activity as your connected provider becomes available." breadcrumb={{ label: 'Dashboard', href: '/admin' }} />
    <section className="ui-card admin-empty-state" aria-labelledby="payments-title">
      <div className="admin-empty-state__icon"><WalletCards aria-hidden="true" /></div>
      <h2 id="payments-title">Payment tracking is not connected</h2>
      <p>Invoices remain available while a payment provider is being configured.</p>
    </section>
  </div></div>;
}
