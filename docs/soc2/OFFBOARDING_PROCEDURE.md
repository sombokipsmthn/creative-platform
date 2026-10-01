# Offboarding Procedure

**Document Version**: 1.0
**Last Updated**: 2026-10-01
**Owner**: Engineering Manager + HR
**Review Cycle**: Annually or as needed

---

## Purpose

This document defines the offboarding procedure for the KIPSMTHN Creative Platform. It establishes a repeatable, auditable workflow for securely revoking access when employees, contractors, or service providers leave the organization or change roles.

---

## Scope

This procedure applies to:

- **Employees** (full-time, part-time, temporary)
- **Contractors** (independent contractors, agency staff, consultants)
- **Service Providers** (third-party vendors with platform access)
- **Role Changes** (internal transfers, promotions, demotions)
- **Access Types**:
  - Infrastructure provider access (Vercel, Neon, Clerk, GitHub, etc.)
  - Application access (creator accounts, client access, API keys)
  - Physical access (if applicable)
  - Knowledge access (documentation, code, configurations)

---

## Offboarding Timeline

### Ideal Scenario (Known Departure in Advance)

| Timeline | Action | Owner |
|----------|--------|-------|
| **T-4 Weeks** | Initiate offboarding process | HR |
| **T-3 Weeks** | Access inventory and planning | Engineering Manager |
| **T-2 Weeks** | Access revocation planning | System Owners |
| **T-1 Week** | Knowledge transfer and documentation | Departing Individual |
| **T-3 Days** | Final access review | Engineering Manager |
| **T-Day** | Access revocation (last day) | System Owners |
| **T+1 Day** | Verification and reporting | Engineering Manager |
| **T+7 Days** | Access review confirmation | Engineering Manager |

### Immediate Departure (Termination, Security Incident)

| Timeline | Action | Owner |
|----------|--------|-------|
| **T=0** | Initiate emergency offboarding | HR + Security Lead |
| **T+1 Hour** | Critical access revocation | System Owners |
| **T+4 Hours** | High-risk access revocation | System Owners |
| **T+8 Hours** | Standard access revocation | System Owners |
| **T+24 Hours** | Verification and reporting | Engineering Manager |

---

## Offboarding Procedure

### Phase 1: Initiation (HR Responsibilities)

1. **Notification**: HR notifies Engineering Manager of impending departure
2. **Classification**: Determine departure type:
   - Voluntary resignation
   - Termination (performance, conduct)
   - Layoff/restructuring
   - End of contract
   - Role change/internal transfer
3. **Timeline Agreement**: Establish offboarding schedule based on departure type
4. **Access Inventory Request**: Request current access inventory from Engineering Manager
5. **Knowledge Transfer Planning**: Schedule knowledge transfer sessions

### Phase 2: Access Inventory (Engineering Manager Responsibilities)

Within 3 days of notification, Engineering Manager provides:
1. **Infrastructure Access List**:
   - Vercel: Team membership, environment variable access, integration permissions
   - Neon: Database user accounts, roles, connection strings
   - Clerk: Dashboard access, MFA settings, webhook management
   - GitHub: Repository permissions, team membership, API tokens, SSH keys
   - Cloudflare R2: Bucket access, API tokens (if applicable)
   - Other providers: As applicable
2. **Application Access List**:
   - Creator accounts: Users with local creator records
   - Client accounts: Users with active gallery access tokens/PINs
   - API keys: Service accounts for internal/external integrations
   - Webhooks: Registered webhook endpoints
3. **Current Usage Metrics** (where available):
   - Last login timestamp
   - API request volume (last 30 days)
   - Deployment activity (last 30 days)
   - Console/login activity (last 30 days)
4. **Access Justification Documentation**:
   - Business purpose for each access
   - Role/job function alignment
   - Data classification accessed

### Phase 3: Access Revocation Planning (System Owner Responsibilities)

Each system owner plans revocation for their domain:

**Vercel Administrator**:
- Remove from team
- Revoke environment variable access
- Revoke integration permissions
- Cancel deployment permissions
- Remove from organization (if applicable)

**Neon Database Administrator**:
- Revoke database user account
- Or: Set password to random value and disable login
- Remove roles/privileges
- Audit recent activity for data exfiltration risks

**Clerk Administrator**:
- Revoke dashboard access
- Enforce MFA reset (if account to be preserved)
- Revoke webhook management permissions
- Schedule account deletion/downgrading (per data retention policy)

**GitHub Administrator**:
- Remove from organization/teams
- Revoke repository permissions
- Revoke API tokens and SSH keys
- Remove from billing (if applicable)
- Audit recent commits for data exfiltration risks

**Application Owner**:
- For creator accounts: Anonymize/pseudonymize data per retention policy
- For client access: Revoke gallery tokens/PINs
- For API keys: Rotate/revoke keys
- For webhooks: Delete/update endpoints

### Phase 4: Knowledge Transfer (Departing Individual Responsibilities)

1. **Documentation Review**:
   - Ensure all runbooks, procedures, and configurations are up-to-date
   - Commit all pending changes to version control
   - Document any undocumented processes or tribal knowledge
2. **Knowledge Transfer Sessions**:
   - Schedule sessions with knowledge recipients
   - Cover: system architecture, deployment procedures, incident response
   - Provide access to monitoring dashboards, logs, and alerts
3. **Access to Resources**:
   - Ensure knowledge recipients have necessary access during transfer period
   - Provide read-only access to historical data where applicable

### Phase 5: Final Access Review (Engineering Manager Responsibilities)

1 day before last day:
1. Verify all planned revocations are scheduled or completed
2. Check for any missed access points
3. Confirm knowledge transfer completion
4. Prepare verification checklist for post-departure validation

### Phase 6: Access Revocation (Last Day - System Owner Responsibilities)

Execute revocations according to planned schedule:
- Priority 1 (Critical): Immediate revocation on notice
  - Production database access
  - Environment variable modification permissions
  - Deployment approval permissions
  - API key creation/revocation permissions
- Priority 2 (High): Revoke within 4 hours
  - Read-only database access
  - Log viewing permissions
  - Monitoring dashboard access
  - Staging environment access
- Priority 3 (Standard): Revoke within 8 hours
  - Documentation access
  - Development environment access
  - Non-production API keys
  - Test environment access
- Priority 4 (Low): Revoke within 24 hours
  - Archived data access
  - Historical logs access
  - Reference materials access

### Phase 7: Verification and Reporting (Engineering Manager Responsibilities)

Within 24 hours after last day:
1. **Verification**:
   - Attempt to log in with departed user's credentials (should fail)
   - Check API key validity (should be invalid/revoked)
   - Verify environment variable access (should be denied)
   - Confirm repository access (should be denied)
   - Validate dashboard access (should be denied)
2. **Reporting**:
   - Compile offboarding report:
     - Departing individual information
     - Timeline and actions taken
     - Verification results
     - Exceptions or issues encountered
     - Lessons learned
   - Store report in secure, access-controlled location
   - Notify HR and Security Lead of completion
   - Schedule follow-up verification at 7 and 30 days

### Phase 8: Follow-up Verification (Engineering Manager Responsibilities)

At 7 and 30 days post-departure:
1. Repeat verification checks from Phase 7
2. Check for any anomalous activity (should be none)
3. Document verification results
4. Escalate any suspicious activity to Security Lead immediately

---

## Evidence Collection

**Required Records (Retained 3 Years)**:
1. Offboarding initiation notice (HR email/ticket)
2. Access inventory report (Engineering Manager)
3. Access revocation plan (System Owners)
4. Knowledge transfer records (session notes, documentation updates)
5. Access revocation tickets/records (system logs, provider confirmations)
6. Verification reports (T+1 day, T+7 days, T+30 days)
7. Offboarding report (final summary)
8. Exception records (if any)

**Storage Location**:
- Secure, access-controlled repository (e.g., encrypted GitHub repo with limited access)
- Access restricted to Engineering Manager, HR, Security Lead, and Platform Owner
- Backup in secure, geographically-separated location

---

## Special Cases

### Role Change / Internal Transfer
- Follow same procedure but modify rather than revoke access
- Update access to match new role/responsibilities
- Verify new access is appropriate and minimal necessary
- Document role change in access management system

### Contractor/Agency Staff
- Same procedure as employees
- Coordinate with contracting agency for notification
- May have shorter notice periods
- Verify completion of deliverables before final access revocation

### Service Provider Vendors
- Follow vendor management process
- Coordinate through procurement/legal contacts
- May have contractual notice periods
- Verify SLAs and data handling commitments

### Deceased or Incapacitated Individual
- Follow emergency offboarding procedure
- Coordinate with emergency contact/legal representative
- May require legal documentation for account access
- Prioritize data preservation and security

### Security Incident / Suspected Compromise
- Follow emergency offboarding procedure
- Prioritize speed over completeness
- Preserve logs and evidence for investigation
- Notify Security Lead immediately
- May involve forensic preservation of accounts

---

## Integration with SOC 2 Controls

| SOC 2 Criteria | Control | Evidence |
|----------------|---------|----------|
| CC6.1 | Logical access security measures | Access revocation records, verification reports |
| CC6.2 | Authentication credentials | Credential revocation, MFA enforcement |
| CC6.3 | Authorization | Access justification reviews, least privilege enforcement |
| CC6.4 | Network security | Firewall rule updates, VPC changes (if applicable) |
| CC6.5 | Password requirements | Password changes, credential revocation |
| CC6.6 | Electronic credential transmission | Webhook updates, API key rotation |
| CC6.7 | Access restriction changes | Access revocation tickets, approval records, implementation logs |
| CC6.8 | Physical access | Provider SOC 2 reports, device collection records |
| CC6.9 | Online transaction processing | Application logs, API audit trails, change management |
| CC7.1 | Vulnerability identification | Offboarding as vulnerability prevention control |
| CC7.2 | Vulnerability assessment | Risk assessment during offboarding process |
| CC7.3 | Vulnerability remediation | Access revocation as remediation action |
| CC7.4 | Vulnerability verification | Post-departure verification activities |
| CC7.5 | Vulnerability documentation | Offboarding reports, exception records, metrics |

---

## Metrics & KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Offboarding completion rate | 100% | Completed offboardings / Total offboardings |
| Average time to revoke critical access | < 1 hour | Notification → Critical access revoked |
| Average time to complete standard offboarding | < 8 hours | Notification → All access revoked |
| Post-offboarding access attempts | 0 | Verified login/API attempts after revocation |
| Knowledge transfer completion rate | 100% | Planned sessions / Completed sessions |
| Offboarding exception rate | < 5% | Offboardings with exceptions / Total offboardings |
| Verification compliance rate | 100% | Required verifications completed / Total offboardings |

---

## Emergency Offboarding Checklist

**Immediate Actions (Within 1 Hour)**:
[ ] Notify Engineering Manager and Security Lead
[ ] Revoke production database access
[ ] Revoke environment variable modification permissions
[ ] Revoke deployment approval permissions
[ ] Revoke API key creation/revocation permissions
[ ] Revoke primary domain administration access (if applicable)
[ ] Revoke primary cloud administrator access (if applicable)
[ ] Revoke primary financial system access (if applicable)

**Short-term Actions (Within 4 Hours)**:
[ ] Revoke read-only database access
[ ] Revoke log viewing permissions
[ ] Revoke monitoring dashboard access
[ ] Revoke staging environment access
[ ] Revoke CI/CD pipeline modification permissions
[ ] Revoke secret management access (if applicable)
[ ] Revoke encryption key management access (if applicable)

**Standard Actions (Within 8 Hours)**:
[ ] Revoke documentation access
[ ] Revoke development environment access
[ ] Revoke non-production API keys
[ ] Revoke test environment access
[ ] Revoke third-party integration access
[ ] Revoke external service provider access
[ ] Revoke mobile device management access (if applicable)

**Follow-up Actions (Within 24 Hours)**:
[ ] Verify all revocations (attempt login/use should fail)
[ ] Check for any missed access points
[ ] Document verification results
[ ] Notify HR and Security Lead of completion
[ ] Schedule 7-day and 30-day follow-up verifications

---

## References

- [NIST SP 800-88 Rev. 1](https://csrc.nist.gov/publications/detail/sp/800-88/rev-1/final) - Guidelines for Media Sanitization
- [ISO/IEC 27001:2022](https://www.iso.org/standard/93273.html) - Information security management systems
- [SOC 2 Trust Services Criteria](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/soc2trustservicescriteria.html)
- [ITIL v4](https://www.itilframework.com/) - Information Technology Infrastructure Library
- [NIST SP 800-53 Rev. 5](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final) - Security and Privacy Controls for Information Systems and Organizations

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-10-01 | Engineering Manager + HR | Initial version |