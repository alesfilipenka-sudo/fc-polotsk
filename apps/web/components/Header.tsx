"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Send, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { VKIcon } from "./icons/VKIcon";
import { NAV, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SOCIAL_ICONS = [
  { id: "instagram", Icon: Instagram, href: SITE.social.instagram, label: "Instagram" },
  { id: "telegram", Icon: Send, href: SITE.social.telegram, label: "Telegram" },
  { id: "vk", Icon: VKIcon, href: SITE.social.vk, label: "VK" },
];

export function Header() {
  const pathname = usePathname();
  // Прозрачный фон допустим только на главной — там под header лежит тёмный
  // Hero. На остальных страницах под header — белый, без фона он выглядит
  // пустым и нечитаемым.
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // На не-главных всегда рисуем solid вариант. На главной — переключаемся по scroll.
  const solid = !isHome || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-200",
        solid
          ? "border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:h-20 md:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <Logo size={solid ? 30 : 36} priority />
          <div className="min-w-0">
            <p
              className={cn(
                "truncate font-display text-base leading-none md:text-lg",
                solid ? "text-slate-900" : "text-white",
              )}
            >
              {SITE.name}
            </p>
            <p
              className={cn(
                "text-[10px] uppercase tracking-eyebrow",
                solid ? "text-slate-500" : "text-white/60",
              )}
            >
              EST. 2019
            </p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "underline-grow text-xs font-semibold uppercase tracking-wider",
                solid ? "text-slate-700 hover:text-polotsk-500" : "text-white/85 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 md:flex">
            {SOCIAL_ICONS.map(({ id, Icon, href, label }) => (
              <a
                key={id}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full transition",
                  solid
                    ? "text-slate-600 hover:bg-slate-100"
                    : "text-white/85 hover:bg-white/10",
                )}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full lg:hidden",
              solid
                ? "text-slate-700 hover:bg-slate-100"
                : "text-white hover:bg-white/10",
            )}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:text-polotsk-500"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
              {SOCIAL_ICONS.map(({ id, Icon, href, label }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
