# P2 — Product Completeness

**Status**: Ready for implementation  
**Date**: 2024-09-15  
**Timeline**: 3-4 weeks (1 dev), 2-3 weeks (2 devs)  
**Scope**: 4 major tasks across gallery themes, features, dashboard, and onboarding

---

## Summary of Tasks

| Task | Item | Status | Effort | Priority |
|------|------|--------|--------|----------|
| 12 | Gallery Themes (Minimal, Editorial, Cinematic, Mosaic, Story) | 🟡 Partial | 2-3 weeks | HIGH |
| 13 | Gallery V2 Feature Verification (10 features) | 🟡 Audit | 1 week | HIGH |
| 14 | Command Center Audit (Dashboard KPIs) | 🟡 Audit | 1 week | MEDIUM |
| 15 | Onboarding & Creator Profile Audit | 🟡 Audit | 1 week | MEDIUM |

---

## Task 12: Build Five Gallery Themes

### Current State
- `src/lib/gallery/themes.ts` has only `'reference-pending'` theme
- Database schema `galleryThemes` table supports themes
- Gallery viewer doesn't exist yet (needs build)
- No theme selector UI in admin

### Theme Specifications

#### 1. **Minimal**
- Clean, spacious, typography-focused
- Large single images with plenty of whitespace
- Minimal UI chrome
- Focus on image quality and breathing room
- Gallery metadata (title, description) in serif font
- Optional: Collections as simple numbered sections
- **Layout**: Custom single-image focus layout
- **Use Case**: High-end photography portfolios, minimalist design studios

#### 2. **Editorial**
- Magazine/newspaper-style layout
- Mixed image sizes with feature images
- Collections function as stories/articles
- Metadata (photo captions, descriptions) integrated
- Typography-driven, editorial feel
- **Layout**: Magazine grid with featured/hero image + supporting images
- **Use Case**: Photojournalism, editorial photographers, creative directors

#### 3. **Cinematic**
- Full-screen hero images
- Minimal UI (fade in on hover)
- Slideshow-like experience
- Dark theme, dramatic lighting
- Collections as scenes/chapters
- **Layout**: Fullscreen slideshow with navigation dots
- **Use Case**: Film/video production portfolios, cinematic photography

#### 4. **Mosaic**
- Dynamic grid with varied aspect ratios
- Images of different sizes arranged organically
- Playful, energetic feel
- Collections as visual groups
- **Layout**: Masonry with mixed aspect ratios (1:1, 2:1, 1:2, 16:9)
- **Use Case**: Event photographers, lifestyle photographers, diverse portfolios

#### 5. **Story**
- Sequential storytelling with annotations
- Each image tells part of a narrative
- Optional image-level captions/descriptions
- Timeline-like progression
- Collections function as chapters
- **Layout**: Vertical scroll story layout with captions
- **Use Case**: Wedding photographers, event coverage, narrative projects

### Deliverables

#### 1. Update Theme Registry
**File**: `src/lib/gallery/themes.ts`

```typescript
export type GalleryThemeId = 
  | 'minimal' 
  | 'editorial' 
  | 'cinematic' 
  | 'mosaic' 
  | 'story';

export type GalleryThemeDefinition = {
  id: GalleryThemeId;
  label: string;
  description: string;
  category: 'modern' | 'editorial' | 'cinematic' | 'playful' | 'narrative';
  presets: {
    // Theme-specific config presets
  };
};

export const GALLERY_THEMES: GalleryThemeDefinition[] = [
  // All 5 themes
];
```

#### 2. Gallery Viewer Components
**Files**: `src/components/gallery/viewers/`

- `GalleryViewerMinimal.tsx` — Minimal theme renderer
- `GalleryViewerEditorial.tsx` — Editorial theme renderer
- `GalleryViewerCinematic.tsx` — Cinematic theme renderer
- `GalleryViewerMosaic.tsx` — Mosaic theme renderer
- `GalleryViewerStory.tsx` — Story theme renderer
- `GalleryViewerWrapper.tsx` — Route viewer to correct theme based on theme ID

#### 3. Theme Selector UI
**File**: `src/app/admin/galleries/[id]/theme-selector.tsx`

- 5 theme cards with:
  - Live preview/screenshot
  - Theme name + description
  - Toggle selection
  - Preset options per theme
- Preview updates in real-time when switching

#### 4. Theme Configuration Component
**File**: `src/components/gallery/theme-settings.tsx`

- Color customization (if applicable to theme)
- Layout tweaks per theme
- Custom CSS option (for advanced users)
- Font/typography options

#### 5. API Endpoint Enhancement
**File**: `src/app/api/galleries/[id]/theme/route.ts`

```typescript
// GET — Fetch gallery theme config
// POST — Save theme + settings
// DELETE — Reset to default theme
```

#### 6. Database Seed
**File**: `drizzle/seed.ts` or migration

- Seed theme defaults to all galleries
- Add theme presets for quick switching

### Implementation Checklist

- [ ] Update `themes.ts` with all 5 theme definitions
- [ ] Create 5 gallery viewer components (Minimal, Editorial, Cinematic, Mosaic, Story)
- [ ] Build theme selector UI in gallery settings
- [ ] Build theme configuration panel
- [ ] Add API endpoint for theme GET/POST/DELETE
- [ ] Create theme preview component (for selector)
- [ ] Add theme to public gallery viewer (when accessing shared gallery)
- [ ] Test all 5 themes with sample galleries
- [ ] Write theme documentation (styling, customization options)

### Success Criteria

✅ All 5 themes load correctly in admin gallery settings  
✅ Theme selector shows live preview  
✅ Switching themes updates gallery immediately  
✅ Each theme accurately represents its specification  
✅ Public galleries render with selected theme  
✅ Theme customization options work per theme  

---

## Task 13: Verify Gallery V2 Features

### Features to Audit & Test

#### ✓ **1. Proofing**
**What it is**: Client access to gallery via shareable link + PIN  
**Database Support**: 
- `galleryAccessSessions` — Client sessions
- `galleryAccessAttempts` — Access attempts + rate limiting
- `galleries.accessPin` — Optional PIN for access

**Audit Checklist**:
- [ ] Verify PIN generation working
- [ ] Test session creation on gallery access
- [ ] Verify PIN validation logic (API endpoint)
- [ ] Test rate limiting on wrong PIN attempts
- [ ] Verify lockout mechanism after N attempts
- [ ] Test session expiry logic (if `expiresAt` set)

**API Endpoints**:
- `GET /api/galleries/[slug]/verify-pin` — Verify PIN
- `POST /api/galleries/[slug]/access` — Create session
- `GET /api/galleries/[slug]/photos` — Get gallery photos (with session token)

#### ✓ **2. Comments**
**What it is**: Photo-level feedback from clients  
**Database Support**:
- `galleryComments` — Comments on photos
  - `photoId` — Which photo
  - `sessionId` — Which client session
  - `body` — Comment text
  - `resolvedAt` — Mark comment as resolved
  - `authorName` — Client name

**Audit Checklist**:
- [ ] Verify comment creation API endpoint
- [ ] Test comment retrieval (per photo, per gallery)
- [ ] Verify comment author attribution
- [ ] Test comment resolution workflow
- [ ] Test comment deletion (by creator only)
- [ ] Test comments show/hide toggle per gallery

**API Endpoints**:
- `POST /api/galleries/[slug]/comments` — Add comment
- `GET /api/galleries/[slug]/comments` — Get all comments
- `PATCH /api/galleries/comments/[id]` — Update/resolve comment
- `DELETE /api/galleries/comments/[id]` — Delete comment

#### ✓ **3. Favorites**
**What it is**: Client can mark photos as favorites  
**Database Support**:
- `galleryPhotoActions` — Client actions (favorites, selections)
  - `isFavorite` — Boolean flag

**Audit Checklist**:
- [ ] Test favorite toggle (button shows state)
- [ ] Verify favorites persist across sessions
- [ ] Test favorite count display
- [ ] Verify creator can see client's favorites
- [ ] Test favorite list view (filter to only favorites)

**API Endpoints**:
- `POST /api/galleries/[slug]/photos/[photoId]/favorite` — Toggle favorite
- `GET /api/galleries/[slug]/photos?filter=favorites` — Get only favorites

#### ✓ **4. Selections**
**What it is**: Client can select/flag photos (e.g., "I like these")  
**Database Support**:
- `galleryPhotoActions` — Client actions
  - `isSelected` — Boolean flag

**Audit Checklist**:
- [ ] Test selection toggle (separate from favorites)
- [ ] Verify selections persist
- [ ] Test selection count display
- [ ] Verify creator can see client selections
- [ ] Test selection list view
- [ ] Test export selections (CSV/list)

**API Endpoints**:
- `POST /api/galleries/[slug]/photos/[photoId]/select` — Toggle selection
- `GET /api/galleries/[slug]/photos?filter=selected` — Get only selections
- `GET /api/galleries/[slug]/selections/export` — Export selections (CSV)

#### ✓ **5. Approval**
**What it is**: Gallery approval workflow (client approves all photos)  
**Database Support**:
- `galleryApprovals` — Gallery-level approval record
  - `status` — pending, approved, rejected
  - `requestedAt` — When creator asked for approval
  - `respondedAt` — When client responded
  - `responseNote` — Optional client note

**Audit Checklist**:
- [ ] Test approval request workflow (creator → client)
- [ ] Verify approval request email/notification
- [ ] Test client approval response (approve/reject)
- [ ] Verify approval status persists
- [ ] Test rejection reason/note capture
- [ ] Test approval timeline (created, requested, responded dates)

**API Endpoints**:
- `POST /api/galleries/[id]/approvals/request` — Request approval
- `PATCH /api/galleries/[id]/approvals/respond` — Respond to approval request

#### ✓ **6. Downloads**
**What it is**: Client can download photos with optional watermark  
**Database Support**:
- `galleryDownloads` — Download log for tracking
  - `photoId` — Which photo
  - `sessionId` — Which session
  - `downloadType` — single or batch
  - `presetId` — Which preset used
  - `createdAt` — Timestamp
- `galleries.allowDownloads` — Toggle downloads on/off per gallery

**Audit Checklist**:
- [ ] Verify download toggle in gallery settings
- [ ] Test single photo download
- [ ] Test batch download (multiple photos as ZIP)
- [ ] Verify download includes/excludes watermark based on preset
- [ ] Test download logging/tracking
- [ ] Verify download count display
- [ ] Test download access control (PIN required if set)

**API Endpoints**:
- `GET /api/galleries/[slug]/photos/[photoId]/download` — Download single photo
- `POST /api/galleries/[slug]/photos/download-batch` — Download multiple photos

#### ✓ **7. Download Presets**
**What it is**: Predefined download options (e.g., "Social - 1080px", "Print - Full Res")  
**Database Support**:
- `galleryDownloadPresets` — Preset definitions
  - `name` — "Social Media", "Print", "Web", etc.
  - `maxWidth` — Max pixel width
  - `quality` — JPEG quality (0-100)
  - `format` — jpg, png, webp
  - `includeWatermark` — Boolean

**Audit Checklist**:
- [ ] Verify default presets created per gallery
- [ ] Test preset creation/edit/delete
- [ ] Verify preset shows in download UI
- [ ] Test preset download applies correct settings
- [ ] Test image resizing per preset
- [ ] Test watermark application per preset
- [ ] Verify preset list shows in gallery settings

**API Endpoints**:
- `GET /api/galleries/[id]/download-presets` — List presets
- `POST /api/galleries/[id]/download-presets` — Create preset
- `PATCH /api/galleries/[id]/download-presets/[presetId]` — Update preset
- `DELETE /api/galleries/[id]/download-presets/[presetId]` — Delete preset

#### ✓ **8. Watermarking**
**What it is**: Add creator branding watermark to photos  
**Database Support**:
- `galleryWatermarks` — Watermark config per gallery
  - `enabled` — Boolean toggle
  - `text` — Watermark text (e.g., "KIPSMTHN")
  - `position` — bottom-right, bottom-center, center, etc.
  - `opacity` — 0-100%
  - `fontSize` — Font size in pixels

**Audit Checklist**:
- [ ] Test watermark toggle on/off
- [ ] Test watermark text customization
- [ ] Test watermark position options (5+ positions)
- [ ] Test watermark opacity slider
- [ ] Test watermark preview in gallery
- [ ] Test watermark on downloads (if enabled in preset)
- [ ] Verify watermark applies to display/thumbnail variants (not original)

**API Endpoints**:
- `GET /api/galleries/[id]/watermark` — Get watermark config
- `PATCH /api/galleries/[id]/watermark` — Update watermark

#### ✓ **9. Expiry**
**What it is**: Gallery/session expiration for time-limited sharing  
**Database Support**:
- `galleryAccessSessions.expiresAt` — Session expiry timestamp
- `galleries.publishedAt` — Gallery publish date (optional for expiry logic)

**Audit Checklist**:
- [ ] Test session expiry date setting (admin)
- [ ] Verify expired sessions redirect to error page
- [ ] Test expiry countdown display (for clients)
- [ ] Verify expiry enforcement (API level)
- [ ] Test expiry warning (e.g., "expires in 3 days")
- [ ] Verify refresh/extend session (creator can extend)

**API Endpoints**:
- `POST /api/galleries/[id]/access/extend` — Extend session expiry
- `GET /api/galleries/[slug]/access/check` — Check if access valid/expired

#### ✓ **10. PIN / Security**
**What it is**: Access PIN + rate limiting + attempt tracking  
**Database Support**:
- `galleries.accessPin` — PIN hash
- `galleryAccessAttempts` — Attempt tracking
  - `galleryId`, `ipAddress`, `attemptCount`, `lastAttemptAt`, `lockoutUntil`

**Audit Checklist**:
- [ ] Test PIN generation (admin can set custom PIN)
- [ ] Test PIN entry UI (client side)
- [ ] Verify PIN validation (API side)
- [ ] Test rate limiting (max attempts before lockout)
- [ ] Verify lockout mechanism (temp IP ban)
- [ ] Test brute force protection
- [ ] Verify attempt logging for security audit
- [ ] Test PIN reset (creator can issue new PIN)

**API Endpoints**:
- `POST /api/galleries/[slug]/verify-access` — Verify PIN + create session
- `POST /api/galleries/[id]/access/reset-pin` — Reset PIN to new value

### Implementation Checklist

- [ ] Audit each feature's API endpoints
- [ ] Test each feature in public gallery viewer
- [ ] Test in proofing/client portal
- [ ] Verify all features work together (no conflicts)
- [ ] Create feature test suite (automated tests)
- [ ] Document feature usage in admin UI
- [ ] Create user guide for creators (how to enable/use each feature)
- [ ] Test on staging database
- [ ] Fix any bugs discovered during audit

### Success Criteria

✅ All 10 features have working API endpoints  
✅ All features render correctly in gallery UI  
✅ Client can perform all actions (comment, favorite, select, download, etc.)  
✅ Creator can manage all feature settings  
✅ All features integrate smoothly (no conflicts or data loss)  
✅ Security controls in place (PINs, rate limiting, expiry)  
✅ Download presets and watermarking work correctly  

---

## Task 14: Audit Command Center (Dashboard)

### Current Implementation
- Dashboard exists at `/src/app/admin/dashboard/page.tsx`
- Has KPI widgets, financial summaries, activity feed
- Uses `DashboardStats` TypeScript interface

### Audit Scope

#### **Section 1: KPI Overview**
**Current Metrics**:
- Clients (total, new, active)
- Projects (total, new, active, completed)
- Quotes (total, new)
- Invoices (total, new)
- Galleries (total, new)

**To Audit**:
- [ ] Verify count queries are accurate
- [ ] Test date range filtering (7d, 30d, 90d, 12m, all)
- [ ] Verify "new" calculations correct
- [ ] Verify "active" status logic correct
- [ ] Check for missing KPIs (should match original requirements)

**Potential Missing**:
- Active clients (by recent activity)
- Overdue/at-risk projects
- Payment status breakdown

#### **Section 2: Financial Dashboard**
**Current Metrics**:
- Period quoted value
- Accepted quote value
- Period invoiced value
- Period paid value
- Overdue invoices

**To Audit**:
- [ ] Verify currency handling (KES + others)
- [ ] Test calculation accuracy (quote total vs. sum of items)
- [ ] Verify invoice paid tracking
- [ ] Test overdue calculation (invoice dueDate < today)
- [ ] Verify financial graphs/charts working

**Potential Missing**:
- Revenue trend (chart over time)
- Outstanding balance (awaiting payment)
- Profitability by client
- Profitability by project

#### **Section 3: Quote Status Tracking**
**Current Statuses**:
- Draft, Sent, Approved, Converted (?)

**To Audit**:
- [ ] Verify status values match quote schema
- [ ] Test status transitions (draft → sent → approved → converted)
- [ ] Verify conversion rate calculation correct
- [ ] Verify quote expiry tracking
- [ ] Test quote age/staleness (unsent for N days)

**Potential Missing**:
- Quotes expiring soon (warning)
- Rejected quotes
- Quote approval pending

#### **Section 4: Invoice Status Tracking**
**Current Statuses**:
- Draft, Sent, Overdue, Paid

**To Audit**:
- [ ] Verify status values match invoice schema
- [ ] Test status transitions
- [ ] Verify overdue calculation
- [ ] Test payment tracking
- [ ] Verify payment due date accuracy

**Potential Missing**:
- Partially paid invoices
- Payment schedule (e.g., "50% due on approval, 50% on delivery")

#### **Section 5: Gallery Status Tracking**
**Current Statuses**:
- Draft, Published, Archived

**To Audit**:
- [ ] Verify status values match gallery schema
- [ ] Test status display accuracy
- [ ] Verify gallery publish state in public API

**Potential Missing**:
- Galleries awaiting approval
- Galleries with pending client feedback

#### **Section 6: Attention/Alerts Section**
**Currently Shows**:
- Overdue invoices count
- Pending quotes count
- Active projects count
- Active galleries count

**To Audit**:
- [ ] Verify each count is accurate
- [ ] Test alert thresholds (e.g., "2+ overdue" triggers red state)
- [ ] Verify links to detail views
- [ ] Test actionability (can click alert to see list)

**Potential Missing**:
- Quotes expiring soon
- Contracts awaiting signature
- Tax/eTIMS compliance alerts
- Payment reminders

#### **Section 7: Activity Feed**
**Currently Shows**:
- Recent client, project, quote, invoice, gallery activities
- Activity type + title + description + date

**To Audit**:
- [ ] Verify activities logged correctly
- [ ] Test activity ordering (newest first)
- [ ] Verify activity icons match type
- [ ] Test activity date formatting
- [ ] Verify activity privacy (only show creator's activities)

**Potential Missing**:
- Filterable activity feed (by type)
- Activity search
- Activity export (audit log)

#### **Section 8: Quick Actions**
**Currently Shows**:
- Buttons to create new items (client, project, quote, invoice, gallery)

**To Audit**:
- [ ] Verify all quick action buttons working
- [ ] Test button routing/navigation
- [ ] Verify icons match actions

**Potential Missing**:
- "View recent X" actions
- "Generate tax report" action
- "Download all invoices" action

#### **Section 9: Time Range Filter**
**Currently Supports**: 7d, 30d, 90d, 12m, all time

**To Audit**:
- [ ] Verify date range calculations
- [ ] Test filter application across all sections
- [ ] Verify default selection (likely 30d)
- [ ] Test URL param persistence (can bookmark filtered view)

### Deliverables

#### 1. Audit Report
**File**: `P2_COMMAND_CENTER_AUDIT.md`

- Current dashboard widgets documented
- Missing widgets identified
- Calculation accuracy verified
- Recommendations for improvements

#### 2. Missing Widget Implementation (if needed)
**Possible new widgets**:
- Revenue trend chart (KPI over time)
- Overdue balance widget
- Client profitability breakdown
- Project timeline/Gantt view
- Tax compliance status
- Payment health score

#### 3. Dashboard Enhancements
**Potential improvements**:
- Export dashboard to PDF
- Dashboard customization (choose which widgets to show)
- More granular date filtering (custom date range picker)
- Comparison view (this period vs. last period)

### Success Criteria

✅ All current widgets verified accurate  
✅ Any missing widgets identified and documented  
✅ Financial calculations verified correct  
✅ KPI counts match actual database data  
✅ All features (filters, quick actions) working  
✅ Dashboard loads performantly  

---

## Task 15: Audit Onboarding & Creator Profile

### Current Implementation
- Onboarding flow at `/src/app/admin/onboarding`
- 4-step process:
  1. Profile (name, handle, bio, website, location)
  2. Services (add creator services with rates)
  3. Business (KRA PIN, VAT, WHT, deposit %)
  4. Finish (review + complete)

- Creator profile in `creatorProfiles` table
- Business profile in `creatorBusinessProfiles` table

### Audit Scope

#### **Step 1: Profile Setup**
**Current Fields**:
- Display name
- Creator handle
- Bio
- Website (optional)
- Location (optional)
- Avatar (from Clerk)

**To Audit**:
- [ ] Verify all fields save correctly
- [ ] Test handle validation (allowed characters, uniqueness)
- [ ] Test avatar display
- [ ] Verify profile accessible after onboarding
- [ ] Test profile edit after onboarding

**Potential Missing**:
- Social links (Instagram, Twitter, LinkedIn, etc.)
- Portfolio website verification
- Creator category/specialization

#### **Step 2: Services Setup**
**Current Features**:
- Quick-add 9 preset services
- Custom service addition
- Service name, description, category, default rate
- Rate options: Full Day, Half Day, Hourly

**To Audit**:
- [ ] Verify preset services add correctly
- [ ] Test custom service creation
- [ ] Verify rate calculations
- [ ] Test service editing/deletion
- [ ] Verify minimum 1 service required
- [ ] Test service visibility on creator profile

**Potential Missing**:
- Service packages (bundles of services)
- Service templates (starter kits)
- Service rate history (track rate changes)
- Equipment rental rates (if needed)

#### **Step 3: Business Setup**
**Current Fields**:
- Business name (optional)
- Phone number
- KRA PIN
- VAT registered (toggle)
- VAT number
- Currency selection (KES, USD, EUR)
- Deposit percentage (default 50%)
- WHT rate

**To Audit**:
- [ ] Verify KRA PIN validation/formatting
- [ ] Test VAT toggle (shows/hides VAT field)
- [ ] Verify VAT number validation
- [ ] Test currency selection accuracy
- [ ] Verify deposit % applied to quotes
- [ ] Test WHT rate usage (if applicable)
- [ ] Verify business data saved correctly

**Issues Found**:
- Fields are entirely optional (can skip with empty values)
- No validation on KRA PIN format
- No validation on VAT number format
- No integration with eTIMS (see P1 Recovery Item 10)

#### **Step 4: Finish / Review**
**Current Features**:
- Review summary of all entered data
- Option to edit previous steps
- Finish button marks onboarding complete

**To Audit**:
- [ ] Verify summary displays correct data
- [ ] Test back buttons (can edit previous steps)
- [ ] Verify completion status updates
- [ ] Test redirect to dashboard after completion
- [ ] Verify onboarding email (if sent)

### Potential Enhancements

#### 1. **Additional Profile Fields**
- Social media links
- Creator specialization/category tags
- Timezone (for scheduling)
- Preferred currency (default for all quotes/invoices)

#### 2. **Service Enhancements**
- Service photos/portfolio
- Service skill tags (e.g., "portrait", "product", "event")
- Service availability calendar
- Service testimonials/ratings

#### 3. **Business Enhancements**
- Bank account setup (for payments)
- Tax file number (TFN) / ID verification
- Insurance/licensing info
- Compliance checklist (tax registration, business license)

#### 4. **Portfolio Visibility Setup**
- Should portfolio auto-publish? (Yes/No)
- Public portfolio settings (which projects to show)
- Portfolio SEO optimization (keywords, description)

#### 5. **Integration Setup**
- Google Drive folder selection (for Drive import)
- Payment processor setup (Stripe, M-Pesa, etc.)
- Email template preferences

### Deliverables

#### 1. Onboarding Audit Report
**File**: `P2_ONBOARDING_AUDIT.md`

- Current flow documented
- Missing fields identified
- Validation gaps noted
- User experience recommendations

#### 2. Profile Completeness Check
**File**: `src/app/admin/profile/completeness.tsx` (component)

- Show profile completion % in dashboard
- Highlight missing fields
- Suggest next steps for profile completion

#### 3. Business Setup Validation
**File**: `src/lib/onboarding/validation.ts`

- KRA PIN format validation
- VAT number format validation
- Currency and payment info validation
- Tax compliance checklist

### Success Criteria

✅ Onboarding flow complete and verified  
✅ All data saves correctly to database  
✅ Profile accessible and editable post-onboarding  
✅ Services configuration working  
✅ Business details (KRA PIN, VAT, etc.) saved correctly  
✅ Onboarding completion tracked accurately  
✅ No missing required fields in final flow  

---

## Implementation Order

### Week 1-2: Gallery Themes (Task 12)
**Parallel tracks possible**:
- Track A: Theme registry + viewer components (2 dev-days)
- Track B: Theme selector UI + settings (1 dev-day)
- Track C: API endpoints + integration (1 dev-day)

**Dependencies**: None (can start immediately)

### Week 2-3: Feature Verification (Task 13)
**Single track** (best done by one person sequentially):
- Gallery feature audit checklist (3 days)
- Missing API endpoint implementation (if needed) (2-3 days)
- Feature testing + bug fixes (2-3 days)

**Dependencies**: Task 12 (needs themes to test with)

### Week 3: Dashboard & Onboarding Audits (Tasks 14-15)
**Can run in parallel**:
- Task 14: Dashboard audit (2 days)
- Task 15: Onboarding audit (2 days)
- Both can generate audit reports independently

**Dependencies**: None (audits only)

---

## Success Metrics

### Task 12 ✅
- All 5 themes render correctly
- Theme switching works instantly
- Themes match specifications
- Public galleries display with correct theme

### Task 13 ✅
- All 10 features verified working
- No data loss or conflicts
- Security controls functional
- Client actions persist across sessions

### Task 14 ✅
- All KPIs accurate within ±2%
- Date range filtering works
- Financial summaries calculated correctly
- Dashboard loads in <2 seconds

### Task 15 ✅
- Onboarding completion rate > 95%
- All required fields validated
- Profile data complete and accessible
- No orphaned records in database

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Theme rendering performance | Slow gallery load | MEDIUM | Test with 1000+ photos, optimize image loading |
| Missing features | Incomplete feature set | MEDIUM | Reference schema closely, test each feature |
| Dashboard calculation errors | Inaccurate KPIs | LOW | Unit test all calculations, compare to raw SQL |
| Onboarding UX issues | High abandonment | LOW | A/B test, track completion funnel |

---

## Questions for Product Owner

**Task 12 — Gallery Themes**:
1. Should themes be locked to pricing tier (e.g., Editorial/Cinematic for Pro only)?
2. Should creators be able to combine themes (e.g., Minimal layout + Story navigation)?

**Task 13 — Gallery Features**:
1. Should comments require client approval before showing to creator?
2. Should download presets be shared across galleries, or unique per gallery?

**Task 14 — Dashboard**:
1. What's the most important KPI to display first (revenue, active clients, quote conversion)?
2. Should dashboard show projections/forecasts?

**Task 15 — Onboarding**:
1. Should business setup be required or optional?
2. Should onboarding support multi-currency setup initially, or KES-only?

---

**Generated**: 2024-09-15  
**Scope**: P2 Completeness (Tasks 12-15)  
**Status**: Ready for implementation
