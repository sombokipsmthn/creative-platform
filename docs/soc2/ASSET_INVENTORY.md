# Asset Inventory for KIPSMTHN Creative Platform

## Introduction

This document provides a comprehensive inventory of all assets within the KIPSMTHN Creative Platform environment. Assets are categorized by type and include detailed information for each asset.

## Asset Categories

Assets are organized into the following categories:

1. Hardware Assets
2. Software Assets
3. Data Assets
4. Network Assets
5. Facilities Assets
6. Personnel Assets

## Hardware Assets

The platform utilizes cloud infrastructure and does not own physical hardware assets. However, the following hardware assets are relevant to the platform:

| Asset ID | Asset Type | Description | Owner | Location | Criticality |
| ---------- | ------------ | ------------- | ------- | ---------- | ------------- |
| HW-001 | Development Laptops | Developer laptops used for platform development | Engineering Team | Remote | Medium |
| HW-002 | Mobile Devices | Mobile devices used for testing | QA Team | Remote | Low |
| HW-003 | Servers | Virtual servers hosted on Vercel | Platform Engineer | Vercel Cloud | High |
| HW-004 | Database Instances | Neon/Postgres database instances | Platform Engineer | Neon Cloud | High |
| HW-005 | Storage Buckets | Vercel Blob storage buckets | Platform Engineer | Vercel Cloud | High |

## Software Assets

The platform utilizes the following software assets:

| Asset ID | Asset Type | Description | Version | Owner | License | Criticality |
| ---------- | ------------ | ------------- | --------- | ------- | --------- | ------------- |
| SW-001 | Operating System | Linux (Ubuntu) | Latest | Platform Engineer | Open Source | High |
| SW-002 | Web Framework | Next.js | 14.x | Platform Engineer | MIT | High |
| SW-003 | UI Library | React | 18.x | Platform Engineer | MIT | High |
| SW-004 | Language | TypeScript | 5.x | Platform Engineer | Apache 2.0 | High |
| SW-005 | Styling | Tailwind CSS | Latest | Platform Engineer | MIT | Medium |
| SW-006 | Animation | Framer Motion | Latest | Platform Engineer | MIT | Low |
| SW-007 | Icons | Lucide React | Latest | Platform Engineer | ISC | Low |
| SW-008 | ORM | Drizzle ORM | Latest | Platform Engineer | MIT | High |
| SW-009 | Authentication | Clerk | Latest | Security Lead | Proprietary | High |
| SW-010 | Database | Neon/Postgres | Latest | Platform Engineer | Open Source | High |
| SW-011 | Storage | Vercel Blob | Latest | Platform Engineer | Proprietary | High |
| SW-012 | Email Service | Resend | Latest | Platform Engineer | Proprietary | Medium |
| SW-013 | Payment Service | Stripe | Latest | Platform Engineer | Proprietary | Medium |
| SW-014 | Testing Framework | Vitest | Latest | Engineering Team | MIT | Medium |
| SW-015 | Linter | ESLint | Latest | Engineering Team | MIT | Medium |
| SW-016 | Secret Scanner | TruffleHog | Latest | Security Team | AGPL-3.0 | High |

## Data Assets

The platform manages the following data assets:

| Asset ID | Asset Type | Description | Owner | Location | Retention Period | Sensitivity |
| ---------- | ------------ | ------------- | ------- | ---------- | ------------------ | ------------- |
| DA-001 | User Profiles | Creator and client profile information | Platform Engineer | Neon/Postgres | 7 years | Confidential |
| DA-002 | Gallery Metadata | Gallery information and metadata | Platform Engineer | Neon/Postgres | 7 years | Confidential |
| DA-003 | Media Files | Photos and videos uploaded to galleries | Platform Engineer | Vercel Blob | 7 years | Confidential |
| DA-004 | Financial Records | Quotes, invoices, contracts, and payments | Platform Engineer | Neon/Postgres | 10 years | Restricted |
| DA-005 | Authentication Data | Session tokens and authentication logs | Platform Engineer | Neon/Postgres | 90 days | Restricted |
| DA-006 | Activity Logs | User activity and audit logs | Platform Engineer | Neon/Postgres | 2 years | Internal |
| DA-007 | Configuration Data | System configuration and settings | Platform Engineer | Neon/Postgres | 3 years | Internal |
| DA-008 | Error Logs | Application and system error logs | Platform Engineer | Neon/Postgres | 1 year | Internal |
| DA-009 | Backup Data | Database and system backups | Platform Engineer | Vercel Blob | 1 year | Restricted |
| DA-010 | API Keys | Third-party service API keys | Security Lead | Environment Variables | Until rotation | Restricted |

## Network Assets

The platform utilizes the following network assets:

| Asset ID | Asset Type | Description | Owner | Location | Criticality |
| ---------- | ------------ | ------------- | ------- | ---------- | ------------- |
| NW-001 | Internet Connection | Connection to Vercel platform | Platform Engineer | Vercel Cloud | High |
| NW-002 | API Endpoints | Public and private API endpoints | Platform Engineer | Vercel Cloud | High |
| NW-003 | Database Connections | Connections to Neon/Postgres database | Platform Engineer | Neon Cloud | High |
| NW-004 | Storage Connections | Connections to Vercel Blob storage | Platform Engineer | Vercel Cloud | High |
| NW-005 | Email Service Connections | Connections to Resend email service | Platform Engineer | Resend Cloud | Medium |
| NW-006 | Payment Service Connections | Connections to Stripe payment service | Platform Engineer | Stripe Cloud | Medium |
| NW-007 | Content Delivery Network | Vercel Edge Network for content delivery | Platform Engineer | Vercel Cloud | High |

## Facilities Assets

The platform utilizes cloud infrastructure and does not own physical facilities assets. However, the following facilities assets are relevant to the platform:

| Asset ID | Asset Type | Description | Owner | Location | Criticality |
| ---------- | ------------ | ------------- | ------- | ---------- | ------------- |
| FA-001 | Office Space | Office space used by platform team | Engineering Team | Remote | Low |
| FA-002 | Data Centers | Vercel, Neon, and other cloud provider data centers | Platform Engineer | Various Locations | High |
| FA-003 | Backup Facilities | Backup storage facilities | Platform Engineer | Various Locations | High |

## Personnel Assets

The platform has the following personnel assets:

| Asset ID | Asset Type | Description | Owner | Location | Criticality |
| ---------- | ------------ | ------------- | ------- | ---------- | ------------- |
| PE-001 | Engineering Team | Developers and engineers maintaining the platform | Engineering Manager | Remote | High |
| PE-002 | Security Team | Security personnel responsible for platform security | Security Lead | Remote | High |
| PE-003 | QA Team | Quality assurance personnel testing the platform | Engineering Manager | Remote | Medium |
| PE-004 | Support Team | Customer support personnel assisting users | Engineering Manager | Remote | Medium |
| PE-005 | Management Team | Platform management and leadership | CEO | Remote | High |

## Acceptance Criteria

The following criteria must be met for the asset inventory to be considered complete:

1. All hardware assets are identified and documented.
2. All software assets are identified and documented with versions and licenses.
3. All data assets are identified and documented with retention periods and sensitivity levels.
4. All network assets are identified and documented.
5. All facilities assets are identified and documented.
6. All personnel assets are identified and documented.
7. Each asset has an assigned owner.
8. Criticality levels are assigned appropriately.

This asset inventory provides a comprehensive overview of all assets within the KIPSMTHN Creative Platform environment. It includes hardware, software, data, network, facilities, and personnel assets, along with their descriptions, owners, locations, criticality levels, and other relevant information. This inventory serves as a foundation for asset management, risk assessment, and security controls.