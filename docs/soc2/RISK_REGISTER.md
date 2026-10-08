# Risk Register

**Document Version**: 1.0
**Last Updated**: 2026-10-01
**Owner**: Security Lead
**Review Cycle**: Quarterly

---

## Risk Assessment Methodology

| Rating | Impact Description | Likelihood Description | Risk Score Formula |
|--------|-------------------|------------------------|-------------------|
| **Critical** | Business critical failure; regulatory violation | Almost certain (9-10/10) | Impact × Likelihood ≥ 70 |
| **High** | Significant business impact | Likely (6-8/10) | Impact × Likelihood 40-69 |
| **Medium** | Moderate business impact | Possible (3-5/10) | Impact × Likelihood 15-39 |
| **Low** | Minor business impact | Unlikely (1-2/10) | Impact × Likelihood < 15 |

---

## Risk Register

| ID | Asset/System | Threat | Vulnerability | Impact | Likelihood | Risk Score | Existing Controls | Treatment | Owner | Target Date | Status |
|----|-------------|--------|---------------|--------|------------|------------|-------------------|-----------|-------|-------------|--------|
| RISK-001 | Database (Neon) | Unauthorized access | Weak authentication controls | Critical (9) | Medium (4) | **36** | MFA enforced, IP restrictions | Mitigate | Platform Engineer | 2026-12-31 | In Progress |
| RISK-002 | Gallery Access | Session hijacking | Short session expiry | High (7) | Low (2) | **14** | HttpOnly cookies, secure flags | Accept | Security Lead | N/A | Accepted |
| RISK-003 | Authentication (Clerk) | Credential stuffing | Reused passwords | High (7) | Medium (4) | **28** | MFA, brute force protection | Mitigate | Security Lead | 2026-11-30 | In Progress |
| RISK-004 | API Routes | Broken access control | Missing authorization checks | Critical (9) | Medium (3) | **27** | withCreatorApi wrapper, ownership checks | Mitigate | Engineering Manager | 2026-10-31 | In Progress |
| RISK-005 | Vercel Deployment | Supply chain attack | Compromised dependencies | High (7) | Low (2) | **14** | Dependabot, npm audit, signed commits | Mitigate | Platform Engineer | 2026-12-31 | Planned |
| RISK-006 | Customer Data | Data breach | Insider threat | Critical (9) | Low (2) | **18** | Role-based access, audit logging | Mitigate | Security Lead | Ongoing | Ongoing |
| RISK-007 | Storage (Blob/R2) | Unauthorized access | Public bucket exposure | High (7) | Low (1) | **7** | Private buckets, access controls | Accept | Platform Engineer | N/A | Accepted |
| RISK-008 | Third-Party (Clerk/Vercel) | Vendor outage | Provider dependency | Critical (9) | Medium (3) | **27** | Multi-provider strategy, documentation | Mitigate | Engineering Manager | 2026-12-31 | Planned |
| RISK-009 | Source Code | IP theft | Repository compromise | High (7) | Low (2) | **14** | GitHub security features, branch protection | Mitigate | Engineering Manager | Ongoing | Ongoing |
| RISK-010 | Payment Data | PCI compliance violation | Insecure payment handling | Critical (9) | Low (1) | **9** | Tokenization via Stripe/PayPal | Accept | Engineering Manager | N/A | Accepted |
| RISK-011 | Infrastructure | DDoS attack | Service unavailability | High (7) | Medium (3) | **21** | Vercel DDoS protection, CDN | Mitigate | Platform Engineer | Ongoing | Ongoing |
| RISK-012 | Personnel | Insider threat | Malicious employee | Critical (9) | Low (1) | **9** | Background checks, access reviews, monitoring | Mitigate | HR + Security | Ongoing | Ongoing |
| RISK-013 | Database | Data loss | Accidental deletion | Critical (9) | Medium (3) | **27** | Automated backups, point-in-time recovery | Mitigate | Platform Engineer | Ongoing | Ongoing |
| RISK-014 | API | Injection attacks | SQL/NoSQL injection | High (7) | Low (2) | **14** | Parameterized queries, ORM usage | Mitigate | Engineering Manager | Ongoing | Ongoing |
| RISK-015 | Network | Man-in-the-middle | Unencrypted communications | High (7) | Low (1) | **7** | TLS 1.2+ enforced, HSTS | Accept | Platform Engineer | N/A | Accepted |
| RISK-016 | Configuration | Misconfiguration | Exposed secrets in code | Critical (9) | Medium (3) | **27** | Secret scanning, .gitignore, environment variables | Mitigate | Security Lead | Ongoing | Ongoing |
| RISK-017 | Business Continuity | Major incident | Extended outage > 24 hours | Critical (9) | Low (2) | **18** | DR plan, backup restoration testing | Mitigate | Engineering Manager | 2026-12-31 | Planned |
| RISK-018 | Legal/Compliance | Regulatory violation | Non-compliance with GDPR/CCPA | Critical (9) | Low (2) | **18** | Data classification, retention policies, privacy notices | Mitigate | Security Lead | Ongoing | Ongoing |
| RISK-019 | Physical | Facility access | Unauthorized physical access | Medium (5) | Low (1) | **5** | Provider SOC 2 reports, cloud infrastructure | Accept | Engineering Manager | N/A | Accepted |
| RISK-020 | Recovery | Backup failure | Backup corruption or loss | Critical (9) | Low (2) | **18** | Regular restore testing, multiple backup locations | Mitigate | Platform Engineer | 2026-11-30 | In Progress |

---

## Risk Summary by Category

### By Risk Level

| Level | Count | Percentage |
|-------|-------|------------|
| Critical | 8 | 40% |
| High | 6 | 30% |
| Medium | 4 | 20% |
| Low | 2 | 10% |

### By Treatment

| Treatment | Count | Percentage |
|-----------|-------|------------|
| Mitigate | 14 | 70% |
| Accept | 4 | 20% |
| Transfer | 0 | 0% |
| Avoid | 2 | 10% |

---

## Risk Acceptance Criteria

Risks may be accepted when:
1. Cost of mitigation exceeds potential loss
2. Risk is within organizational risk appetite
3. Compensating controls are in place
4. Acceptance is documented and approved by risk owner

**Approved Risk Acceptances**:

| Risk ID | Justification | Approver | Date | Expiry |
|---------|---------------|----------|------|--------|
| RISK-002 | Session hijacking risk is low due to short expiry and secure cookies | Security Lead | 2026-10-01 | 2027-10-01 |
| RISK-007 | Private buckets with access controls reduce exposure significantly | Platform Engineer | 2026-10-01 | 2027-10-01 |
| RISK-010 | Payment data is tokenized by third-party providers (PCI DSS scope reduced) | Engineering Manager | 2026-10-01 | 2027-10-01 |
| RISK-015 | TLS enforcement and HSTS provide adequate protection | Platform Engineer | 2026-10-01 | 2027-10-01 |
| RISK-019 | Cloud infrastructure eliminates physical access risk | Engineering Manager | 2026-10-01 | 2027-10-01 |

---

## Risk Review Schedule

| Date | Review Type | Participants | Status |
|------|-------------|--------------|--------|
| 2026-10-01 | Initial Assessment | Security Lead, Engineering Manager | Completed |
| 2026-11-01 | Monthly Review | Security Lead | Scheduled |
| 2026-12-01 | Monthly Review | Security Lead | Scheduled |
| 2027-01-01 | Quarterly Review | Security Committee | Scheduled |

---

## Integration with SOC 2 Controls

| SOC 2 Criteria | Risk Control | Evidence |
|----------------|--------------|----------|
| CC9.1 | Risk mitigation | Risk register, treatment plans, remediation tracking |
| CC9.2 | Control monitoring | Risk review meeting minutes, status updates |
| A1.1 | Availability | Business continuity risks, DR testing |
| CC6.1 | Access security | Access control risks, least privilege enforcement |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-10-01 | Initial risk register created |
