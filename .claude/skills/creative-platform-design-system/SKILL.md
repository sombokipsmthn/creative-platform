---
name: creative-platform-design-system
description: Use when changing Creative Platform pages, layouts, shared UI components, global styles, or responsive behavior.
---

# Creative Platform Design System

Before editing, inspect the actual page, shared components, global CSS variables, Tailwind configuration, and existing shadcn/ui patterns.

- Preserve the existing application structure, visual identity, and orange brand accent.
- Prefer global design tokens over hardcoded per-component colors.
- Standardize typography, spacing, radii, borders, shadows, control heights, and page gutters.
- Avoid overlapping panels, excessive nested cards, and unnecessary decoration.
- Keep layouts accessible and responsive across desktop, tablet, and mobile.
- Reuse existing components before creating new ones.
- Build shared abstractions only when they have genuine reuse.
- Preserve routes, API contracts, permissions, persistence, business logic, and existing interactions.
- Do not add dependencies or hardcode fake business data for a visual redesign.
- Verify loading, empty, error, disabled, success, and keyboard-focus states where relevant.
- Review the complete changed files and check for unintended global styling effects.
