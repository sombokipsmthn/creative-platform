# Data Classification Policy

**Document Version**: 1.0
**Last Updated**: 2026-10-01
**Owner**: Security Lead
**Review Cycle**: Annually or when data types change significantly

---

## Purpose

This policy establishes the framework for classifying, protecting, and managing the data processed by the KIPSMTHN Creative Platform. Proper data classification ensures appropriate security controls are applied based on data sensitivity and business value.

---

## Scope

This policy applies to all data:

- Created, stored, processed, or transmitted by KIPSMTHN
- Accessible through the Creative Platform application
- Held by employees, contractors, or third-party vendors on behalf of KIPSMTHN

---

## Data Classification Levels

### Level 1: Public

**Definition**: Data that is intentionally made available to the public and has no sensitivity.

**Examples**:

- Public portfolio images and galleries
- Marketing materials and press releases
- Public website content
- Published case studies

**Protection Requirements**:

- Encryption in transit (TLS 1.2+)
- Standard web security controls
- No specific access restrictions

**Retention**: Indefinite (subject to business needs)

---

### Level 2: Internal

**Definition**: Data intended for internal use only. Disclosure could cause minor inconvenience or harm.

**Examples**:

- Internal operational documents
- Employee directories (non-sensitive)
- Internal process documentation
- Non-sensitive business reports

**Protection Requirements**:

- Encryption in transit (TLS 1.2+)
- Access limited to employees and authorized contractors
- Standard authentication controls
- Logging of access events

**Retention**: 7 years (business records)

---

### Level 3: Confidential

**Definition**: Sensitive data that could cause significant harm if disclosed unauthorizedly.

**Examples**:

- Client contact information (name, email, phone)
- Project details and scopes
- Quote and invoice data (non-payment)
- Gallery access tokens and PINs
- Internal communications

**Protection Requirements**:

- Encryption in transit (TLS 1.2+)
- Encryption at rest (AES-256)
- Strict access controls (need-to-know basis)
- Multi-factor authentication for access
- Comprehensive audit logging
- Regular access reviews
- DLP (Data Loss Prevention) controls

**Retention**: 7 years (tax/legal requirements)

---

### Level 4: Restricted

**Definition**: Highly sensitive data that could cause severe harm if disclosed. Requires the highest level of protection.

**Examples**:

- Client payment information (bank details, credit cards)
- KRA PIN and tax identification numbers
- Authentication credentials and secrets
- API keys and service tokens
- Employee PII (salary, ID numbers)
- Legal documents and contracts

**Protection Requirements**:

- Encryption in transit (TLS 1.3+)
- Encryption at rest (AES-256 with key rotation)
- Strict access controls with approval workflow
- Multi-factor authentication required
- Real-time monitoring and alerting
- Data loss prevention with blocking
- Separate storage and access controls
- Regular penetration testing
- Strict retention and disposal procedures

**Retention**: Varies by data type (see retention schedule)

---

## Data Classification Matrix

| Data Type | Classification | Storage | Transmission | Access Control |
| ----------- | --------------- | --------- | -------------- | ---------------- |
| Customer names/emails | Confidential | Encrypted at rest | TLS | Role-based |
| Customer phone numbers | Confidential | Encrypted at rest | TLS | Role-based |
| Project details | Confidential | Encrypted at rest | TLS | Role-based |
| Quotes/invoices | Confidential | Encrypted at rest | TLS | Role-based |
| Payment bank details | Restricted | Encrypted at rest | TLS 1.3+ | MFA + approval |
| KRA PINs | Restricted | Encrypted at rest | TLS 1.3+ | MFA + approval |
| Gallery access tokens | Restricted | Encrypted at rest | TLS 1.3+ | MFA + approval |
| API keys/secrets | Restricted | Encrypted at rest | TLS 1.3+ | MFA + approval |
| Public gallery images | Public | Encrypted at rest | TLS | None |
| Public portfolio content | Public | Encrypted at rest | TLS | None |

---

## Data Handling Requirements

### Collection

- Collect only data necessary for business purposes
- Inform data subjects of collection purpose
- Obtain consent where required
- Classify data at point of collection

### Storage

- Store data according to classification level
- Apply appropriate encryption
- Implement access controls
- Regular backup and integrity checks

### Use

- Use data only for stated purposes
- Restrict access to authorized personnel
- Monitor for unauthorized use
- Maintain audit trails

### Transmission

- Encrypt all transmissions (TLS 1.2+ minimum)
- Use secure protocols (SFTP, HTTPS)
- Verify recipient identity
- Log transmission events

### Disposal

- Dispose according to classification level
- Use secure deletion methods
- Verify destruction
- Document disposal actions

---

## Data Owner Responsibilities

### Business Data Owners

1. Define classification for data they own
2. Approve access requests
3. Review access periodically
4. Ensure appropriate protection
5. Authorize data sharing

### Technical Data Owners

1. Implement classification controls
2. Configure access controls
3. Maintain encryption standards
4. Monitor for violations
5. Update controls as needed

---

## Data Subject Rights

### Access Requests

- Individuals may request access to their personal data
- Verify identity before disclosure
- Provide data within 30 days
- Charge no fee (unless excessive)

### Correction Requests

- Individuals may request correction of inaccurate data
- Verify identity before changes
- Update within 30 days
- Document changes made

### Deletion Requests

- Individuals may request deletion of their data
- Verify identity before action
- Delete within 30 days (subject to legal retention)
- Notify downstream processors

### Portability Requests

- Individuals may request data export
- Provide in structured, machine-readable format
- Complete within 30 days
- Ensure security of transfer

---

## Cross-Border Data Transfers

### Requirements

- Assess data protection laws in destination country
- Implement appropriate safeguards (standard contractual clauses)
- Document transfer impact assessment
- Notify data subjects where required

### Prohibited Transfers

- Do not transfer Restricted data to jurisdictions without adequate protection
- Do not transfer without proper legal basis
- Obtain legal counsel approval for uncertain situations

---

## Monitoring and Compliance

### Access Monitoring

- Log all access to Confidential and Restricted data
- Review access patterns regularly
- Alert on suspicious activity
- Investigate anomalies

### Data Flow Mapping

- Maintain data flow diagrams
- Update when systems change
- Document all data transfers
- Identify critical data handling points

### Compliance Audits

- Annual classification compliance audit
- Quarterly access review
- Real-time monitoring for Restricted data
- Report findings to security team

---

## Training and Awareness

### Required Training

- Annual data classification training for all employees
- Role-specific training for data handlers
- Security awareness training incorporating classification
- Vendor training on data protection requirements

### Training Content

- Classification levels and criteria
- Handling requirements per level
- Reporting procedures for suspected breaches
- Personal responsibilities under this policy

---

## Evidence Requirements

**Required Records (Retained 3 Years)**:

1. Data classification inventory
2. Data processing records
3. Access review results
4. Training completion records
5. Incident reports involving data breaches
6. Data subject request logs
7. Cross-border transfer assessments

---

## Integration with SOC 2 Controls

| SOC 2 Criteria | Control | Evidence |
| ---------------- | --------- | ---------- |
| CC6.1 | Logical access security | Classification-based access controls |
| CC6.3 | Authorization | Data access rules based on classification |
| CC6.4 | Network security | Encryption standards per classification |
| CC6.5 | Password requirements | Authentication for Restricted data |
| CC6.6 | Electronic credential transmission | Secure transmission standards |
| CC7.5 | Vulnerability documentation | Classification policy documentation |
| CC9.1 | Risk mitigation | Classification as risk mitigation |
| A1.1 | Availability commitments | Data availability per classification |

---

## References

- [GDPR](https://gdpr.eu/) - General Data Protection Regulation
- [CCPA](https://oag.ca.gov/privacy/ccpa) - California Consumer Privacy Act
- [NIST SP 800-122](https://csrc.nist.gov/publications/detail/sp/800-122/final) - Guide to Protecting the Confidentiality of PII
- [ISO/IEC 27001:2022](https://www.iso.org/standard/93273.html) - Information security management

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-10-01 | Security Lead | Initial version |