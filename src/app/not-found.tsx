import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404: Page Not Found – KIPSMTHN',
  description: 'The page you are looking for could not be found. Return to the homepage or contact us for assistance.',
  // Optional: open graph image, etc.
};

export default function NotFound() {
  return (
    <main className="">
      <div className="">
        <h1 className="">404</h1>
        <p className="">
          Page not found
        </p>
        <p className="">
          We couldn&apos;t find the page you are looking for. It may have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="">
          <Button asChild>
            <Link href="/" className="Button--primary">
              Return to homepage
            </Link>
          </Button>
          <Button asChild>
            <Link href="/contact" className="Button--secondary">
              Contact us
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
