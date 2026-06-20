export const authSecret =
  process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";

export const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "";

export const isGoogleAuthEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);
