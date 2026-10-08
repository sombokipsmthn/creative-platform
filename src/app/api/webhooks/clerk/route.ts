import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Webhook handling is no longer needed with Better Auth.
    // Authentication is managed directly by Better Auth.
    return NextResponse.json({
      success: true,
      message: "Webhook endpoint deprecated",
    });
  } catch (error) {
    console.error("POST /api/webhooks/clerk error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}