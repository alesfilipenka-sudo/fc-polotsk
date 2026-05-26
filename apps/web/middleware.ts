/**
 * Edge middleware: охраняет /match-admin/* кроме страницы логина.
 *
 * Проверяет HS256-JWT из cookie mc_session. Если нет / подпись неверная /
 * просрочен — редиректит на /match-admin/login с параметром ?from= для
 * возврата после логина.
 */

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { MATCH_ADMIN_SESSION_COOKIE } from "@/lib/match-admin-auth";

async function isSessionValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.sub === "match-admin";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Логин-страница и её server actions свободны.
  if (pathname === "/match-admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(MATCH_ADMIN_SESSION_COOKIE)?.value;
  const ok = await isSessionValid(token);
  if (ok) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/match-admin/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/match-admin/:path*"],
};
