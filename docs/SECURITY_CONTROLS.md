# Security Controls Matrix
## Domu Match Platform

**Date:** January 2025  
**Version:** 1.0

This document maps identified security gaps to compensating controls and remediation plans.

## Security Gaps and Controls

### 1. Vector Extension in Public Schema

| Aspect | Details |
|--------|---------|
| **Gap** | Vector extension installed in `public` schema instead of `extensions` schema |
| **Risk Level** | Low |
| **Impact** | Minimal - extension doesn't expose sensitive data directly |
| **Likelihood** | Very Low - requires database-level access |
| **Compensating Controls** | |
| - Access Controls | RLS policies restrict access to vector tables |
| - Monitoring | Database access logs monitored |
| - Audit | Regular security audits |
| **Remediation** | Move to `extensions` schema during next maintenance window (Q2 2025) |
| **Status** | ✅ Compensating controls in place, risk acceptable |

### 2. Leaked Password Protection Disabled

| Aspect | Details |
|--------|---------|
| **Gap** | Supabase leaked password protection not enabled (requires Pro plan) |
| **Risk Level** | Medium |
| **Impact** | Medium - compromised passwords could lead to account takeover |
| **Likelihood** | Medium - users may reuse compromised passwords |
| **Compensating Controls** | |
| - Password Requirements | Minimum 8 chars, uppercase, lowercase, numbers |
| - Rate Limiting | Authentication rate limiting |
| - Monitoring | Failed login attempts logged and monitored |
| - Account Security | Email verification, account lockout |
| **Remediation** | Upgrade to Supabase Pro plan (Q1 2025) or implement custom validation |
| **Status** | ⚠️ Compensating controls in place, remediation planned |

### 3. Third-Party Processor Security

| Aspect | Details |
|--------|---------|
| **Gap** | Multiple third-party processors with varying security postures |
| **Risk Level** | Low to Medium |
| **Impact** | Medium - data breach at processor could affect users |
| **Likelihood** | Low - processors have strong security certifications |
| **Compensating Controls** | |
| - DPAs | Signed Data Processing Agreements with all processors |
| - SCCs | Standard Contractual Clauses for transfers |
| - Monitoring | Processor security incidents tracked |
| - Audits | Annual processor security review |
| **Remediation** | Ongoing - regular reviews and updates |
| **Status** | ✅ Controls in place, ongoing monitoring |

### 4. Cross-Border Data Transfers

| Aspect | Details |
|--------|---------|
| **Gap** | Data transferred to US-based processors (Sentry, Vercel, etc.) |
| **Risk Level** | Medium |
| **Impact** | Medium - regulatory compliance risk |
| **Likelihood** | High - transfers occur regularly |
| **Compensating Controls** | |
| - SCCs | Standard Contractual Clauses in place |
| - TIAs | Transfer Impact Assessments conducted |
| - Encryption | Data encrypted in transit and at rest |
| - Minimization | Data minimization practices |
| **Remediation** | Ongoing - monitor regulatory changes |
| **Status** | ✅ Controls in place, compliant with current regulations |

## Risk Matrix

| Risk | Likelihood | Impact | Risk Level | Status |
|------|------------|--------|------------|--------|
| Vector extension location | Very Low | Low | Low | ✅ Acceptable |
| Leaked password protection | Medium | Medium | Medium | ⚠️ Remediation planned |
| Processor security | Low | Medium | Low-Medium | ✅ Monitored |
| Cross-border transfers | High | Medium | Medium | ✅ Compliant |

## Remediation Timeline

### Q1 2025
- Upgrade to Supabase Pro plan
- Enable leaked password protection
- Implement custom password validation (if Pro upgrade delayed)

### Q2 2025
- Move vector extension to `extensions` schema
- Complete security audit
- Update security documentation

### Ongoing
- Monitor processor security
- Review and update DPAs
- Conduct annual security assessments

## Compliance Status

- **GDPR:** ✅ Compliant (with documented controls)
- **AVG (Dutch GDPR):** ✅ Compliant
- **UAVG:** ✅ Compliant
- **Telecommunicatiewet:** ✅ Compliant (cookie consent implemented)
- **ISO 27001:** ⚠️ In progress (controls in place, certification planned)

**Last Updated:** January 2025

