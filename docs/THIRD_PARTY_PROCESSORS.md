# Third-Party Processors
## Domu Match Platform

**Date:** January 2025  
**Version:** 1.0

This document lists all third-party processors used by Domu Match and their GDPR compliance status.

## Processor Inventory

### 1. Supabase

- **Service:** Database, authentication, hosting, storage, realtime
- **Provider:** Supabase Inc.
- **Location:** EU (primary), US (backup)
- **Data Categories Processed:**
  - All user data (profiles, messages, matches, etc.)
  - Authentication data
  - File storage (verification documents, profile photos)
- **Purpose:** Core platform infrastructure
- **DPA Status:** ✅ Standard contractual clauses (SCCs) in place
- **Transfer Mechanism:** SCCs (Module 2: Controller to Processor)
- **Subprocessors:** Listed in Supabase DPA (AWS, Cloudflare, etc.)
- **Security:** ISO 27001, SOC 2 Type II
- **Data Retention:** Managed by Domu Match (Supabase provides infrastructure only)
- **Contact:** support@supabase.com

### 2. Sentry

- **Service:** Error tracking, performance monitoring, session replay
- **Provider:** Functional Software, Inc. (Sentry)
- **Location:** US (primary), EU (secondary)
- **Data Categories Processed:**
  - Error logs (with PII redaction)
  - Performance metrics
  - Session recordings (with user consent only)
- **Purpose:** Debugging, error monitoring, user experience improvement
- **DPA Status:** ✅ Standard contractual clauses (SCCs) in place
- **Transfer Mechanism:** SCCs (Module 2: Controller to Processor)
- **Consent Required:** Yes - opt-in consent for error tracking and session replay
- **PII Handling:** PII redaction enabled, sendDefaultPii: false by default
- **Subprocessors:** Listed in Sentry DPA (AWS, etc.)
- **Security:** SOC 2 Type II, ISO 27001
- **Data Retention:** 90 days (configurable)
- **Contact:** security@sentry.io

### 3. Vercel

- **Service:** Hosting, CDN, analytics
- **Provider:** Vercel Inc.
- **Location:** US (primary), EU (edge locations)
- **Data Categories Processed:**
  - Analytics data (anonymized, with consent)
  - Performance metrics
  - Request logs
- **Purpose:** Application hosting, performance optimization
- **DPA Status:** ✅ Standard contractual clauses (SCCs) in place
- **Transfer Mechanism:** SCCs (Module 2: Controller to Processor)
- **Consent Required:** Yes - opt-in consent for analytics
- **Subprocessors:** Listed in Vercel DPA (AWS, Cloudflare, etc.)
- **Security:** SOC 2 Type II
- **Data Retention:** Managed by Vercel (logs: 30 days)
- **Contact:** privacy@vercel.com

### 4. Persona (Identity Verification)

- **Service:** KYC/identity verification
- **Provider:** Persona Identities, Inc.
- **Location:** US
- **Data Categories Processed:**
  - Government-issued ID documents
  - Selfie photos
  - Biometric data
- **Purpose:** Identity verification, fraud prevention
- **DPA Status:** ✅ Signed DPA
- **Transfer Mechanism:** SCCs (Module 2: Controller to Processor)
- **Special Category Data:** Biometric data (Article 9 GDPR)
- **Subprocessors:** Listed in Persona DPA
- **Security:** SOC 2 Type II, ISO 27001
- **Data Retention:** 4 weeks after verification (per Dutch law)
- **Contact:** privacy@withpersona.com

### 5. Veriff (Identity Verification)

- **Service:** KYC/identity verification
- **Provider:** Veriff OÜ
- **Location:** EU (Estonia), US
- **Data Categories Processed:**
  - Government-issued ID documents
  - Selfie photos
  - Biometric data
- **Purpose:** Identity verification, fraud prevention
- **DPA Status:** ✅ Signed DPA
- **Transfer Mechanism:** SCCs (if data processed in US)
- **Special Category Data:** Biometric data (Article 9 GDPR)
- **Subprocessors:** Listed in Veriff DPA
- **Security:** ISO 27001, SOC 2
- **Data Retention:** 4 weeks after verification (per Dutch law)
- **Contact:** privacy@veriff.com

### 6. Onfido (Identity Verification)

- **Service:** KYC/identity verification
- **Provider:** Onfido Ltd.
- **Location:** UK, EU, US
- **Data Categories Processed:**
  - Government-issued ID documents
  - Selfie photos
  - Biometric data
- **Purpose:** Identity verification, fraud prevention
- **DPA Status:** ✅ Signed DPA
- **Transfer Mechanism:** SCCs (if data processed outside EEA)
- **Special Category Data:** Biometric data (Article 9 GDPR)
- **Subprocessors:** Listed in Onfido DPA
- **Security:** ISO 27001, SOC 2
- **Data Retention:** 4 weeks after verification (per Dutch law)
- **Contact:** privacy@onfido.com

### 7. Email Service Providers

#### 7.1 Resend (Transactional Emails)
- **Service:** Email delivery
- **Provider:** Resend Inc.
- **Location:** US
- **Data Categories:** Email addresses, email content
- **DPA Status:** ✅ Standard contractual clauses
- **Transfer Mechanism:** SCCs
- **Purpose:** Transactional emails, notifications

#### 7.2 SendGrid (Backup)
- **Service:** Email delivery
- **Provider:** Twilio SendGrid
- **Location:** US, EU
- **Data Categories:** Email addresses, email content
- **DPA Status:** ✅ Standard contractual clauses
- **Transfer Mechanism:** SCCs
- **Purpose:** Backup email delivery

## Transfer Impact Assessments

### US-Based Processors

All US-based processors (Sentry, Vercel, Persona, email providers) use Standard Contractual Clauses (SCCs) as the transfer mechanism. Transfer Impact Assessments have been conducted for each:

1. **Legal Framework:** US processors operate under US law, which may allow government access to data
2. **Mitigation Measures:**
   - Encryption in transit and at rest
   - Access controls and audit logging
   - Data minimization
   - Regular security audits
3. **Risk Assessment:** Low to medium risk, mitigated by technical and organizational measures
4. **Ongoing Monitoring:** Regular review of processor security practices and compliance

## Subprocessor Notifications

Users are notified of subprocessor changes via:
- Privacy Policy updates
- Email notifications (for significant changes)
- In-app notifications (for critical changes)

## Processor Compliance Monitoring

- **Annual Reviews:** All processors reviewed annually
- **Security Audits:** Processor security certifications verified
- **Incident Monitoring:** Processor security incidents tracked
- **DPA Updates:** DPAs reviewed and updated as needed

## User Rights

Users can:
- Request information about processors (via Privacy Policy)
- Object to processing by specific processors (may affect service functionality)
- Request data export (includes data processed by third parties)
- Request account deletion (triggers deletion requests to processors)

## Contact

For questions about third-party processors:
- **Email:** domumatch@gmail.com
- **DPO:** domumatch@gmail.com

**Last Updated:** January 2025

