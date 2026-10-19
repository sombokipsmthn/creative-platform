import { AdminPageHeader } from '@/components/ui/AdminPageHeader';

export default function NewInvoicePage() {
  return <div className="ui-page ui-page-padded"><div className="ui-shell"><AdminPageHeader title="Create invoice" description="Prepare a bill for a client and project." breadcrumb={{ label: 'Invoices', href: '/admin/invoices' }} /><section className="ui-card admin-empty-state"><h2>Invoice creation flow coming soon</h2><p>Invoices can still be reviewed and managed from the invoice collection.</p></section></div></div>;
}
