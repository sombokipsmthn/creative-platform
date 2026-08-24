"use client";

import {
  useEffect,
  useState,
} from "react";
import Image from "next/image";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Lock,
  X,
} from "lucide-react";

type Photo = {
  original_url: string | undefined;
  id: string;
  filename: string;
  display_url: string;
  thumbnail_url: string;
  is_hidden: boolean;
  is_favorite: boolean;
  is_selected: boolean;
  sort_order: number;
  collection_id?: string | null;
};

type Collection = {
  id: string;
  title: string;
  sort_order: number;
};

type Gallery = {
  id: string;
  title: string;
  slug: string;
  status: string;
  access_pin?: string | null;
  cover_photo_id?: string | null;
  allow_downloads: boolean;
  allow_favorites: boolean;
  allow_selections: boolean;
};

export default function ClientGalleryPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const [slug, setSlug] =
    useState<string | null>(null);

  const [gallery, setGallery] =
    useState<Gallery | null>(null);

  const [collections, setCollections] =
    useState<Collection[]>([]);

  const [photos, setPhotos] =
    useState<Photo[]>([]);

  const [authenticated, setAuthenticated] =
    useState(false);

  const [pin, setPin] =
    useState("");

  const [activeCollection, setActiveCollection] =
    useState<string>("all");

  const [viewerIndex, setViewerIndex] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    params.then((value) =>
      setSlug(value.slug)
    );
  }, [params]);

  useEffect(() => {
    if (!slug) {
      return;
    }

    async function load() {
      try {
        const response =
          await fetch(
            `/api/public/galleries/${slug}`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        setGallery(data.gallery);
        setCollections(
          data.collections || []
        );
        setPhotos(
          data.photos || []
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  async function unlock() {
    if (!slug || !pin) {
      return;
    }

    const response =
      await fetch(
        `/api/public/galleries/${slug}/access`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            pin,
          }),
        }
      );

    if (response.ok) {
      setAuthenticated(true);
    }
  }

  const visiblePhotos =
    photos
      .filter(
        (photo) =>
          !photo.is_hidden
      )
      .filter(
        (photo) =>
          activeCollection ===
            "all" ||
          photo.collection_id ===
            activeCollection
      )
      .sort(
        (a, b) =>
          a.sort_order -
          b.sort_order
      );

  async function toggleFavorite(
    photo: Photo
  ) {
    if (!slug) {
      return;
    }

    const next =
      !photo.is_favorite;

    setPhotos((current) =>
      current.map((item) =>
        item.id === photo.id
          ? {
              ...item,
              is_favorite: next,
            }
          : item
      )
    );

    await fetch(
      `/api/public/galleries/${slug}/photos`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          photoId: photo.id,
          isFavorite: next,
        }),
      }
    );
  }

  async function toggleSelection(
    photo: Photo
  ) {
    if (!slug) {
      return;
    }

    const next =
      !photo.is_selected;

    setPhotos((current) =>
      current.map((item) =>
        item.id === photo.id
          ? {
              ...item,
              is_selected: next,
            }
          : item
      )
    );

    await fetch(
      `/api/public/galleries/${slug}/photos`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          photoId: photo.id,
          isSelected: next,
        }),
      }
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">
          Loading gallery
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Gallery not found.
      </div>
    );
  }

  if (
    gallery.access_pin &&
    !authenticated
  ) {
    return (
      <main className="min-h-screen bg-[#090909] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
            <Lock className="w-5 h-5 text-zinc-400" />
          </div>

          <h1 className="mt-6 text-2xl font-light">
            {gallery.title}
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Enter the gallery PIN to
            continue.
          </p>

          <input
            value={pin}
            onChange={(event) =>
              setPin(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                unlock();
              }
            }}
            type="password"
            inputMode="numeric"
            maxLength={8}
            placeholder="PIN"
            className="mt-8 w-full text-center tracking-[0.4em] px-4 py-4 rounded-xl bg-white/5 border border-white/10 outline-none"
          />

          <button
            onClick={unlock}
            className="mt-3 w-full py-3.5 rounded-xl bg-white text-black text-sm font-medium"
          >
            Enter Gallery
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-light">
                {gallery.title}
              </h1>

              <p className="text-xs text-zinc-500 mt-1">
                {visiblePhotos.length}{" "}
                photos
              </p>
            </div>

            <button className="px-4 py-2 rounded-lg border border-white/10 text-xs">
              Share
            </button>
          </div>

          {collections.length >
            0 && (
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() =>
                  setActiveCollection(
                    "all"
                  )
                }
                className={`shrink-0 px-4 py-2 rounded-full text-xs ${
                  activeCollection ===
                  "all"
                    ? "bg-white text-black"
                    : "bg-white/5 text-zinc-400"
                }`}
              >
                All Photos
              </button>

              {collections.map(
                (collection) => (
                  <button
                    key={
                      collection.id
                    }
                    onClick={() =>
                      setActiveCollection(
                        collection.id
                      )
                    }
                    className={`shrink-0 px-4 py-2 rounded-full text-xs ${
                      activeCollection ===
                      collection.id
                        ? "bg-white text-black"
                        : "bg-white/5 text-zinc-400"
                    }`}
                  >
                    {
                      collection.title
                    }
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </header>

      <section className="max-w-[1800px] mx-auto p-3 md:p-8">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-5">
          {visiblePhotos.map(
            (photo, index) => (
              <div
                key={photo.id}
                className="relative mb-3 md:mb-5 break-inside-avoid group"
              >
                <button
                  onClick={() =>
                    setViewerIndex(
                      index
                    )
                  }
                  className="block w-full text-left"
                >
                  <Image
                    src={
                      photo.display_url
                    }
                    alt={
                      photo.filename
                    }
                    width={1800}
                    height={1200}
                    className="w-full h-auto rounded-sm transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                </button>

                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {gallery.allow_favorites && (
                    <button
                      onClick={() =>
                        toggleFavorite(
                          photo
                        )
                      }
                      className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center ${
                        photo.is_favorite
                          ? "bg-white text-black"
                          : "bg-black/50 text-white"
                      }`}
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={
                          photo.is_favorite
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  )}

                  {gallery.allow_selections && (
                    <button
                      onClick={() =>
                        toggleSelection(
                          photo
                        )
                      }
                      className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center text-xs font-medium ${
                        photo.is_selected
                          ? "bg-white text-black"
                          : "bg-black/50 text-white"
                      }`}
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {viewerIndex !==
        null &&
        visiblePhotos[
          viewerIndex
        ] && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
            <button
              onClick={() =>
                setViewerIndex(
                  null
                )
              }
              className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={() =>
                setViewerIndex(
                  Math.max(
                    0,
                    viewerIndex - 1
                  )
                )
              }
              className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
            >
              <ChevronLeft />
            </button>

            <div className="relative w-[90vw] h-[90vh]">
              <Image
                src={
                  visiblePhotos[
                    viewerIndex
                  ].display_url
                }
                alt={
                  visiblePhotos[
                    viewerIndex
                  ].filename
                }
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            <button
              onClick={() =>
                setViewerIndex(
                  Math.min(
                    visiblePhotos.length -
                      1,
                    viewerIndex + 1
                  )
                )
              }
              className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
            >
              <ChevronRight />
            </button>

            {gallery.allow_downloads && (
              <a
                href={
                  visiblePhotos[
                    viewerIndex
                  ].original_url
                }
                download
                className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full bg-white text-black text-xs flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            )}
          </div>
        )}
    </main>
  );
}