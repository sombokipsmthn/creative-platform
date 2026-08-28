import { del, put } from "@vercel/blob";

export type StorageBody = Buffer;

export type StorageObject = {
  path: string;
  url: string;
  size: number;
  contentType: string;
};

export type RetrievedStorageObject = {
  body: Buffer;
  contentType: string;
};

export interface GalleryStorage {
  putObject(input: {
    path: string;
    body: Buffer | Uint8Array;
    contentType: string;
  }): Promise<StorageObject>;

  deleteObject(pathOrUrl: string): Promise<void>;

  getObject(
    path: string,
  ): Promise<RetrievedStorageObject | null>;
}

function getProvider() {
  return (
    process.env.STORAGE_PROVIDER ||
    "vercel-blob"
  ).toLowerCase();
}

function getR2Config() {
  const accountId =
    process.env.R2_ACCOUNT_ID;

  const bucket =
    process.env.R2_BUCKET;

  const token =
    process.env.CLOUDFLARE_API_TOKEN;

  if (
    !accountId ||
    !bucket ||
    !token
  ) {
    throw new Error(
      "R2 storage is not configured. Set R2_ACCOUNT_ID, R2_BUCKET and CLOUDFLARE_API_TOKEN.",
    );
  }

  return {
    accountId,
    bucket,
    token,
  };
}

function r2ObjectUrl(path: string) {
  const {
    accountId,
    bucket,
  } = getR2Config();

  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function r2PublicUrl(path: string) {
  const publicBase =
    process.env.R2_PUBLIC_URL?.replace(
      /\/$/,
      "",
    );

  if (publicBase) {
    return `${publicBase}/${path}`;
  }

  return `/api/public/galleries/media?key=${encodeURIComponent(
    path,
  )}`;
}

class VercelBlobStorage
  implements GalleryStorage
{
  async putObject(input: {
    path: string;
    body: Buffer | Uint8Array;
    contentType: string;
  }): Promise<StorageObject> {
    const body =
      Buffer.isBuffer(input.body)
        ? input.body
        : Buffer.from(input.body);

    const blob = await put(
      input.path,
      body,
      {
        access: "public",
        addRandomSuffix: false,
        contentType:
          input.contentType,
        token:
          process.env
            .BLOB_READ_WRITE_TOKEN,
      },
    );

    return {
      path: blob.pathname,
      url: blob.url,
      size: body.byteLength,
      contentType:
        input.contentType,
    };
  }

  async deleteObject(
    pathOrUrl: string,
  ) {
    await del(pathOrUrl, {
      token:
        process.env
          .BLOB_READ_WRITE_TOKEN,
    });
  }

  async getObject(
    path: string,
  ) {
    const response = await fetch(
      path,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    return {
      body: Buffer.from(
        await response.arrayBuffer(),
      ),
      contentType:
        response.headers.get(
          "content-type",
        ) ||
        "application/octet-stream",
    };
  }
}

class R2Storage
  implements GalleryStorage
{
 
async putObject(input: {
  path: string;
  body: Buffer | Uint8Array;
  contentType: string;
}): Promise<StorageObject> {
  const { token } =
    getR2Config();

  const body =
    Buffer.isBuffer(input.body)
      ? input.body
      : Buffer.from(input.body);

  const response =
    await fetch(
      r2ObjectUrl(input.path),
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":
            input.contentType,
        },
        body:
          body as unknown as BodyInit,
      },
    );

  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      `R2 upload failed (${response.status}): ${message}`,
    );
  }

  return {
    path: input.path,
    url: r2PublicUrl(
      input.path,
    ),
    size: body.byteLength,
    contentType:
      input.contentType,
  };
}
  async deleteObject(
    pathOrUrl: string,
  ) {
    let path = pathOrUrl;

    if (
      pathOrUrl.startsWith(
        "http",
      )
    ) {
      const parsed =
        new URL(pathOrUrl);

      const marker =
        "/objects/";

      const index =
        parsed.pathname.indexOf(
          marker,
        );

      if (index >= 0) {
        path =
          parsed.pathname.slice(
            index +
              marker.length,
          );
      }
    }

    if (!path) {
      return;
    }

    const { token } =
      getR2Config();

    const response =
      await fetch(
        r2ObjectUrl(
          decodeURIComponent(
            path,
          ),
        ),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

    if (
      !response.ok &&
      response.status !== 404
    ) {
      throw new Error(
        `R2 delete failed (${response.status}).`,
      );
    }
  }

  async getObject(
    path: string,
  ) {
    const { token } =
      getR2Config();

    const response =
      await fetch(
        r2ObjectUrl(path),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

    if (
      response.status === 404
    ) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `R2 read failed (${response.status}).`,
      );
    }

    return {
      body: Buffer.from(
        await response.arrayBuffer(),
      ),
      contentType:
        response.headers.get(
          "content-type",
        ) ||
        "application/octet-stream",
    };
  }
}

export function getGalleryStorage(): GalleryStorage {
  return getProvider() === "r2"
    ? new R2Storage()
    : new VercelBlobStorage();
}

export function getGalleryStorageProvider() {
  return getProvider();
}