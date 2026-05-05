import { defineType, defineField } from "sanity";
import { UserIcon } from "@sanity/icons";

const POSITIONS = [
  { title: "Вратарь", value: "GK" },
  { title: "Защитник", value: "DF" },
  { title: "Полузащитник", value: "MF" },
  { title: "Нападающий", value: "FW" },
] as const;

export const player = defineType({
  name: "player",
  title: "Player",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Имя",
      type: "string",
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: "num",
      title: "Номер",
      type: "number",
      validation: (r) => r.required().integer().min(1).max(99),
    }),
    defineField({
      name: "pos",
      title: "Позиция",
      type: "string",
      options: { list: [...POSITIONS], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "age",
      title: "Возраст",
      type: "number",
      validation: (r) => r.required().integer().min(14).max(50),
    }),
    defineField({
      name: "country",
      title: "Гражданство",
      description: "ISO-3 либо короткий код для бейджа: BLR, RUS, UKR.",
      type: "string",
      validation: (r) => r.required().max(4),
      initialValue: "BLR",
    }),
    defineField({
      name: "photo",
      title: "Фото",
      type: "image",
      options: { hotspot: true },
      description: "Портрет 3:4. Если пусто — рендерим SVG-силуэт.",
    }),
    defineField({
      name: "bio",
      title: "Биография",
      type: "text",
      rows: 4,
    }),
  ],
  preview: {
    select: { title: "name", num: "num", pos: "pos", media: "photo" },
    prepare({ title, num, pos }) {
      return {
        title: `#${num} ${title}`,
        subtitle: pos ? POSITIONS.find((p) => p.value === pos)?.title : "",
      };
    },
  },
  orderings: [
    { title: "Номер", name: "numAsc", by: [{ field: "num", direction: "asc" }] },
    { title: "Имя", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
});
