import {
  getFormationCoords,
  tokenTextColor,
  tokenStroke,
} from "@/lib/formations";

interface LineupEntry {
  playerId?: string;
  name?: string;
  number?: number;
  position?: string;
  isStarter?: boolean;
  isCaptain?: boolean;
  positionSlot?: number;
}

interface PitchViewProps {
  squad?: LineupEntry[];
  /** Цвет фишек, HEX. */
  color?: string;
  formation?: string;
  /** Подпись над/под полем (например, название команды). */
  label?: string;
}

/**
 * SVG-поле с фишками 11 стартовых игроков. Координаты — из FORMATION_COORDS
 * по индексу positionSlot (если задан) или по порядку в массиве.
 *
 * Запасные (isStarter === false) не отображаются на поле.
 */
export function PitchView({
  squad,
  color = "#234794",
  formation = "4-3-3",
  label,
}: PitchViewProps) {
  const coords = getFormationCoords(formation);
  const tc = tokenTextColor(color);
  const sc = tokenStroke(color);

  const starters = (squad ?? []).filter(
    (p) => p.isStarter !== false,
  );

  return (
    <div className="overflow-hidden rounded-2xl">
      {label && (
        <p className="mb-2 text-center text-[10px] uppercase tracking-eyebrow text-white/60">
          {label}
        </p>
      )}
      <svg
        viewBox="0 0 100 108"
        className="block w-full"
        style={{ background: "#166534" }}
        role="img"
        aria-label={label ? `Состав ${label}` : "Состав"}
      >
        {/* Pitch lines */}
        <rect
          x="4"
          y="3"
          width="92"
          height="102"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.7"
        />
        <line
          x1="4"
          y1="54"
          x2="96"
          y2="54"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.6"
        />
        <circle
          cx="50"
          cy="54"
          r="9"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.6"
        />
        <rect
          x="28"
          y="3"
          width="44"
          height="14"
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="0.6"
        />
        <rect
          x="28"
          y="91"
          width="44"
          height="14"
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="0.6"
        />

        {/* Players */}
        {starters.slice(0, 11).map((p, i) => {
          const slot = p.positionSlot != null ? p.positionSlot : i;
          const c = coords[slot] ?? coords[i] ?? { x: 50, y: 50 };
          const key = p.playerId ?? `${p.name ?? "?"}-${i}`;
          const firstName = (p.name ?? "?").split(" ")[0];
          return (
            <g key={key}>
              <circle
                cx={c.x}
                cy={c.y}
                r="5.5"
                fill={color}
                stroke={sc}
                strokeWidth="0.8"
              />
              <text
                x={c.x}
                y={c.y + 0.8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={tc}
                fontSize="3.4"
                fontWeight="700"
                fontFamily="Oswald, sans-serif"
              >
                {p.number ?? ""}
              </text>
              <text
                x={c.x}
                y={c.y + 9}
                textAnchor="middle"
                fill="rgba(255,255,255,0.85)"
                fontSize="2.9"
                fontFamily="Inter, sans-serif"
              >
                {firstName}
              </text>
              {p.isCaptain && (
                <text
                  x={c.x + 6.5}
                  y={c.y - 3}
                  fill="#7e96d8"
                  fontSize="4"
                  fontFamily="Oswald, sans-serif"
                >
                  ©
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
