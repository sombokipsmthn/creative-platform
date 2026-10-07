# Scope Definition for KIPSMTHN Creative Platform

## System Boundary

The KIPSMTHN Creative Platform is a web-based application designed to facilitate creative services for photographers and their clients. It operates within the following boundaries:

- **Frontend**: Next.js application running on Vercel
- **Backend**: API routes and server actions
- **Database**: Neon/Postgres hosted on Vercel
- **Storage**: Vercel Blob for media storage
- **Authentication**: Clerk for user management
- **Third-party Services**: Resend for email, Stripe for payments (planned)

## Services Provided

The platform provides the following services:

1. Creator accounts and profiles
2. Client management
3. Project tracking
4. Gallery creation and sharing
5. Photo upload and processing
6. Gallery access controls
7. Favorites and selections
8. Comments and approval workflows
9. Download management
10. Quotes and invoicing
11. Contract management
12. Payment processing (planned)
13. Equipment records
14. Notifications and activity tracking

## Users

The platform has three main user types:

1. **Creators**: Photographers and creative professionals
2. **Clients**: Individuals or businesses hiring the creators
3. **Administrators**: Platform staff

## Sensitive Data

The platform handles the following types of sensitive data:

1. Personal information of creators and clients
2. Financial information (quotes, invoices, contracts)
3. Gallery content and access credentials
4. Authentication credentials
5. Payment information (when implemented)

## Production Systems

The production environment consists of:

1. Vercel deployment for frontend and API
2. Neon/Postgres database
3. Vercel Blob storage
4. Clerk authentication service

## Third-Party Systems

The platform integrates with the following third-party systems:

1. Vercel (hosting, deployments, serverless functions)
2. Neon (database hosting)
3. Clerk (authentication and user management)
4. Vercel Blob (object storage)
5. Resend (email delivery)
6. Stripe (payment processing, planned)

## Trust Services Criteria

The platform will be evaluated against the following Trust Services Criteria:

1. Security
2. Availability
3. Confidentiality
4. Processing Integrity
5. Privacy

## Exclusions

The following systems and services are excluded from the SOC 2 scope:

1. Mobile applications (planned for future phases)
2. Physical office infrastructure
3. Third-party services not directly integrated with the platform

## Dependencies

The platform has the following dependencies:

1. Next.js framework
2. React library
3. TypeScript
4. Drizzle ORM
5. Vercel platform
6. Neon database service
7. Clerk authentication service
8. Vercel Blob storage

## System Owners

The system owners are:

1. Engineering Manager
2. Lead Engineer
3. Platform Engineer
4. Security Lead

## Control Owners

Control ownership is assigned as follows:

1. Security: Security Lead
2. Authentication: Lead Engineer
3. Authorization: Platform Engineer
4. Data Protection: Engineering Manager
5. Infrastructure: Platform Engineer
6. Application Security: Lead Engineer
7. Vendor Management: Security Lead
8. Incident Response: Engineering Manager
9. Compliance: Security Lead

## Evidence Owners

Evidence ownership is assigned as follows:

1. Security Evidence: Security Lead
2. Access Review Evidence: Platform Engineer
3. Audit Evidence: Engineering Manager
4. Configuration Evidence: Platform Engineer
5. Change Management Evidence: Lead Engineer
6. Vendor Evidence: Security Lead
7. Compliance Evidence: Security Lead
8. Policy Evidence: Engineering Manager

## Acceptance Criteria

The following criteria must be met for the scope to be considered complete:

1. Every production component has an owner.
2. Every production data store is identified.
3. Every major third-party provider is identified.
4. Scope boundaries are explicit.
5. Out-of-scope systems have documented rationale.

This scope document provides a clear definition of what is included in the SOC 2 examination and what is excluded. It establishes the boundaries of the system, identifies the services provided, and defines the users, sensitive data, production systems, and third-party systems involved. The document also specifies the Trust Services Criteria to be evaluated and any exclusions from the scope.