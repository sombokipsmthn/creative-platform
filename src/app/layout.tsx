import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="min-h-screen bg-neutral-950 text-white">
            <nav className="border-b border-neutral-800 px-6 py-4">
              <span className="text-sm uppercase tracking-wide text-neutral-400">
                Admin
              </span>
            </nav>
            <main className="p-6">{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
