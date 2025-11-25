# KYC Verification Setup Guide

## Overview
The platform uses a third-party KYC provider (Veriff, Persona, or Onfido) for identity verification. We never store raw documents - verification is handled entirely by the provider.

## Supported Providers

- **Veriff** (default, EU-compliant)
- **Persona**
- **Onfido**

## Setup Steps

### 1. Choose Provider
Set `KYC_PROVIDER` environment variable to your chosen provider:
```bash
KYC_PROVIDER=veriff  # or persona, onfido
```

### 2. Get API Credentials
Sign up with your chosen provider and obtain:
- API Key
- Webhook Secret
- API URL (usually provided in docs)

### 3. Configure Environment Variables

**For Veriff:**
```bash
VERIFF_API_KEY=your_api_key_here
VERIFF_API_URL=https://station.veriff.com
VERIFF_WEBHOOK_SECRET=your_webhook_secret_here
```

**For Persona:**
```bash
PERSONA_API_KEY=your_api_key_here
PERSONA_API_URL=https://withpersona.com/api/v1
PERSONA_WEBHOOK_SECRET=your_webhook_secret_here
```

**For Onfido:**
```bash
ONFIDO_API_KEY=your_api_key_here
ONFIDO_API_URL=https://api.onfido.com/v3
ONFIDO_WEBHOOK_SECRET=your_webhook_secret_here
```

### 4. Configure Webhook URL
In your provider's dashboard, set the webhook URL to:
```
https://your-domain.com/api/verification/provider-webhook?provider=veriff
```
(Replace `veriff` with your provider name)

### 5. Run Database Migrations
Apply the verification migration:
```bash
psql $DATABASE_URL -f db/migrations/021_kyc_verification.sql
```

### 6. Test Verification Flow
1. User starts verification via `/verify` page
2. User is redirected to provider-hosted flow
3. Provider processes verification
4. Webhook updates verification status
5. User profile status updates automatically

## Webhook Security
Webhooks are secured using HMAC signatures. The provider signs the payload with your webhook secret, and we verify the signature before processing.

## GDPR Compliance
- We never store raw documents
- Verification data is retained by the provider according to their retention policy
- Users can request deletion of their verification data
- All processing complies with GDPR and Dutch privacy regulations

## Troubleshooting

**Webhook not receiving:**
- Check webhook URL is correct in provider dashboard
- Verify webhook secret matches environment variable
- Check server logs for signature verification errors

**Verification stuck in pending:**
- Check webhook is configured correctly
- Verify provider session was created successfully
- Check `verification_webhooks` table for errors

**Provider session creation fails:**
- Verify API key is correct
- Check API URL is correct
- Ensure callback URL is accessible from provider








