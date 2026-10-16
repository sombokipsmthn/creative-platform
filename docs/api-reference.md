# API Reference - Creative Platform

## Overview

The Creative Platform API provides endpoints for managing quotes, invoices, contracts, projects, galleries, and calendar data. All authenticated endpoints require a valid session and are protected by the `withCreatorApi` middleware.

## Rate Limiting

All list endpoints are rate-limited to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/quotes` | 60 requests | 1 minute |
| `/api/invoices` | 60 requests | 1 minute |
| `/api/projects` | 30 requests | 1 minute |
| `/api/calendar` | 30 requests | 1 minute |
| `/api/clients` | 60 requests | 1 minute |
| `/api/contracts` | 30 requests | 1 minute |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed in window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the window resets
- `Retry-After`: Seconds to wait before retrying (only on 429)

## Authentication

All API endpoints that require authentication use Better Auth with session cookies. The `withCreatorApi` middleware validates the session and ensures the creator owns the resources being accessed.

## Endpoints

### Quotes API

#### GET /api/quotes

Fetch quotes belonging to the authenticated creator.

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `sent`, `accepted`, `rejected`, `invoiced`)
- `clientId` (optional): Filter by client ID

**Response:**
```json
{
  "quotes": [
    {
      "id": "quote_123",
      "title": "Photography Session",
      "status": "accepted",
      "clientId": "client_456",
      "projectName": "Summer Campaign",
      "invoiceId": null,
      "subtotal": 50000,
      "tax": 5000,
      "total": 55000,
      "currency": "KES",
      "validUntil": "2024-12-31",
      "createdAt": "2024-01-01T00:00:00Z",
      "client": { "id": "client_456", "name": "Acme Corp" },
      "items": [
        {
          "id": "item_1",
          "category": "Photography",
          "description": "Full day shoot",
          "quantity": 1,
          "unit": "session",
          "rate": 50000,
          "amount": 50000
        }
      ]
    }
  ]
}
```

**Rate Limit:** 60 requests per minute

---

#### POST /api/quotes

Create a new quote.

**Request Body:**
```json
{
  "clientId": "string (optional)",
  "title": "string (required)",
  "projectName": "string (optional)",
  "quoteNumber": "string (optional)",
  "currency": "KES (default)",
  "paymentTerms": "string (optional)",
  "validUntil": "ISO date string",
  "productionDays": 1,
  "location": "string (optional)",
  "clientContact": "string (optional)",
  "depositPercentage": 50,
  "notes": "string (optional)",
  "status": "draft",
  "tax": 0,
  "items": [
    {
      "category": "Production",
      "description": "string (required)",
      "quantity": 1,
      "unit": "unit",
      "rate": 1000,
      "notes": "string (optional)"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "quote": { ... },
  "client": { ... },
  "items": [ ... ]
}
```

---

### Invoices API

#### GET /api/invoices

Fetch invoices belonging to the authenticated creator with pagination.

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `sent`, `paid`, `overdue`, `cancelled`)
- `clientId` (optional): Filter by client ID
- `currency` (optional): Filter by currency code
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "invoice_123",
      "invoiceNumber": "INV-2024-0001",
      "status": "sent",
      "clientId": "client_456",
      "quoteId": "quote_789",
      "subtotal": 50000,
      "tax": 5000,
      "total": 55000,
      "currency": "KES",
      "issueDate": "2024-01-01",
      "dueDate": "2024-01-15",
      "notes": "string",
      "client": { "id": "client_456", "name": "Acme Corp" },
      "items": [
        {
          "description": "string",
          "quantity": 1,
          "unitPrice": 50000,
          "amount": 50000
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

**Rate Limit:** 60 requests per minute

---

#### PATCH /api/invoices

Update invoice status.

**Request Body:**
```json
{
  "invoiceId": "invoice_123",
  "status": "paid"
}
```

**Valid Status Transitions:**
- `draft` → `sent`, `cancelled`
- `sent` → `paid`, `overdue`, `cancelled`
- `overdue` → `paid`, `cancelled`
- `paid`, `cancelled` → no transitions (terminal states)

**Response:** Updated invoice with items and client

**Rate Limit:** 60 requests per minute

---

#### POST /api/invoices

Create a new invoice manually or from an accepted quote.

**Manual Invoice:**
```json
{
  "clientId": "client_456",
  "title": "Invoice",
  "invoiceNumber": "INV-2024-0001 (optional, auto-generated)",
  "status": "draft",
  "issueDate": "2024-01-01",
  "dueDate": "2024-01-15",
  "notes": "string",
  "currency": "KES",
  "subtotal": 50000,
  "tax": 5000,
  "total": 55000,
  "items": [
    {
      "description": "string",
      "quantity": 1,
      "unitPrice": 50000,
      "amount": 50000
    }
  ]
}
```

**From Quote:**
```json
{
  "quoteId": "quote_789"
}
```

**Response:** `201 Created` with invoice details

---

### Calendar API

#### GET /api/calendar

Fetch calendar events from all entities within a date range.

**Query Parameters:**
- `start` (required): ISO date string or parseable date
- `end` (required): ISO date string or parseable date
- `clientId` (optional): Filter by client ID
- `category` (optional): Filter by entity type (`quote`, `invoice`, `project`, `gallery`, `contract`)
- `view` (optional): Calendar view mode (`month`, `week`, `agenda`)

**Response:**
```json
[
  {
    "id": "resource_id",
    "title": "string",
    "description": "string",
    "startDate": "ISO date",
    "endDate": "ISO date",
    "allDay": true,
    "category": "Quotation | Invoice | Project | Gallery | Contract",
    "status": "string",
    "relatedClientId": "string",
    "relatedProjectId": "string",
    "relatedQuoteId": "string",
    "relatedInvoiceId": "string",
    "relatedGalleryId": "string",
    "sourceType": "quote | invoice | project | gallery | contract",
    "sourceId": "string",
    "isTentative": false
  }
]
```

**Events are sorted by start date and filtered to only include events with valid dates.**

**Rate Limit:** 30 requests per minute

---

### Gallery Access API

#### POST /api/public/galleries/[slug]/access

Verify access to a protected gallery using PIN.

**Request Body:**
```json
{
  "pin": "1234"
}
```

**Response (No PIN required):**
```json
{
  "success": true,
  "sessionId": "session_123",
  "requiresPin": false
}
```

**Response (PIN verified):**
```json
{
  "success": true,
  "sessionId": "session_123",
  "requiresPin": true
}
```

**Error Response (Incorrect PIN):**
```json
{
  "error": "Incorrect PIN."
}
```
Status: `401 Unauthorized`

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Start and end dates are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Client not found"
}
```

### 404 Not Found
```json
{
  "error": "Gallery not found."
}
```

### 409 Conflict
```json
{
  "error": "Invalid invoice status transition: draft → paid"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "resetAt": 1704067200000,
  "limit": 60,
  "remaining": 0
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch calendar data"
}
```

## Best Practices

1. **Use pagination** for list endpoints to avoid large response bodies
2. **Include rate limit headers** in your client to respect limits
3. **Validate status transitions** before making updates
4. **Handle errors gracefully** with appropriate retries
5. **Cache responses** where appropriate to reduce API calls

## Rate Limit Implementation

Rate limiting is implemented in `/src/middleware/rate-limit.ts` using an in-memory store. Production should replace this with Redis or a distributed store for better scalability.

```typescript
import { createRateLimiter } from "@/middleware/rate-limit";

const limiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  key: "ip", // or "user" for user-based limiting
});
```
