# Gallery V2 Features Audit Checklist

**Date**: 2024-09-15  
**Status**: Ready for verification  
**Scope**: 10 core gallery features

---

## Quick Reference

| # | Feature | Status | Confidence | Priority |
|---|---------|--------|-----------|----------|
| 1 | Proofing (PIN + Sessions) | 🟢 Schema Ready | HIGH | HIGH |
| 2 | Comments | 🟢 Schema Ready | HIGH | HIGH |
| 3 | Favorites | 🟢 Schema Ready | HIGH | HIGH |
| 4 | Selections | 🟢 Schema Ready | HIGH | HIGH |
| 5 | Approval Workflow | 🟢 Schema Ready | HIGH | MEDIUM |
| 6 | Downloads | 🟢 Schema Ready | HIGH | HIGH |
| 7 | Download Presets | 🟢 Schema Ready | HIGH | HIGH |
| 8 | Watermarking | 🟢 Schema Ready | HIGH | HIGH |
| 9 | Expiry (Sessions) | 🟢 Schema Ready | HIGH | MEDIUM |
| 10 | PIN / Security | 🟢 Schema Ready | HIGH | HIGH |

---

## Feature 1: Proofing (PIN + Client Sessions)

### Schema Support
✓ `galleryAccessSessions` — Client sessions  
✓ `galleries.accessPin` — PIN for access  
✓ `galleryAccessAttempts` — Attempt tracking  

### Test Cases

- [ ] **PIN Generation**: Admin can set custom PIN for gallery
- [ ] **PIN Validation**: Client enters PIN, system validates it
- [ ] **Session Creation**: Valid PIN creates a session token
- [ ] **Session Persistence**: Session token allows gallery access across visits
- [ ] **Session Expiry**: Session expires after `expiresAt` timestamp
- [ ] **Rate Limiting**: Max 5 failed PIN attempts before lockout
- [ ] **Lockout Duration**: IP locked for 15 minutes after max attempts
- [ ] **Rate Limit Reset**: Counter resets after successful access
- [ ] **Client Portal Access**: Valid session allows full gallery access

### API Endpoints to Test
```
POST   /api/galleries/[slug]/verify-access      — Verify PIN + create session
GET    /api/galleries/[slug]/access/status      — Check if session valid
POST   /api/galleries/[id]/access/extend        — Extend session expiry
POST   /api/galleries/[id]/access/reset-pin     — Generate new PIN (creator only)
```

### Implementation Notes
- [ ] Verify PIN hashing (never store plain PIN)
- [ ] Test session token generation (unique, cryptographically secure)
- [ ] Confirm rate limiting is IP-based
- [ ] Verify lockout shows user-friendly error message

---

## Feature 2: Comments

### Schema Support
✓ `galleryComments` — Photo-level comments  
  - `photoId` → links to photo  
  - `sessionId` → links to client session  
  - `body` → comment text  
  - `resolvedAt` → mark as addressed  
  - `authorName` — Client name  

### Test Cases

- [ ] **Add Comment**: Client can comment on photo
- [ ] **Comment Attribution**: Comment shows client name + date
- [ ] **Comment Persistence**: Comments visible on subsequent visits
- [ ] **Comment Retrieval**: Creator can see all comments per gallery
- [ ] **Comment Resolution**: Creator marks comment as resolved
- [ ] **Comment Filtering**: Show unresolved comments first
- [ ] **Comment Deletion**: Only creator can delete comments
- [ ] **Comment Count**: Display count of unresolved comments
- [ ] **No Anonymous Comments**: Comments require valid session

### API Endpoints to Test
```
POST   /api/galleries/[slug]/comments              — Add comment
GET    /api/galleries/[slug]/comments              — Get all comments
GET    /api/galleries/[slug]/photos/[photoId]/comments — Get photo comments
PATCH  /api/galleries/comments/[id]                — Update/resolve comment
DELETE /api/galleries/comments/[id]                — Delete comment
```

### Implementation Notes
- [ ] Verify comment text sanitized (no XSS)
- [ ] Test comment timestamp accuracy
- [ ] Confirm only authenticated sessions can comment
- [ ] Verify creator notifications on new comments (if implemented)

---

## Feature 3: Favorites

### Schema Support
✓ `galleryPhotoActions.isFavorite` — Boolean flag per session  
✓ `galleryPhotos.isFavorite` — Default favorite state  

### Test Cases

- [ ] **Toggle Favorite**: Client can mark photo as favorite
- [ ] **Favorite Persistence**: Favorites persist across sessions
- [ ] **Favorite Count**: Gallery shows total favorites per photo
- [ ] **Favorite List**: Filter view to show only favorited photos
- [ ] **Creator Visibility**: Creator can see which client favorited which photos
- [ ] **Favorite Icon**: UI clearly shows favorite state (filled/unfilled)
- [ ] **Batch Favorite**: Client can favorite multiple photos quickly
- [ ] **Favorite Export**: Creator can export list of favorited photos

### API Endpoints to Test
```
POST   /api/galleries/[slug]/photos/[photoId]/favorite  — Toggle favorite
GET    /api/galleries/[slug]/photos?filter=favorites   — Get only favorites
GET    /api/galleries/[id]/favorites/summary            — Get favorite stats
```

### Implementation Notes
- [ ] Test favorite button state transitions
- [ ] Verify favorite count updates in real-time
- [ ] Confirm favorites isolated per client session
- [ ] Check favorite data persists during session expiry

---

## Feature 4: Selections

### Schema Support
✓ `galleryPhotoActions.isSelected` — Boolean flag per session  
✓ `galleryPhotos.isSelected` — Default selection state  

### Test Cases

- [ ] **Toggle Selection**: Client can select/deselect photos
- [ ] **Selection Persistence**: Selections persist across visits
- [ ] **Selection Count**: Show count of selected photos
- [ ] **Selection List**: View shows all selected photos together
- [ ] **Creator Visibility**: Creator can see which photos client selected
- [ ] **Selection Export**: Creator can export selected photos as list
- [ ] **Download Selections**: Client can download all selected photos at once
- [ ] **Clear Selections**: Client can clear all selections
- [ ] **Separate from Favorites**: Selections work independently from favorites

### API Endpoints to Test
```
POST   /api/galleries/[slug]/photos/[photoId]/select    — Toggle selection
GET    /api/galleries/[slug]/photos?filter=selected     — Get selected only
POST   /api/galleries/[slug]/selections/download        — Download all selected
GET    /api/galleries/[id]/selections/export            — Export list (CSV)
POST   /api/galleries/[id]/selections/clear             — Clear all selections
```

### Implementation Notes
- [ ] Verify selection badge shows distinct styling from favorites
- [ ] Test bulk download of selections (ZIP file)
- [ ] Confirm CSV export includes filename, date, client name
- [ ] Verify selections cleared on session expiry (if applicable)

---

## Feature 5: Approval Workflow

### Schema Support
✓ `galleryApprovals` — Gallery-level approval record  
  - `status` — pending, approved, rejected  
  - `requestedAt` — When creator asked  
  - `respondedAt` — When client responded  
  - `responseNote` — Client's note  

### Test Cases

- [ ] **Request Approval**: Creator requests gallery approval
- [ ] **Approval Notification**: Client receives notification to approve
- [ ] **Client Approval**: Client can approve/reject gallery
- [ ] **Approval Status**: Gallery shows approval state (pending/approved/rejected)
- [ ] **Rejection Reason**: Client can provide rejection note
- [ ] **Approval Timeline**: Show requested/responded dates
- [ ] **Re-request**: Creator can re-request after rejection
- [ ] **Approval Lock**: Approved galleries show "approved" badge
- [ ] **Timeline View**: Show approval history

### API Endpoints to Test
```
POST   /api/galleries/[id]/approvals/request     — Request approval
GET    /api/galleries/[id]/approval/status       — Get current status
PATCH  /api/galleries/[id]/approvals/respond     — Approve/reject
GET    /api/galleries/[id]/approvals/history     — Get approval history
```

### Implementation Notes
- [ ] Verify approval is per-gallery, not per-photo
- [ ] Test email notification to client
- [ ] Confirm rejection note appears in creator dashboard
- [ ] Verify approval process doesn't affect download/comment functionality

---

## Feature 6: Downloads

### Schema Support
✓ `galleryDownloads` — Download log for tracking  
✓ `galleries.allowDownloads` — Enable/disable toggle  
✓ `galleryDownloadPresets` — Download options  

### Test Cases

- [ ] **Downloads Toggle**: Creator can enable/disable downloads per gallery
- [ ] **Single Download**: Client can download individual photos
- [ ] **Batch Download**: Client can download multiple photos as ZIP
- [ ] **Download Type**: System logs "single" vs "batch" downloads
- [ ] **Download Count**: Track how many times each photo downloaded
- [ ] **Download Log**: Creator can view download history
- [ ] **Preset Applied**: Downloads use selected preset settings
- [ ] **Watermark Applied**: Watermark included if preset enabled
- [ ] **File Naming**: Downloaded files have meaningful names
- [ ] **Disabled Downloads**: If disabled, download button hidden from client

### API Endpoints to Test
```
GET    /api/galleries/[slug]/photos/[photoId]/download      — Download single
POST   /api/galleries/[slug]/photos/download-batch          — Download multiple
GET    /api/galleries/[id]/downloads/log                    — View download history
GET    /api/galleries/[id]/download-stats                   — Download analytics
```

### Implementation Notes
- [ ] Verify download requires valid session
- [ ] Test ZIP creation for batch downloads
- [ ] Confirm file sizes reasonable (don't max out bandwidth)
- [ ] Verify download count increments correctly
- [ ] Test download on poor network (resume capability?)

---

## Feature 7: Download Presets

### Schema Support
✓ `galleryDownloadPresets` — Preset definitions  
  - `name` — "Social Media", "Print", etc.  
  - `maxWidth` — Max pixel width  
  - `quality` — JPEG quality 0-100  
  - `format` — jpg, png, webp  
  - `includeWatermark` — Boolean  

### Test Cases

- [ ] **Default Presets**: Gallery created with sensible defaults (Social, Print, Web)
- [ ] **Create Preset**: Creator can create new custom preset
- [ ] **Edit Preset**: Creator can modify preset settings
- [ ] **Delete Preset**: Creator can remove preset (keep at least 1)
- [ ] **Preset List**: Gallery settings show all presets
- [ ] **Quality Setting**: Different quality levels produce different file sizes
- [ ] **Format Support**: jpg, png, webp all work
- [ ] **Dimension Limiting**: Max width is enforced during download
- [ ] **Watermark Toggle**: Watermark included/excluded per preset
- [ ] **Preset Selection**: Client can choose preset before downloading

### API Endpoints to Test
```
GET    /api/galleries/[id]/download-presets              — List all presets
POST   /api/galleries/[id]/download-presets              — Create preset
PATCH  /api/galleries/[id]/download-presets/[presetId]  — Update preset
DELETE /api/galleries/[id]/download-presets/[presetId]  — Delete preset
GET    /api/galleries/[id]/download-presets/default      — Get default presets
```

### Implementation Notes
- [ ] Verify default presets include: "Social Media" (1080px, jpg), "Print" (3000px, jpg), "Web" (1920px, jpg)
- [ ] Test image resizing (use sharp or similar library)
- [ ] Confirm watermark applied before resizing
- [ ] Verify preset names unique per gallery
- [ ] Test that deleting preset doesn't break existing downloads

---

## Feature 8: Watermarking

### Schema Support
✓ `galleryWatermarks` — Watermark config per gallery  
  - `enabled` — Boolean toggle  
  - `text` — Watermark text  
  - `position` — bottom-right, center, etc.  
  - `opacity` — 0-100%  
  - `fontSize` — Font size in pixels  

### Test Cases

- [ ] **Watermark Toggle**: Creator can enable/disable watermark per gallery
- [ ] **Custom Text**: Creator can set custom watermark text (e.g., "© KIPSMTHN")
- [ ] **Position Options**: Watermark can be positioned in 9 locations (corners, edges, center)
- [ ] **Opacity Control**: Opacity slider works (0-100%)
- [ ] **Font Size**: Font size adjustable (12px-72px)
- [ ] **Preview**: Creator sees live preview while configuring
- [ ] **Applied to Displays**: Watermark visible in gallery display photos
- [ ] **Applied to Downloads**: Watermark visible in downloaded photos (if preset enabled)
- [ ] **NOT on Original**: Watermark not stored on original photo file
- [ ] **Disabled Downloads**: Watermark respects preset settings

### API Endpoints to Test
```
GET    /api/galleries/[id]/watermark           — Get watermark config
PATCH  /api/galleries/[id]/watermark           — Update watermark
POST   /api/galleries/[id]/watermark/preview   — Generate preview with watermark
```

### Implementation Notes
- [ ] Use image processing library (sharp, Jimp, Canvas) to apply watermark
- [ ] Watermark applied server-side during download, not stored
- [ ] Test watermark rendering on various image sizes
- [ ] Verify text rendering is crisp at all font sizes
- [ ] Confirm watermark doesn't obscure important image content

---

## Feature 9: Expiry (Session Expiration)

### Schema Support
✓ `galleryAccessSessions.expiresAt` — Session expiry timestamp  
✓ `galleries.publishedAt` — Gallery publish date (optional)  

### Test Cases

- [ ] **Set Expiry Date**: Creator can set session expiry when sharing gallery
- [ ] **Default Expiry**: Sessions have reasonable default (7 days?)
- [ ] **Enforce Expiry**: Expired sessions deny access
- [ ] **Expiry Warning**: Client sees countdown when session expiring (e.g., "Expires in 3 days")
- [ ] **Expired Message**: Clear error message when session expired
- [ ] **Extend Session**: Creator can extend existing session
- [ ] **Re-request Access**: Client can request new session link when expired
- [ ] **Expiry Calculation**: Timestamps accurate (no off-by-one errors)
- [ ] **Multiple Sessions**: Gallery can have multiple concurrent sessions (different clients)
- [ ] **Stale Session Cleanup**: Old expired sessions cleaned up

### API Endpoints to Test
```
POST   /api/galleries/[id]/access/extend           — Extend session expiry
GET    /api/galleries/[slug]/access/status         — Check session validity
POST   /api/galleries/[id]/access/request-new      — Request new session (client)
DELETE /api/galleries/[slug]/access/revoke         — Revoke session early (creator)
```

### Implementation Notes
- [ ] Use UTC timestamps for consistency across timezones
- [ ] Test expiry enforcement at database level (query checks `expiresAt > NOW()`)
- [ ] Verify countdown timer updates on client-side
- [ ] Test that extending session doesn't create duplicate sessions
- [ ] Confirm database cleanup job removes expired sessions (scheduled task)

---

## Feature 10: PIN / Security

### Schema Support
✓ `galleries.accessPin` — PIN hash  
✓ `galleryAccessAttempts` — Attempt tracking  
  - `galleryId` — Which gallery  
  - `ipAddress` — Client IP  
  - `attemptCount` — Failed attempts  
  - `lockoutUntil` — Lockout timestamp  

### Test Cases

- [ ] **PIN Setup**: Creator can set PIN when creating gallery
- [ ] **Custom PIN**: Creator can set custom 4-6 digit PIN
- [ ] **PIN Hashing**: PIN stored as hash, never plaintext
- [ ] **PIN Entry**: Client UI has PIN input (numpad or text)
- [ ] **PIN Validation**: Correct PIN grants access
- [ ] **Wrong PIN**: Incorrect PIN rejected, attempt logged
- [ ] **Failed Attempts**: After 5 failed attempts, IP locked for 15 min
- [ ] **Brute Force Protection**: System prevents rapid PIN guessing
- [ ] **Attempt Logging**: Creator can see access attempts + IP addresses
- [ ] **PIN Reset**: Creator can issue new PIN without resetting gallery
- [ ] **No PIN Default**: Gallery accessible without PIN if creator doesn't set one
- [ ] **Different PINs**: Each gallery can have different PIN

### API Endpoints to Test
```
POST   /api/galleries/[slug]/verify-access        — Verify PIN
POST   /api/galleries/[id]/access/reset-pin       — Set/reset PIN
GET    /api/galleries/[id]/access/attempts        — View attempt log
POST   /api/galleries/[id]/access/unlock          — Unlock IP early (admin only)
```

### Implementation Notes
- [ ] Use bcrypt or similar for PIN hashing
- [ ] Implement rate limiting per IP per gallery
- [ ] Log failed attempts with timestamp + IP
- [ ] Use environment variables for rate limit thresholds
- [ ] Test on different network conditions (VPN, proxy, etc.)
- [ ] Verify PIN entry UI supports keyboard + mouse

---

## Cross-Feature Integration Tests

### Test Suites

- [ ] **Favorites + Comments**: Can favorite a photo with existing comment
- [ ] **Selections + Downloads**: Download all selections with correct preset
- [ ] **Watermark + Downloads**: Downloaded selection includes watermark
- [ ] **Approval + Expiry**: Approved gallery doesn't auto-extend expiry
- [ ] **PIN + Comments**: Require valid PIN to post comment
- [ ] **Expiry + Downloads**: Cannot download after session expires
- [ ] **All Features Together**: Create gallery with all features enabled, test end-to-end workflow

---

## Performance Tests

- [ ] Gallery loads in < 3 seconds with 500+ photos
- [ ] Download batch (50 photos) completes in < 30 seconds
- [ ] Comment add/retrieve < 500ms latency
- [ ] PIN validation < 100ms (hashing with cost factor 10)
- [ ] Watermark application < 2 seconds per image

---

## Security Tests

- [ ] PIN brute force blocked (5 attempts = 15 min lockout)
- [ ] SQL injection attempts blocked (parameterized queries)
- [ ] XSS in comments prevented (sanitize input)
- [ ] CSRF tokens on all state-changing endpoints
- [ ] Session tokens are cryptographically secure (256-bit minimum)
- [ ] No sensitive data in error messages
- [ ] API endpoints require authentication/valid session

---

## Accessibility Tests

- [ ] All buttons have ARIA labels
- [ ] Keyboard navigation works for all features
- [ ] Color contrasts meet WCAG AA standards
- [ ] Icons have text labels
- [ ] Form inputs labeled correctly
- [ ] Modal dialogs trap focus

---

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Success Criteria

✅ **All 10 features have working API endpoints**  
✅ **All features render correctly in UI**  
✅ **Client can perform all expected actions**  
✅ **Creator can manage all feature settings**  
✅ **No data loss or conflicts between features**  
✅ **Security controls functional (PIN, rate limiting, session expiry)**  
✅ **Download presets and watermarking work correctly**  
✅ **Performance acceptable (loads, downloads, validation)**  
✅ **Cross-feature integration tested**  
✅ **Accessible to all users**  

---

## Bug Tracking

Issues discovered during audit should be logged as:
- Feature: [Feature Name]
- Severity: Critical / High / Medium / Low
- Steps to Reproduce: [Detailed steps]
- Expected Behavior: [What should happen]
- Actual Behavior: [What actually happens]
- Environment: [Browser, OS, device]

---

**Generated**: 2024-09-15  
**Status**: Ready for testing  
**Next Step**: Execute test cases and log findings
