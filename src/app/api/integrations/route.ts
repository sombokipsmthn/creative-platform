import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { creatorIntegrations } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

const AVAILABLE_INTEGRATIONS = [
  {
    integrationKey: 'kra_etims',
    name: 'KRA eTIMS Taxpayer Portal Bridge',
    description: 'Connected to etims.kra.go.ke for tax compliance',
    category: 'tax',
  },
  {
    integrationKey: 'cloudflare_r2',
    name: 'Cloudflare R2 Object Storage',
    description: 'Object storage with zero egress fees',
    category: 'storage',
  },
  {
    integrationKey: 'google_drive',
    name: 'Google Drive Importer',
    description: 'OAuth 2.0 Read-Only Connector for importing assets',
    category: 'storage',
  },
  {
    integrationKey: 'mpesa',
    name: 'M-Pesa Payment Gateway',
    description: 'Safaricom Daraja API for payment collection',
    category: 'payments',
  },
  {
    integrationKey: 'slack',
    name: 'Slack Notifications',
    description: 'Post gallery activity to Slack channels',
    category: 'notifications',
  },
];

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const connected = await db.query.creatorIntegrations.findMany({
        where: eq(creatorIntegrations.userId, user.id),
      });

      const integrations = AVAILABLE_INTEGRATIONS.map(available => {
        const connectedIntegration = connected.find(c => c.integrationKey === available.integrationKey);
        return {
          ...available,
          status: connectedIntegration?.status || 'inactive',
          config: connectedIntegration?.config || {},
          connectedAt: connectedIntegration?.connectedAt || null,
          id: connectedIntegration?.id || null,
        };
      });

      return NextResponse.json({ integrations });
    } catch (error) {
      console.error("GET /api/integrations error:", error);
      return NextResponse.json(
        { error: "Failed to fetch integrations" },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const body = await request.json();
      const { integrationKey, action, config } = body;

      if (!integrationKey || !action) {
        return NextResponse.json({ error: "integrationKey and action are required" }, { status: 400 });
      }

      const available = AVAILABLE_INTEGRATIONS.find(i => i.integrationKey === integrationKey);
      if (!available) {
        return NextResponse.json({ error: "Invalid integration key" }, { status: 400 });
      }

      const existing = await db.query.creatorIntegrations.findFirst({
        where: and(
          eq(creatorIntegrations.userId, user.id),
          eq(creatorIntegrations.integrationKey, integrationKey)
        ),
      });

      if (action === 'connect') {
        const [updated] = await db
          .insert(creatorIntegrations)
          .values({
            userId: user.id,
            integrationKey,
            name: available.name,
            description: available.description,
            status: 'active',
            config: existing?.config || {},
            connectedAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [creatorIntegrations.userId, creatorIntegrations.integrationKey],
            set: {
              status: 'active',
              config: existing?.config || {},
              connectedAt: new Date(),
              updatedAt: new Date(),
            },
          })
          .returning();

        return NextResponse.json({ integration: updated });
      }

      if (action === 'disconnect') {
        if (!existing) {
          return NextResponse.json({ error: "Integration not connected" }, { status: 404 });
        }

        const [updated] = await db
          .update(creatorIntegrations)
          .set({
            status: 'inactive',
            config: {},
            connectedAt: null,
            updatedAt: new Date(),
          })
          .where(and(
            eq(creatorIntegrations.userId, user.id),
            eq(creatorIntegrations.integrationKey, integrationKey)
          ))
          .returning();

        return NextResponse.json({ integration: updated });
      }

      if (action === 'configure') {
        if (!config || typeof config !== 'object') {
          return NextResponse.json({ error: "config object required" }, { status: 400 });
        }

        const [updated] = await db
          .insert(creatorIntegrations)
          .values({
            userId: user.id,
            integrationKey,
            name: available.name,
            description: available.description,
            status: existing?.status || 'configured',
            config,
            connectedAt: existing?.connectedAt,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [creatorIntegrations.userId, creatorIntegrations.integrationKey],
            set: {
              config,
              status: existing?.status || 'configured',
              updatedAt: new Date(),
            },
          })
          .returning();

        return NextResponse.json({ integration: updated });
      }

      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
      console.error("POST /api/integrations error:", error);
      return NextResponse.json(
        { error: "Failed to update integration" },
        { status: 500 }
      );
    }
  });
}
