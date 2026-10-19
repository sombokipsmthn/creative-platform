# Vendor Risk Management Policy

**Document Version**: 1.0
**Last Updated**: 2026-10-01
**Owner**: Engineering Manager
**Review Cycle**: Annually or when new vendors are onboarded

---

## Purpose

This policy establishes the framework for managing risks associated with third-party vendors and service providers that handle KIPSMTHN Creative Platform data or provide critical infrastructure services.

---

## Scope

This policy applies to all vendors and service providers that:

- Access, process, store, or transmit KIPSMTHN data
- Provide infrastructure or platform services essential to operations
- Have technical access to production systems or customer data
- Are considered critical to business continuity

---

## Vendor Inventory

### Critical Vendors

| Vendor | Service | Data Accessed | Business Criticality | Security Relevance | Owner | Contract Renewal |
|--------|---------|---------------|---------------------|-------------------|-------|------------------|
| **Vercel** | Hosting, deployment, serverless functions | Application code, environment variables | Critical | High | Engineering Manager | Annual |
| **Neon** | PostgreSQL database | All customer data, credentials, audit logs | Critical | High | Platform Engineer | Annual |
| **Clerk** | Authentication, user management | User PII, session tokens, authentication data | Critical | High | Security Lead | Annual |
| **GitHub** | Version control, CI/CD | Source code, deployment configurations | Critical | Medium | Engineering Manager | Annual |
| **Resend** | Email delivery | Customer contact information, email content | High | Medium | Communications Lead | Annual |
| **Vercel Blob** | Image/media storage | Customer photos, media assets | High | Medium | Platform Engineer | Annual |
| **Cloudflare** | CDN (if/when used) | Public content, DNS | Medium | Medium | Platform Engineer | Annual |

### Vendor Assessment Criteria

Each vendor is assessed based on:

1. **Data Sensitivity**: What types of data does the vendor access?
   - Public data (low risk)
   - Internal data (medium risk)
   - Confidential/customer PII (high risk)
   - Financial/legal data (critical risk)

2. **Business Impact**: What is the impact if the vendor fails?
   - No business impact
   - Limited operational impact
   - Significant operational impact
   - Critical business impact

3. **Security Posture**: Does the vendor meet security requirements?
   - SOC 2 Type II certification
   - ISO 27001 certification
   - Penetration testing reports
   - Incident response capabilities
   - Encryption standards

4. **Compliance Requirements**: Does the vendor meet regulatory obligations?
   - GDPR compliance (if handling EU data)
   - CCPA compliance (if handling California data)
   - Industry-specific requirements

---

## Vendor Risk Categories

| Risk Level | Criteria | Review Frequency | Assessment Required |
|------------|----------|------------------|--------------------|
| **Critical** | Access to production data, authentication, or financial systems | Quarterly | Full risk assessment |
| **High** | Access to sensitive but non-critical data; essential services | Semi-annually | Risk assessment + security questionnaire |
| **Medium** | Access to internal data; important but not essential services | Annually | Basic security review |
| **Low** | Public-facing services; no data access | Bi-annually | Minimal review |

---

## Vendor Onboarding Process

### Pre-Contract Requirements

1. **Security Questionnaire**: Complete vendor security assessment
2. **Contract Review**: Legal review of data protection terms
3. **DPA Execution**: Data Processing Agreement for PII processing
4. **Access Planning**: Define minimum necessary access levels
5. **Risk Acceptance**: Document and approve identified risks

### Contract Requirements

All vendor contracts must include:

- **Data Protection Clauses**: GDPR/CCPA compliance requirements
- **Security Standards**: Minimum security controls required
- **Breach Notification**: Timeline and process for breach disclosure
- **Audit Rights**: Right to audit vendor security practices
- **Subprocessor Restrictions**: Control over sub-processors
- **Data Ownership**: Clear statement of data ownership
- **Termination Rights**: Data return/deletion upon termination
- **Business Continuity**: Vendor BCP requirements

---

## Vendor Monitoring

### Ongoing Monitoring Activities

1. **Security Incident Monitoring**: Track vendor security incidents
2. **Service Level Monitoring**: Monitor vendor performance and availability
3. **Compliance Verification**: Verify continued compliance with requirements
4. **Access Reviews**: Periodic review of vendor access levels
5. **Financial Stability**: Monitor vendor financial health

### Key Performance Indicators (KPIs)

| KPI | Target | Measurement |
|-----|--------|-------------|
| **Uptime SLA** | > 99.9% | Vendor status page monitoring |
| **Incident Response Time** | < 4 hours | Vendor incident reports |
| **Security Compliance** | 100% | Annual security assessments |
| **Breach Notification** | Within 24 hours | Incident tracking |
| **Audit Completion** | 100% on schedule | Audit schedule tracking |

---

## Vendor Offboarding

### Termination Process

1. **Access Revocation**: Remove all vendor access to systems and data
2. **Data Return/Deletion**: Verify data has been returned or destroyed
3. **Contract Closure**: Complete final billing and contract termination
4. **Knowledge Transfer**: Capture any institutional knowledge
5. **Documentation**: Document termination and lessons learned

### Data Deletion Verification

For vendors processing KIPSMTHN data, require:

- Written certification of data deletion
- Verification that no copies remain
- Confirmation that backup media is also deleted
- Certificate of destruction for physical media (if applicable)

---

## Subprocessor Management

### Requirements

1. **Approval**: All subprocessors must be pre-approved in contract
2. **Notification**: Vendor must notify of any new subprocessors
3. **Same Obligations**: Subprocessors must meet same security requirements
4. **Right to Object**: KIPSMTHN may object to new subprocessors

### Monitoring

- Maintain current list of approved subprocessors
- Review subprocessor security documentation
- Verify subprocessor compliance with data protection requirements

---

## Emergency Vendor Procedures

### Vendor Breach Response

If a vendor experiences a security breach:

1. **Notification**: Vendor must notify KIPSMTHN within 24 hours
2. **Assessment**: KIPSMTHN assesses impact on its own systems
3. **Containment**: Implement mitigating controls
4. **Communication**: Notify affected parties per Incident Response Plan
5. **Remediation**: Work with vendor on remediation

### Vendor Failure Response

If a vendor becomes unavailable:

1. **Activate Business Continuity Plan** for affected service
2. **Engage Alternative Provider** if available
3. **Manual Workarounds** for critical functions
4. **Customer Communication** regarding service impact
5. **Post-Incident Review** of vendor reliability

---

## Evidence Requirements

**Required Records (Retained 3 Years)**:

1. Vendor inventory and risk assessments
2. Security questionnaires and responses
3. Contract agreements with data protection clauses
4. Data Processing Agreements (DPAs)
5. Annual security assessments
6. Monitoring reports and KPIs
7. Incident reports involving vendors
8. Termination and offboarding documentation

---

## Integration with SOC 2 Controls

| SOC 2 Criteria | Control | Evidence |
|----------------|---------|----------|
| CC9.1 | Risk mitigation | Vendor risk assessments, mitigation plans |
| CC9.2 | Control monitoring | Vendor monitoring reports, KPI tracking |
| A1.1 | Availability commitments | Vendor SLA monitoring, backup provider assessments |
| A1.2 | Recovery procedures | Vendor continuity plans, alternative provider strategy |
| CC6.1 | Logical access security | Vendor access reviews, least privilege enforcement |

---

## References

- [NIST SP 800-161](https://csrc.nist.gov/publications/detail/sp/800-161/final) - Supply Chain Risk Management
- [ISO/IEC 27036-1:2023](https://www.iso.org/standard/81478.html) - Information security for supplier relationships
- [SOC 2 Trust Services Criteria](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/soc2trustservicescriteria.html)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-10-01 | Engineering Manager | Initial version |