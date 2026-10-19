import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const metadata = {
  title: 'Thank you — KIPSMTHN',
  description: 'Thanks for your inquiry. We will get back to you shortly.',
};

export default function ThanksPage() {
  return (
    <main className="">
      <div className="">
        <h1 className="">Thanks — we got your inquiry</h1>
        <p className="">
          We will respond within 24 hours. Check your inbox for a confirmation.
        </p>
        <div className="">
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
