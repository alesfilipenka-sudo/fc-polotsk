import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="mb-8 text-xs text-slate-400">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${it.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
              {it.href && !isLast ? (
                <Link
                  href={it.href}
                  className="truncate uppercase tracking-eyebrow hover:text-polotsk-500"
                >
                  {it.label}
                </Link>
              ) : (
                <span className="truncate uppercase tracking-eyebrow text-slate-600">
                  {it.label}
                </span>
              )}
              {!isLast && <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
