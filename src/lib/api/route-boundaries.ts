import { NextResponse } from "next/server";

import { getCurrentUserFromRequest } from "@/lib/auth/get-current-user";

export class ApiError extends Error {
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export type AuthenticatedUser = {
  id: string;
};

function getDatabaseDiagnostic(error: unknown) {
  let current = error;

  for (let depth = 0; depth < 5 && current && typeof current === "object"; depth += 1) {
    const candidate = current as {
      code?: unknown;
      table?: unknown;
      column?: unknown;
      constraint?: unknown;
      cause?: unknown;
    };

    if (typeof candidate.code === "string") {
      return {
        code: candidate.code,
        ...(typeof candidate.table === "string" ? { table: candidate.table } : {}),
        ...(typeof candidate.column === "string" ? { column: candidate.column } : {}),
        ...(typeof candidate.constraint === "string"
          ? { constraint: candidate.constraint }
          : {}),
      };
    }

    current = candidate.cause;
  }

  return {};
}

export function logUnexpectedApiError(
  request: Request,
  operation: string,
  error: unknown
) {
  console.error("Unexpected API failure", {
    operation,
    method: request.method,
    path: new URL(request.url).pathname,
    errorName: error instanceof Error ? error.name : typeof error,
    ...getDatabaseDiagnostic(error),
  });
}

export async function withCreatorApi<T>(
  req: Request,
  handler: (req: Request, user: AuthenticatedUser) => Promise<T>,
  options: { status?: number } = {}
): Promise<NextResponse> {
  try {
    const user = await getCurrentUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await handler(req, user);

    /*
     * Allow handlers to return a NextResponse directly (e.g. for
     * 400/404/401 responses with custom bodies). Re-wrapping those
     * with NextResponse.json would overwrite their status code.
     */
    if (result instanceof NextResponse) {
      return result;
    }

    return NextResponse.json(result, {
      status: options.status ?? 200,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          error: error.message,
          ...(error.details ?? {}),
        },
        { status: error.statusCode }
      );
    }

    logUnexpectedApiError(req, "withCreatorApi", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
