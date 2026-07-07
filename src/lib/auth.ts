import { timingSafeEqual, createHmac } from "node:crypto";
import type { Customer } from "./types";
import { toSafeUser } from "./user-auth";

export const sessionCookieName = "molare_session";

const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;
const sessionVersion = 1;

type SessionPayload = {
  version: number;
  expiresAt: number;
  user: Customer;
};

type SessionCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SESSION_SECRET environment variable.");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function signaturesMatch(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function isRole(value: unknown): value is Customer["role"] {
  return value === "customer" || value === "admin";
}

function parseSafeUser(value: unknown): Customer | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<Customer>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.fullName !== "string" ||
    typeof candidate.email !== "string" ||
    !isRole(candidate.role)
  ) {
    return null;
  }

  return {
    id: candidate.id,
    fullName: candidate.fullName,
    email: candidate.email,
    phone: typeof candidate.phone === "string" ? candidate.phone : undefined,
    role: candidate.role
  };
}

export function getSessionCookieOptions(nodeEnv = process.env.NODE_ENV): SessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: nodeEnv === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds
  };
}

export async function createSessionToken(user: Customer) {
  const payload: SessionPayload = {
    version: sessionVersion,
    expiresAt: Date.now() + sessionMaxAgeSeconds * 1000,
    user: toSafeUser(user)
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<Customer | null> {
  if (!token) return null;

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return null;

  if (!signaturesMatch(signature, sign(encodedPayload))) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<SessionPayload>;
    if (payload.version !== sessionVersion || typeof payload.expiresAt !== "number" || payload.expiresAt <= Date.now()) {
      return null;
    }
    return parseSafeUser(payload.user);
  } catch {
    return null;
  }
}
