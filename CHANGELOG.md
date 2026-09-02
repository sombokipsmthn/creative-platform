# Changelog

All notable changes to the KIPSMTHN Creative Platform will be documented in this file.

## [2.0.0] - 2026-09-02

### Added

#### Design System
- **Centralized CSS tokens** in `src/app/globals.css`
  - Color system with light/dark mode support
  - Spacing scale (4px to 64px)
  - Border radius scale (6px to 30px)
  - Typography scale (12px to 60px)
  - Shadow/elevation tokens
- **Semantic CSS classes** for consistent UI:
  - `.ui-card`, `.ui-card-interactive`, `.ui-stat-card`
  - `.ui-button`, `.ui-button-primary`, `.ui-button-secondary`
  - `.ui-input`, `.ui-select`, `.ui-textarea`, `.ui-label`
  - `.ui-table`, `.ui-table-container`, `.ui-table-header`
  - `.ui-badge`, `.ui-status-badge` with status variants
  - `.ui-page-title`, `.ui-section-title`, `.ui-meta`, `.ui-eyebrow`
  - `.ui-card-grid`, `.ui-card-grid-2`, `.ui-card-grid-3`, `.ui-card-grid-4`
  - `.ui-empty-state`, `.ui-skeleton`, `.ui-divider`
- **Public site classes**:
  - `.public-card`, `.public-feature-card`, `.public-hero`

### Changed

#### Admin Dashboard (`src/app/admin/dashboard/page.tsx`)
- Replaced hardcoded card styles with `.ui-card` and `.ui-stat-card`
- Standardized panel components with `.ui-section-title` and `.ui-eyebrow`
- Unified button styling with `.ui-button` variants
- Improved spacing consistency throughout

#### Clients Page (`src/app/admin/clients/page.tsx`)
- Applied `.ui-card` and `.ui-card-interactive` for client cards
- Standardized form inputs with `.ui-input`, `.ui-select`, `.ui-label`
- Unified status badges with `.ui-status-badge`

#### Projects/Galleries Page (`src/app/admin/projects/page.tsx`)
- Replaced hardcoded gallery card styles with `.ui-card`
- Applied `.ui-image-container` and `.ui-aspect-*` utilities
- Standardized action buttons with `.ui-button`

#### Invoices Page (`src/app/admin/invoices/page.tsx`)
- Implemented `.ui-table-container` and `.ui-table` for invoice listing
- Applied `.ui-stat-card` for summary metrics
- Unified filter bar with `.ui-input` and `.ui-select`

#### Quotes Page (`src/app/admin/quotes/page.tsx`)
- Applied `.ui-table-container` for quotes listing
- Standardized status badges with `.ui-status-badge`
- Used `.ui-stat-card` for quote metrics

#### Expenses Page (`src/app/admin/expenses/page.tsx`)
- Implemented `.ui-stat-card` for expense metrics
- Applied `.ui-card` for receipt entries
- Standardized form inputs with semantic classes

#### Settings Page (`src/app/admin/settings/page.tsx`)
- Unified settings sections with `.ui-card`
- Standardized form controls with `.ui-input`, `.ui-select`
- Applied consistent tab navigation styling

#### Public Pages
- **Home** (`src/app/page.tsx`): Applied `.public-hero`, `.public-card`, `.page-shell`
- **About** (`src/app/about/page.tsx`): Standardized profile cards
- **Work** (`src/app/work/page.tsx`): Applied `.ui-card-grid` for portfolio
- **Services** (`src/app/services/page.tsx`): Unified service modules
- **Contact** (`src/app/contact/page.tsx`): Standardized contact cards

### Documentation

- Added `DESIGN_SYSTEM.md` - Complete design system documentation
- Updated `README.md` - Added design system section
- Created `CHANGELOG.md` - This file

### Technical

- Created `next.config.js` - Next.js configuration file
- Maintained backward compatibility with existing `btn-*` classes

## [1.0.0] - Previous Version

Initial platform release with:
- Basic CRUD operations for clients, quotes, invoices
- Client gallery system
- Equipment management
- Authentication with Clerk
- Database with Drizzle ORM
