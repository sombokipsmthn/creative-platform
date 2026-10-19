import Link from 'next/link';
import { ArrowRight, FilePlus2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';

export default function NewInvoicePage() {
  return (
    <div className="ui-page ui-page-padded">
      <div className="ui-shell">
        <AdminPageHeader
          title="Create invoice"
          description="Start from the invoice collection, then continue through the supported editor workflow."
          breadcrumb={{ label: 'Invoices', href: '/admin/invoices' }}
        />
        <section className="ui-card admin-empty-state" aria-labelledby="new-invoice-title">
          <div className="admin-empty-state__icon"><FilePlus2 aria-hidden="true" /></div>
          <h2 id="new-invoice-title">Invoice drafts start from the invoice list</h2>
          <p>
            The quick-create prompt on the invoice list routes to this supported editor entry point. Detailed line items, tax, currency, and totals must be persisted together.
          </p>
          <Button asChild variant="outline">
            <Link href="/admin/invoices">Back to invoices <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
