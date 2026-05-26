import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { cookies } from "next/headers";
import {
  MATCH_ADMIN_SESSION_COOKIE,
  MATCH_ADMIN_SESSION_TTL_HOURS,
  verifySession,
} from "@/lib/match-admin-auth";
import { logoutAction } from "../_actions/logout";

export const metadata: Metadata = {
  title: "Match Admin · ФК Полоцк",
  robots: { index: false, follow: false },
};

function formatExpiresIn(exp: number): string {
  const diffMs = exp * 1000 - Date.now();
  if (diffMs <= 0) return "истекла";
  const totalMin = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  if (hours > 0) return `${hours}ч ${minutes}м`;
  return `${minutes}м`;
}

export default async function MatchAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(MATCH_ADMIN_SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  // Login страница имеет свой layout — здесь рендер только когда залогинены.
  // (middleware уже редиректнул бы, но защитимся ещё раз.)
  const expiresLabel = session.ok ? formatExpiresIn(session.exp) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {expiresLabel && (
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/logo.png"
                alt="ФК Полоцк"
                width={28}
                height={28}
                className="object-contain"
              />
              <div className="min-w-0">
                <p className="font-display text-sm leading-none">Match Admin</p>
                <p className="text-[10px] uppercase tracking-eyebrow text-slate-500">
                  Сессия · {expiresLabel} · TTL {MATCH_ADMIN_SESSION_TTL_HOURS}ч
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 hover:bg-slate-100"
              >
                Сайт
                <ExternalLink className="h-3 w-3" />
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 hover:bg-slate-100"
                >
                  Выйти
                  <LogOut className="h-3 w-3" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
