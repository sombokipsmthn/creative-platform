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

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log("Design-system guardrails passed.");
