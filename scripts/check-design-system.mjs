import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const errors = [];
const uiDir = join(root, "src/components/ui");
const cssPath = join(root, "src/app/globals.css");
const css = readFileSync(cssPath, "utf8");

const requiredTokens = [
  "--background", "--foreground", "--card", "--card-foreground", "--popover",
  "--primary", "--secondary", "--muted", "--accent", "--destructive",
  "--border", "--input", "--ring", "--radius",
];
for (const token of requiredTokens) {
  if (!css.includes(token)) errors.push(`Missing shadcn token ${token} in src/app/globals.css`);
}

const canonical = [
  "alert", "avatar", "badge", "button", "card", "dialog", "dropdown-menu", "input",
  "label", "select", "separator", "sheet", "skeleton", "table", "tabs", "textarea",
];
for (const name of canonical) {
  if (!existsSync(join(uiDir, `${name}.tsx`))) errors.push(`Missing canonical UI component ${name}.tsx`);
}

const domainSpecific = new Set(["AdminPageHeader.tsx", "GalleryTopNav.tsx", "ImageCard.tsx", "MediaCard.tsx", "SettingsNavigation.tsx", "VideoPlayer.tsx"]);
for (const file of readdirSync(uiDir).filter((name) => /^[A-Z].*\.tsx$/.test(name) && !domainSpecific.has(name))) {
  const source = readFileSync(join(uiDir, file), "utf8");
  if (!source.includes("Compatibility export")) {
    errors.push(`Uppercase UI file must be a compatibility export: ${file}`);
  }
}

// Detect competing UI libraries
const sourceFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name.startsWith(".")) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (/\.(tsx?|css)$/.test(entry.name)) sourceFiles.push(path);
  }
}
walk(join(root, "src"));
for (const path of sourceFiles) {
  const source = readFileSync(path, "utf8");
  if (/from ["'](?:@mui|@chakra-ui|antd|bootstrap)["']/.test(source)) {
    errors.push(`Competing UI library import in ${path}`);
  }
}

// Detect hardcoded theme colors in admin/shared components (slate/zinc direct usage)
const forbiddenHardcoded = [
  "bg-slate-", "text-slate-", "border-slate-", "dark:bg-slate-", "dark:text-slate-", "dark:border-slate-",
  "bg-zinc-", "text-zinc-", "border-zinc-", "dark:bg-zinc-", "dark:text-zinc-", "dark:border-zinc-",
  "bg-emerald-", "text-emerald-", "border-emerald-", "dark:bg-emerald-", "dark:text-emerald-", "dark:border-emerald-",
  "bg-amber-", "text-amber-", "border-amber-", "dark:bg-amber-", "dark:text-amber-", "dark:border-amber-",
  "bg-red-", "text-red-", "border-red-", "dark:bg-red-", "dark:text-red-", "dark:border-red-",
];
const adminPaths = ["src/app/admin", "src/components/admin", "src/components/ui/AdminPageHeader.tsx"];
for (const path of sourceFiles) {
  if (!adminPaths.some(p => path.startsWith(join(root, p)))) continue;
  const rel = path.replace(root + "/", "");
  const source = readFileSync(path, "utf8");
  for (const pattern of forbiddenHardcoded) {
    if (source.includes(pattern)) {
      errors.push(`Hardcoded theme color "${pattern}" in ${rel} — use semantic tokens instead`);
      break;
    }
  }
}

// Detect legacy component class usage in admin.
//
// The legacy `.Button` primitive (Button--primary/secondary/outline/ghost) is no
// longer rendered by any admin component. The canonical shadcn Button primitive
// is used instead. The regex below targets class/className attributes only, so
// import statements and comments no longer trigger false positives.
//
// Domain-specific ui-* and admin-* classes are intentionally permitted:
// they are defined in src/app/globals.css / src/app/admin/admin.css and used by
// shared admin primitives (AdminPageHeader tabs, StatCards, GalleryWorkspace,
// AdminResourceToolbar, TableFilterBar, SettingsNavigation).
const legacyClasses = [
  /(?:class|className)="[^"]*\bButton\b/,
];
// Domain-specific ui-* and admin-* classes are intentionally permitted:
// they are defined in src/app/globals.css / src/app/admin/admin.css and used by
// shared admin primitives (AdminPageHeader tabs, StatCards, GalleryWorkspace,
// AdminResourceToolbar, TableFilterBar, SettingsNavigation).
const permittedLegacy = new Set([
  "admin-tabs", "admin-tab", "admin-settings-tabs-list", "admin-settings-tab",
  "admin-filter-bar", "admin-filter-search", "admin-filter-controls",
  "ui-card", "ui-panel", "ui-stat-card", "ui-badge",
]);
for (const path of sourceFiles) {
  if (!path.includes("/admin/") && !path.includes("AdminPageHeader.tsx")) continue;
  const source = readFileSync(path, "utf8");
  for (const pattern of legacyClasses) {
    if (pattern.test(source)) {
      errors.push(`Legacy class pattern "${pattern}" found in ${path.replace(root + "/", "")}`);
      break;
    }
  }
}

// Detect duplicate primitive files (case-insensitive duplicates)
const uiFiles = readdirSync(uiDir).filter((name) => name.endsWith(".tsx"));
const lowerMap = new Map();
for (const f of uiFiles) {
  const lower = f.toLowerCase();
  if (!lowerMap.has(lower)) lowerMap.set(lower, []);
  lowerMap.get(lower).push(f);
}
for (const [lower, files] of lowerMap) {
  if (files.length > 1 && !domainSpecific.has(files[0])) {
    errors.push(`Case-insensitive duplicate UI primitives: ${files.join(", ")}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log("Design-system guardrails passed.");
