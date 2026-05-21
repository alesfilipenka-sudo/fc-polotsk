/**
 * Centralized date/time formatting for FC Polotsk.
 *
 * Sanity stores datetimes as UTC ISO strings. The Studio's datetime picker
 * uses the editor's local timezone for input. To make the rendered time on
 * the site match what editors actually meant (Minsk local time), we pin all
 * match-related formatting to `Europe/Minsk` regardless of which timezone
 * the Vercel runtime happens to be in.
 */
const TZ = "Europe/Minsk";

export function formatMatchDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    timeZone: TZ,
  });
}

export function formatMatchTime(iso?: string | null) {
  if (!iso) return "—:—";
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

export function formatShortDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    timeZone: TZ,
  });
}
