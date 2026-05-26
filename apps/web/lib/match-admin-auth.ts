/**
 * Match admin аутентификация.
 *
 * Архитектура: один shared password в env (`ADMIN_PASSWORD`). После успешной
 * проверки — JWT в httpOnly cookie на 12 часов. Middleware (Edge) проверяет
 * подпись JWT через `jose`. Для маленькой админки (1-3 оператора) этого
 * достаточно; если потребуется per-user — заменим на NextAuth.
 *
 * Env variables (Vercel):
 *   ADMIN_PASSWORD — пароль, который вводит оператор
 *   AUTH_SECRET    — секрет для подписи JWT (минимум 32 случайных символа)
 */

import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "mc_session";
const SESSION_TTL_HOURS = 12;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET env var is missing or too short (min 16 chars).",
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Возвращает true, если введённый пароль совпадает с ADMIN_PASSWORD из env.
 * Простое строковое сравнение — достаточно, т.к. пароль из env известен
 * только владельцу Vercel-проекта.
 */
export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return input === expected;
}

/**
 * Подписать сессионный JWT. Используется после успешного логина.
 */
export async function signSession(): Promise<string> {
  const expiresIn = `${SESSION_TTL_HOURS}h`;
  return await new SignJWT({ role: "match-admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("match-admin")
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

/**
 * Проверить и распарсить JWT из cookie. Возвращает payload или null при
 * любой ошибке (нет cookie, плохая подпись, истёк срок).
 */
export async function verifySession(token: string | undefined): Promise<
  { ok: true; exp: number } | { ok: false }
> {
  if (!token) return { ok: false };
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.sub !== "match-admin") return { ok: false };
    return { ok: true, exp: payload.exp ?? 0 };
  } catch {
    return { ok: false };
  }
}

export const MATCH_ADMIN_SESSION_COOKIE = SESSION_COOKIE;
export const MATCH_ADMIN_SESSION_TTL_HOURS = SESSION_TTL_HOURS;
