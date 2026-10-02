# System Description

**Document Version**: 1.0
**Last Updated**: 2026-10-02
**Owner**: Engineering Manager
**Review Cycle**: Annually or after significant changes

---

## 1. Company/Service Context

### Organization Overview

- **Organization**: KIPSMTHN Creative Platform
- **Industry**: Creative Services / Photography & Videography
- **Primary Service**: Digital gallery delivery, client management, and creative project workflow
- **Headquarters**: Nairobi, Kenya
- **Operational Scope**: Kenya-based with international client base

### Business Model

- **Revenue Model**: Creative service fees (photography, videography, creative direction)
- **Customer Base**: Corporations, NGOs, foundations, and individuals
- **Service Delivery**: Remote galleries with client collaboration tools

---

## 2. System Purpose

### Primary Functions

1. **Gallery Management**: Create, manage, and deliver digital photo/video galleries to clients
2. **Client Management**: Maintain client relationships and project information
3. **Quote & Invoice Generation**: Create professional quotes and invoices
4. **Contract Management**: Generate and manage legal contracts
5. **Payment Processing**: Track payments and financial transactions
6. **Equipment Tracking**: Manage rental equipment and services

### Value Proposition

- Streamlined creative workflow from project to delivery
- Professional client-facing galleries with collaboration features
- Integrated billing and contract management
- Secure, branded delivery experience

---

## 3. System Boundaries

### In-Scope

- Web application (Next.js frontend + API routes)
- PostgreSQL database (Neon)
- Authentication system (Clerk)
- File storage (Vercel Blob / Cloudflare R2)
- Email delivery (Resend)
- Payment processing (Stripe/PayPal integration)
- Analytics (Google Analytics, optional)

### Out-of-Scope

- Mobile applications (responsive web only)
- Third-party vendor systems (assessed via vendor management)
- Physical office infrastructure (cloud-based)
- Hardware devices (client devices)

---

## 4. Infrastructure

### Hosting Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Layer                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Desktop   │  │ Tablet   │  │ Mobile   │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       │             │             │                         │
└───────┼─────────────┼─────────────┼─────────────────────────┘
        │             │             │
        ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                   CDN / Edge Layer                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Vercel Edge Network                     │   │
│  │         (Global DNS, Caching, Edge Functions)        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Vercel Functions (Node.js)              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │  Frontend    │  │  API Routes │  │  Middleware  │  │   │
│  │  │  (Next.js)   │  │  (REST/GraphQL)│ (Auth,Rate │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Neon      │  │  Vercel     │  │     Clerk           │ │
│  │  PostgreSQL │  │   Blob      │  │   (Auth)            │ │
│  │  (Primary)  │  │  (Media)    │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Resend    │  │   Stripe/   │  │     GitHub          │ │
│  │   (Email)   │  │   PayPal    │  │   (Code/CI)         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Infrastructure Components

| Component | Provider | Purpose | SLA |
|-----------|----------|---------|-----|
| Application Hosting | Vercel | Next.js deployment, serverless functions | 99.99% |
| Database | Neon | PostgreSQL database, point-in-time recovery | 99.95% |
| Authentication | Clerk | User management, MFA, session handling | 99.99% |
| Object Storage | Vercel Blob | Image/video storage, CDN distribution | 99.99% |
| CDN/DNS | Vercel | Global edge network, DNS management | 99.99% |
| Email | Resend | Transactional emails, notifications | 99.9% |
| Payments | Stripe/PayPal | Payment processing, invoicing | 99.99% |
| Version Control | GitHub | Source code, CI/CD, code review | 99.9% |

---

## 5. Software

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18.x | UI component library |
| | Next.js | 14.x | React framework, App Router |
| | TypeScript | 5.x | Type safety |
| | Tailwind CSS | 3.x | Utility-first styling |
| **Backend** | Node.js | 22 LTS | Runtime environment |
| | Next.js API Routes | 14.x | Server-side logic |
| | Drizzle ORM | 0.x | Database ORM, type-safe queries |
| **Database** | PostgreSQL | Latest | Primary data store |
| | Neon | Latest | Serverless Postgres provider |
| **Authentication** | Clerk | Latest | User management, MFA |
| **Storage** | Vercel Blob | Latest | Image/video storage |
| | Cloudflare R2 | (Optional) | Alternative S3-compatible storage |
| **Email** | Resend | Latest | Email delivery |
| **Payments** | Stripe/PayPal | Latest | Payment processing |
| **Monitoring** | Vercel Analytics | Latest | Performance monitoring |
| | Google Analytics | Latest | User analytics (optional) |
| **CI/CD** | GitHub Actions | Latest | Automated testing, deployment |
| **Security** | trufflehog | Latest | Secret scanning |
| | Dependabot | Latest | Dependency updates |

### Architecture Patterns

- **Server Components**: Next.js App Router with server components for data fetching
- **Edge Functions**: Middleware for authentication, routing, rate limiting
- **API Routes**: RESTful endpoints with consistent error handling
- **Database Transactions**: Drizzle ORM for type-safe queries
- **Event-Driven**: Clerk webhooks for async user events
- **State Management**: React Context for UI state, Clerk for auth state

---

## 6. People

### Roles and Responsibilities

| Role | Count | Responsibilities | Access Level |
|------|-------|-----------------|--------------|
| **Engineering Manager** | 1 | Technical leadership, architecture decisions | Full admin |
| **Lead Engineer** | 1 | Development, code review, security | Developer + deploy |
| **Platform Engineer** | 1 | DevOps, infrastructure, monitoring | Infrastructure admin |
| **Security Lead** | 1 | Security policy, vulnerability management | Security admin |
| **Creative Staff** | Variable | Gallery creation, client communication | Creator (limited) |
| **Clients** | Variable | Gallery viewing, selection, approval | Client (guest) |

### Access Control Model

- **Creators**: Can access their own data (clients, projects, galleries, invoices)
- **Clients**: Can access only their assigned galleries via secure tokens
- **Administrators**: Full platform access (infrastructure, configuration)
- **External Vendors**: Limited, time-bound access per engagement

---

## 7. Processes

### Development Lifecycle

1. **Planning**: Feature requests prioritized via backlog
2. **Development**: Feature branches, pull requests required
3. **Code Review**: Mandatory review by at least 1 CODEOWNER
4. **Testing**: Automated tests (unit, integration, security)
5. **CI/CD**: GitHub Actions pipeline (lint → test → build → deploy)
6. **Deployment**: Production via Vercel, manual promotion from staging
7. **Monitoring**: Error tracking, performance metrics, security alerts

### Security Processes

1. **Vulnerability Management**: Weekly automated scans, quarterly manual review
2. **Access Reviews**: Quarterly review of all access privileges
3. **Incident Response**: Tiered response based on severity
4. **Change Management**: All changes documented, reviewed, tested
5. **Backup & Recovery**: Daily automated backups, quarterly restore tests
6. **Offboarding**: Immediate access revocation upon departure

---

## 8. Data

### Data Categories

| Category | Description | Classification | Volume |
|----------|-------------|---------------|--------|
| **Customer PII** | Names, emails, phone numbers | Confidential | ~100 GB |
| **Project Data** | Quotes, invoices, contracts | Confidential | ~50 GB |
| **Gallery Content** | Photos, videos, metadata | Confidential | ~500 GB |
| **Authentication** | User accounts, sessions, tokens | Restricted | ~1 GB |
| **Financial Data** | Payment records, bank details | Restricted | ~10 GB |
| **System Logs** | Access logs, error logs | Internal | ~100 GB/year |

### Data Lifecycle

1. **Collection**: Via application forms, uploads, integrations
2. **Storage**: Encrypted at rest (AES-256), in transit (TLS 1.3)
3. **Processing**: Server-side processing with authorization checks
4. **Sharing**: Secure token-based access for clients
5. **Retention**: Per policy (see Data Retention Policy)
6. **Disposal**: Secure deletion with verification

### Data Locations

| Data Type | Primary Location | Backup Location | Encryption |
|-----------|-----------------|-----------------|------------|
| Database | Neon (us-east-1) | Automated snapshots | At rest + transit |
| Media Files | Vercel Blob | Regional replicas | At rest + transit |
| Auth Data | Clerk | Multi-region | At rest + transit |
| Backups | Vercel managed | Geographic redundancy | At rest |

---

## 9. Third-Party Services

### Critical Vendors

| Vendor | Service | Data Accessed | Risk Level | Contract |
|--------|---------|---------------|------------|----------|
| **Vercel** | Hosting, deployment | App code, env vars | Critical | Annual |
| **Neon** | Database | All data | Critical | Pay-as-you-go |
| **Clerk** | Authentication | User PII, sessions | Critical | Pay-as-you-go |
| **GitHub** | Code, CI/CD | Source code, secrets | High | Free tier |
| **Resend** | Email | Customer contacts | Medium | Pay-as-you-go |
| **Stripe/PayPal** | Payments | Financial data | Critical | Transaction fees |

### Vendor Security Requirements

- SOC 2 Type II or ISO 27001 certification preferred
- Data Processing Agreements (DPA) in place
- Breach notification within 72 hours
- Subprocessor restrictions documented
- Annual security assessment for critical vendors

---

## 10. Control Environment

### Technical Controls

| Control | Implementation | Owner |
|---------|---------------|-------|
| **Authentication** | Clerk MFA, session management | Security Lead |
| **Authorization** | withCreatorApi wrapper, ownership checks | Engineering Manager |
| **Encryption** | TLS 1.3 in transit, AES-256 at rest | Platform Engineer |
| **Logging** | Structured JSON logging, IP hash anonymization | Security Lead |
| **Monitoring** | Vercel analytics, error tracking | Platform Engineer |
| **Backup** | Automated daily snapshots, 30-day retention | Platform Engineer |
| **Secrets** | Environment variables, .gitignore, secret scanning | Security Lead |

### Administrative Controls

| Control | Implementation | Owner |
|---------|---------------|-------|
| **Security Policy** | 18 documented policies | Security Lead |
| **Access Reviews** | Quarterly reviews | Engineering Manager |
| **Training** | Annual security awareness | HR Manager |
| **Incident Response** | Formal IR plan | Security Lead |
| **Vendor Management** | Risk assessments, DPA | Engineering Manager |
| **Risk Management** | Risk register, treatment plans | Security Lead |

### Physical Controls

- Cloud-only infrastructure (no physical servers)
- Provider data centers with SOC 2 compliance
- No on-premises equipment

---

## 11. Significant Changes

### Recent Changes (Last 12 Months)

| Date | Change | Impact | Documentation |
|------|--------|--------|---------------|
| 2026-09-15 | SOC 2 readiness program initiated | Security controls enhanced | This document |
| 2026-09-01 | Gallery access rate limiting added | Brute force protection | Security incident logs |
| 2026-08-15 | Database migration to Neon | Scalability improvement | Migration records |
| 2026-07-01 | Vercel deployment automation | CI/CD improvements | Deployment docs |

---

## 12. Availability

### Service Level Objectives

| Component | Target Uptime | Actual (Last 30 days) |
|-----------|---------------|----------------------|
| **Application** | 99.9% | 99.95% |
| **Database** | 99.95% | 99.98% |
| **Authentication** | 99.99% | 99.99% |
| **Storage** | 99.9% | 99.97% |

### Recovery Objectives

| Objective | Target | Current |
|-----------|--------|---------|
| **RTO** | 4 hours | < 2 hours |
| **RPO** | 1 hour | < 1 hour |
| **MTTR** | < 2 hours | < 1 hour |

---

## 13. Confidentiality

### Data Classification Summary

| Level | Percentage of Data | Protection Required |
|-------|--------------------|--------------------|
| **Public** | ~20% | Standard web security |
| **Internal** | ~15% | Access controls, logging |
| **Confidential** | ~55% | Encryption, strict access |
| **Restricted** | ~10% | Maximum protection, audit |

### Confidentiality Controls

- Client PII encrypted at rest
- Gallery access via time-limited tokens
- Payment data tokenized via Stripe/PayPal
- Communication logs retained per policy

---

## 14. Security

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 1: Network Security                          │   │
│  │  - TLS 1.3 enforced                                 │   │
│  │  - DDoS protection (Vercel)                         │   │
│  │  - Firewall rules (provider-managed)                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 2: Authentication                            │   │
│  │  - Clerk MFA enforcement                            │   │
│  │  - Session management                               │   │
│  │  - Password policies                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 3: Authorization                             │   │
│  │  - withCreatorApi wrapper                           │   │
│  │  - Resource ownership checks                        │   │
│  │  - Rate limiting                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 4: Data Protection                           │   │
│  │  - Encryption at rest (AES-256)                     │   │
│  │  - Encryption in transit (TLS 1.3)                  │   │
│  │  - Secret management (env vars)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 5: Monitoring & Response                     │   │
│  │  - Security event logging                           │   │
│  │  - Anomaly detection                                │   │
│  │  - Incident response process                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Security Posture

| Metric | Value |
|--------|-------|
| **Known Vulnerabilities** | 0 high/critical |
| **Security Incidents (Last 90 days)** | 0 |
| **Security Tests Passed** | 100% |
| **Patch Currency** | Current |
| **MFA Adoption** | 100% (admin), 85% (users) |

---

## Document Control

| Field | Value |
|-------|-------|
| **Document Owner** | Engineering Manager |
| **Classification** | Internal |
| **Review Frequency** | Annually |
| **Last Review Date** | 2026-10-02 |
| **Next Review Date** | 2027-10-02 |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-10-02 | Engineering Manager | Initial version |
