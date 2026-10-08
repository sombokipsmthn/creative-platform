# Interface Design System — KIPSMTHN Creative Platform

**Product:** Creative business platform for photographers, filmmakers, and studios.  
**Design direction:** Craft-first, tool-oriented, premium SaaS. Not a marketing site — a working dashboard/app for managing clients, projects, quotes, invoices, and delivery galleries.

---

## Direction & Feel

| Aspect | Decision | Why |
|--------|----------|-----|
| **Human** | A creative entrepreneur or studio manager who opens the app between client calls, after a shoot, or first thing in the morning. They need to see what's owed, what's next, and what's delivered — quickly. | The interface must serve a working creative professional, not a generic SaaS user. |
| **Primary verb** | Survey — "what's my status?" — then act — "create quote / invoice / gallery / client record." | The dashboard is a status overview first, action hub second. |
| **Feel** | Tight but not cramped. Credible, not cute. Like a professional tool you'd trust with financial data. Warm enough to feel human (purple accent, organic shadows), cold enough to feel reliable (neutral backgrounds, clear hierarchy). | The product serves creative people who work with their hands and mind — the interface should feel like a good tool, not a toy. |
| **Signature element** | Purple accent (`#7c3aed`) on interactive states + rounded cards with subtle elevation. The purple is the only bright hue; everything else is neutral structure. | A single accent color that's used consistently says "crafted" more than a palette of five colors used without thought. |

---

## Depth Strategy

| Layer | Light mode | Dark mode | Description |
|-------|-----------|-----------|-------------|
| **Surface 0** | `#f8f9fa` (--color-bg-page) | `#121212` | Page background |
| **Surface 1** | `#ffffff` (--color-bg-card) | `#1e1e1e` (--color-bg-card) | Cards, modals, panels |
| **Surface 2** | `#f1f3f5` (--color-bg-input) | `#2d2d2d` (--color-bg-input) | Inputs, form controls |
| **Surface 3** | `#f8f9fa` (--color-bg-soft) | `#252525` (--color-bg-soft) | Soft-action backgrounds (primary buttons) |
| **Overlay** | `rgba(0,0,0,0.55)` (--color-bg-overlay) | `rgba(0,0,0,0.7)` | Modal backdrops, popovers |
| **Border subtle** | `#e9ecef` (--color-border-subtle) | `#3a3a3a` | General UI boundaries |
| **Border strong** | `#dee2e6` (--color-border-strong) | `#4a4a4a` | Table rows, section dividers |
| **Focus ring** | `2px solid var(--color-accent)` | `2px solid var(--color-accent)` | Keyboard focus |

*No box-shadow on surfaces in light mode — borders + whitespace do the structural work. In dark mode, a single subtle ring `0 0 0 1px rgba(255,255,255,0.08)` replaces shadows (shadows don't read on dark).*

---

## Hierarchy

**Type scale ratio: 1.25** (minor third). From a 14px body:

```
Caption      11px   / 500  / muted
Body         14px   / 400  / primary
Label        12px   / 500  / secondary (uppercase-tracked)
Heading 4    16px   / 500  / primary
Heading 3    18px   / 500  / primary
Heading 2    22px   / 600  / primary (tabular-nums on numbers)
Heading 1    28px   / 600  / primary
Display      44px+  / 700  / primary
```

**Three levers together** (size + weight + color/opacity), never size alone. A single 14px size holds three tiers through weight + opacity:

```
value:      600 / primary   (leading the number)
label:      500 / secondary
meta:       400 / muted
```

**Density:** 16px base padding/component spacing. Not tight (12px — workbench), not airy (24px — brochure). 16px is the chosen number, repeated consistently.

**Focal point per view:** The primary metric (e.g., "4 unpaid invoices", "$48K quoted") — larger, higher contrast, given whitespace. Everything else is demoted to a lower tier.

---

## Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-bg-page` | `#f8f9fa` | `#121212` | Page background |
| `--color-bg-card` | `#ffffff` | `#1e1e1e` | Cards, panels |
| `--color-bg-elevated` | `#ffffff` | `#2d2d2d` | Elevated panels / section backs |
| `--color-bg-input` | `#f1f3f5` | `#2d2d2d` | Inputs, form controls |
| `--color-bg-soft` | `#f8f9fa` | `#252525` | Primary button bg |
| `--color-border-subtle` | `#e9ecef` | `#3a3a3a` | General boundaries |
| `--color-border-strong` | `#dee2e6` | `#4a4a4a` | Table rows, section dividers |
| `--color-text-primary` | `#212529` | `#f8f9fa` | Body text |
| `--color-text-secondary` | `#495057` | `#dee2e6` | Secondary text, meta |
| `--color-text-muted` | `#6c757d` | `#adb5bd` | Disabled / helper text |
| `--color-accent` | `#7c3aed` | `#8b5cf6` | Primary interactive state |
| `--color-accent-hover` | `#6d28d9` | `#7c3aed` | Hover / active |
| `--color-amber` | `#f59e0b` | `#f59e0b` | Attention (overdue, pending) |
| `--color-amber-soft` | `#fef3c7` | `#fef3c7` | Amber surface (badges, low-priority) |
| `--color-red` | `#ef4444` | `#ef4444` | Danger (errors, overdue invoices) |
| `--color-red-soft` | `#fee2e2` | `#fee2e2` | Red surface (error states) |
| `--color-green` | `#10b981` | `#10b981` | Success |
| `--color-green-soft` | `#d1fae5` | `#d1fae5` | Green surface (success states) |
| `--color-info` | `#3b82f6` | `#3b82f6` | Info links, secondary action |
| `--color-text-inverse` | `#ffffff` | `#ffffff` | On-accent text |

*All other `slate-*`, `zinc-*`, `purple-*`, `amber-*`, `red-*` Tailwind utilities now resolve to these tokens via `@theme` overrides.*

---

## Depth — Borders over Shadows

- **Light mode:** No box-shadow on surfaces. Borders (`--color-border-subtle`) + whitespace do the lifting.  
- **Dark mode:** One subtle focus ring `0 0 0 1px rgba(255,255,255,0.08)` replaces shadows. Shadows are weak on dark.  
- **Inputs:** Slightly darker than surroundings (--color-bg-input), not lighter. Inputs are inset — they receive content.

---

## Spacing & Sizing

| Base unit | 8px (repeated everywhere) |
|-----------|--------------------------|
| Micro gaps (icon / text) | 4px |
| Component padding (button, card) | 16px vertical, 12px horizontal |
| Section gap (between groups of cards) | 24px |
| Major area gap (between columns/sections) | 32px |
| Sidebar width | 248px (fixed, matches admin layout) |
| Card radius | `--radius-md` (0.5rem) for cards, `--radius-sm` (0.375rem) for buttons |

*No random values. Everything is a multiple of 8px. If it's not on the scale, it doesn't exist.*

---

## Controls & Components

### Button (CVA/variant style)

| Variant | Class | Usage |
|---------|-------|-------|
| `primary` | `ui-button ui-button-primary` | Main CTA |
| `secondary` | `ui-button ui-button-secondary` | Secondary actions |
| `ghost` | `ui-button ui-button-ghost` | Minimal action |
| `destructive` | `ui-button ui-button-destructive` | Delete / remove |

All buttons use `border-radius: var(--radius-sm)` (0.375rem). Primary button: `--color-btn-primary-bg` + white text. Secondary: `--color-bg-soft` border `--color-border-subtle` text.

### Card

- `--radius-md` (0.5rem)  
- `--color-bg-card` surface  
- Subtle `--color-border-subtle` border  
- No box-shadow in light mode (dark mode: one ring `0 0 0 1px rgba(255,255,255,0.08)`)

### Input

- `--color-bg-input` fill  
- `--color-border-subtle` border  
- `--color-text-primary` text  
- Focus: `focus:border-purple-500` (= `--color-accent`)  
- No decorative focus ring that fights the background

### Select / Dropdown

- Headless primitive (Radix/Vaul style) — not hand-rolled  
- `--color-bg-card` surface, `--color-border-subtle` border  
- Dark mode: `--color-border-subtle` = `#3a3a3a`

---

## Dark Mode

- Same token set, inverted lightness values  
- `--color-bg-page`: `#f8f9fa` → `#121212`  
- `--color-text-primary`: `#212529` → `#f8f9fa`  
- `--color-border-subtle`: `#e9ecef` → `#3a3a3a`  
- Shadows → borders (they don't read on dark)  
- Accent hue stays; only lightness shifts  
- One semantic hue only (purple) — no multi-hue theming

---

## After Completing a Task

- Run `npm run build`, `npm run typecheck`, `npm run test`.  
- Visually verify in browser at desktop + mobile widths.  
- Keep user-facing updates short — surface the useful recommendation or decision.  

Offer to save patterns for future sessions into `.interface-design/system.md`. If yes, this file is the single source of truth for the next session.