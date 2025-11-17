# UAVG Compliance Documentation
## Uitvoeringswet AVG (Dutch GDPR Implementation Act)

**Date:** January 2025  
**Version:** 1.0

This document addresses Dutch-specific GDPR implementation requirements under the Uitvoeringswet AVG (UAVG).

## Overview

The UAVG implements GDPR in Dutch law and adds specific requirements for:
- Processing of citizen service numbers (BSN)
- Biometric data processing
- Education data (BRIN codes, DUO data)
- Whistleblower data
- Specific sector rules

## 1. Biometric Data Processing

### 1.1 Identity Verification

**Data Processed:**
- Government-issued ID documents (photos)
- Selfie photos for facial recognition matching
- Biometric templates (created by KYC providers)

**Legal Basis:**
- Article 9(2)(f) GDPR - Fraud prevention
- UAVG Article 23 - Specific rules for biometric data

**Justification:**
- Necessary for platform safety and fraud prevention
- Prevents fake accounts and identity theft
- Required for user trust in roommate matching

**Safeguards:**
1. **Third-Party Processing:** Biometric data processed by certified KYC providers (Persona, Veriff, Onfido)
2. **Retention:** 4 weeks after verification (UAVG requirement)
3. **Access Controls:** Only authorized personnel can access verification data
4. **Encryption:** Data encrypted in transit and at rest
5. **DPAs:** Signed Data Processing Agreements with all KYC providers

**User Rights:**
- Right to access verification data
- Right to deletion (after 4-week retention period)
- Right to object (may affect platform access)

**Documentation:**
- DPIA Section 3.1.2 (Biometric Data Processing)
- ROPA Section 2.5 (Identity Verification)

## 2. Education Data (BRIN Codes, DUO Data)

### 2.1 BRIN Code Processing

**Data Processed:**
- BRIN codes (institution identifiers)
- University affiliations
- Program codes (CROHO codes)

**Legal Basis:**
- Article 6(1)(b) GDPR - Contract (necessary for matching service)
- UAVG - Education data processing rules

**Source:**
- DUO (Dienst Uitvoering Onderwijs) - Dutch Ministry of Education
- Studiekeuzedatabase (program data)

**Compliance:**
- DUO data used in accordance with licensing terms
- BRIN codes processed only for matching purposes
- No BSN (citizen service numbers) processed
- Education data anonymized in analytics

**Documentation:**
- DUO_LICENSING.md - DUO data usage compliance
- ROPA Section 2.3 (Academic Information)

### 2.2 Program Data (DUO)

**Data Source:**
- DUO "Overzicht Erkenningen ho" dataset
- Studiekeuzedatabase API

**Usage:**
- Matching users by academic program
- University verification
- Program coverage monitoring

**Restrictions:**
- Data used only for platform functionality
- No redistribution of DUO data
- Attribution to DUO maintained
- Compliance with DUO reuse terms

**Documentation:**
- DUO_LICENSING.md
- PROGRAMME_DATA.md

## 3. BSN (Citizen Service Number) Processing

**Status:** ✅ Not Processed

Domu Match does not process BSN (Burgerservicenummer) numbers. We only process:
- University email addresses
- Academic information (program, university)
- No government-issued identification numbers

**Compliance:** N/A - BSN processing not applicable

## 4. Whistleblower Data

**Status:** ✅ Not Applicable

Domu Match does not operate a whistleblower system. User reports are handled as safety incidents, not whistleblower disclosures.

**Compliance:** N/A - Whistleblower provisions not applicable

## 5. Sector-Specific Rules

### 5.1 Education Sector

**Applicable Rules:**
- DUO data licensing compliance
- University partnership agreements
- Student data protection (under 18 handling)

**Compliance Measures:**
- Age verification (minimum 17 years)
- University email verification
- DUO data attribution
- Education data minimization

### 5.2 Housing Sector

**Applicable Rules:**
- Housing application data protection
- Move-in planning data
- Agreement data retention

**Compliance Measures:**
- Data minimization in housing applications
- Secure storage of housing data
- Retention policies for housing data
- User consent for housing features

## 6. Data Protection Officer (DPO)

**Status:** ⚠️ To be Appointed

**Requirement Assessment:**
- Core activity: Large-scale processing of special category data (biometric)
- Large-scale: Processing affects significant number of data subjects
- **Conclusion:** DPO appointment likely required

**Action Plan:**
- Assess DPO requirement with legal counsel
- Appoint DPO if required
- Document DPO contact information
- Update privacy policy with DPO details

**Current Contact:**
- Privacy: domumatch@gmail.com
- DPO: domumatch@gmail.com (to be confirmed)

## 7. Representative in Netherlands

**Status:** ✅ Established

As a Dutch-based platform processing data of Dutch residents:
- Business address in Netherlands
- Dutch contact information
- Dutch-language privacy notices
- Compliance with Dutch national law

## 8. Dutch Language Requirements

**Compliance:**
- ✅ Privacy Policy available in Dutch
- ✅ Cookie consent banner in Dutch
- ✅ Cookie preference center in Dutch
- ✅ Terms of Service in Dutch (if applicable)
- ✅ DSAR requests can be submitted in Dutch

**Documentation:**
- Privacy Policy: `/privacy` (Dutch version)
- Cookie Policy: `/cookies` (Dutch version)

## 9. Regulatory Cooperation

**Authority:**
- Autoriteit Persoonsgegevens (AP) - Dutch Data Protection Authority

**Cooperation:**
- 72-hour breach notifications to AP
- DSAR request handling
- Compliance documentation available for inspection
- Regular compliance reviews

## 10. Ongoing Compliance

### 10.1 Regular Reviews
- Annual UAVG compliance review
- Quarterly biometric data processing review
- Ongoing DUO licensing compliance

### 10.2 Updates
- Monitor UAVG amendments
- Update documentation as needed
- Train staff on UAVG requirements

**Last Updated:** January 2025  
**Next Review:** January 2026

