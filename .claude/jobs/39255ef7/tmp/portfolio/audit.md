# Creator Portfolio — Audit & Gap Analysis

## Current State (What Exists)

### Database Schema (`src/db/schema.ts`)
- **projects table**: Has `id`, `creatorId`, `clientId`, `name`, `description`, `scopeOfWork`, `deliverables`, `totalAmount`, `currency`, `paymentTerms`, `revisionsPolicy`, `licensingTerms`, `noticePeriod`, `status`, `startDate`, `endDate`, `createdAt`, `updatedAt`
- **Missing for portfolio**: `slug` (unique), `publishedAt`, `featured`, `category`/`type`, `coverImageId`, `shortDescription`, `fullStory` (overview, challenge, approach, outcome, credits), `location`, `year`, `services`, `disciplines`, `collaborators`, `role`, `visibility` (public/private/draft)

### API Routes
- **GET /api/projects** - Lists projects with client join, filters by status/clientId ✅
- **POST /api/projects** - Creates project ✅
- **GET /api/projects/calendar** - Calendar view ✅
- **Missing**: GET/PATCH/DELETE `/api/projects/[id]`, publish/unpublish, reorder, media management, slug handling

### Admin UI (`src/app/admin/projects/page.tsx`)
- Full project list with filtering, search, status counts ✅
- Create project modal with all current fields ✅
- View project modal with status update ✅
- **Missing**: Edit project, media management, cover image, featured toggle, publish toggle, slug, preview, delete/archive

### Admin Detail Page (`src/app/admin/projects/[id]/page.tsx`)
- Currently redirects to galleries (placeholder) ⚠️

### Public Work Page (`src/app/work/page.tsx`)
- Hardcoded demo data (4 categories, 12 projects) ⚠️
- Pillar filter + All/Category tabs ✅
- Beautiful card grid with featured project spanning 2 columns ✅
- **Must connect to real database**

### Public Gallery API (`src/app/api/public/galleries/[slug]/route.ts`)
- Public access by slug ✅
- Checks publish status ✅
- Returns gallery with cover, client, project info ✅

### Storage & Media
- Vercel Blob / R2 abstraction (`src/lib/gallery/storage.ts`) ✅
- Image processing with watermark, thumbnails ✅
- Video processing support ✅
- **Gallery photos table** has: `original_url`, `display_url`, `thumbnail_url`, `storage_path`, `sort_order`, `is_hidden`, `is_favorite`, `is_selected` ✅

### Authentication
- `withCreatorApi` wrapper for creator-owned operations ✅
- `getCurrentUser()` from Clerk + local user ✅
- `assertOwnership` helpers ✅

### Design System
- CSS variables for colors, spacing, typography ✅
- UI components: Button, Input, Card, ImageCard, MediaCard, StatCard, Badge ✅
- Framer Motion available ✅
- Montserrat font ✅

## Gaps to Implement

### Phase 2: Data Layer
1. **Schema migration** - Add portfolio fields to `projects` table:
   - `slug` (unique, required for public URLs)
   - `publishedAt` (timestamp)
   - `featured` (boolean)
   - `shortDescription` (text)
   - `category` (text - Photography, Videography, Branding, UI/UX, etc.)
   - `coverImageId` (uuid, FK to gallery_photos or project_media)
   - `year` (text)
   - `location` (text)
   - `services` (jsonb)
   - `disciplines` (jsonb)
   - `collaborators` (jsonb)
   - `role` (text)
   - `story_overview` (text)
   - `story_challenge` (text)
   - `story_approach` (text)
   - `story_outcome` (text)
   - `story_credits` (text)
   - `visibility` (enum: public, private, draft)
   - Indexes on slug, featured, publishedAt, visibility

2. **Project media table** - Either extend `gallery_photos` or create `project_media`:
   - Option A: Use existing `gallery_photos` with `project_id` (already exists as FK) + new gallery type "portfolio"
   - Option B: New `project_media` table for portfolio-specific media

### Phase 3: Admin Portfolio
1. **API routes**:
   - GET `/api/projects/[id]` - single project
   - PATCH `/api/projects/[id]` - update project (all fields)
   - DELETE `/api/projects/[id]` - delete/archive
   - POST `/api/projects/[id]/publish` - publish
   - POST `/api/projects/[id]/unpublish` - unpublish
   - POST `/api/projects/reorder` - reorder featured/projects
   - GET/POST `/api/projects/[id]/media` - manage project media
   - PATCH `/api/projects/[id]/media/[mediaId]` - update media (caption, alt, order)
   - DELETE `/api/projects/[id]/media/[mediaId]` - delete media
   - POST `/api/projects/[id]/media/[mediaId]/cover` - set cover

2. **Admin project detail page** (`/admin/projects/[id]`):
   - Multi-step editor (Basic info → Story → Media → Portfolio settings → Review)
   - Image/video upload using existing gallery upload infrastructure
   - Cover image selection
   - Media reordering (drag & drop)
   - Featured toggle
   - Published/Draft toggle
   - Slug editor with collision handling
   - Live preview button (opens public project page)

### Phase 4: Public Portfolio
1. **Public project page** (`/work/[slug]`):
   - Hero with cover image
   - Title, short description
   - Metadata (client, year, category, location, role, services)
   - Full story sections (overview, challenge, approach, outcome, credits)
   - Supporting media gallery
   - Navigation (prev/next project, back to portfolio)
   - Contact/CTA section

2. **Portfolio index** (`/work`):
   - Replace hardcoded data with database query
   - Filter by category
   - Featured projects first
   - Published-only filter
   - SEO metadata per project

### Phase 5: Security + Validation
- All creator-owned mutations verify ownership via `creatorId`
- Public routes only return `publishedAt IS NOT NULL` AND `visibility = 'public'`
- Draft/private projects never exposed publicly
- Slug uniqueness enforced at DB level
- Input validation on all API routes

### Phase 6: Testing
- TypeScript check
- ESLint
- Build
- Unit tests for new API routes
- Integration tests for admin flows
- Public route security tests

## Architecture Decisions

1. **Project Media**: Use existing `gallery_photos` table with a special `project_id` FK. Create a "portfolio" gallery type or just attach photos directly to projects. Since galleries are for client delivery and projects are for portfolio, better to have a separate `project_media` table to avoid confusion. But the schema already has `projectId` on galleries. Simpler: create a `project_media` table that mirrors `gallery_photos` structure but for portfolio projects.

2. **Slug generation**: Auto-generate from title on create, allow manual edit, handle collisions with suffix.

3. **Cover image**: Reference to `project_media.id` or `gallery_photos.id`.

4. **Categories**: Use existing project categories from work page (Photography, Videography, Branding, UI/UX) as enum or free text.

5. **Public routes**: `/work` for index, `/work/[slug]` for project detail. Keep `/work` as the public portfolio route.

6. **Admin nav**: Add "Portfolio" to admin sidebar under Content section (separate from Galleries).