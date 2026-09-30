# Persona safety ops checklist

Complete these once in the [Persona Dashboard](https://withpersona.com). Domu Match tags Accounts with `banned` on admin ban; Repeat detection and Inquiry Comparison must be enabled in the template.

1. Require Government ID **Repeat** (ID reuse) check on the inquiry template — decline when the same ID + portrait appears on a different Account.
2. Require **Inquiry Comparison** for first name, last name, and birthdate (claimed vs extracted from ID).
3. Enable **minimum age 18** check on the template if available on your plan.
4. Create a **Workflow**: Account tag `banned` OR Repeat against a banned-tagged Account → auto-decline the inquiry.
5. Confirm webhook URL is `/api/verification/provider-webhook?provider=persona` with `PERSONA_WEBHOOK_SECRET` set in the environment.
6. Confirm `PERSONA_API_KEY` and inquiry template ID (`PERSONA_TEMPLATE_ID` / `NEXT_PUBLIC_PERSONA_TEMPLATE_ID`) are set.
