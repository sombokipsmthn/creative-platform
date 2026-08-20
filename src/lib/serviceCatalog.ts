// src/lib/serviceCatalog.ts

export type ServiceCategory =
  | 'professional'
  | 'data'
  | 'logistics'
  | 'postproduction'
  | 'extra';

export interface ServiceCatalogItem {
  id: string;
  name: string;
  category: ServiceCategory;
  sectionName: string;
  defaultRate: number;
  defaultUnit: 'day' | 'item' | 'output' | 'set';
  defaultNotes?: string;
}

/**
 * Non-equipment services used by the quotation builder.
 *
 * Equipment itself is intentionally not stored here. Equipment pricing is
 * loaded from the PostgreSQL `equipment` table via /api/equipment.
 */
export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  // A. Professional Fees (Core)
  {
    id: 'prof-photo',
    name: 'Photographers',
    category: 'professional',
    sectionName: 'A. Professional Fees (Core)',
    defaultRate: 25000,
    defaultUnit: 'day',
    defaultNotes: 'Photographers professional fee',
  },
  {
    id: 'prof-dop',
    name: 'Videographer (Director & DOP)',
    category: 'professional',
    sectionName: 'A. Professional Fees (Core)',
    defaultRate: 45000,
    defaultUnit: 'day',
    defaultNotes: 'Video DOP',
  },
  {
    id: 'prof-ad',
    name: 'Videographer (AD)',
    category: 'professional',
    sectionName: 'A. Professional Fees (Core)',
    defaultRate: 25000,
    defaultUnit: 'day',
    defaultNotes: 'Podcast Video AD',
  },
  {
    id: 'prof-drone-pilot',
    name: 'Drone Pilot & Aerial Cinematographer',
    category: 'professional',
    sectionName: 'A. Professional Fees (Core)',
    defaultRate: 30000,
    defaultUnit: 'day',
    defaultNotes: 'Licensed aerial operator & spotter',
  },
  {
    id: 'prof-sound-eng',
    name: 'Sound Recordist & Boom Operator',
    category: 'professional',
    sectionName: 'A. Professional Fees (Core)',
    defaultRate: 20000,
    defaultUnit: 'day',
    defaultNotes: 'Dedicated location multi-track audio',
  },
  {
    id: 'prof-gaffer',
    name: 'Gaffer & Grip Key',
    category: 'professional',
    sectionName: 'A. Professional Fees (Core)',
    defaultRate: 18000,
    defaultUnit: 'day',
    defaultNotes: 'Lighting setup and power management',
  },
  {
    id: 'prof-pa',
    name: 'Production Assistant (PA)',
    category: 'professional',
    sectionName: 'A. Professional Fees (Core)',
    defaultRate: 10000,
    defaultUnit: 'day',
    defaultNotes: 'On-set logistics and equipment coordination',
  },

  // Data & Storage
  {
    id: 'data-hdd',
    name: 'HDD / NVMe Drives (1 TB) + backup storage',
    category: 'data',
    sectionName: 'Data & Storage',
    defaultRate: 13000,
    defaultUnit: 'item',
    defaultNotes: 'Primary and backup media',
  },
  {
    id: 'data-dit',
    name: 'DIT (Digital Intermediate Tech & Ingest)',
    category: 'data',
    sectionName: 'Data & Storage',
    defaultRate: 5000,
    defaultUnit: 'day',
    defaultNotes: 'Offload, verification, backup handling',
  },
  {
    id: 'data-cloud',
    name: 'High-Speed Cloud Delivery & 1-Year Archive',
    category: 'data',
    sectionName: 'Data & Storage',
    defaultRate: 4000,
    defaultUnit: 'item',
    defaultNotes: 'Secure client portal hosting',
  },

  // Travel & Logistics
  {
    id: 'logistics-ground',
    name: 'Ground + Equipment transport',
    category: 'logistics',
    sectionName: 'C. Travel & Logistics',
    defaultRate: 2000,
    defaultUnit: 'day',
    defaultNotes: 'Fuel, taxis, local movement',
  },
  {
    id: 'logistics-out-of-town',
    name: 'Out of Town Crew Travel & Per Diem',
    category: 'logistics',
    sectionName: 'C. Travel & Logistics',
    defaultRate: 15000,
    defaultUnit: 'day',
    defaultNotes: 'Accommodations, regional travel, per diem',
  },

  // Postproduction
  {
    id: 'post-photo',
    name: 'Photo Postproduction',
    category: 'postproduction',
    sectionName: 'Postproduction (Per output billing)',
    defaultRate: 10000,
    defaultUnit: 'output',
    defaultNotes: 'Batch Processing (Same day Delivery)',
  },
  {
    id: 'post-video',
    name: 'Video Postproduction',
    category: 'postproduction',
    sectionName: 'Postproduction (Per output billing)',
    defaultRate: 7000,
    defaultUnit: 'output',
    defaultNotes: 'Event Coverage + Highlight video + Podcast Output',
  },
  {
    id: 'post-color-grading',
    name: 'Cinematic Color Grading & Sound Master',
    category: 'postproduction',
    sectionName: 'Postproduction (Per output billing)',
    defaultRate: 15000,
    defaultUnit: 'output',
    defaultNotes: 'DaVinci Resolve color grading & sound mix',
  },
  {
    id: 'post-reels',
    name: 'Social Media Cutdowns (Reels / TikTok / Shorts)',
    category: 'postproduction',
    sectionName: 'Postproduction (Per output billing)',
    defaultRate: 4000,
    defaultUnit: 'output',
    defaultNotes: 'Vertical 9:16 optimized cuts with dynamic captions',
  },
];
