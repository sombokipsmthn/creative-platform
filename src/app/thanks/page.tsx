export const metadata = {
  title: 'Thank you — KIPSMTHN',
  description: 'Thanks for your inquiry. We will get back to you shortly.',
};

export default function ThanksPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-8 text-center">
        <h1 className="text-3xl font-semibold">Thanks — we got your inquiry</h1>
        <p className="mt-3 text-sm text-gray-600">We will respond within 24 hours. Check your inbox for a confirmation.</p>
        <div className="mt-6">
          <a href="/" className="rounded-full bg-purple-600 px-4 py-2 text-white">Return to homepage</a>
        </div>
      </div>
    </main>
  );
}
