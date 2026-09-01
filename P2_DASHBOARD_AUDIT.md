# Command Center (Dashboard) Audit

**Date**: 2024-09-15  
**Status**: Ready for execution  
**Scope**: Admin dashboard KPI verification

---

## Quick Checklist

### KPI Accuracy (±2% tolerance)
- [ ] Client count matches `SELECT COUNT(*) FROM clients WHERE creatorId = ?`
- [ ] Project count matches database
- [ ] Quote count and statuses accurate
- [ ] Invoice count and statuses accurate
- [ ] Gallery count and statuses accurate

### Financial Accuracy
- [ ] Quote totals calculated correctly
- [ ] Invoice totals calculated correctly
- [ ] Overdue invoice count accurate
- [ ] Paid vs. unpaid split accurate
- [ ] Currency conversion correct (if multi-currency)

### Feature Tests
- [ ] Date range filter (7d, 30d, 90d, 12m, all) works
- [ ] Quick action buttons route correctly
- [ ] Activity feed shows recent items
- [ ] Alerts section highlights critical issues
- [ ] Dashboard loads in < 2 seconds

---

## 1. KPI Overview Section

### Metrics to Audit

#### Clients
```sql
-- Total clients
SELECT COUNT(*) FROM clients WHERE creatorId = ?

-- New clients (today/this period)
SELECT COUNT(*) FROM clients WHERE creatorId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)

-- Active clients (recent project/quote/invoice in period)
SELECT COUNT(DISTINCT clientId) FROM (
  SELECT clientId FROM projects WHERE creatorId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
  UNION
  SELECT clientId FROM quotes WHERE creatorId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
  UNION
  SELECT clientId FROM invoices WHERE creatorId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
)
```

**Tests**:
- [ ] Client count shows 0+ (never negative)
- [ ] New count ≤ total count
- [ ] Active count ≤ total count
- [ ] Filter by date range changes results appropriately

#### Projects
```sql
-- Total projects
SELECT COUNT(*) FROM projects WHERE creatorId = ?

-- New projects (this period)
SELECT COUNT(*) FROM projects WHERE creatorId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)

-- Active projects (status = 'active' and recent activity)
SELECT COUNT(*) FROM projects WHERE creatorId = ? AND status = 'active'

-- Completed projects
SELECT COUNT(*) FROM projects WHERE creatorId = ? AND status = 'completed'
```

**Tests**:
- [ ] Project counts are non-negative
- [ ] Completed ≤ total
- [ ] Active projects reflect current status
- [ ] Status transitions tracked correctly

#### Quotes
```sql
-- Total quotes
SELECT COUNT(*) FROM quotes WHERE creatorId = ?

-- New quotes (this period)
SELECT COUNT(*) FROM quotes WHERE creatorId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)

-- Quote statuses
SELECT status, COUNT(*) FROM quotes WHERE creatorId = ? GROUP BY status
```

**Tests**:
- [ ] Quote count non-negative
- [ ] New ≤ total
- [ ] Status breakdown shows: draft, sent, approved, converted, rejected
- [ ] Conversion rate calculated correctly (converted / sent)

#### Invoices
```sql
-- Total invoices
SELECT COUNT(*) FROM invoices WHERE creatorId = ?

-- New invoices (this period)
SELECT COUNT(*) FROM invoices WHERE creatorId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)

-- Invoice statuses + due dates
SELECT status, COUNT(*) FROM invoices WHERE creatorId = ? GROUP BY status
```

**Tests**:
- [ ] Invoice count non-negative
- [ ] Statuses: draft, sent, overdue, paid
- [ ] Overdue calculation correct (dueDate < TODAY AND status != 'paid')
- [ ] New ≤ total

#### Galleries
```sql
-- Total galleries
SELECT COUNT(*) FROM galleries WHERE creatorId = ?

-- New galleries (this period)
SELECT COUNT(*) FROM galleries WHERE creatorId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)

-- Gallery statuses
SELECT status, COUNT(*) FROM galleries WHERE creatorId = ? GROUP BY status
```

**Tests**:
- [ ] Gallery count non-negative
- [ ] Statuses: draft, published, archived
- [ ] New ≤ total
- [ ] Published count reflects actual public galleries

---

## 2. Financial Dashboard Section

### Metrics to Audit

#### Quote Valuation
```sql
-- Period quoted value (sum of all quote totals this period)
SELECT COALESCE(SUM(total), 0) FROM quotes 
WHERE creatorId = ? AND status != 'draft' AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)

-- Accepted quote value (approved/converted quotes)
SELECT COALESCE(SUM(total), 0) FROM quotes 
WHERE creatorId = ? AND status IN ('approved', 'converted') AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
```

**Tests**:
- [ ] Quoted value ≥ accepted value
- [ ] No negative values
- [ ] Values in creator's default currency
- [ ] Multipler conversion works if applicable

#### Invoice Valuation
```sql
-- Period invoiced value
SELECT COALESCE(SUM(total), 0) FROM invoices 
WHERE creatorId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)

-- Period paid value
SELECT COALESCE(SUM(total), 0) FROM invoices 
WHERE creatorId = ? AND status = 'paid' AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)

-- Overdue invoices
SELECT COUNT(*) FROM invoices 
WHERE creatorId = ? AND dueDate < NOW() AND status != 'paid'
```

**Tests**:
- [ ] Invoiced ≥ paid
- [ ] Overdue count accurate
- [ ] Payment tracking works
- [ ] No duplicate invoice counting

#### Revenue Trends
**Questions**:
- [ ] Are revenue trend charts implemented?
- [ ] Do they show MoM or WoW trends?
- [ ] Is forecast/projection shown?

---

## 3. Quote Status Dashboard

### Statuses
- [ ] Draft (not yet sent)
- [ ] Sent (sent to client)
- [ ] Approved (client accepted)
- [ ] Converted (converted to invoice)
- [ ] Rejected (client declined)

### Tests

```sql
-- Quote status breakdown
SELECT status, COUNT(*) FROM quotes WHERE creatorId = ? GROUP BY status

-- Conversion rate
SELECT (SELECT COUNT(*) FROM quotes WHERE status = 'converted') / 
       CAST((SELECT COUNT(*) FROM quotes WHERE status IN ('sent', 'approved', 'converted')) AS FLOAT)

-- Pending (awaiting client response)
SELECT COUNT(*) FROM quotes WHERE status = 'sent' AND createdAt < DATE_SUB(NOW(), INTERVAL 7 DAY)
```

**Tests**:
- [ ] Status counts non-negative
- [ ] Conversion rate 0-100%
- [ ] Pending old quotes highlighted
- [ ] Quote age tracking (days since sent)
- [ ] Expiry warnings if `validUntil` < now

---

## 4. Invoice Status Dashboard

### Statuses
- [ ] Draft (not yet sent)
- [ ] Sent (sent to client)
- [ ] Overdue (past due date, not paid)
- [ ] Paid (marked as paid)
- [ ] Partially Paid (optional advanced feature)

### Tests

```sql
-- Invoice status breakdown
SELECT status, COUNT(*) FROM invoices WHERE creatorId = ? GROUP BY status

-- Overdue amount
SELECT COALESCE(SUM(total), 0) FROM invoices 
WHERE dueDate < NOW() AND status != 'paid'

-- Days overdue
SELECT invoiceNumber, DUE_DATE, DATEDIFF(NOW(), dueDate) as days_overdue 
FROM invoices WHERE dueDate < NOW() AND status != 'paid' ORDER BY days_overdue DESC
```

**Tests**:
- [ ] Overdue count matches calculation
- [ ] Invoice aging tracked
- [ ] Oldest invoices highlighted
- [ ] Days overdue calculated correctly
- [ ] Payment terms respected

---

## 5. Gallery Status Dashboard

### Statuses
- [ ] Draft (not yet published)
- [ ] Published (live)
- [ ] Archived (hidden from public)

### Tests

```sql
-- Gallery status breakdown
SELECT status, COUNT(*) FROM galleries WHERE creatorId = ? GROUP BY status

-- Published galleries
SELECT COUNT(*) FROM galleries WHERE status = 'published' AND publishedAt < NOW()
```

**Tests**:
- [ ] Status counts accurate
- [ ] Published date tracking works
- [ ] Public API respects published status
- [ ] Draft galleries not visible to clients

---

## 6. Attention / Alerts Section

### Alerts to Display

- [ ] **Overdue Invoices**: Count + link to invoice list
- [ ] **Pending Quotes**: Count + link to quote list
- [ ] **Active Projects**: Count + link to project list
- [ ] **Active Galleries**: Count + link to gallery list

### Tests

```sql
-- Overdue invoices (alert if > 0)
SELECT COUNT(*) FROM invoices 
WHERE dueDate < NOW() AND status != 'paid'

-- Pending quotes (alert if > 5 unresponded)
SELECT COUNT(*) FROM quotes 
WHERE status = 'sent' AND validUntil > NOW()

-- Check thresholds
```

**Tests**:
- [ ] Alerts appear when conditions met
- [ ] Alerts disappear when resolved
- [ ] Clicking alert shows relevant list
- [ ] Alert styling reflects severity (red = critical)
- [ ] Count badges update in real-time (or on refresh)

---

## 7. Activity Feed

### Log Items

Activity types:
- [ ] New client created
- [ ] New project created
- [ ] New quote sent
- [ ] Quote approved
- [ ] Invoice created
- [ ] Invoice paid
- [ ] Gallery published
- [ ] Comment added

### Tests

```sql
-- Activity feed (union of all recent actions)
SELECT 'client_created' as type, createdAt, name as title
FROM clients WHERE creatorId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
UNION
SELECT 'project_created', createdAt, name as title
FROM projects WHERE creatorId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
-- ... etc for all types
ORDER BY createdAt DESC LIMIT 50
```

**Tests**:
- [ ] Feed shows newest first
- [ ] Items limited to date range
- [ ] Icons match activity type
- [ ] Dates formatted correctly
- [ ] Links navigate to detail views
- [ ] Activity count/limit configurable

---

## 8. Quick Actions

### Buttons to Test

- [ ] **+ New Client** → Routes to `/admin/clients/new`
- [ ] **+ New Project** → Routes to `/admin/projects/new`
- [ ] **+ New Quote** → Routes to `/admin/quotes/new`
- [ ] **+ New Invoice** → Routes to `/admin/invoices/new`
- [ ] **+ New Gallery** → Routes to `/admin/galleries/new`

**Tests**:
- [ ] All buttons present
- [ ] All buttons clickable
- [ ] Routes correct
- [ ] Forms load properly after navigation
- [ ] Icons match action

---

## 9. Time Range Filter

### Ranges Supported
- [ ] 7 days
- [ ] 30 days
- [ ] 90 days
- [ ] 12 months
- [ ] All time

### Tests

```
Date Range Calculations:
- 7d = NOW() - 7 days
- 30d = NOW() - 30 days
- 90d = NOW() - 90 days
- 12m = NOW() - 365 days
- all = no date filter
```

**Tests**:
- [ ] Default range is 30d
- [ ] Switching range updates all metrics
- [ ] Date calculations accurate (no off-by-one)
- [ ] Range persists in URL (bookmarkable)
- [ ] All sections respect range filter
- [ ] Performance acceptable with "all time" range

---

## 10. Performance & UX

### Load Times
- [ ] Dashboard loads in < 2 seconds (first load)
- [ ] Dashboard loads in < 1 second (cached)
- [ ] Range filter < 500ms
- [ ] No layout shift during load (CLS < 0.1)

### Responsive Design
- [ ] Desktop (1920px+) ✓
- [ ] Tablet (768px+) ✓
- [ ] Mobile (375px+) ✓
- [ ] All metrics visible
- [ ] No horizontal scrolling

### Accessibility
- [ ] All text labels present
- [ ] Color contrast ≥ 4.5:1
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Focus indicators visible

---

## Missing Features Checklist

Potential features not yet implemented:

- [ ] **Revenue Trend Chart** (revenue over time)
- [ ] **Client Profitability** (revenue by client)
- [ ] **Project Profitability** (revenue by project)
- [ ] **Quote-to-Invoice Conversion Pipeline** (visual funnel)
- [ ] **Payment Health Score** (on-time payment %)
- [ ] **Tax Compliance Dashboard** (if P1 Item 10 implemented)
- [ ] **Export Dashboard to PDF** (reporting)
- [ ] **Custom Dashboard Widgets** (drag & drop customization)
- [ ] **Forecast/Projections** (AI-based revenue forecast)
- [ ] **Comparison View** (this period vs. last period)

---

## Recommendations

### Quick Wins (< 1 day)
1. Verify all KPI calculations
2. Test date range filtering
3. Confirm responsive design

### Medium Effort (1-2 days)
1. Add revenue trend chart
2. Implement dashboard export to PDF
3. Add more activity types

### Larger Initiatives (3+ days)
1. Build client/project profitability breakdown
2. Implement AI-based revenue forecasting
3. Add custom widget dashboard

---

## Success Criteria

✅ All KPIs accurate (±2%)  
✅ Date range filtering works  
✅ All quick actions functional  
✅ Dashboard loads in < 2 seconds  
✅ No layout shift during load  
✅ Responsive on all devices  
✅ Accessible to all users  
✅ Activity feed populated  
✅ Alerts trigger appropriately  

---

**Generated**: 2024-09-15  
**Status**: Ready for testing  
**Next Step**: Execute test checklist and document findings
