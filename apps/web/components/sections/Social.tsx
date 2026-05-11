import { Instagram, Send, ArrowRight, Youtube } from "lucide-react";
import { SectionHeader } from "../SectionHeader";
import { VKIcon } from "../icons/VKIcon";
import { sanityFetch } from "@/lib/sanity";
import { SOCIALS_QUERY } from "@/lib/queries";

interface SocialDoc {
  _id: string;
  id: "instagram" | "telegram" | "vk" | "youtube";
  label: string;
  handle: string;
  url: string;
  followers?: string;
  accent?: string;
}

const PLACEHOLDER_SOCIALS: SocialDoc[] = [
  {
    _id: "ig",
    id: "instagram",
    label: "Instagram",
    handle: "@fcpolotsk",
    url: "https://instagram.com/",
    followers: "—",
    accent: "from-pink-500 via-fuchsia-500 to-orange-400",
  },
  {
    _id: "tg",
    id: "telegram",
    label: "Telegram",
    handle: "@fcpolotsk",
    url: "https://t.me/",
    followers: "—",
    accent: "from-sky-400 to-blue-600",
  },
  {
    _id: "vk",
    id: "vk",
    label: "ВКонтакте",
    handle: "fcpolotsk",
    url: "https://vk.com/",
    followers: "—",
    accent: "from-blue-500 to-indigo-700",
  },
];

const ICONS = {
  instagram: Instagram,
  telegram: Send,
  vk: VKIcon,
  youtube: Youtube,
} as const;

export async function Social() {
  const channels = await sanityFetch<SocialDoc[]>(SOCIALS_QUERY).catch(
    () => null,
  );
  const list =
    channels && channels.length > 0 ? channels : PLACEHOLDER_SOCIALS;

  return (
    <section id="social" className="relative bg-slate-50/60 py-14 md:py-20">
      <div className="wave-divider absolute inset-x-0 top-0" aria-hidden />
      <div className="wave-divider absolute inset-x-0 bottom-0" aria-hidden />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="Соцсети клуба"
          title={
            <>
              Будь в <span className="text-polotsk-500">центре</span>
              <br />
              событий
            </>
          }
          action={
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-polotsk-500 hover:text-polotsk-700"
            >
              Все каналы
              <ArrowRight className="h-4 w-4" />
            </a>
          }
        />

        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {list.map((channel) => {
            const Icon = ICONS[channel.id] ?? Instagram;
            const accent =
              channel.accent ?? "from-polotsk-400 to-polotsk-700";
            return (
              <a
                key={channel._id}
                href={channel.url}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-polotsk-500"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`}
                />
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white ${accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-lg leading-none text-slate-900">
                      {channel.label}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {channel.handle}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                  <div>
                    <p className="font-display text-2xl tabular-nums text-slate-900">
                      {channel.followers ?? "—"}
                    </p>
                    <p className="text-[10px] uppercase tracking-eyebrow text-slate-400">
                      подписчиков
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-polotsk-500 group-hover:text-polotsk-700">
                    Подписаться
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
