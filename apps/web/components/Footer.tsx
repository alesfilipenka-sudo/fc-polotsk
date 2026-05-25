import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Send, Youtube } from "lucide-react";
import { LogoDecor } from "./Logo";
import { VKIcon } from "./icons/VKIcon";
import { SITE } from "@/lib/constants";
import { sanityFetch } from "@/lib/sanity";
import { SITE_SETTINGS_QUERY } from "@/lib/queries";

const COLUMNS = [
  {
    title: "Клуб",
    links: [
      { label: "Команда", href: "/#team" },
      { label: "Тренерский штаб", href: "/#team" },
      { label: "Академия", href: "#" },
      { label: "История", href: "#" },
    ],
  },
  {
    title: "Матчи",
    links: [
      { label: "Расписание", href: "/#matches" },
      { label: "Результаты", href: "/#results" },
      { label: "Турнирная таблица", href: "/#matches" },
    ],
  },
];

const FOOTER_SOCIAL = [
  { Icon: Instagram, href: "https://instagram.com/", label: "Instagram" },
  { Icon: Send, href: "https://t.me/", label: "Telegram" },
  { Icon: VKIcon, href: "https://vk.com/", label: "VK" },
  { Icon: Youtube, href: "https://youtube.com/", label: "YouTube" },
];

interface FooterSettings {
  footerDescription?: string;
  establishedYear?: number;
  city?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export async function Footer() {
  const settings = await sanityFetch<FooterSettings>(SITE_SETTINGS_QUERY);

  const description =
    settings?.footerDescription ??
    `Профессиональный футбольный клуб из Полоцка. Высшая лига Беларуси, сезон ${SITE.season}.`;
  const year = settings?.establishedYear ?? 2019;
  const phone = settings?.phone ?? "+375 (00) 000-00-00";
  const email = settings?.email ?? "info@fcpolotsk.by";
  const address = settings?.address ?? settings?.city ?? SITE.city;

  return (
    <footer className="relative overflow-hidden bg-polotsk-500 text-white">
      <div className="wave-divider-light absolute inset-x-0 top-0" aria-hidden />
      <div
        className="grain pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        aria-hidden
      />
      <LogoDecor
        size={500}
        opacity={0.10}
        className="pointer-events-none absolute -bottom-20 -right-24"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-14 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="ФК Полоцк"
              width={64}
              height={64}
              className="object-contain"
            />
            <div>
              <p className="font-display text-2xl leading-none">{SITE.name}</p>
              <p className="text-xs uppercase tracking-eyebrow text-white/60">
                Football Club · Est. {year}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm text-white/75">{description}</p>
          <div className="mt-6 flex gap-2">
            {FOOTER_SOCIAL.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 transition hover:bg-white/15"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="md:col-span-2">
            <p className="mb-4 text-xs font-semibold uppercase tracking-eyebrow text-white/60">
              {col.title}
            </p>
            <ul className="space-y-2.5 text-sm text-white/85">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-3">
          <p className="mb-4 text-xs font-semibold uppercase tracking-eyebrow text-white/60">
            Контакты
          </p>
          <ul className="space-y-3 text-sm text-white/85">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-polotsk-300" />
              <span>{address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-polotsk-300" />
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-white">
                {phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-polotsk-300" />
              <a href={`mailto:${email}`} className="hover:text-white">
                {email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/60 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg leading-none text-white">
              {year}
            </span>
            <span>© {SITE.name}. Все права защищены.</span>
          </div>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-white">
              Политика конфиденциальности
            </Link>
            <Link href="#" className="hover:text-white">
              Правила пользования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
