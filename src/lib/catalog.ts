// src/lib/catalog.ts

import { ServiceCatalogItem } from "./serviceCatalog";

export interface EquipmentRecord {
  id: string;
  name: string;
  dailyRate: number;
  category: string;
  subcategory?: string | null;
  brand?: string | null;
  specs?: string | null;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  sectionName: string;
  defaultRate: number;
  defaultUnit: "day" | "item" | "output" | "set";
  defaultNotes?: string;
}

function mapEquipmentCategory(category: string): string {
  switch (category.trim().toLowerCase()) {
    case "cameras":
    case "lenses":
      return "camera";
    case "sound":
    case "audio":
      return "audio";
    case "lights":
    case "lighting":
    case "modifiers":
      return "lighting";
    case "drones":
      return "drones";
    case "stands":
    case "focus pulling systems":
    case "grips & motion":
    case "photography / video accessories":
      return "grip";
    default:
      return "grip";
  }
}

function mapEquipmentSection(category: string): string {
  switch (mapEquipmentCategory(category)) {
    case "camera":
      return "Camera Package";
    case "audio":
      return "Audio Package";
    case "lighting":
      return "Lighting Package";
    case "drones":
      return "Drones & Action";
    default:
      return "Grips & Motion";
  }
}

export function toCatalogItem(item: EquipmentRecord): CatalogItem {
  const category = mapEquipmentCategory(item.category);
  const specs = [item.brand, item.specs].filter(Boolean).join(" · ");

  return {
    id: `equipment-${item.id}`,
    name: item.name,
    category,
    sectionName: mapEquipmentSection(item.category),
    defaultRate: Math.max(0, Number(item.dailyRate) || 0),
    defaultUnit: "day",
    defaultNotes: specs || item.subcategory || undefined,
  };
}

export function toServiceCatalogItem(item: ServiceCatalogItem): CatalogItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    sectionName: item.sectionName,
    defaultRate: item.defaultRate,
    defaultUnit: item.defaultUnit,
    defaultNotes: item.defaultNotes,
  };
}
