ALTER TABLE "payments" ALTER COLUMN "invoice_id" DROP NOT NULL;
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_invoice_id_invoices_id_fk";
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL;
