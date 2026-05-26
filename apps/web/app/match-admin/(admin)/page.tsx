import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { sanityFetch } from "@/lib/sanity";
import { ADMIN_MATCH_LIST_QUERY } from "@/lib/match-admin-queries";
import { formatShortDate, formatMatchTime } from "@/lib/dateFormat";

interface TeamRef {
  name?: string;
  short?: string;
  logo?: string;
  isOwn?: boolean;
}
interface AdminMatch {
  _id: string;
  date?: string;
  competition?: string;
  tour?: number;
  status?: "scheduled" | "live" | "finished";
  hs?: number;
  as?: number;
  currentMinute?: number;
  home?: TeamRef;
  away?: TeamRef;
}

function StatusBadge({ status, minute }: { status?: string; minute?: number }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-300" />
        </span>
        LIVE{minute != null ? ` · ${minute}'` : ""}
      </span>
    );
  }
  if (status === "scheduled") {
    return (
      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
        Скоро
      </span>
    );
  }
  if (status === "finished") {
    return (
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Завершён
      </span>
    );
  }
  return null;
}

function TeamSmall({ team }: { team?: TeamRef }) {
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      {team?.logo ? (
        <img src={team.logo} alt="" className="h-4 w-4 object-contain shrink-0" />
      ) : team?.isOwn ? (
        <img src="/logo.png" alt="" className="h-4 w-4 object-contain shrink-0" />
      ) : null}
      <span className={`truncate text-sm ${team?.isOwn ? "font-bold text-polotsk-700" : "text-slate-700"}`}>
        {team?.name ?? team?.short ?? "?"}
      </span>
    </span>
  );
}

function sortMatches(list: AdminMatch[]): AdminMatch[] {
  // Live → scheduled (по возрастанию даты, ближайший сверху) → finished (по убыванию)
  const live = list.filter((m) => m.status === "live");
  const scheduled = list
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const finished = list
    .filter((m) => m.status === "finished")
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return [...live, ...scheduled, ...finished];
}

export default async function MatchAdminHomePage() {
  const raw = (await sanityFetch<AdminMatch[]>(ADMIN_MATCH_LIST_QUERY, {}, 5)) ?? [];
  const list = sortMatches(raw);

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl">Матчи</h1>
      <p className="mb-6 text-sm text-slate-500">
        Выбери матч, чтобы открыть панель событий.
      </p>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          В Sanity ещё нет ни одного матча.
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((m) => (
            <li key={m._id}>
              <Link
                href={`/match-admin/${m._id}`}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-polotsk-300 hover:bg-polotsk-50/30"
              >
                <div className="flex flex-col items-center gap-0.5 w-14 shrink-0 text-center">
                  <span className="font-display text-xs leading-none text-slate-500">
                    {m.date ? formatShortDate(m.date) : "—"}
                  </span>
                  <span className="text-[10px] uppercase tracking-eyebrow text-slate-400">
                    {m.date ? formatMatchTime(m.date) : "—:—"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={m.status} minute={m.currentMinute} />
                    {m.tour && (
                      <span className="text-[10px] uppercase tracking-eyebrow text-slate-400">
                        Тур {m.tour}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 min-w-0">
                    <TeamSmall team={m.home} />
                    <span className="text-xs text-slate-400 shrink-0">—</span>
                    <TeamSmall team={m.away} />
                  </div>
                </div>

                {(m.status === "live" || m.status === "finished") && m.hs != null && m.as != null && (
                  <div className="font-display text-xl tabular-nums text-slate-700 shrink-0">
                    {m.hs}:{m.as}
                  </div>
                )}

                <ChevronRight className="h-5 w-5 text-slate-300 shrink-0 transition group-hover:text-polotsk-500" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
