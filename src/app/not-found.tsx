export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold">404</h1>
        <p className="mt-4 text-lg">We couldn't find that page.</p>
        <p className="mt-2 text-sm text-gray-500">Try the homepage or contact us if you think this is an error.</p>
        <div className="mt-6 flex justify-center gap-3">
          <a href="/" className="rounded-full bg-purple-600 px-4 py-2 text-white">Return home</a>
          <a href="/contact" className="rounded-full border px-4 py-2">Contact us</a>
        </div>
      </div>
    </main>
  );
}
