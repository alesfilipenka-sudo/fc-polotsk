import { defineType, defineField } from "sanity";
import { EarthGlobeIcon } from "@sanity/icons";

const SOCIAL_IDS = [
  { title: "Instagram", value: "instagram" },
  { title: "Telegram", value: "telegram" },
  { title: "VK", value: "vk" },
  { title: "YouTube", value: "youtube" },
] as const;

export const socialChannel = defineType({
  name: "socialChannel",
  title: "Social Channel",
  type: "document",
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: "id",
      title: "Платформа",
      type: "string",
      options: { list: [...SOCIAL_IDS], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "Название",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "handle",
      title: "Handle",
      description: "@fcpolotsk или ссылка-фрагмент.",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (r) =>
        r.required().uri({ scheme: ["http", "https"], allowRelative: false }),
    }),
    defineField({
      name: "followers",
      title: "Подписчиков (display)",
      description: "Строка для UI: '12K', '3.5K'. Не число — клуб сам форматирует.",
      type: "string",
    }),
    defineField({
      name: "accent",
      title: "Tailwind gradient (accent)",
      description: "Например: from-pink-500 via-fuchsia-500 to-orange-400",
      type: "string",
    }),
    defineField({
      name: "order",
      title: "Порядок",
      description: "Чем меньше — тем левее в строке. По умолчанию IG=1, TG=2, VK=3.",
      type: "number",
      initialValue: 99,
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "handle", id: "id" },
    prepare({ title, subtitle, id }) {
      return { title: `${title} (${id})`, subtitle };
    },
  },
  orderings: [
    {
      title: "Порядок",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
