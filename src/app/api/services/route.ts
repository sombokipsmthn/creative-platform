import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Get available services for quote builder
 * Returns crew, production, post-production, and transport services
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.trim() || "";
    const search = searchParams.get("search")?.trim() || "";

    // Built-in services by category
    const allServices: Record<
      string,
      Array<{ label: string; unit: string; rate: number }>
    > = {
      crew: [
        { label: "Camera Operator", unit: "day", rate: 12000 },
        { label: "Director", unit: "day", rate: 20000 },
        { label: "Producer", unit: "day", rate: 18000 },
        { label: "Director of Photography", unit: "day", rate: 18000 },
        { label: "1st Assistant Camera", unit: "day", rate: 10000 },
        { label: "2nd Assistant Camera", unit: "day", rate: 7000 },
        { label: "Gaffer", unit: "day", rate: 12000 },
        { label: "Sound Recordist", unit: "day", rate: 12000 },
        { label: "Boom Operator", unit: "day", rate: 8000 },
        { label: "Production Assistant", unit: "day", rate: 5000 },
        { label: "Editor", unit: "day", rate: 15000 },
        { label: "Photographer", unit: "day", rate: 12000 },
      ],
      production: [
        { label: "Production Management", unit: "project", rate: 15000 },
        { label: "Pre-production", unit: "project", rate: 12000 },
        { label: "Location Scouting", unit: "project", rate: 8000 },
        { label: "Production Coordination", unit: "project", rate: 10000 },
        { label: "Production Day", unit: "day", rate: 15000 },
        { label: "Set Catering", unit: "day", rate: 8000 },
        { label: "Production Insurance", unit: "project", rate: 0 },
      ],
      "post production": [
        { label: "Video Editing", unit: "project", rate: 25000 },
        { label: "Color Grading", unit: "project", rate: 15000 },
        { label: "Sound Mix", unit: "project", rate: 15000 },
        { label: "Motion Graphics", unit: "project", rate: 20000 },
        { label: "Subtitles / Captions", unit: "project", rate: 8000 },
        { label: "Photo Retouching", unit: "project", rate: 12000 },
        { label: "Photo Editing", unit: "project", rate: 10000 },
        { label: "SFX / VFX", unit: "project", rate: 25000 },
        { label: "Rendering / Encoding", unit: "project", rate: 5000 },
      ],
      transport: [
        { label: "Production Transport", unit: "day", rate: 8000 },
        { label: "Crew Transport", unit: "day", rate: 6000 },
        { label: "Equipment Transport", unit: "day", rate: 6000 },
        { label: "Fuel / Mileage", unit: "trip", rate: 0 },
      ],
      other: [
        { label: "Miscellaneous Expense", unit: "unit", rate: 0 },
        { label: "Location Fee", unit: "day", rate: 0 },
        { label: "Permit", unit: "project", rate: 0 },
        { label: "Other Service", unit: "unit", rate: 0 },
      ],
    };

    let results: Array<{
      id: string;
      label: string;
      category: string;
      unit: string;
      rate: number;
    }> = [];

    if (category) {
      const categoryKey = category.toLowerCase();
      const services = allServices[categoryKey] || [];

      results = services
        .map((service, index) => ({
          id: `${categoryKey}-${index}`,
          label: service.label,
          category: category,
          unit: service.unit,
          rate: service.rate,
        }))
        .filter((service) => {
          if (!search) return true;
          const searchLower = search.toLowerCase();
          return (
            service.label.toLowerCase().includes(searchLower) ||
            service.category.toLowerCase().includes(searchLower)
          );
        });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/services error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch services",
      },
      {
        status: 500,
      }
    );
  }
}
