import type { PlayerDetail } from "./types";
import { computeAge } from "./types";

interface PlayerInfoCardProps {
  player: PlayerDetail;
}

const FOOT_LABEL: Record<string, string> = {
  left: "Левая",
  right: "Правая",
  both: "Обе",
};

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Minsk",
  });
}

export function PlayerInfoCard({ player }: PlayerInfoCardProps) {
  const age = computeAge(player);
  const birthLabel = formatDate(player.birthDate);
  const footLabel = player.preferredFoot
    ? FOOT_LABEL[player.preferredFoot]
    : null;

  const rows: Array<{ label: string; value: string }> = [
    { label: "Возраст", value: `${age} лет` },
  ];
  if (birthLabel) rows.push({ label: "Дата рождения", value: birthLabel });
  if (player.height) rows.push({ label: "Рост", value: `${player.height} см` });
  if (player.weight) rows.push({ label: "Вес", value: `${player.weight} кг` });
  if (footLabel) rows.push({ label: "Ведущая нога", value: footLabel });
  rows.push({ label: "Гражданство", value: player.country });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
      <p className="mb-4 text-[10px] uppercase tracking-eyebrow text-slate-400">
        Параметры
      </p>
      <dl className="divide-y divide-slate-100">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-xs uppercase tracking-eyebrow text-slate-500">
              {r.label}
            </dt>
            <dd className="text-sm font-medium text-slate-900 text-right">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
