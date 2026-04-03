// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,

    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    ],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    beforeSend(event, hint) {
      // In local/dev, Next's dev server can throw `write EIO` when stdout is unavailable
      // (e.g. terminals/PTY closed). This isn't actionable for the app.
      if (process.env.NODE_ENV !== "production") {
        const original: any = hint?.originalException;
        const originalMessage =
          typeof original?.message === "string" ? original.message : undefined;
        const eventMessage =
          event?.exception?.values?.[0]?.value ||
          event?.logentry?.message ||
          undefined;

        const code =
          original?.code ||
          (event as any)?.contexts?.node_system_error?.code ||
          undefined;
        const syscall =
          original?.syscall ||
          (event as any)?.contexts?.node_system_error?.syscall ||
          undefined;

        const message = String(originalMessage || eventMessage || "");
        const isWriteEio =
          code === "EIO" &&
          syscall === "write" &&
          message.toLowerCase().includes("write eio");

        if (isWriteEio) {
          return null;
        }
      }

      return event;
    },

    // Disable sending user PII by default (GDPR compliance)
    // PII is only sent if user has explicitly consented (checked client-side)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: false,
  });
}
