import { Inter } from 'next/font/google';
import Head from 'next/head';

const outfit = Inter({ subsets: ['latin'] });

export interface PortfolioMetadataProps {
  handle: string;
  user: typeof import('@/db/schema').users.$inferSelect;
  profile: typeof import('@/db/schema').creatorProfiles.$inferSelect;
  portfolio: typeof import('@/db/schema').creatorPortfolios.$inferSelect;
  projects: Array<{
    id: string;
    name: string;
    slug: string | null;
    category: string | null;
    year: string | null;
    coverDisplayUrl: string | null;
    coverThumbnailUrl: string | null;
    coverAltText: string | null;
    coverCaption: string | null;
  }>;
}

export function PortfolioMetadata({
  handle,
  user,
  profile,
  portfolio,
  projects,
}: PortfolioMetadataProps) {
  // Determine display name from profile or user
  const displayName = profile?.bio?.split('\n')[0] || user.name || 'Kipsmthn';

  // Determine headline
  const headline = portfolio?.headline || `Portfolio of ${displayName}`;

  // Get first project's cover image for og:image
  const firstProjectCover = projects[0];
  const ogImage = firstProjectCover?.coverDisplayUrl
    ? firstProjectCover.coverDisplayUrl
    : '/og-image.svg';

  return (
    <>
      <Head>
        <title>{headline} | {displayName}</title>
        <meta
          name="description"
          content={portfolio?.headline || profile?.bio || `View the public portfolio of ${displayName}. Photography, video, and creative projects.`}
        />
        <link
          rel="canonical"
          href={`/portfolio/${handle}`}
        />
        <meta
          property="og:title"
          content={`${headline} | ${displayName}`}
        />
        <meta
          property="og:description"
          content={portfolio?.headline || profile?.bio || `View the public portfolio of ${displayName}. Photography, video, and creative projects.`}
        />
        <meta
          property="og:type"
          content="website"
        />
        <meta
          property="og:image"
          content={ogImage}
        />
        <meta
          property="og:image:width"
          content="1200"
        />
        <meta
          property="og:image:height"
          content="630"
        />
        <meta
          property="twitter:card"
          content="summary_large_image"
        />
        <meta
          property="twitter:title"
          content={`${headline} | ${displayName}`}
        />
        <meta
          property="twitter:description"
          content={portfolio?.headline || profile?.bio || `View the public portfolio of ${displayName}. Photography, video, and creative projects.`}
        />
        <meta
          property="twitter:image"
          content={ogImage}
        />
      </Head>

      {/* Fallback for when JS is disabled or SSR doesn't run */}
      <noscript>
        <meta
          name="description"
          content={portfolio?.headline || profile?.bio || `View the public portfolio of ${displayName}. Photography, video, and creative projects.`}
        />
        <link rel="canonical" href={`/portfolio/${handle}`} />
      </noscript>
    </>
  );
}