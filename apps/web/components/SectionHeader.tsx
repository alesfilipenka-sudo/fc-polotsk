import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  action?: ReactNode;
  dark?: boolean;
}

/**
 * Reusable section heading: small uppercase eyebrow + display-font title +
 * optional action (link or button) on the right.
 */
export function SectionHeader({
  eyebrow,
  title,
  action,
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
      <div className="min-w-0">
        <p
          className={cn(
            "mb-3 text-xs font-semibold uppercase tracking-eyebrow",
            dark ? "text-polotsk-300" : "text-polotsk-500",
          )}
        >
          {eyebrow}
        </p>
        <h2
          className={cn(
            "font-display text-4xl leading-[0.9] md:text-6xl",
            dark ? "text-white" : "text-slate-900",
          )}
        >
          {title}
        </h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
