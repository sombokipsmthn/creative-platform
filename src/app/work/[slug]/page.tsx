import { notFound } from "next/navigation";
import { Metadata } from "next";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import ProjectDetailClient from "./ProjectDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

interface Project {
  id: string;
  name: string;
  short_description: string | null;
  description: string | null;
  slug: string | null;
  category: string | null;
  year: string | null;
  location: string | null;
  services: string[] | null;
  disciplines: string[] | null;
  collaborators: string[] | null;
  role: string | null;
  scope_of_work: string | null;
  deliverables: string | null;
  total_amount: number | null;
  currency: string | null;
  payment_terms: string | null;
  revisions_policy: string | null;
  licensing_terms: string | null;
  notice_period: string | null;
  story_overview: string | null;
  story_challenge: string | null;
  story_approach: string | null;
  story_outcome: string | null;
  story_credits: string | null;
  status: string;
  visibility: string | null;
  featured: boolean;
  published_at: string | null;
  cover_media_id: string | null;
  created_at: string;
  updated_at: string;
  client_name: string | null;
  client_company: string | null;
  client_email: string | null;
  client_location: string | null;
  client_website: string | null;
  media: Array<{
    id: string;
    filename: string;
    original_url: string;
    display_url: string;
    thumbnail_url: string;
    mime_type: string | null;
    file_size: number | null;
    width: number | null;
    height: number | null;
    alt_text: string | null;
    caption: string | null;
    sort_order: number;
    is_hidden: boolean;
    is_cover: boolean;
    created_at: string;
    updated_at: string;
  }>;
}

async function getProject(slug: string): Promise<Project | null> {
  try {
    const projectResult = await db.execute(sql`
      SELECT
        p.*,
        c.name AS client_name,
        c.company AS client_company,
        c.email AS client_email,
        c.location AS client_location,
        c.website AS client_website
      FROM projects p
      LEFT JOIN clients c ON c.id = p.client_id
      WHERE p.slug = ${slug}
        AND p.visibility = 'public'
        AND p.published_at IS NOT NULL
      LIMIT 1
    `);

    const project = projectResult.rows[0];

    if (!project) return null;

    const mediaResult = await db.execute(sql`
      SELECT
        id,
        filename,
        original_url,
        display_url,
        thumbnail_url,
        mime_type,
        file_size,
        width,
        height,
        alt_text,
        caption,
        sort_order,
        is_hidden,
        is_cover,
        created_at,
        updated_at
      FROM project_media
      WHERE project_id = ${project.id}
        AND is_hidden = false
      ORDER BY sort_order ASC, created_at ASC
    `);

    return {
      ...project,
      media: mediaResult.rows,
    } as Project;
  } catch (error) {
    console.error("GET /work/[slug] error:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProject(slug);

  if (!data) {
    return {
      title: "Project Not Found | KIPSMTHN",
      description: "The requested project could not be found.",
    };
  }

  const project = data;
  const title = `${project.name} | KIPSMTHN`;
  const description =
    (project.short_description as string) ||
    (project.description as string) ||
    "A KIPSMTHN creative project case study.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: (project.published_at as string) || undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProject(slug);

  if (!data) {
    notFound();
  }

  return <ProjectDetailClient project={data} slug={slug} />;
}