# Data Protection Impact Assessment (DPIA)
## Domu Match Platform

**Date:** January 2025  
**Version:** 1.0  
**Status:** Active

## Executive Summary

This Data Protection Impact Assessment (DPIA) evaluates the privacy risks associated with the Domu Match platform, a roommate matching service for Dutch university students. The assessment identifies potential risks to data subjects' rights and freedoms and outlines mitigation measures to ensure GDPR compliance.

## 1. Description of Processing

### 1.1 Processing Activities

#### 1.1.1 User Registration and Profile Creation
- **Data Categories:** Email address, name, date of birth, university affiliation, academic program
- **Purpose:** Create user accounts and build compatibility profiles
- **Lawful Basis:** Contract (Article 6(1)(b) GDPR) - necessary for service provision
- **Data Subjects:** University students aged 17+

#### 1.1.2 Identity Verification
- **Data Categories:** Government-issued ID documents, selfie photos, biometric data
- **Purpose:** Verify user identity and prevent fraud
- **Lawful Basis:** Legitimate interest (Article 6(1)(f) GDPR) - fraud prevention and platform safety
- **Special Category Data:** Biometric data (Article 9(2)(f) GDPR - fraud prevention)
- **Data Subjects:** All users seeking to use matching features
- **Retention:** 4 weeks after verification (Dutch law requirement)

#### 1.1.3 Compatibility Matching
- **Data Categories:** Questionnaire responses, lifestyle preferences, personality traits, academic information
- **Purpose:** Match compatible roommates using algorithmic scoring
- **Lawful Basis:** Contract (Article 6(1)(b) GDPR) - core service functionality
- **Automated Decision-Making:** Yes - matching algorithm (Article 22 GDPR applies)
- **Data Subjects:** All users participating in matching

#### 1.1.4 Communication (Chat)
- **Data Categories:** Chat messages, read receipts, timestamps
- **Purpose:** Enable communication between matched users
- **Lawful Basis:** Contract (Article 6(1)(b) GDPR) - communication feature
- **Data Subjects:** Users engaged in chat conversations
- **Retention:** 1 year after last message

#### 1.1.5 Analytics and Error Tracking
- **Data Categories:** Usage patterns, error logs, performance metrics (anonymized where possible)
- **Purpose:** Improve platform functionality and user experience
- **Lawful Basis:** Legitimate interest (Article 6(1)(f) GDPR) - service improvement
- **Consent Required:** Yes - opt-in consent for non-essential analytics
- **Data Subjects:** All users (with consent)

#### 1.1.6 Safety and Moderation
- **Data Categories:** User reports, moderation actions, safety incidents
- **Purpose:** Maintain platform safety and prevent harassment
- **Lawful Basis:** Legitimate interest (Article 6(1)(f) GDPR) - user safety
- **Data Subjects:** Users involved in safety incidents
- **Retention:** 1 year after resolution

## 2. Necessity and Proportionality

### 2.1 Necessity Assessment

All processing activities are necessary for:
- Providing the core roommate matching service
- Ensuring platform safety and preventing fraud
- Complying with legal obligations (verification requirements)
- Improving service quality (with user consent)

### 2.2 Proportionality Assessment

- **Verification Data:** Minimal collection (ID + selfie), processed by third-party KYC providers, deleted after 4 weeks
- **Matching Data:** Comprehensive but necessary for accurate compatibility scoring
- **Communication Data:** Necessary for user-to-user communication, retained only as long as needed
- **Analytics:** Anonymized where possible, opt-in consent required

## 3. Risk Assessment

### 3.1 High-Risk Processing Activities

#### 3.1.1 Automated Matching Algorithm
- **Risk:** Algorithmic bias, unfair matching decisions
- **Likelihood:** Medium
- **Impact:** High (affects user experience and housing outcomes)
- **Mitigation:**
  - Regular algorithm audits
  - User feedback mechanisms
  - Manual review option for disputes
  - Transparent scoring explanation

#### 3.1.2 Biometric Data Processing
- **Risk:** Unauthorized access to biometric data, identity theft
- **Likelihood:** Low
- **Impact:** High (sensitive personal data)
- **Mitigation:**
  - Third-party KYC providers with GDPR compliance
  - Encryption in transit and at rest
  - 4-week retention limit (Dutch law)
  - Access controls and audit logging

#### 3.1.3 Data Breach
- **Risk:** Unauthorized access to personal data
- **Likelihood:** Low
- **Impact:** High (privacy violation, identity theft risk)
- **Mitigation:**
  - Encryption (TLS, at-rest encryption)
  - Access controls (RLS, role-based access)
  - Regular security audits
  - Incident response plan
  - 72-hour breach notification procedure

### 3.2 Medium-Risk Processing Activities

#### 3.2.1 Cross-Border Data Transfers
- **Risk:** Data transferred to non-EEA countries (US-based services)
- **Likelihood:** High (Sentry, Vercel, KYC providers)
- **Impact:** Medium (regulatory compliance risk)
- **Mitigation:**
  - Standard Contractual Clauses (SCCs)
  - Transfer Impact Assessments
  - User consent for non-essential transfers
  - Data localization where possible

#### 3.2.2 Third-Party Processors
- **Risk:** Processor non-compliance, data misuse
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:**
  - Signed Data Processing Agreements (DPAs)
  - Processor audits
  - Subprocessor notifications
  - Regular compliance reviews

### 3.3 Low-Risk Processing Activities

#### 3.3.1 Analytics Data
- **Risk:** Re-identification from anonymized data
- **Likelihood:** Very Low
- **Impact:** Low
- **Mitigation:**
  - Proper anonymization techniques
  - Opt-in consent required
  - Limited data collection

## 4. Measures to Address Risks

### 4.1 Technical Measures
- Encryption (TLS 1.3, AES-256 at rest)
- Access controls (Row Level Security, role-based access)
- Data minimization (collect only necessary data)
- Pseudonymization (where applicable)
- Regular security updates and patches
- Automated data retention and deletion

### 4.2 Organizational Measures
- Data Protection Officer (DPO) appointment (if required)
- Staff training on data protection
- Privacy by design and default
- Regular DPIA reviews
- Incident response procedures
- Vendor management and DPA compliance

### 4.3 Legal Measures
- Privacy Policy and Terms of Service
- Cookie Policy (Telecommunicatiewet compliance)
- Data Processing Agreements with processors
- Standard Contractual Clauses for transfers
- User consent mechanisms (opt-in for non-essential)

## 5. Consultation

### 5.1 Stakeholder Consultation
- **Users:** Privacy policy, consent mechanisms, DSAR processes
- **Legal Counsel:** DPIA review, compliance verification
- **Technical Team:** Security measures, data flows
- **Data Protection Authority:** Notification if high-risk processing identified

### 5.2 Ongoing Review
- Annual DPIA review
- Review triggered by:
  - New processing activities
  - Significant changes to existing processing
  - Security incidents
  - Regulatory changes

## 6. Conclusion

The Domu Match platform implements appropriate technical and organizational measures to mitigate privacy risks. High-risk processing activities (automated matching, biometric data) are subject to additional safeguards. The platform complies with GDPR requirements and Dutch national law (AVG, UAVG, Telecommunicatiewet).

**Approval:** [To be signed by DPO/Data Controller]  
**Review Date:** January 2026

