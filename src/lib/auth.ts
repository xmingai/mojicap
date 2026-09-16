/**
 * better-auth server instance — email one-time code sign-in, plus Google when
 * GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are set. There are no passwords.
 *
 * Built lazily: importing this module (e.g. while Next collects route config
 * at build time) must not open a database connection or require secrets.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";
import { getDB } from "./db";
import { account, rateLimit, session, user, verification } from "./db/schema";
import { emailLocale, sendEmail, signInCodeEmail } from "./email";


function createAuth() {
  const googleId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  return betterAuth({
    appName: "MojiCap",
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(getDB(), {
      provider: "sqlite",
      schema: { user, session, account, verification, rateLimit },
    }),
    session: {
      expiresIn: 60 * 60 * 24 * 365, // a year — signing in again means fetching a code from an inbox
      updateAge: 60 * 60 * 24, // refresh at most daily
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    rateLimit: {
      enabled: true,
      // In-memory limits don't survive across serverless instances.
      storage: "database",
      customRules: {
        "/email-otp/send-verification-otp": { window: 60, max: 3 },
        "/sign-in/email-otp": { window: 60, max: 10 },
      },
    },
    socialProviders: googleId && googleSecret ? { google: { clientId: googleId, clientSecret: googleSecret } } : {},
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 10 * 60,
        allowedAttempts: 5,
        storeOTP: "hashed",
        async sendVerificationOTP({ email, otp }, ctx) {
          const message = signInCodeEmail(otp, emailLocale(ctx?.request?.headers));
          // Don't await: response timing must not reveal whether an address exists.
          // after() keeps the serverless function alive until the send completes.
          after(() => sendEmail({ to: email, ...message }));
        },
      }),
      nextCookies(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

let instance: Auth | null = null;

export function getAuth(): Auth {
  if (!instance) instance = createAuth();
  return instance;
}

export function googleSignInAvailable(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

/** The signed-in user for an API request, or null. */
export async function getSessionUser(request: Request): Promise<{ id: string; email: string; name: string } | null> {
  const result = await getAuth().api.getSession({ headers: request.headers });
  if (!result?.user) return null;
  return { id: result.user.id, email: result.user.email, name: result.user.name };
}
