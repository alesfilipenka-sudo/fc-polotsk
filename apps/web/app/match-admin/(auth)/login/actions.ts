"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  verifyPassword,
  signSession,
  MATCH_ADMIN_SESSION_COOKIE,
  MATCH_ADMIN_SESSION_TTL_HOURS,
} from "@/lib/match-admin-auth";

export interface LoginState {
  error?: string;
}

/**
 * Server Action: проверяет пароль и ставит httpOnly cookie с JWT.
 * При успехе — редирект на ?from= (или /match-admin).
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = (formData.get("password") ?? "").toString();
  const from = (formData.get("from") ?? "/match-admin").toString();

  if (!verifyPassword(password)) {
    // 500ms задержка — простая защита от brute-force
    await new Promise((r) => setTimeout(r, 500));
    return { error: "Неверный пароль" };
  }

  const token = await signSession();
  const cookieStore = await cookies();
  cookieStore.set({
    name: MATCH_ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MATCH_ADMIN_SESSION_TTL_HOURS * 3600,
  });

  // Защита от open-redirect: разрешаем только относительные пути в /match-admin
  const safeRedirect = from.startsWith("/match-admin") ? from : "/match-admin";
  redirect(safeRedirect);
  return {}; // unreachable, redirect() throws
}
