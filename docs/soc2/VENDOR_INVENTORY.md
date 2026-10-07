# Vendor Inventory for KIPSMTHN Creative Platform

## Introduction

This document provides a comprehensive inventory of all third-party vendors and service providers used by the KIPSMTHN Creative Platform. Each vendor is assessed for business criticality, security relevance, and contractual obligations.

## Vendor Inventory

| Vendor ID | Vendor Name | Service Provided | Data Accessed | Business Criticality | Security Relevance | Contract | DPA Available | SOC Report Availability | Subprocessors | Renewal/Review Date | Owner |
|-----------|-------------|------------------|---------------|----------------------|--------------------|----------|---------------|-------------------------|---------------|---------------------|-------|
| VEN-001 | Vercel | Hosting, deployments, serverless functions | Application code, configuration, logs | High | High | Enterprise Agreement | Yes | SOC 2 Type 2 | AWS, Google Cloud | Annual | Platform Engineer |
| VEN-002 | Neon | Database hosting | User data, gallery metadata, financial records | High | High | Service Agreement | Yes | SOC 2 Type 2 | AWS | Annual | Platform Engineer |
| VEN-003 | Clerk | Authentication and user management | User credentials, session tokens, profile data | High | High | Service Agreement | Yes | SOC 2 Type 2 | AWS, Google Cloud | Annual | Security Lead |
| VEN-004 | Vercel Blob | Object storage | Media files, gallery content, backups | High | High | Service Agreement | Yes | SOC 2 Type 2 | AWS | Annual | Platform Engineer |
| VEN-005 | Resend | Email delivery | Email content, recipient addresses, metadata | Medium | Medium | Service Agreement | Yes | SOC 2 Type 2 | AWS | Annual | Platform Engineer |
| VEN-006 | Stripe | Payment processing (planned) | Payment card information, transaction data | High | High | Service Agreement | Yes | SOC 2 Type 2 | Various banks | Annual | Platform Engineer |
| VEN-007 | GitHub | Source code hosting, version control | Source code, configuration, issues | Medium | Medium | Enterprise Agreement | Yes | SOC 2 Type 2 | Microsoft Azure | Annual | Engineering Manager |
| VEN-008 | Cloudflare | CDN, DNS, SSL/TLS | Network traffic, DNS records | Medium | Medium | Service Agreement | Yes | SOC 2 Type 2 | Various | Annual | Platform Engineer |

## Critical Vendors

Special attention is given to the following critical vendors:

1. **Vercel**: Primary hosting platform for the application
2. **Neon**: Primary database hosting provider
3. **Clerk**: Primary authentication and user management provider
4. **Vercel Blob**: Primary object storage provider
5. **Stripe**: Planned payment processing provider

## Vendor Assessment Criteria

Each vendor is assessed based on the following criteria:

1. **Business Criticality**: How critical is the vendor's service to platform operations?
2. **Security Relevance**: What security implications does the vendor introduce?
3. **Data Accessed**: What type of data does the vendor have access to?
4. **Contract**: What contractual agreements are in place?
5. **DPA Availability**: Is a Data Processing Agreement available?
6. **SOC Report Availability**: Does the vendor provide SOC reports?
7. **Subprocessors**: Who are the vendor's subprocessors?
8. **Renewal/Review Date**: When is the contract up for renewal or review?
9. **Owner**: Who is responsible for managing the vendor relationship?

## Vendor Review Process

The platform conducts regular vendor reviews following this process:

1. **Discover**: Identify all vendors and services
2. **Assess**: Evaluate each vendor against the assessment criteria
3. **Prioritize**: Rank vendors by criticality and risk
4. **Document**: Record findings in the vendor inventory
5. **Monitor**: Ongoing monitoring of vendor performance and security
6. **Review**: Conduct formal reviews at scheduled intervals
7. **Renew**: Renew or terminate contracts as needed

## Evidence Requirements

For each vendor, the following evidence should be maintained:

1. Contract agreements
2. Data Processing Agreements (DPAs)
3. SOC reports or equivalent certifications
4. Security assessments and questionnaires
5. Performance and SLA reports
6. Incident reports and breach notifications
7. Renewal and termination notices
8. Communication records with vendors

## Acceptance Criteria

The following criteria must be met for the vendor inventory to be considered complete:

1. All third-party vendors and service providers are identified.
2. Each vendor's service, data accessed, and business criticality are documented.
3. Security relevance and contractual obligations are documented.
4. DPA and SOC report availability are documented.
5. Subprocessors are identified where applicable.
6. Renewal/review dates are documented.
7. Owners are assigned for each vendor relationship.
8. Vendor review process is defined and documented.

This vendor inventory provides a comprehensive overview of all third-party vendors and service providers used by the KIPSMTHN Creative Platform. It includes vendor details, services provided, data accessed, business criticality, security relevance, contractual information, and ownership information. This inventory serves as a foundation for vendor risk management, security assessments, and compliance monitoring.