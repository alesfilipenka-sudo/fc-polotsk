import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  action?: ReactNode;
  dark?: boolean;
}

/**
 * Reusable section heading: eyebrow + display title + optional right action.
 * On mobile (<sm) the action wraps to a new line under the title so filters
 * don't collide with the heading text.
 */
export function SectionHeader({
  eyebrow,
  title,
  action,
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-6">
      <div className="min-w-0">
        <p
          className={cn(
            "mb-2 text-xs font-semibold uppercase tracking-eyebrow md:mb-3",
            dark ? "text-polotsk-300" : "text-polotsk-500",
          )}
        >
          {eyebrow}
        </p>
        <h2
          className={cn(
            "font-display text-3xl leading-[0.9] sm:text-4xl md:text-6xl",
            dark ? "text-white" : "text-slate-900",
          )}
        >
          {title}
        </h2>
      </div>
      {action ? (
        <div className="shrink-0 flex flex-wrap gap-2">{action}</div>
      ) : null}
    </div>
  );
}
