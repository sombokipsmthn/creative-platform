import type { Metadata } from "next";
import WorkIndexPage from "./page-client";

export const metadata: Metadata = {
  title: 'Work | KIPSMTHN',
  description: 'Selected works across photography, videography, branding, and UI/UX. Portfolio archive of commercial production, brand films, and creative systems.',
  alternates: { canonical: "/work" },
  openGraph: {
    title: 'Work | KIPSMTHN',
    description: 'Selected works across photography, videography, branding, and UI/UX. Portfolio archive of commercial production, brand films, and creative systems.',
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
  },
};

export default function WorkPage() {
  return <WorkIndexPage />;
}
