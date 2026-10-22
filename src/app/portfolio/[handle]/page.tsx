import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicCreatorByHandle, getPublicProjects } from '@/lib/portfolio/public-content';
import { PortfolioContent } from './PortfolioContent';

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const creator = await getPublicCreatorByHandle(handle);

  if (!creator) {
    return {
      title: 'Portfolio Not Found',
      description: 'The requested portfolio could not be found.',
    };
  }

  const projects = await getPublicProjects(creator.id);
  const firstProjectCover = projects[0]?.cover?.displayUrl;

  return {
    title: `${creator.headline || `Portfolio of ${creator.name}`} | ${creator.name}`,
    description:
      creator.headline ||
      creator.bio ||
      `View the public portfolio of ${creator.name}. Photography, video, and creative projects.`,
    openGraph: {
      title: `${creator.headline || `Portfolio of ${creator.name}`} | ${creator.name}`,
      description:
        creator.headline ||
        creator.bio ||
        `View the public portfolio of ${creator.name}. Photography, video, and creative projects.`,
      type: 'website',
      images:
        firstProjectCover
          ? [{ url: firstProjectCover, width: 1200, height: 630, alt: `${creator.name} Portfolio` }]
          : [{ url: '/og-image.svg', width: 1200, height: 630, alt: `${creator.name} Portfolio` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${creator.headline || `Portfolio of ${creator.name}`} | ${creator.name}`,
      description:
        creator.headline ||
        creator.bio ||
        `View the public portfolio of ${creator.name}. Photography, video, and creative projects.`,
      images: firstProjectCover ? [firstProjectCover] : ['/og-image.svg'],
    },
    alternates: {
      canonical: `/portfolio/${handle}`,
    },
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  const { handle } = await params;
  const creator = await getPublicCreatorByHandle(handle);

  if (!creator) {
    notFound();
  }

  const projects = await getPublicProjects(creator.id);

  return (
    <PortfolioContent
      user={creator}
      profile={creator}
      portfolio={creator}
      projects={projects}
    />
  );
}