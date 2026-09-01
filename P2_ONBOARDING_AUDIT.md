# Onboarding & Creator Profile Audit

**Date**: 2024-09-15  
**Status**: Ready for execution  
**Scope**: 4-step onboarding flow + creator profile/business setup

---

## Quick Checklist

### Onboarding Completion
- [ ] All 4 steps load correctly
- [ ] Form data persists on back/forward navigation
- [ ] Required field validation works
- [ ] Success on step 4 completes onboarding
- [ ] User redirected to dashboard on completion
- [ ] Incomplete onboarding prevents dashboard access

### Data Persistence
- [ ] Profile data saves to `creatorProfiles` table
- [ ] Services save to `creatorServices` table
- [ ] Business data saves to `creatorBusinessProfiles` table
- [ ] User onboarding status tracked correctly

### UX/Flow
- [ ] Progress bar accurate
- [ ] Step titles clear
- [ ] Back button works
- [ ] No data loss on navigation
- [ ] Error messages helpful

---

## Step 1: Profile Setup

### Fields

#### Display Name (Required)
- [ ] Input accepts text
- [ ] Saves to `users.name`
- [ ] Pre-filled from Clerk profile
- [ ] Validation: non-empty

#### Creator Handle (Required)
- [ ] Input accepts alphanumeric + hyphens/underscores
- [ ] Saves to `users.handle`
- [ ] Unique validation? (should prevent duplicates)
- [ ] Pre-filled with suggested handle from email
- [ ] Format: lowercase, no spaces
- [ ] Validation: required, valid characters only

#### Bio (Optional)
- [ ] Textarea accepts long text
- [ ] Saves to `creatorProfiles.bio`
- [ ] Character limit? (if any)
- [ ] Markdown support? (or plain text only?)

#### Website (Optional)
- [ ] Input accepts URL
- [ ] Saves to `creatorProfiles.website`
- [ ] URL validation (http/https)
- [ ] Clickable in profile view

#### Location (Optional)
- [ ] Input accepts text (city, region)
- [ ] Saves to `creatorProfiles.location`
- [ ] Used for discoverability?

#### Avatar
- [ ] Pulls from Clerk profile image
- [ ] Displays preview
- [ ] Not editable in onboarding (Clerk handles)
- [ ] Falls back to placeholder if no image

### Database

```sql
-- Expected structure after Step 1
SELECT * FROM users WHERE id = ?
-- name, handle should be populated

SELECT * FROM creator_profiles WHERE userId = ?
-- bio, website, location should be populated
```

### Tests

- [ ] User enters all data, navigates away, comes back → data persists
- [ ] Handle with special characters rejected
- [ ] Duplicate handle? (test if allowed or rejected)
- [ ] Bio with 1000+ characters accepted
- [ ] Website with invalid URL rejected
- [ ] Skip to Step 2 without completing Step 1 → error

---

## Step 2: Services Setup

### Features

#### Quick-Add Presets
**Presets**:
- [ ] Photography
- [ ] Videography
- [ ] Video Editing
- [ ] Graphic Design
- [ ] Content Creation
- [ ] Brand Photography
- [ ] Event Coverage
- [ ] Corporate Video
- [ ] Social Media Content

**Tests**:
- [ ] Clicking preset adds it to service list
- [ ] Preset marked as "added" (UI feedback)
- [ ] Cannot add duplicate preset
- [ ] Details auto-filled from preset

#### Custom Service Addition
- [ ] "+ Add Service" button adds empty row
- [ ] Can add unlimited services
- [ ] Minimum 1 service required
- [ ] Cannot save Step 2 without services

#### Service Fields

##### Name (Required)
- [ ] Text input
- [ ] Save to `creatorServices.name`
- [ ] Non-empty validation

##### Description (Optional)
- [ ] Textarea
- [ ] Save to `creatorServices.description`
- [ ] 500+ character limit?

##### Category (Optional)
- [ ] Text input
- [ ] Save to `creatorServices.category`
- [ ] Predefined options or free text?

##### Default Rate (Optional)
- [ ] Currency selector (KES, USD, EUR)
- [ ] Number input
- [ ] Save to `creatorServices.defaultRate` + `currency`
- [ ] Validation: non-negative

##### Rate Options (Optional)
- [ ] Toggle buttons: Full Day, Half Day, Hourly
- [ ] Input fields for each enabled rate
- [ ] Save to `creatorServices.rates` (JSON or separate fields?)
- [ ] Used in quote builder?

#### Service Management
- [ ] Edit service details
- [ ] Delete service (if > 1)
- [ ] Reorder services? (drag/drop or list)

### Database

```sql
-- Expected after Step 2
SELECT * FROM creator_services WHERE creatorId = ?
-- name, description, category, defaultRate, currency all populated

-- Check rates stored correctly
SELECT * FROM creator_services WHERE id = ?
-- rates should contain fullDay, halfDay, hourly values
```

### Tests

- [ ] Add 3 services, navigate back, return → services persist
- [ ] Try to save with 0 services → error "Add at least one service"
- [ ] Add service without name → error on save
- [ ] Service with 1000-char description saved correctly
- [ ] Rate with negative value rejected
- [ ] Currency change reflected for all rates
- [ ] Delete service → service count decreases
- [ ] Cannot delete last service

---

## Step 3: Business Setup

### Fields

#### Business Name (Optional)
- [ ] Text input
- [ ] Save to `creatorBusinessProfiles.businessName`
- [ ] No validation (optional)

#### Phone Number (Optional)
- [ ] Phone input (formatted?)
- [ ] Save to `creatorBusinessProfiles.phone`
- [ ] Validation: valid phone format?

#### KRA PIN (Optional)
- [ ] Text input
- [ ] Save to `creatorBusinessProfiles.kraPin`
- [ ] Validation: KRA PIN format (11 digits starting with P)
- [ ] Used for tax compliance
- [ ] Not displayed in plaintext after save

#### VAT Registered (Toggle)
- [ ] Checkbox
- [ ] Save to `creatorBusinessProfiles.vatRegistered`
- [ ] When unchecked, hide VAT Number field
- [ ] When checked, show VAT Number field

#### VAT Number (Conditional)
- [ ] Text input (only shown if VAT Registered = true)
- [ ] Save to `creatorBusinessProfiles.vatNumber`
- [ ] Validation: VAT format (KE... or other format)

#### Currency (Dropdown)
- [ ] Options: KES, USD, EUR (+ others?)
- [ ] Save to `creatorBusinessProfiles.currency`
- [ ] Default: KES
- [ ] Used for invoice defaults

#### Deposit Percentage (Optional)
- [ ] Number input (0-100%)
- [ ] Save to `creatorBusinessProfiles.depositPercentage`
- [ ] Default: 50%
- [ ] Applied to quotes/invoices

#### WHT Rate (Optional)
- [ ] Number input (0-100%)
- [ ] Save to `creatorBusinessProfiles.whtRate`
- [ ] Default: 0%
- [ ] Withholding Tax rate for Kenyan tax

### Database

```sql
-- Expected after Step 3 (all optional)
SELECT * FROM creator_business_profiles WHERE userId = ?
-- businessName, phone, kraPin, vatRegistered, vatNumber, currency, depositPercentage, whtRate
```

### Tests

- [ ] Fill all fields, save, return → data persists
- [ ] KRA PIN with invalid format rejected
- [ ] KRA PIN with valid format accepted (11 digits)
- [ ] KRA PIN not stored in plaintext
- [ ] VAT toggle shows/hides VAT Number field
- [ ] VAT Number required when VAT Registered = true
- [ ] Deposit % between 0-100
- [ ] WHT % between 0-100
- [ ] Currency change updates display
- [ ] Skip Step 3 (all optional) → proceed to Step 4
- [ ] All fields left empty → proceed to Step 4

### Validation Issues to Check

**Current State**: Fields appear to be entirely optional (can skip with empty values)

**Questions**:
- Should KRA PIN be required if user in Kenya?
- Should VAT Number be required if VAT Registered = true? ✓ (already implemented)
- Should at least Business Name be required?

---

## Step 4: Finish / Review

### Display
- [ ] Summary of Profile data (name, handle, bio, website, location)
- [ ] List of all services (name, category, rate)
- [ ] Business details (name, KRA PIN, VAT, currency, deposit %, WHT)
- [ ] Edit buttons for each section (back to Step N)

### Navigation
- [ ] "Back to Business" button → Step 3
- [ ] "Back to Services" button → Step 2
- [ ] "Back to Profile" button → Step 1
- [ ] "Finish" button → complete onboarding

### Tests

- [ ] All summary data matches what was entered
- [ ] Back buttons work and preserve data
- [ ] Finish button shows loading state
- [ ] After finish, user redirected to `/admin`
- [ ] Onboarding status set to "complete"
- [ ] User can access dashboard

---

## Post-Onboarding Profile Access

### Profile Editing
- [ ] Creator can view profile at `/admin/profile` (or similar)
- [ ] Creator can edit all profile fields
- [ ] Changes saved to database
- [ ] Profile accessible on public site (if public profile feature exists)

### Services Management
- [ ] Creator can add/edit/delete services post-onboarding
- [ ] Service changes reflected in quotes
- [ ] Old quotes/invoices not affected by service changes

### Business Profile Changes
- [ ] Creator can update business details
- [ ] KRA PIN changes require verification? (security check)
- [ ] VAT registration changes tracked
- [ ] Changes reflected in new invoices

---

## Data Integrity Checks

### Orphaned Records
```sql
-- Check for creator profiles without user
SELECT * FROM creator_profiles WHERE userId NOT IN (SELECT id FROM users)

-- Check for business profiles without user
SELECT * FROM creator_business_profiles WHERE userId NOT IN (SELECT id FROM users)

-- Check for services without creator
SELECT * FROM creator_services WHERE creatorId NOT IN (SELECT id FROM users)
```

**Tests**:
- [ ] No orphaned records exist
- [ ] Foreign keys enforced (no stale references)

### Cascading Deletes
- [ ] Delete user → all related profiles/services deleted
- [ ] Delete service → no orphaned references

---

## Onboarding Flow Metrics

### Completion Tracking
```sql
-- Check onboarding status
SELECT onboardingStatus, COUNT(*) FROM users GROUP BY onboardingStatus

-- Check onboarding step distribution
SELECT onboardingStep, COUNT(*) FROM users GROUP BY onboardingStep

-- Identify users stuck in onboarding
SELECT * FROM users WHERE onboardingStatus != 'complete' AND createdAt < DATE_SUB(NOW(), INTERVAL 7 DAY)
```

**Tests**:
- [ ] New users have `onboardingStatus = 'incomplete'`
- [ ] `onboardingStep` increments correctly (1 → 2 → 3 → 4)
- [ ] Completed users have `onboardingStatus = 'complete'`
- [ ] No users stuck in middle of onboarding

### Dropout Analysis
- [ ] Track where users abandon onboarding (which step)
- [ ] Identify problematic steps
- [ ] Monitor abandonment rate (goal: > 90% completion)

---

## UX/Accessibility

### Form Inputs
- [ ] All inputs labeled clearly
- [ ] Error messages below fields, in red
- [ ] Required field markers (*)
- [ ] Placeholder text helpful
- [ ] Disabled buttons have hover state

### Keyboard Navigation
- [ ] Tab through all inputs
- [ ] Enter submits form
- [ ] Escape doesn't lose data
- [ ] Focus indicators visible

### Responsiveness
- [ ] Desktop (1920px) ✓
- [ ] Tablet (768px) ✓
- [ ] Mobile (375px) ✓
- [ ] All fields usable on mobile
- [ ] No horizontal scrolling

### Accessibility
- [ ] Form labels associated with inputs (`for` attribute)
- [ ] Error messages linked to inputs (`aria-describedby`)
- [ ] Color contrast ≥ 4.5:1
- [ ] Screen reader announces steps/progress
- [ ] Form sections clearly labeled

---

## Potential Enhancements

### Additional Fields to Consider

#### Profile
- [ ] Social media links (Instagram, Twitter, LinkedIn)
- [ ] Creator specialty/category tags
- [ ] Timezone (for scheduling)
- [ ] Preferred contact method

#### Services
- [ ] Service photos/portfolio samples
- [ ] Service skill tags (portrait, product, event)
- [ ] Availability calendar
- [ ] Service testimonials/reviews

#### Business
- [ ] Bank account setup (for payments)
- [ ] Insurance/licensing info
- [ ] Tax file identification
- [ ] Compliance checklist

#### Portfolio
- [ ] Should portfolio auto-publish? (Yes/No toggle)
- [ ] Which projects public? (checkboxes)
- [ ] Portfolio SEO settings

#### Integrations
- [ ] Google Drive folder selection
- [ ] Payment processor setup
- [ ] Email template preferences
- [ ] Slack/Zapier integrations

---

## Success Criteria

✅ All 4 steps load and function correctly  
✅ Form data persists on navigation  
✅ Required field validation works  
✅ All data saves to correct database tables  
✅ Completion status tracked accurately  
✅ User redirected to dashboard on completion  
✅ No incomplete onboarding blocks access to dashboard  
✅ Profile editable post-onboarding  
✅ No orphaned data in database  
✅ Accessible on all devices  
✅ Accessible to all users (WCAG AA)  
✅ Completion rate > 90%  

---

## Bug Tracking Template

```
Title: [Step X] [Field Name] - [Issue]

Description:
[What is the problem?]

Steps to Reproduce:
1. [First step]
2. [Second step]
3. [etc.]

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

Environment:
- Browser: [Chrome/Firefox/Safari/Edge + version]
- OS: [Windows/Mac/Linux + version]
- Device: [Desktop/Tablet/Mobile + model if mobile]

Screenshots:
[Attach if visual issue]

Severity: [Critical / High / Medium / Low]
```

---

**Generated**: 2024-09-15  
**Status**: Ready for testing  
**Next Step**: Execute test checklist and document findings
