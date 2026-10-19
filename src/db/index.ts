import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });

import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let _db: NodePgDatabase<typeof schema> | null = null;
let _mockDb: any = null;

// Mock in-memory tables populated with realistic initial data
const mockTables: Record<string, any[]> = {
  equipment: [
    {
      id: "eq-01",
      name: "Sony FX3 Cinema Line Camera",
      dailyRate: 15000,
      category: "Cameras",
      subcategory: "Full-Frame Cinema",
      brand: "Sony",
      specs: "Full-frame 4K 120p, 10-bit 4:2:2, 15+ stops dynamic range, S-Cinetone",
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "eq-02",
      name: "Sony FX6 Full-Frame Cinema Camera",
      dailyRate: 25000,
      category: "Cameras",
      subcategory: "Cinema Camera",
      brand: "Sony",
      specs: "4K 120p, electronic variable ND, modular body, dual base ISO",
      imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "eq-03",
      name: "Sony FE 24-70mm f/2.8 GM II",
      dailyRate: 6000,
      category: "Lenses",
      subcategory: "Standard Zoom",
      brand: "Sony",
      specs: "Fast f/2.8 aperture, extreme aspherical optics, lightweight design",
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "eq-04",
      name: "Sony FE 70-200mm f/2.8 GM OSS II",
      dailyRate: 7500,
      category: "Lenses",
      subcategory: "Telephoto Zoom",
      brand: "Sony",
      specs: "Optical SteadyShot, constant f/2.8, internal zoom mechanism",
      imageUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "eq-05",
      name: "Aputure LS 600d Pro Daylight LED",
      dailyRate: 12000,
      category: "Lighting",
      subcategory: "COB LED",
      brand: "Aputure",
      specs: "600W daylight point source, Bowens mount, weather-resistant",
      imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "eq-06",
      name: "Aputure Light Dome 150 Softbox",
      dailyRate: 3500,
      category: "Modifiers",
      subcategory: "Softbox",
      brand: "Aputure",
      specs: "Large parabolic softbox with honeycomb grid and dual diffusers",
      imageUrl: "https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "eq-07",
      name: "Sennheiser EW-DP Wireless Mic System",
      dailyRate: 5000,
      category: "Audio",
      subcategory: "Wireless Lav",
      brand: "Sennheiser",
      specs: "All-digital UHF wireless system with ME 2 omni lavalier mic",
      imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "eq-08",
      name: "Zoom F8n Pro 8-Channel Field Recorder",
      dailyRate: 8000,
      category: "Audio",
      subcategory: "Field Recorder",
      brand: "Zoom",
      specs: "32-bit float dual A/D converters, 8 XLR inputs, timecode I/O",
      imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "eq-09",
      name: "DJI Ronin RS 3 Pro Gimbal",
      dailyRate: 8500,
      category: "Grips & Motion",
      subcategory: "Gimbal Stabilizer",
      brand: "DJI",
      specs: "Carbon fiber construction, 4.5kg payload, automated axis locks",
      imageUrl: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "eq-10",
      name: "DJI Mavic 3 Pro Cine Drone Kit",
      dailyRate: 20000,
      category: "Drones",
      subcategory: "Aerial Cinema",
      brand: "DJI",
      specs: "Hasselblad 4/3 CMOS camera, 70mm & 166mm telephoto, Apple ProRes 422 HQ",
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "eq-11",
      name: "Nanlite PavoTube II 30X RGB Tubes (2-Kit)",
      dailyRate: 4500,
      category: "Lighting",
      subcategory: "Pixel Tube",
      brand: "Nanlite",
      specs: "4ft RGBWW pixel tubes with built-in battery and wireless DMX",
      imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "eq-12",
      name: "Teradek Bolt 4K LT 750 Transmitter/Receiver",
      dailyRate: 14000,
      category: "Accessories",
      subcategory: "Wireless Video",
      brand: "Teradek",
      specs: "Zero-delay 4K HDR wireless video transmission up to 750ft line-of-sight",
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  users: [
    {
      id: "creator-demo-001",
      name: "Somboriot Kipchilat",
      email: "sombo@mintylime.co.ke",
      emailVerified: true,
      onboardingStatus: "complete",
      onboardingStep: 4,
      handle: "kipsmthn",
      role: "creator",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "dev-admin-user",
      name: "Local Development Admin",
      email: "dev-admin@localhost.test",
      emailVerified: true,
      onboardingStatus: "complete",
      onboardingStep: 4,
      handle: "dev-admin",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  creatorProfiles: [
    {
      id: "profile-demo-001",
      userId: "creator-demo-001",
      bio: "Commercial photographer and filmmaker based in Nairobi, Kenya. Producing visual media for African startup ecosystems, venture builders, and regional brands.",
      website: "https://kipsmthn.com",
      location: "Nairobi, Kenya",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "profile-dev-001",
      userId: "dev-admin-user",
      bio: "Local developer workspace administrator.",
      website: "https://kipsmthn.com",
      location: "Nairobi, Kenya",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  businessProfiles: [
    {
      id: "biz-demo-001",
      userId: "creator-demo-001",
      businessName: "KIPSMTHN Creative Platform",
      phone: "+254 722 145 776",
      kraPin: "P051123456Z",
      vatRegistered: true,
      vatNumber: "051123456Z",
      currency: "KES",
      depositPercentage: 50,
      whtRate: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  clients: [
    {
      id: "client-demo-001",
      creatorId: "creator-demo-001",
      name: "Jamie Njoroge",
      company: "Acacia Stories Studio",
      email: "jamie@acaciastories.test",
      phone: "+254 700 123 456",
      location: "Nairobi, Kenya",
      kraPin: "P051998877Y",
      website: "https://acaciastories.test",
      notes: "Commercial documentary production client",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "client-demo-002",
      creatorId: "creator-demo-001",
      name: "Sarah Kimani",
      company: "BURN Manufacturing",
      email: "sarah.k@burnmfg.test",
      phone: "+254 711 234 567",
      location: "Ruiru, Kenya",
      kraPin: "P051223344X",
      website: "https://burnstoves.com",
      notes: "Industrial and ecosystem clean energy media",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  projects: [
    {
      id: "project-demo-001",
      creatorId: "creator-demo-001",
      clientId: "client-demo-001",
      name: "Clean Energy Impact & Ecosystem Media",
      slug: "clean-energy-impact",
      description: "Documentary photography and cinema production covering clean energy innovation and distribution across Kenya.",
      shortDescription: "Clean energy documentary film in East Africa.",
      category: "Documentary",
      year: "2025",
      location: "Nairobi & Naivasha",
      services: ["Photography", "Cinematography", "Drone Filming"],
      disciplines: ["Production", "Post-production"],
      collaborators: ["Acacia Stories Crew"],
      role: "Director of Photography",
      scopeOfWork: "3 production shoot days, factory filming, founder interviews, 4K highlight film, 50 master photographs.",
      deliverables: "1x 4K Master Film (3 min), 3x 9:16 Social Cutdowns, 50 color-graded photographs",
      totalAmount: 380000,
      currency: "KES",
      paymentTerms: "50% deposit upon contract signing, 50% on final gallery delivery.",
      revisionsPolicy: "2 rounds of editorial cuts included.",
      licensingTerms: "Worldwide commercial digital & print usage for 3 years.",
      noticePeriod: "14 days",
      storyOverview: "Clean energy ecosystem growth in rural and peri-urban Kenya.",
      status: "active",
      visibility: "public",
      featured: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      client: {
        id: "client-demo-001",
        name: "Jamie Njoroge",
        company: "Acacia Stories Studio",
        email: "jamie@acaciastories.test",
        phone: "+254 700 123 456",
        location: "Nairobi, Kenya",
        website: "https://acaciastories.test",
      },
      media: [
        {
          id: "med-01",
          filename: "field-interview.jpg",
          displayUrl: "https://images.unsplash.com/photo-1505373877842-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1505373877842-8d25f7d46678?auto=format&fit=crop&w=400&q=80",
          altText: "Founder Field Interview",
          caption: "Naivasha clean cooking distribution hub interview",
          sortOrder: 0,
          isHidden: false,
          isCover: true,
          mimeType: "image/jpeg",
        },
        {
          id: "med-02",
          filename: "factory-production.jpg",
          displayUrl: "https://images.unsplash.com/photo-1589939705385-5185137a7f0f?auto=format&fit=crop&w=1200&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1589939705385-5185137a7f0f?auto=format&fit=crop&w=400&q=80",
          altText: "Production Facility",
          caption: "Ruiru modern stove assembly line",
          sortOrder: 1,
          isHidden: false,
          isCover: false,
          mimeType: "image/jpeg",
        },
      ],
    },
  ],
  quotes: [
    {
      id: "quote-demo-001",
      creatorId: "creator-demo-001",
      clientId: "client-demo-001",
      quoteNumber: "Q-2025-001",
      title: "Clean Energy Field Documentary Production",
      projectName: "Clean Energy Impact",
      status: "accepted",
      subtotal: 350000,
      discountType: "none",
      discountValue: 0,
      discountAmount: 0,
      tax: 56000,
      total: 406000,
      currency: "KES",
      paymentTerms: "50% advance deposit to secure dates, 50% on final deliverables approval.",
      validUntil: "2026-12-31",
      productionDays: 3,
      location: "Nairobi & Naivasha",
      clientContact: "Jamie Njoroge (jamie@acaciastories.test)",
      depositPercentage: 50,
      notes: "Includes drone permits, sound engineer, camera package, and travel logistics.",
      invoiceId: "invoice-demo-001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      client: {
        id: "client-demo-001",
        name: "Jamie Njoroge",
        company: "Acacia Stories Studio",
        email: "jamie@acaciastories.test",
        phone: "+254 700 123 456",
      },
      items: [
        {
          id: "qi-01",
          category: "Crew",
          description: "Director & Cinematographer (DOP) — 3 Production Days",
          quantity: 3,
          unit: "day",
          rate: 45000,
          amount: 135000,
          notes: "Lead cinematography and lighting direction",
        },
        {
          id: "qi-02",
          category: "Camera",
          description: "Sony FX3 + FX6 Dual Cinema Kit with G-Master Lenses",
          quantity: 3,
          unit: "day",
          rate: 35000,
          amount: 105000,
          notes: "Primary 4K capture kits",
        },
        {
          id: "qi-03",
          category: "Post Production",
          description: "Full Editing, Color Grading & Sound Master",
          quantity: 1,
          unit: "package",
          rate: 110000,
          amount: 110000,
          notes: "Includes master cut and social versions",
        },
      ],
    },
  ],
  quoteItems: [
    {
      id: "qi-01",
      quoteId: "quote-demo-001",
      category: "Crew",
      description: "Director & Cinematographer (DOP) — 3 Production Days",
      quantity: 3,
      unit: "day",
      rate: 45000,
      amount: 135000,
      notes: "Lead cinematography and lighting direction",
    },
    {
      id: "qi-02",
      quoteId: "quote-demo-001",
      category: "Camera",
      description: "Sony FX3 + FX6 Dual Cinema Kit with G-Master Lenses",
      quantity: 3,
      unit: "day",
      rate: 35000,
      amount: 105000,
      notes: "Primary 4K capture kits",
    },
    {
      id: "qi-03",
      quoteId: "quote-demo-001",
      category: "Post Production",
      description: "Full Editing, Color Grading & Sound Master",
      quantity: 1,
      unit: "package",
      rate: 110000,
      amount: 110000,
      notes: "Includes master cut and social versions",
    },
  ],
  invoices: [
    {
      id: "invoice-demo-001",
      creatorId: "creator-demo-001",
      clientId: "client-demo-001",
      quoteId: "quote-demo-001",
      invoiceNumber: "INV-2025-001",
      title: "Clean Energy Impact Production — 50% Mobilization Deposit",
      status: "paid",
      currency: "KES",
      subtotal: 175000,
      tax: 28000,
      total: 203000,
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      notes: "Thank you for partnering with KIPSMTHN Studio. eTIMS compliant invoice.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      client: {
        id: "client-demo-001",
        name: "Jamie Njoroge",
        company: "Acacia Stories Studio",
        email: "jamie@acaciastories.test",
        phone: "+254 700 123 456",
        kraPin: "P051998877Y",
      },
      items: [
        {
          id: "ii-01",
          invoiceId: "invoice-demo-001",
          description: "Production Mobilization Deposit (50% of accepted quote Q-2025-001)",
          quantity: 1,
          unitPrice: 175000,
          amount: 175000,
        },
      ],
    },
  ],
  invoiceItems: [
    {
      id: "ii-01",
      invoiceId: "invoice-demo-001",
      description: "Production Mobilization Deposit (50% of accepted quote Q-2025-001)",
      quantity: 1,
      unitPrice: 175000,
      amount: 175000,
    },
  ],
  galleries: [
    {
      id: "gallery-demo-001",
      creatorId: "creator-demo-001",
      clientId: "client-demo-001",
      projectId: "project-demo-001",
      title: "Clean Energy Impact & Ecosystem Media",
      description: "Private client review and delivery gallery for BURN Manufacturing & Delta39 Studio.",
      category: "Documentary",
      slug: "clean-energy-impact",
      status: "published",
      allowDownloads: true,
      allowFavorites: true,
      allowSelections: true,
      accessPin: "2539",
      theme: "editorial",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  contracts: [
    {
      id: "contract-demo-001",
      creatorId: "creator-demo-001",
      clientId: "client-demo-001",
      projectId: "project-demo-001",
      quoteId: "quote-demo-001",
      contractNumber: "CON-2025-001",
      title: "Commercial Media Production Agreement",
      status: "draft",
      token: "demo-token-clean-energy",
      totalAmount: 406000,
      currency: "KES",
      content: `# Commercial Media Production Agreement\n\nThis Commercial Media Production Agreement is entered into by and between KIPSMTHN Studio ("Creator") and Acacia Stories Studio ("Client").\n\n## Scope of Services\nProduction of 4K documentary media and photography in Kenya.\n\n## Compensation\nTotal Fee: KES 406,000 (VAT inclusive).\n\n## Terms\nDeposit 50% due on execution. Final balance due on delivery.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentAt: null,
      signedAt: null,
      clientName: "Jamie Njoroge",
    },
  ],
  contractEvents: [
    {
      id: "ce-01",
      contractId: "contract-demo-001",
      eventType: "created",
      metadata: { note: "Contract draft created from quote Q-2025-001" },
      createdAt: new Date().toISOString(),
    },
  ],
  contractTemplates: [
    {
      id: "tpl-01",
      name: "Commercial Photography Agreement",
      description: "For commercial, editorial, and brand photography shoots with licensing terms.",
      category: "Photography",
      documentType: "photography_agreement",
      content: "# Commercial Photography Agreement\n\nStandard commercial photography production terms and licensing rights.",
      variables: ["creator_name", "client_name", "location", "total_fee", "currency"],
      isSystemTemplate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "tpl-02",
      name: "Video Production & Cinematography Agreement",
      description: "For comprehensive video production including pre-production, filming days, and post-production.",
      category: "Video",
      documentType: "video_production_agreement",
      content: "# Video Production Agreement\n\nCommercial video production schedule, deliverables, and revision policies.",
      variables: ["creator_name", "client_name", "project_title", "total_fee", "currency"],
      isSystemTemplate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "tpl-03",
      name: "Creative Retainer Agreement",
      description: "For ongoing monthly creative retainer engagements.",
      category: "Creative Services",
      documentType: "creative_retainer_agreement",
      content: "# Creative Retainer Agreement\n\nMonthly scope of work, turnaround commitments, and invoicing cycle.",
      variables: ["creator_name", "client_name", "monthly_fee", "currency"],
      isSystemTemplate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

function getTableName(table: any): string {
  if (!table) return "";
  if (typeof table === "string") return table;
  if (table[Symbol.for("drizzle:Name")]) return table[Symbol.for("drizzle:Name")];
  if (table._?.name) return table._.name;
  for (const [key, value] of Object.entries(schema)) {
    if (value === table) return key;
  }
  return "";
}

function resolveMockRows(tableName: string): any[] {
  // Normalize table name aliases
  const normalized = tableName.toLowerCase().replace(/_/g, "");
  for (const [key, rows] of Object.entries(mockTables)) {
    if (key.toLowerCase().replace(/_/g, "") === normalized) {
      return rows;
    }
  }
  if (!mockTables[tableName]) {
    mockTables[tableName] = [];
  }
  return mockTables[tableName];
}

function createChainableQuery(initialRows: any[]) {
  let rows = [...initialRows];

  const chainable: any = {
    from(table: any) {
      const name = getTableName(table);
      rows = [...resolveMockRows(name)];
      return chainable;
    },
    where(_condition?: any) {
      return chainable;
    },
    orderBy(_order?: any) {
      return chainable;
    },
    limit(count?: number) {
      if (typeof count === "number") {
        rows = rows.slice(0, count);
      }
      return chainable;
    },
    offset(count?: number) {
      if (typeof count === "number") {
        rows = rows.slice(count);
      }
      return chainable;
    },
    innerJoin() {
      return chainable;
    },
    leftJoin() {
      return chainable;
    },
    groupBy() {
      return chainable;
    },
    then(onfulfilled?: (val: any) => any, onrejected?: (err: any) => any) {
      return Promise.resolve(rows).then(onfulfilled, onrejected);
    },
    catch(onrejected?: (err: any) => any) {
      return Promise.resolve(rows).catch(onrejected);
    },
  };

  return chainable;
}

function createMockDb(): any {
  console.warn("⚠️ [AI Studio] Database not connected or DATABASE_URL not set — using in-memory mock store");

  const queryApi: Record<string, any> = {};

  // Build query proxy for all schema tables
  for (const key of Object.keys(schema)) {
    queryApi[key] = {
      findMany: async (options?: any) => {
        let rows = resolveMockRows(key);
        if (options?.limit && typeof options.limit === "number") {
          rows = rows.slice(0, options.limit);
        }
        return [...rows];
      },
      findFirst: async (_options?: any) => {
        const rows = resolveMockRows(key);
        return rows.length > 0 ? { ...rows[0] } : null;
      },
      findUnique: async (_options?: any) => {
        const rows = resolveMockRows(key);
        return rows.length > 0 ? { ...rows[0] } : null;
      },
    };
  }

  const mockDbInstance: any = {
    query: queryApi,

    select(_fields?: any) {
      return createChainableQuery([]);
    },

    insert(table: any) {
      const tableName = getTableName(table);
      const rows = resolveMockRows(tableName);
      let insertedItem: any = null;

      const inserter: any = {
        values(data: any) {
          const item = {
            id: data.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ...data,
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date(),
          };
          rows.unshift(item);
          insertedItem = item;
          return inserter;
        },
        returning(_fields?: any) {
          return inserter;
        },
        onConflictDoNothing() {
          return inserter;
        },
        then(onfulfilled?: (val: any) => any, onrejected?: (err: any) => any) {
          return Promise.resolve(insertedItem ? [insertedItem] : []).then(onfulfilled, onrejected);
        },
      };

      return inserter;
    },

    update(table: any) {
      const tableName = getTableName(table);
      const rows = resolveMockRows(tableName);
      let updatedItem: any = null;

      const updater: any = {
        set(data: any) {
          if (rows.length > 0) {
            Object.assign(rows[0], data, { updatedAt: new Date() });
            updatedItem = rows[0];
          }
          return updater;
        },
        where(_condition?: any) {
          return updater;
        },
        returning(_fields?: any) {
          return updater;
        },
        then(onfulfilled?: (val: any) => any, onrejected?: (err: any) => any) {
          return Promise.resolve(updatedItem ? [updatedItem] : []).then(onfulfilled, onrejected);
        },
      };

      return updater;
    },

    delete(table: any) {
      const tableName = getTableName(table);
      const deleter: any = {
        where(_condition?: any) {
          return deleter;
        },
        returning() {
          return deleter;
        },
        then(onfulfilled?: (val: any) => any, onrejected?: (err: any) => any) {
          return Promise.resolve([]).then(onfulfilled, onrejected);
        },
      };
      return deleter;
    },

    async transaction(callback: (tx: any) => Promise<any>) {
      return callback(mockDbInstance);
    },

    async execute(_sqlStatement?: any) {
      return { rows: [] };
    },
  };

  return mockDbInstance;
}

function initDb(): any {
  if (_db) return _db;

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || !dbUrl.startsWith("postgres")) {
    if (!_mockDb) {
      _mockDb = createMockDb();
    }
    return _mockDb;
  }

  try {
    const parsedDbUrl = new URL(dbUrl);
    const usesTls =
      parsedDbUrl.hostname.endsWith(".neon.tech") ||
      parsedDbUrl.searchParams.get("sslmode") === "require";

    if (usesTls && parsedDbUrl.searchParams.get("sslmode") === "require") {
      parsedDbUrl.searchParams.set("sslmode", "verify-full");
    }

    const pool = new Pool({
      connectionString: parsedDbUrl.toString(),
      ssl: usesTls ? { rejectUnauthorized: true } : undefined,
    });

    _db = drizzle(pool, {
      schema,
    });

    console.log("✅ Database connected successfully");
    return _db;
  } catch (err) {
    console.warn("⚠️ Failed to connect to PostgreSQL database, falling back to mock:", err);
    if (!_mockDb) {
      _mockDb = createMockDb();
    }
    return _mockDb;
  }
}

// Export a proxy that lazily initializes the database on first access
const dbProxy = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(target, prop, receiver) {
    const activeDb = initDb();
    const value = Reflect.get(activeDb, prop, receiver);
    if (typeof value === "function") {
      return value.bind(activeDb);
    }
    return value;
  },
});

export const db: NodePgDatabase<typeof schema> = dbProxy;