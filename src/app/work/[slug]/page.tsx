import { notFound } from "next/navigation";
import { Metadata } from "next";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { ProjectDetailClient } from "./ProjectDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getProject(slug: string) {
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
      project: {
        ...project,
        media: mediaResult.rows,
      },
    };
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

  const project = data.project;
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

  return <ProjectDetailClient project={data.project} slug={slug} />;
}