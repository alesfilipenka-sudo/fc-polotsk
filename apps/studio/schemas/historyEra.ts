import { defineType, defineField } from "sanity";
import { ClockIcon } from "@sanity/icons";

const TONES = [
  { title: "Sepia (1905)", value: "sepia" },
  { title: "БССР (1928)", value: "bssr" },
  { title: "Советский (1975)", value: "soviet" },
  { title: "Modern (2004 / 2019)", value: "modern" },
  { title: "Gaz (2013)", value: "gaz" },
  { title: "Current (2025+)", value: "current" },
];

const FACT_ICONS = [
  "Trophy",
  "Award",
  "Medal",
  "Flag",
  "Shield",
  "Users",
  "Factory",
  "TrendingUp",
  "Calendar",
  "MapPin",
  "ArrowUpCircle",
  "Sparkles",
  "GraduationCap",
  "Target",
  "Landmark",
];

export const historyEra = defineType({
  name: "historyEra",
  title: "Эпоха истории клуба",
  type: "document",
  icon: ClockIcon,
  fields: [
    defineField({
      name: "order",
      title: "Порядок",
      description: "Числовой порядок отображения. 1 — самая ранняя, 7 — самая поздняя.",
      type: "number",
      validation: (r) => r.required().integer().min(1).max(50),
    }),
    defineField({
      name: "eraId",
      title: "ID эпохи (slug)",
      description: "Латинский ID: origin / bssr / soviet / fcpolotsk / gaz / p2019 / now",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "year",
      title: "Год (маркер)",
      description: 'Например "1905" — для круглого маркера на таймлайне.',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "range",
      title: "Период",
      description: 'Например "1905 — 1917"',
      type: "string",
    }),
    defineField({
      name: "tone",
      title: "Цветовая палитра",
      type: "string",
      options: { list: TONES, layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kicker",
      title: "Надзаголовок",
      description: 'Например "Истоки", "Эпоха БССР"',
      type: "string",
    }),
    defineField({
      name: "name",
      title: "Название эпохи",
      type: "string",
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: "lead",
      title: "Лид (акцент-строка)",
      type: "string",
      validation: (r) => r.max(220),
    }),
    defineField({
      name: "body",
      title: "Описание",
      type: "text",
      rows: 5,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "photo",
      title: "Историческое фото",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "caption",
          title: "Подпись / alt",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "facts",
      title: "Достижения (до 3)",
      type: "array",
      validation: (r) => r.max(3),
      of: [
        {
          type: "object",
          name: "fact",
          fields: [
            defineField({
              name: "icon",
              title: "Иконка",
              description: "Lucide-icon: Trophy / Award / Medal / Flag / Shield / Users / Factory / TrendingUp / Calendar / MapPin / ArrowUpCircle / Sparkles / GraduationCap / Target / Landmark",
              type: "string",
              options: { list: FACT_ICONS.map((v) => ({ title: v, value: v })) },
            }),
            defineField({
              name: "t",
              title: "Заголовок",
              type: "string",
              validation: (r) => r.required().max(60),
            }),
            defineField({
              name: "d",
              title: "Описание",
              type: "string",
              validation: (r) => r.required().max(180),
            }),
          ],
          preview: {
            select: { title: "t", subtitle: "d", icon: "icon" },
            prepare({ title, subtitle, icon }) {
              return {
                title: title ?? "?",
                subtitle: `${icon ? `${icon} · ` : ""}${subtitle ?? ""}`,
              };
            },
          },
        },
      ],
    }),
  ],
  orderings: [
    {
      title: "По порядку",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", year: "year", range: "range", media: "photo" },
    prepare({ title, year, range, media }) {
      return {
        title: `${year ?? "?"} · ${title ?? "?"}`,
        subtitle: range,
        media,
      };
    },
  },
});
