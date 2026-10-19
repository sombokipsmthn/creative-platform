# Security Testing Plan

**Document Version**: 1.0
**Last Updated**: 2026-10-02
**Owner**: Security Lead
**Review Cycle**: Quarterly or after significant changes

---

## Purpose

This document defines the security testing strategy for the KIPSMTHN Creative Platform. It establishes systematic testing across application, infrastructure, and dependency layers to ensure ongoing security posture.

---

## Test Categories

### 1. Application Security Testing

#### Authentication Tests

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| Auth bypass | Direct API calls without session token | 401 Unauthorized | ✅ Automated |
| Session expiry | Request with expired session | 401 Unauthorized | ✅ Automated |
| Invalid credentials | Sign in with wrong password | Error message, no info leak | ✅ Manual |
| MFA enforcement | Bypass MFA challenge | Block at authentication layer | ✅ Manual |
| Password reset | Reset flow validation | Email sent, no enumeration | ✅ Manual |

**Automation**: All authentication endpoints tested via authorization test matrix (src/lib/auth/authorization.test.ts)

#### Authorization Tests

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| Cross-creator access | Creator A accesses Creator B's data | 404 Not Found | ✅ Automated |
| Client isolation | Client accesses another client's gallery | 401 Unauthorized | ✅ Automated |
| Admin escalation | Non-admin accesses admin routes | Redirect to onboarding | ✅ Manual |
| Public vs private | Access private gallery without session | 401 Unauthorized | ✅ Automated |
| File download auth | Download without gallery session | 401 Unauthorized | ✅ Automated |

**Automation**: Authorization matrix covers 25+ test cases (src/lib/auth/authorization.test.ts)

#### Input Validation Tests

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| SQL injection | Injection in query parameters | Sanitized input, no SQL error | ✅ Manual |
| XSS injection | Script tags in form fields | HTML-encoded output | ✅ Manual |
| Path traversal | ../ in file paths | Blocked, 400 Bad Request | ✅ Manual |
| Command injection | Shell metacharacters | Sanitized, no execution | ✅ Manual |
| Oversized input | Large payloads (>1MB) | Rejected with 400/413 | ✅ Manual |
| Type coercion | String where number expected | Coerced safely, no crash | ✅ Manual |

**Automation**: API input validation via parameterized queries and type checking

#### Session Handling Tests

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| Session fixation | Use session token on new login | New session created | ✅ Manual |
| Concurrent sessions | Same account, multiple browsers | All sessions valid | ✅ Manual |
| Session timeout | Inactive session > 30 min | 401 Unauthorized | ✅ Manual |
| Cookie security | Check HttpOnly, Secure, SameSite | All flags set correctly | ✅ Manual |
| PIN rate limiting | 5 failed attempts within window | 429 Too Many Requests | ✅ Automated |

**Implementation**: Rate limiting via `gallery_access_attempts` table (src/app/api/portal/g/[secretToken]/[slug]/access/route.ts)

#### File Upload Tests

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| Extension bypass | Rename executable to .jpg | Blocked by MIME type check | ✅ Manual |
| Oversized file | Upload >100MB file | Rejected with 413 | ✅ Manual |
| Invalid MIME type | JPEG header with .exe extension | Rejected by server | ✅ Manual |
| Storage path traversal | Special characters in filename | Sanitized, safe path | ✅ Manual |
| Unauthorized upload | Upload to another creator's gallery | 403 Forbidden | ✅ Automated |

**Implementation**: Upload validation in src/app/api/galleries/upload/route.ts

#### File Download Tests

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| Download without session | Request download without gallery access | 401 Unauthorized | ✅ Automated |
| Expired gallery download | Download from expired gallery | 410 Gone | ✅ Automated |
| Disable downloads | Gallery with downloads disabled | 403 Forbidden | ✅ Manual |
| File manipulation | Path traversal in download request | Blocked | ✅ Manual |

### 2. Infrastructure Security Testing

#### Deployment Security

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| Branch protection | Push directly to main | Blocked by GitHub rules | ✅ Manual |
| PR requirements | Merge without approvals | Blocked | ✅ Manual |
| CI checks | Deploy without passing tests | Blocked | ✅ Automated |
| Secret scanning | Commit a test secret | Blocked by trufflehog | ✅ Automated |
| Environment isolation | Staging vs production config | Separate env vars | ✅ Manual |

**Automation**: GitHub Actions CI with required checks (ci.yml)

#### Environment Configuration

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| No secrets in .env | Check committed .env files | None committed (.gitignore) | ✅ Automated |
| Required env vars | Deploy without DATABASE_URL | Build fails | ✅ Manual |
| Sensitive data in logs | Check log output for secrets | No secrets in logs | ✅ Manual |
| Error leakage | Check error responses | No internal paths/stack traces | ✅ Manual |
| Debug mode | Deploy with NEXT_PUBLIC_DEBUG=true | Blocked by config | ✅ Manual |

#### Network Exposure

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| Port scanning | Scan exposed ports | Only 80/443 open | ✅ External |
| DNS configuration | Check DNS records | SPF, DKIM, DMARC set | ✅ External |
| TLS configuration | SSL Labs scan | A rating or above | ✅ External |
| CORS policy | Check CORS headers | Restricted origins | ✅ Manual |
| Clickjacking | Check X-Frame-Options | DENY or SAMEORIGIN | ✅ Manual |

#### Database Exposure

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| Direct DB access | Attempt direct connection | Connection string not exposed | ✅ Manual |
| Connection string in code | Search for hardcoded URLs | No hardcoded DB URLs | ✅ Automated |
| SQL injection | Injection via ORM parameters | Safe, parameterized queries | ✅ Automated |
| Data leakage | Check query results | No sensitive data in responses | ✅ Manual |
| Backup exposure | Check backup availability | Backups not publicly accessible | ✅ Manual |

**Implementation**: All queries use parameterized Drizzle ORM (src/db/)

#### Storage Exposure

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| Public blob access | Check Vercel Blob settings | Private by default | ✅ Manual |
| Presigned URL expiry | Check URL expiration | Max 7 days | ✅ Manual |
| R2 bucket policies | Check bucket permissions | Private, signed URLs only | ✅ Manual |
| Content-Type sniffing | Check upload validation | MIME type matching | ✅ Manual |

#### DNS & TLS

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| TLS version | Check minimum TLS | TLS 1.2+ enforced | ✅ Automated |
| Certificate validity | Check cert expiry | >30 days remaining | ✅ Automated |
| HSTS header | Check Strict-Transport-Security | Max-age >= 31536000 | ✅ Manual |
| CSP headers | Check Content-Security-Policy | Restrictive policy | ✅ Manual |
| Security headers | X-Content-Type-Options, X-Frame-Options | Present | ✅ Manual |

### 3. Dependency Security Testing

#### Vulnerable Packages

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| npm audit | Run npm audit --audit-level=high | No high/critical vulnerabilities | ✅ Automated |
| Known CVEs | Check for known CVEs in dependencies | None or documented exceptions | ✅ Automated |
| Supply chain | Check for malicious packages | No known malicious packages | ✅ Manual |
| Typosquatting | Check for package typosquatting | Correct package names | ✅ Manual |

**Automation**: `npm audit` in CI pipeline (.github/workflows/ci.yml)

#### Outdated Dependencies

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| Outdated packages | Check npm outdated | Zero or documented | ✅ Automated |
| EOL versions | Check for end-of-life packages | None | ✅ Manual |
| Security patches | Verify all security patches applied | Current versions | ✅ Automated |

**Automation**: Dependabot weekly updates (.github/dependabot.yml)

#### Transitive Vulnerabilities

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| Transitive deps | Check nested dependency vulnerabilities | None critical | ✅ Automated |
| Bundle analysis | Analyze bundle for dangerous packages | Clean | ✅ Manual |
| Tree shaking | Remove unused dependencies | Minimized bundle | ✅ Manual |

**Automation**: `npm audit --include-workspace-root` in CI

### 4. Manual Security Testing

#### High-Risk Workflow Testing

**Gallery Access Flow**:
1. Create gallery with PIN protection
2. Access via correct PIN → Success (200)
3. Access via wrong PIN → 401 Unauthorized
4. Access via expired link → 410 Gone
5. Brute force PIN (6+ attempts) → 429 Rate Limited
6. Access without session → 401 Unauthorized

**Upload Flow**:
1. Upload valid image → Success (200)
2. Upload invalid MIME type → Rejected (400)
3. Upload oversized file → Rejected (413)
4. Upload to unauthorized gallery → Rejected (404)

**Contract Signing Flow**:
1. Sign valid contract → Success (200)
2. Sign expired contract → Rejected (410)
3. Sign without token → Rejected (404)
4. Inject script in signer name → Sanitized

#### API Abuse Testing

| Attack Vector | Test | Expected Result |
|--------------|------|-----------------|
| Rate limiting | 100 rapid requests to same endpoint | 429 after threshold |
| IDOR | Sequential ID enumeration | 404 for unauthorized |
| CSRF | Cross-site request forgery | Token validation required |
| Session hijacking | Steal session token | Cookie HttpOnly, Secure |
| SSRF | Server-side request forgery | URL validation enforced |

#### Data Exposure Testing

| Test | Description | Expected Result |
|------|-------------|-----------------|
| PII in logs | Check console output for PII | No PII in logs |
| Response payload | Inspect API responses | No sensitive fields leaked |
| Error messages | Trigger various errors | Generic messages only |
| Cross-user data | Compare responses between users | No cross-contamination |

---

## Testing Frequency

| Category | Frequency | Last Test | Next Test |
|----------|-----------|-----------|-----------|
| **Automated Security Scanning** | Every CI run | Ongoing | Ongoing |
| **Dependency Audit** | Weekly (Dependabot) | 2026-10-01 | 2026-10-08 |
| **Authorization Tests** | Every commit | 2026-10-02 | 2026-10-09 |
| **Input Validation Tests** | Quarterly | 2026-07-01 | 2026-10-01 |
| **Manual Penetration Test** | Annually | 2025-10-01 | 2026-10-01 |
| **Infrastructure Scan** | Quarterly | 2026-07-01 | 2026-10-01 |
| **SSL/TLS Scan** | Monthly | 2026-10-01 | 2026-11-01 |

---

## Tools & Techniques

### Automated Tools

| Tool | Purpose | Integration |
|------|---------|-------------|
| `npm audit` | Dependency vulnerability scanning | CI pipeline |
| `trufflehog` | Secret scanning | CI pipeline |
| `dependency-review-action` | PR dependency review | GitHub Actions |
| `vitest` | Unit/integration test execution | CI pipeline |
| `eslint` | Code quality and security linting | CI pipeline |
| `tsc --noEmit` | TypeScript type checking | CI pipeline |

### Manual Techniques

| Technique | Purpose | When |
|-----------|---------|------|
| **OWASP ZAP** | DAST scanning | Quarterly |
| **Burp Suite** | Manual API testing | Quarterly |
| **Nikto** | Web server scanning | Annually |
| **Nmap** | Port and service scanning | Annually |
| **sqlmap** | SQL injection testing | Annually |
| **XSStrike** | XSS testing | Annually |

---

## Evidence Requirements

**Required Records (Retained 3 Years)**:

1. **Test Plans**: Detailed test scenarios and expected outcomes
2. **Execution Logs**: Timestamped results of each test run
3. **Defect Reports**: Documented vulnerabilities with severity
4. **Remediation Records**: Proof of fix implementation
5. **Retest Results**: Verification that fixes are effective
6. **Quarterly Reports**: Summary of testing activities and findings

---

## Integration with SOC 2 Controls

| SOC 2 Criteria | Control | Evidence |
|----------------|---------|----------|
| CC7.1 | Vulnerability identification | Test results, vulnerability reports |
| CC7.2 | Vulnerability assessment | Severity ratings, risk assessments |
| CC7.3 | Vulnerability remediation | Fix implementation records |
| CC7.4 | Vulnerability verification | Retest results, sign-off |
| CC7.5 | Vulnerability documentation | Test plans, execution logs, reports |
| CC8.1 | Change management | Security testing as change control |
| CC9.1 | Risk mitigation | Testing as proactive risk reduction |

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [NIST SP 800-115](https://csrc.nist.gov/publications/detail/sp/800-115/final) - Technical Guide to Information Security Testing
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-10-02 | Security Lead | Initial version |
