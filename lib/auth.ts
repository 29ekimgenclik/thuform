import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "thu_admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const env = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (env) return env;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET (veya ADMIN_PASSWORD) ayarlanmalı");
  }
  return "dev-insecure-secret-change-me";
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function makeSessionToken(): string {
  const payload = `admin.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  const got = parts[2];
  if (expected.length !== got.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(got));
  } catch {
    return false;
  }
}

export function checkPassword(input: string): boolean {
  const stored = process.env.ADMIN_PASSWORD;
  if (!stored) {
    if (process.env.NODE_ENV === "production") return false;
    return input === "tepebasi2025";
  }
  if (input.length !== stored.length) return false;
  try {
    return timingSafeEqual(Buffer.from(input), Buffer.from(stored));
  } catch {
    return false;
  }
}

export function setSessionCookie() {
  cookies().set(COOKIE_NAME, makeSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export function isAuthenticated(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
