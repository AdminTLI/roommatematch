# Record of Processing Activities (ROPA)
## Domu Match Platform

**Date:** January 2025  
**Version:** 1.0  
**Status:** Active

This document provides a complete inventory of all personal data processing activities conducted by Domu Match, as required by Article 30 GDPR.

## 1. Controller Information

- **Name:** Domu Match
- **Contact:** domumatch@gmail.com
- **Data Protection Officer:** domumatch@gmail.com
- **Address:** [Business Address]

## 2. Processing Activities

### 2.1 User Account Management

| Field | Details |
|-------|---------|
| **Purpose** | Create and manage user accounts |
| **Data Categories** | Email address, password (hashed), account creation date, last login |
| **Data Subjects** | All registered users |
| **Lawful Basis** | Contract (Article 6(1)(b) GDPR) |
| **Retention Period** | While account is active + 2 years after inactivity |
| **Recipients** | Supabase (hosting), internal systems |
| **Transfers** | Supabase (EU) |
| **Security Measures** | Password hashing (bcrypt), TLS encryption, access controls |

### 2.2 User Profile Data

| Field | Details |
|-------|---------|
| **Purpose** | Build user profiles for matching |
| **Data Categories** | Name, phone number, bio, profile photos, languages, preferences |
| **Data Subjects** | All registered users |
| **Lawful Basis** | Contract (Article 6(1)(b) GDPR) |
| **Retention Period** | While account is active, deleted upon account deletion |
| **Recipients** | Matched users (limited profile data), internal systems |
| **Transfers** | Supabase (EU) |
| **Security Measures** | RLS policies, encryption, access controls |

### 2.3 Academic Information

| Field | Details |
|-------|---------|
| **Purpose** | Match users by university and academic program |
| **Data Categories** | University, degree level, program, study year, campus |
| **Data Subjects** | All registered users |
| **Lawful Basis** | Contract (Article 6(1)(b) GDPR) |
| **Retention Period** | While account is active, deleted upon account deletion |
| **Recipients** | Matched users, university admins (if applicable) |
| **Transfers** | Supabase (EU) |
| **Security Measures** | RLS policies, access controls |
| **Data Source** | DUO (Dutch Ministry of Education) - programs data |

### 2.4 Questionnaire Responses

| Field | Details |
|-------|---------|
| **Purpose** | Calculate compatibility scores for matching |
| **Data Categories** | Lifestyle preferences, personality traits, living habits, deal breakers |
| **Data Subjects** | All users who complete questionnaire |
| **Lawful Basis** | Contract (Article 6(1)(b) GDPR) |
| **Retention Period** | While account is active, deleted upon account deletion |
| **Recipients** | Matching algorithm, matched users (aggregated scores) |
| **Transfers** | Supabase (EU) |
| **Security Measures** | RLS policies, encryption, access controls |
| **Automated Processing** | Yes - used in matching algorithm |

### 2.5 Identity Verification

| Field | Details |
|-------|---------|
| **Purpose** | Verify user identity and prevent fraud |
| **Data Categories** | Government-issued ID, selfie photos, biometric data |
| **Data Subjects** | Users seeking verification |
| **Lawful Basis** | Legitimate interest (Article 6(1)(f) GDPR) - fraud prevention |
| **Special Category** | Biometric data (Article 9(2)(f) GDPR) |
| **Retention Period** | 4 weeks after verification (Dutch law requirement) |
| **Recipients** | Third-party KYC providers (Persona/Veriff/Onfido), internal systems |
| **Transfers** | KYC providers (may be outside EEA), Supabase (EU) |
| **Security Measures** | Encryption, third-party security, access controls, audit logging |
| **DPA Status** | Signed DPAs with KYC providers |

### 2.6 Matching Data

| Field | Details |
|-------|---------|
| **Purpose** | Generate and manage roommate matches |
| **Data Categories** | Compatibility scores, match status, user decisions (accept/reject) |
| **Data Subjects** | All users participating in matching |
| **Lawful Basis** | Contract (Article 6(1)(b) GDPR) |
| **Retention Period** | 90 days after match expiry |
| **Recipients** | Matched users, internal systems |
| **Transfers** | Supabase (EU) |
| **Security Measures** | RLS policies, encryption |
| **Automated Processing** | Yes - matching algorithm generates scores |

### 2.7 Communication Data (Chat)

| Field | Details |
|-------|---------|
| **Purpose** | Enable communication between matched users |
| **Data Categories** | Chat messages, read receipts, timestamps |
| **Data Subjects** | Users engaged in chat conversations |
| **Lawful Basis** | Contract (Article 6(1)(b) GDPR) |
| **Retention Period** | 1 year after last message in chat |
| **Recipients** | Chat participants, internal systems (moderation) |
| **Transfers** | Supabase (EU), Realtime subscriptions |
| **Security Measures** | RLS policies, message filtering, encryption |

### 2.8 Safety and Moderation

| Field | Details |
|-------|---------|
| **Purpose** | Maintain platform safety and prevent harassment |
| **Data Categories** | User reports, moderation actions, safety incidents |
| **Data Subjects** | Users involved in safety incidents |
| **Lawful Basis** | Legitimate interest (Article 6(1)(f) GDPR) - user safety |
| **Retention Period** | 1 year after resolution |
| **Recipients** | Admin users, internal systems |
| **Transfers** | Supabase (EU) |
| **Security Measures** | Access controls, audit logging |

### 2.9 Analytics and Error Tracking

| Field | Details |
|-------|---------|
| **Purpose** | Improve platform functionality and user experience |
| **Data Categories** | Usage patterns, error logs, performance metrics (anonymized) |
| **Data Subjects** | All users (with consent) |
| **Lawful Basis** | Consent (Article 6(1)(a) GDPR) - opt-in required |
| **Retention Period** | 90 days (error logs), 2 years (anonymized analytics) |
| **Recipients** | Sentry (error tracking), Vercel Analytics, internal systems |
| **Transfers** | Sentry (US/EU), Vercel (US/EU) - with SCCs |
| **Security Measures** | PII redaction, consent management, encryption |
| **DPA Status** | Standard contractual clauses with Sentry and Vercel |

### 2.10 Session Replay

| Field | Details |
|-------|---------|
| **Purpose** | Debug issues and improve user experience |
| **Data Categories** | User session recordings, interactions, screen recordings |
| **Data Subjects** | Users who consent to session replay |
| **Lawful Basis** | Consent (Article 6(1)(a) GDPR) - explicit opt-in required |
| **Retention Period** | 90 days (configurable via Sentry) |
| **Recipients** | Sentry (session replay service) |
| **Transfers** | Sentry (US/EU) - with SCCs |
| **Security Measures** | Consent management, PII masking, encryption |
| **DPA Status** | Standard contractual clauses with Sentry |

## 3. Third-Party Processors

### 3.1 Supabase
- **Purpose:** Database, authentication, hosting, storage
- **Location:** EU (primary), US (backup)
- **DPA Status:** Standard contractual clauses
- **Data Categories:** All user data
- **Subprocessors:** Listed in Supabase DPA

### 3.2 Sentry
- **Purpose:** Error tracking, session replay
- **Location:** US, EU
- **DPA Status:** Standard contractual clauses
- **Data Categories:** Error logs, session recordings (with consent)
- **Subprocessors:** Listed in Sentry DPA

### 3.3 Vercel
- **Purpose:** Hosting, analytics
- **Location:** US, EU
- **DPA Status:** Standard contractual clauses
- **Data Categories:** Analytics data (anonymized, with consent)
- **Subprocessors:** Listed in Vercel DPA

### 3.4 KYC Providers (Persona/Veriff/Onfido)
- **Purpose:** Identity verification
- **Location:** Various (may include US)
- **DPA Status:** Signed DPAs
- **Data Categories:** ID documents, biometric data
- **Subprocessors:** Listed in provider DPAs

### 3.5 Email Service Providers
- **Purpose:** Transactional emails, notifications
- **Location:** EU/US
- **DPA Status:** Standard contractual clauses
- **Data Categories:** Email addresses, email content
- **Subprocessors:** Listed in provider DPAs

## 4. Data Subject Rights

### 4.1 Rights Implementation

| Right | Implementation | Response Time |
|-------|---------------|---------------|
| **Access (Article 15)** | Data export API (`/api/privacy/export`) | 30 days |
| **Rectification (Article 16)** | Profile settings, API endpoints | Immediate |
| **Erasure (Article 17)** | Account deletion API (`/api/privacy/delete`) | 30 days (7-day grace period) |
| **Restriction (Article 18)** | Account suspension, data freezing | 30 days |
| **Portability (Article 20)** | Data export in JSON format | 30 days |
| **Objection (Article 21)** | Opt-out mechanisms, consent withdrawal | Immediate |
| **Automated Decision-Making (Article 22)** | Manual review option, algorithm explanation | On request |

### 4.2 DSAR Process

- **Request Channel:** Privacy settings UI, email (domumatch@gmail.com)
- **Tracking:** DSAR requests table with SLA deadlines
- **Automation:** Automated reminders, admin dashboard
- **Response Format:** JSON export, machine-readable

## 5. Security Measures

### 5.1 Technical Measures
- TLS 1.3 encryption in transit
- AES-256 encryption at rest
- Row Level Security (RLS) policies
- Role-based access controls
- Regular security audits
- Automated vulnerability scanning

### 5.2 Organizational Measures
- Staff training on data protection
- Access logging and monitoring
- Incident response procedures
- Regular DPIA reviews
- Vendor management

## 6. Data Breach Procedures

### 6.1 Detection
- Automated monitoring and alerts
- Security incident logging
- User reports

### 6.2 Response
- Containment within 1 hour
- Assessment within 24 hours
- DPA notification within 72 hours (if required)
- User notification without undue delay (if high risk)

### 6.3 Documentation
- Incident log
- Breach assessment
- Notification records
- Remediation actions

## 7. Review and Updates

This ROPA is reviewed:
- Annually
- When new processing activities are added
- When processors change
- After security incidents
- When regulatory requirements change

**Last Updated:** January 2025  
**Next Review:** January 2026

