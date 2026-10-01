# Access Review Process

**Document Version**: 1.0
**Last Updated**: 2026-10-01
**Owner**: Engineering Manager
**Review Cycle**: Quarterly

---

## Purpose

This document defines the quarterly access review process for the KIPSMTHN Creative Platform. It establishes a repeatable, auditable workflow for reviewing and validating user access to all infrastructure providers and application resources.

---

## Scope

This process applies to access reviews for:

- **Infrastructure Providers**:
  - Vercel (production deployments, environment variables, integrations)
  - Neon (PostgreSQL database, connection strings, database roles)
  - Clerk (authentication, user management, webhooks, MFA settings)
  - GitHub (repository access, branch protection, workflow permissions, tokens)
  - Cloudflare R2 (if/when used for storage)
  - Any other third-party services with access to platform data

- **Application Access**:
  - Creator accounts (users with local creator records in Neon)
  - Client accounts (users with gallery access via tokens/PINs)
  - API service accounts (if any)
  - Administrative access to internal tools

---

## Review Schedule

| Review Type | Frequency | Trigger | Owner |
|-------------|-----------|---------|-------|
| **Quarterly Access Review** | Every quarter (Jan, Apr, Jul, Oct) | First Monday of month | Engineering Manager |
| **Ad-hoc Access Review** | As needed | Role change, termination, security incident | Engineering Manager |
| **Access Request Review** | Per request | New access request | System Owner |
| **Offboarding Access Review** | Per termination | Employee/contractor offboarding | Engineering Manager + HR |

---

## Review Procedure

### 1. Preparation (Days 1-3)

**Engineering Manager Responsibilities**:
1. Generate access reports from each provider:
   - Vercel: Team members, environment variables, integrations, deployment permissions
   - Neon: Database users, roles, connection strings in use
   - Clerk: Users, roles, MFA enforcement, webhook secrets
   - GitHub: Repository permissions, team membership, API tokens, SSH keys
   - Cloudflare R2: Bucket access, API tokens (if applicable)
   - Internal: Admin panel access logs, API key usage (if applicable)
2. Export reports to secure, access-controlled location
3. Notify reviewers of upcoming review
4. Prepare review template and evidence checklist

### 2. Conduct Review (Days 4-10)

**Review Team Responsibilities** (minimum 2 reviewers, including Engineering Manager):
1. Verify principle of least privilege:
   - Each user/service account has only the permissions necessary for their role
   - No excessive permissions (e.g., write access when read-only suffices)
   - No shared accounts (all access tied to individual identities)
2. Validate access justification:
   - Each access has a documented business justification
   - Justification is current and relevant
   - Access matches job function/responsibilities
3. Check for stale/dormant accounts:
   - Identify accounts with no activity in >90 days
   - Investigate whether access is still required
   - Flag for potential removal/disablement
4. Review privileged access:
   - Confirm MFA is enforced for all privileged accounts
   - Review justifications for admin/root-level access
   - Verify separation of duties where applicable
5. Document findings:
   - Approved access (no action needed)
   - Access to be modified (revoked, reduced, or changed)
   - Access requiring further investigation
   - New access requests discovered during review

### 3. Remediation (Days 11-20)

**Engineering Manager Responsibilities**:
1. Create remediation tickets for all findings requiring action:
   - Access revocation
   - Permission reduction
   - MFA enforcement
   - Account renaming/cleanup
   - Justification updates
2. Assign tickets to appropriate owners (platform engineer, DevOps, etc.)
3. Track remediation progress in ticketing system
4. Verify completion of all remediation items
5. Obtain confirmation from system owners for provider-specific changes

### 4. Approval & Closure (Days 21-25)

**Engineering Manager Responsibilities**:
1. Compile final review report:
   - Summary of findings
   - Remediation actions taken
   - Exceptions accepted (with justification)
   - Review participants and dates
2. Obtain approval from:
   - Engineering Manager
   - Security Lead (if different)
   - Platform Owner (CTO/Head of Engineering)
3. Store review package in secure, access-controlled repository:
   - Access reports (raw data)
   - Review worksheet
   - Remediation tickets
   - Approval records
   - Final report
4. Notify stakeholders of review completion
5. Schedule next quarterly review

### 5. Reporting & Metrics (Ongoing)

**Quarterly Metrics to Track**:
- % of reviews completed on schedule
- Average time to remediate findings
- Number of excessive permissions identified
- Number of dormant/disabled accounts identified
- Number of MFA gaps identified and fixed
- Number of exceptions accepted and justification
- Cost of remediation (engineering hours)

---

## Evidence Collection

**Required Records (Retained 3 Years)**:
1. Access reports from each provider (CSV/JSON export)
2. Review worksheet with findings and decisions
3. Remediation tickets (GitHub Issues, Jira tickets, etc.)
4. Approval records (email threads, signed documents, meeting minutes)
5. Final review report
6. Metrics and KPI tracking
7. Exception register (if any)

**Storage Location**:
- Secure, access-controlled repository (e.g., encrypted GitHub repo with limited access)
- Access restricted to Engineering Manager, Security Lead, and Platform Owner
- Backup in secure, geographically-separated location

---

## Access Review Template

### Infrastructure Provider: [Provider Name]

| User/Service Account | Role/Permission | Justification | Last Activity (days) | MFA Enforced? | Action Required | Notes |
|----------------------|-----------------|---------------|----------------------|---------------|-----------------|-------|
| example@company.com | Admin | Platform engineering | 5 | Yes | None | - |
| service-account-vercel | Deploy | CI/CD pipeline | 1 | N/A (token) | Rotate token | Token age: 180 days |
| former-employee@company.com | Read | N/A | 120 | Yes | Revoke access | Employee terminated 2026-06-15 |

### Application Access: [Application Component]

| User Email | Creator ID | Last Login (days) | Galleries Accessed | API Usage (req/day) | Action Required | Notes |
|------------|------------|-------------------|--------------------|---------------------|-----------------|-------|
| creator@example.com | usr_123 | 2 | 3 galleries | 45 | None | Active creator |
| client@example.com | N/A | 45 | 1 gallery (token) | 0 | Investigate | Client gallery access |
| inactive@example.com | usr_456 | 200 | 0 | 0 | Disable account | No activity >90 days |

---

## Integration with SOC 2 Controls

| SOC 2 Criteria | Control | Evidence |
|----------------|---------|----------|
| CC6.1 | Logical access security measures | Access review reports, remediation tickets |
| CC6.2 | Authentication credentials | MFA enforcement reports, password policies |
| CC6.3 | Authorization | Access justification documentation, least privilege reviews |
| CC6.4 | Network security | Firewall rules, VPC configurations (if applicable) |
| CC6.5 | Password requirements | Password policy documentation, MFA reports |
| CC6.6 | Electronic credential transmission | Webhook verification, API token handling |
| CC6.7 | Access restriction changes | Change tickets, approval records, implementation logs |
| CC6.8 | Physical access | Provider SOC 2 reports, data center access logs |
| CC6.9 | Online transaction processing | Application logs, API audit trails, change management |

---

## Emergency Access Procedure

For emergency access requirements (e.g., production incident, security breach):

1. **Request**: Contact Engineering Manager or Security Lead via designated emergency channel (e.g., phone, pager)
2. **Approval**: Verbal approval from two of: Engineering Manager, Security Lead, Platform Owner
3. **Documentation**: Create emergency access ticket immediately after approval
4. **Execution**: Grant time-limited access (maximum 8 hours) with enhanced monitoring
5. **Review**: Post-incident review within 24 hours
6. **Revocation**: Automatic access revocation after approved time window
7. **Reporting**: Include in next quarterly access review

---

## References

- [NIST SP 800-53 Rev. 5](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final) - Security and Privacy Controls for Information Systems and Organizations
- [ISO/IEC 27002:2022](https://www.iso.org/standard/81478.html) - Information security, cybersecurity and privacy protection
- [SOC 2 Trust Services Criteria](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/soc2trustservicescriteria.html)
- [CIS Controls v8](https://www.cisecurity.org/controls/v8)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-10-01 | Engineering Manager | Initial version |