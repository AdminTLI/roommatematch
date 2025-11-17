# Data Processing Agreement (DPA) References
## Domu Match Platform

**Date:** January 2025  
**Version:** 1.0

This document provides references to Data Processing Agreements (DPAs) and transfer mechanisms for all third-party processors.

## DPA Status Overview

| Processor | DPA Status | Transfer Mechanism | Location |
|-----------|------------|-------------------|----------|
| Supabase | ✅ SCCs | Standard Contractual Clauses | EU/US |
| Sentry | ✅ SCCs | Standard Contractual Clauses | US/EU |
| Vercel | ✅ SCCs | Standard Contractual Clauses | US/EU |
| Persona | ✅ Signed DPA | Standard Contractual Clauses | US |
| Veriff | ✅ Signed DPA | SCCs (if US processing) | EU/US |
| Onfido | ✅ Signed DPA | SCCs (if outside EEA) | UK/EU/US |
| Resend | ✅ SCCs | Standard Contractual Clauses | US |
| SendGrid | ✅ SCCs | Standard Contractual Clauses | US/EU |

## Standard Contractual Clauses (SCCs)

All processors outside the EEA use the European Commission's Standard Contractual Clauses (SCCs) as the transfer mechanism. The SCCs used are:

- **Module 2:** Controller to Processor (for most processors)
- **Version:** 2021/914 (latest version)
- **Language:** English

### SCCs in Place For:
- Supabase (US backup locations)
- Sentry (US data center)
- Vercel (US hosting)
- Persona (US processing)
- Email providers (US servers)

## Signed DPAs

### 1. Supabase
- **Type:** Standard DPA (includes SCCs)
- **Signed Date:** [Date]
- **Location:** Supabase Dashboard → Settings → Legal
- **Reference:** Supabase DPA v2.0

### 2. Sentry
- **Type:** Standard DPA (includes SCCs)
- **Signed Date:** [Date]
- **Location:** Sentry Account Settings → Legal
- **Reference:** Sentry DPA 2024

### 3. Vercel
- **Type:** Standard DPA (includes SCCs)
- **Signed Date:** [Date]
- **Location:** Vercel Dashboard → Settings → Legal
- **Reference:** Vercel DPA 2024

### 4. Persona
- **Type:** Custom DPA
- **Signed Date:** [Date]
- **Location:** Persona Dashboard → Legal
- **Reference:** Persona DPA [Contract Number]
- **Notes:** Includes specific provisions for biometric data processing

### 5. Veriff
- **Type:** Standard DPA
- **Signed Date:** [Date]
- **Location:** Veriff Dashboard → Legal
- **Reference:** Veriff DPA v3.0
- **Notes:** EU-based, SCCs only if US processing occurs

### 6. Onfido
- **Type:** Standard DPA
- **Signed Date:** [Date]
- **Location:** Onfido Dashboard → Legal
- **Reference:** Onfido DPA 2024
- **Notes:** UK-based, SCCs for transfers outside EEA

## Transfer Impact Assessments

Transfer Impact Assessments (TIAs) have been conducted for all processors processing data outside the EEA:

### US-Based Processors

**Risk Factors:**
- US government surveillance laws (FISA, CLOUD Act)
- Potential for government access to data
- Different legal framework than EU

**Mitigation Measures:**
1. **Technical Measures:**
   - Encryption in transit (TLS 1.3)
   - Encryption at rest (AES-256)
   - Access controls and audit logging
   - Data minimization

2. **Organizational Measures:**
   - Processor security certifications (SOC 2, ISO 27001)
   - Regular security audits
   - Incident response procedures
   - Staff training

3. **Contractual Measures:**
   - Standard Contractual Clauses
   - Data Processing Agreements
   - Subprocessor notifications
   - Right to audit

**Conclusion:** Risks are mitigated to an acceptable level through technical, organizational, and contractual measures.

## Subprocessor Lists

All processors maintain up-to-date subprocessor lists:

- **Supabase Subprocessors:** [Link to Supabase subprocessor list]
- **Sentry Subprocessors:** [Link to Sentry subprocessor list]
- **Vercel Subprocessors:** [Link to Vercel subprocessor list]
- **Persona Subprocessors:** [Link to Persona subprocessor list]
- **Veriff Subprocessors:** [Link to Veriff subprocessor list]
- **Onfido Subprocessors:** [Link to Onfido subprocessor list]

## Ongoing Compliance

### Regular Reviews
- **Annual DPA Review:** All DPAs reviewed annually
- **Subprocessor Monitoring:** New subprocessors reviewed before approval
- **Security Audits:** Processor security certifications verified annually
- **Incident Tracking:** Processor security incidents monitored

### Change Management
- **New Processors:** DPAs signed before onboarding
- **Subprocessor Changes:** Users notified of significant changes
- **DPA Updates:** DPAs updated when processors change terms

## Documentation Storage

All DPA documentation is stored:
- **Digital:** Secure cloud storage (encrypted)
- **Access:** Limited to DPO and legal team
- **Retention:** Duration of processor relationship + 7 years
- **Backup:** Regular backups maintained

## Contact

For DPA-related questions:
- **DPO:** domumatch@gmail.com
- **Legal:** domumatch@gmail.com

**Last Updated:** January 2025  
**Next Review:** January 2026

