import { NextResponse } from "next/server";

import getCurrentUser from "@/lib/auth/get-current-user";

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
  authUserId?: string | null;
};

export async function withCreatorApi<T>(
  req: Request,
  handler: (req: Request, user: AuthenticatedUser) => Promise<T>,
  options: { status?: number } = {}
): Promise<NextResponse> {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await handler(req, user as AuthenticatedUser);
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

    const message =
      error instanceof Error
        ? error.message
        : "Request failed";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
