import type { creatorPortfolios, creatorProfiles, projectMedia, projects, users } from "@/db/schema";

export type PortfolioData = {
  user: typeof users.$inferSelect;
  profile: typeof creatorProfiles.$inferSelect | null;
  portfolio: typeof creatorPortfolios.$inferSelect;
  projects: Array<typeof projects.$inferSelect & { media: Array<typeof projectMedia.$inferSelect> }>;
};

function MediaItem({
  item,
  projectName,
  index,
}: {
  item: PortfolioData["projects"][number]["media"][number];
  projectName: string;
  index: number;
}) {
  const src = item.displayUrl || item.thumbnailUrl || item.originalUrl;
  const alt = item.altText || item.caption || `${projectName} — image ${index + 1}`;
  const isVideo = item.mimeType?.startsWith("video/");

  return (
    <figure className="group relative m-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
      {isVideo ? (
        <video
          src={src}
          poster={item.thumbnailUrl || undefined}
          controls
          preload="metadata"
          playsInline
          className="block h-auto max-h-[720px] w-full object-contain"
          aria-label={alt}
        />
      ) : (
        // Gallery media can be served through the platform's protected media proxy,
        // so use a regular img rather than requiring a remote next/image host entry.
        <img
          src={src}
          alt={alt}
          loading={index < 2 ? "eager" : "lazy"}
          className="block h-auto max-h-[780px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
        />
      )}
      {item.caption && (
        <figcaption className="border-t border-black/5 px-3 py-2 text-xs text-neutral-600 dark:border-white/10 dark:text-neutral-300">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function PortfolioRenderer({
  data,
  preview = false,
}: {
  data: PortfolioData;
  preview?: boolean;
}) {
  const { user, profile, portfolio, projects: work } = data;
  const contactEmail = portfolio.contactEmail || user.email;
  const isGrid = portfolio.layout === "grid";

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#191919] dark:bg-[#111110] dark:text-[#f4f1eb]">
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
        <a href={preview ? undefined : `/p/${user.handle}`} className="min-w-0 truncate text-sm font-semibold tracking-[0.12em] uppercase">
          {user.name}
        </a>
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          {preview && (
            <span className="rounded-full border border-neutral-300 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase dark:border-neutral-700">
              Preview
            </span>
          )}
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-2 border-b border-current pb-1 text-xs font-medium tracking-wide transition-opacity hover:opacity-60 sm:text-sm"
          >
            Contact <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1440px] px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-20 lg:px-12 lg:pb-24 lg:pt-28">
        <div className="max-w-5xl">
          <p className="mb-5 text-[10px] font-semibold tracking-[0.24em] text-neutral-500 uppercase dark:text-neutral-400 sm:text-xs">
            {profile?.location || "Independent creative"}{profile?.location && profile?.website ? " · " : ""}
            {profile?.website ? "Selected work & collaborations" : "Selected work"}
          </p>
          <h1 className="max-w-5xl text-4xl font-medium leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl xl:text-[88px]">
            {portfolio.headline || profile?.bio || `Selected work by ${user.name}`}
          </h1>
          {profile?.bio && portfolio.headline && (
            <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300 sm:text-lg sm:leading-8">
              {profile.bio}
            </p>
          )}
          {profile?.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-60"
            >
              Visit website <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </section>

      <section
        aria-label="Selected portfolio projects"
        className={`mx-auto w-full max-w-[1440px] px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12 lg:pb-36 ${isGrid ? "grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-16" : "space-y-20 sm:space-y-28 lg:space-y-36"}`}
      >
        {work.map((project, index) => {
          const media = project.media.filter((item) => !item.isHidden);
          const cover = media.find((item) => item.isCover) || media[0];

          return (
            <article key={project.id} className={isGrid ? "min-w-0" : "grid min-w-0 gap-6 lg:grid-cols-[minmax(220px,0.32fr)_minmax(0,1fr)] lg:gap-12"}>
              <div className={isGrid ? "mb-4" : "lg:sticky lg:top-10 lg:self-start"}>
                <div className="mb-4 flex items-center gap-3 text-[10px] font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span className="h-px w-8 bg-neutral-300 dark:bg-neutral-700" />
                  <span>{project.year || project.category || "Selected project"}</span>
                </div>
                <h2 className="text-2xl font-medium leading-tight tracking-[-0.035em] sm:text-3xl">{project.name}</h2>
                {(project.shortDescription || project.description) && (
                  <p className="mt-3 max-w-xl whitespace-pre-line text-sm leading-6 text-neutral-600 dark:text-neutral-300 sm:text-base sm:leading-7">
                    {project.shortDescription || project.description}
                  </p>
                )}
                {project.location && (
                  <p className="mt-3 text-xs tracking-wide text-neutral-500 dark:text-neutral-400">{project.location}</p>
                )}
                {project.storyOverview && !project.shortDescription && !project.description && (
                  <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{project.storyOverview}</p>
                )}
              </div>

              <div className={isGrid ? "space-y-3" : "min-w-0 space-y-3 sm:space-y-4"}>
                {cover && (
                  <MediaItem item={cover} projectName={project.name} index={0} />
                )}
                {media.length > 1 && (
                  <div className={isGrid ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 gap-3 sm:gap-4"}>
                    {media.slice(1, isGrid ? 5 : 7).map((item, mediaIndex) => (
                      <MediaItem key={item.id} item={item} projectName={project.name} index={mediaIndex + 1} />
                    ))}
                  </div>
                )}
                {!media.length && preview && (
                  <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-neutral-300 px-5 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                    Selected project media will appear here.
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-5 py-8 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span>{user.name}{profile?.location ? ` · ${profile.location}` : ""}</span>
          <a href={`mailto:${contactEmail}`} className="font-medium text-[#191919] underline underline-offset-4 dark:text-[#f4f1eb]">
            Start a conversation
          </a>
        </div>
      </footer>
    </main>
  );
}
