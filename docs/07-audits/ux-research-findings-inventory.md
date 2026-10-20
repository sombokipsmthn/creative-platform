# Phase 1: UX Research & Product Discovery — Findings Inventory

**Date:** 2026-10-21
**Branch:** `chore/ux-redesign-comprehensive`
**Base Commit:** `37f01fa`

---

## 1. Audience & Route Architecture

| Audience | Primary Routes | Current State |
|----------|----------------|---------------|
| **Public visitors** | `/`, `/about`, `/work`, `/services`, `/contact`, `/privacy` | Homepage mixes marketing + creator dashboard signals |
| **Authenticated creators** | `/admin/*` (16 routes) | Dashboard, Clients, Projects, Galleries, Quotes, Invoices, Contracts, Calendar, Expenses, Payments, Equipment, Profile, Portfolio, Settings, Onboarding |
| **Clients (gallery access)** | `/Portal/g/[secretToken]`, `/contract/[token]`, `/p/[handle]` | PIN-protected galleries, contract signing, public portfolio |

**Finding:** Homepage `/` currently serves both public marketing and authenticated creator entry — creates confused hierarchy.

---

## 2. Navigation & Information Architecture

| Element | Current State | Issues |
|---------|---------------|--------|
| **Desktop sidebar** | Fixed 260px, grouped sections (Overview, Operations, Settings) | Good structure, but Settings has dead/duplicate tabs |
| **Mobile nav** | Sheet-based, same structure | Works but not tested in smoke |
| **Top header** | Breadcrumb + theme toggle + profile menu | Breadcrumb label derivation fragile (`pathname.replace("/admin/", "")`) |
| **Page headers** | `AdminPageHeader` component (title, description, breadcrumb, actions, tabs) | Inconsistent usage — some pages use custom headers |
| **Footer** | Minimal on public pages, none on admin | No company links, legal links missing |

**Finding:** Two navigation systems (sidebar + top header) with different mental models. Settings page has 6 tabs but only Watermark Studio works; others are empty or misleading.

---

## 3. Component & Styling Systems (3 Competing)

| System | Scope | Examples |
|--------|-------|----------|
| **shadcn/ui CVA** | `src/components/ui/*` (Button, Card, Table, Tabs, Badge, Select, Dialog, Sheet, DropdownMenu) | 18 primitives, proper variants, Radix underpinning |
| **`ui-*` utility classes** | `globals.css` (150+ lines) | `.ui-button-*`, `.ui-card-*`, `.ui-input`, `.ui-badge-*`, `.ui-table-*`, `.ui-stat-card`, `.admin-page-*` |
| **Inline Tailwind + hardcoded** | Page-level | `bg-slate-50 dark:bg-zinc-800`, `text-slate-900 dark:text-white`, `#6D5DFB` purple in 6 files |

**Audit source:** `docs/audits/styling-shadcn-audit.md` — 71% routes use `ui-*`, 75% admin routes hardcode status colors, 6 files with `#6D5DFB`/`#6D28D9`.

**Finding:** No single source of truth. Pages import shadcn components but style with `ui-*` classes or inline Tailwind. Status colors decentralized (8+ custom `statusClass()` functions).

---

## 4. Forms & Validation

| Aspect | Current State |
|--------|---------------|
| **Inputs** | Native `<input className="ui-input">` or shadcn `Input` — mixed |
| **Validation** | Manual per-form, error messages in divs without `role="alert"` |
| **Error handling** | Toast-like `saveMessage` state, no consistent pattern |
| **Dirty state** | Only in WatermarkStudio (`dirty = JSON.stringify(settings) !== JSON.stringify(saved)`) |
| **Form wrapper** | None — no `Form` component with `onSubmit`, `reset`, `dirty` tracking |

**Finding:** Forms work but lack accessibility (no `aria-live` on errors), consistency, and unsaved-changes protection.

---

## 5. Modals & Overlays

| Type | Implementation | Accessibility |
|------|----------------|---------------|
| **Custom modals** | Fixed inset overlays (`fixed inset-0 z-50 bg-black/70`) in clients, projects, onboarding, GalleryManager | ❌ No focus trap, ❌ No ESC dismiss, ❌ No ARIA roles |
| **shadcn Dialog** | Available (`src/components/ui/dialog.tsx`) but unused in those pages | ✅ Focus trap, ✅ ESC, ✅ Portal |
| **Sheet** | Used for mobile nav | ✅ |
| **DropdownMenu** | Used in AdminDataTable row actions | ✅ |

**Finding:** 4+ pages use inaccessible custom modals instead of `Dialog` primitive.

---

## 6. Settings Page Inventory

| Tab | Controls | Working? | Persists? |
|-----|----------|----------|-----------|
| **Branding** | Domain slug, custom domain, hide branding, logo/favicon upload | Partial (uploads placeholder) | ❌ No API |
| **Watermark** | Full WatermarkStudio (text/image, presets, live preview) | ✅ | ✅ `/api/watermark-presets` |
| **Presets** | Selection limit, expiry days, master PIN | UI only | ❌ No API |
| **Email Templates** | Subject/body for invitation | UI only | ❌ No API |
| **Preferences** | KRA PIN, currency, WHT rate | UI only | ❌ No API |
| **Integrations** | 5 services (2 Active, 1 Configure, 2 Connect) | UI only | ❌ No API |

**Finding:** Only Watermark Studio has working backend. Other tabs are UI-only with no persistence — misleading to users.

---

## 7. Homepage (`/`) Analysis

| Section | Current | Issues |
|---------|---------|--------|
| **Hero** | Headline + 2 CTAs ("Get started", "Explore") + workspace image | Competing CTAs, no trust signals, image decorative |
| **Platform** | 6 feature cards | Generic descriptions, no icons |
| **Toolkit** | 6 workspace tools | Duplicate of Platform features |
| **CTA** | Dark section with "Get started" | Redundant with hero |
| **Footer** | 3 spans | No navigation, no legal links |

**Finding:** No clear hierarchy, no audience separation, no social proof, redundant sections.

---

## 8. Data Tables & Lists

| Page | Table Type | Features |
|------|------------|----------|
| **Clients** | `AdminDataTable` | Search, status filter, row selection, modal detail, create modal |
| **Projects** | `AdminDataTable` | Search, status/client/visibility/featured filters, create modal |
| **Invoices** | `AdminDataTable` + `TableFilterBar` | Search, status filter, pagination |
| **Quotes** | `AdminDataTable` + `TableFilterBar` | Search, status filter |
| **Galleries** | Grid + `AdminDataTable` (list view) | View toggle, status/category filter, activity tab |

**Finding:** `AdminDataTable` is well-designed (sorting, selection, column visibility, mobile cards, pagination). Grid view in Galleries duplicates functionality.

---

## 9. Accessibility Gaps (from audit)

| Issue | Locations | Severity |
|-------|-----------|----------|
| Missing `focus-visible` on `ui-input`/`ui-textarea`/`ui-select` | `globals.css` | Medium |
| Custom modals lack focus trap | Clients, Projects, Onboarding, GalleryManager | High |
| Icon-only buttons lack `aria-label` | GalleryManager (copy, delete, settings), Invoices | Medium |
| Status badges color-only semantics | All admin pages | Medium |
| Form errors not announced | All forms | Medium |
| Heading hierarchy skipped (h1→h3) | Various | Low |

---

## 10. Responsive Behavior

| Breakpoint | Admin Pages | Public Pages | Client Portal |
|------------|-------------|--------------|---------------|
| Mobile (<640px) | Stack layouts, sheet nav | Stack | Stack |
| Tablet (640-1024px) | 2-col grids | 2-col | 2-col |
| Desktop (>1024px) | Sidebar fixed, 4-col grids | Multi-col | Full layout |
| **Horizontal overflow** | ✅ None (smoke test passed) | ⚠️ Not tested | ⚠️ Not tested |

---

## 11. Dark Mode & Theming

- **Supported:** Yes — `.dark` class on `<html>`, all tokens have dark variants in `globals.css`
- **Tokens:** Complete semantic set (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, charts, sidebar)
- **Status tokens:** ❌ Missing — no `--success`, `--warning`, `--info`, `--status-*`
- **Brand token:** ❌ Missing — `#6D5DFB` hardcoded in 6 files

---

## 12. Prioritized Remediation (from audit)

| Priority | Task | Files Affected |
|----------|------|----------------|
| **P0** | Replace custom modals with `Dialog` | clients, projects, onboarding, GalleryManager |
| **P0** | Add `aria-label` to icon-only buttons | GalleryManager, Invoices |
| **P0** | Add `focus-visible` to form controls | `globals.css` |
| **P1** | Centralize status/brand tokens | `globals.css`, 12+ admin pages |
| **P1** | Migrate `ui-*` classes → shadcn components | All admin pages |
| **P2** | Replace native selects/date inputs | Clients, projects, settings, GalleryManager |
| **P3** | Remove backup files | `layout.tsx.backup`, `layout.tsx.bak` ✅ Done |

---

## 13. Validation Baseline (Pre-Redesign)

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS |
| `npm run lint` | ⚠️ 8 warnings (pre-existing) |
| `npm run test` | ✅ 15 files, 73 tests PASS |
| `npm run design-system:check` | ✅ PASS |
| `npm run test:responsive-admin` | ❌ FAIL (env blocked — local auth bootstrap 404) |

---

## 14. Key Design Decisions for Redesign

1. **Separate audiences** — Public `/` = marketing only; `/admin` = creator workspace; `/Portal` = client galleries
2. **Single design system** — shadcn/ui `radix-nova` + CSS variables only; remove `ui-*` utility classes
3. **Tokenize everything** — Status colors, brand purple, all hardcoded values → semantic tokens
4. **Accessible by default** — `Dialog` not custom overlays, `focus-visible` on all interactive, ARIA on errors
5. **Settings = working only** — Remove/deprecate tabs without backend; consolidate into logical groups
6. **Preserve business logic** — Auth, DB, APIs, permissions, workflows untouched

---

*Generated during Phase 1 research. Used to inform Phases 2–9 implementation.*