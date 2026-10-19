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
  theme?: string | null;
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
      <div className="">
        <div className="">
          Loading gallery
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="">
        Gallery not found.
      </div>
    );
  }

  if (
    gallery.access_pin &&
    !authenticated
  ) {
    return (
      <main className="">
        <div className="">
          <div className="">
            <Lock className="" />
          </div>

          <h1 className="">
            {gallery.title}
          </h1>

          <p className="">
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
            className=""
          />

          <button
            onClick={unlock}
            className=""
          >
            Enter Gallery
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="" data-gallery-theme={gallery.theme || 'reference-pending'}>
      <header className="">
        <div className="">
          <div className="">
            <div>
              <h1 className="">
                {gallery.title}
              </h1>

              <p className="">
                {visiblePhotos.length}{" "}
                photos
              </p>
            </div>

            <button className="">
              Share
            </button>
          </div>

          {collections.length >
            0 && (
            <div className="">
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

      <section className="">
        <div className="">
          {visiblePhotos.map(
            (photo, index) => (
              <div
                key={photo.id}
                className=""
              >
                <button
                  onClick={() =>
                    setViewerIndex(
                      index
                    )
                  }
                  className="block"
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
                    className=""
                  />
                </button>

                <div className="">
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
                        className=""
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
          <div className="">
            <button
              onClick={() =>
                setViewerIndex(
                  null
                )
              }
              className=""
            >
              <X className="" />
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
              className=""
            >
              <ChevronLeft />
            </button>

            <div className="">
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
                className=""
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
              className=""
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
                className=""
              >
                <Download className="" />
                Download
              </a>
            )}
          </div>
        )}
    </main>
  );
}
