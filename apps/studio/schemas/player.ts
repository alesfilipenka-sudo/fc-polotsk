import { defineType, defineField } from "sanity";
import { UserIcon } from "@sanity/icons";

const POSITIONS = [
  { title: "Вратарь", value: "GK" },
  { title: "Защитник", value: "DF" },
  { title: "Полузащитник", value: "MF" },
  { title: "Нападающий", value: "FW" },
  { title: "Тренер", value: "COACH" },
] as const;

const FEET = [
  { title: "Левая", value: "left" },
  { title: "Правая", value: "right" },
  { title: "Обе", value: "both" },
] as const;

/**
 * Транслит для авто-slug: убирает кириллицу → латиница для URL /player/[slug].
 * Простая реализация — хватит для русских имён игроков.
 */
const RU_LATIN_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya",
};

function slugifyName(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((c) => RU_LATIN_MAP[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export const player = defineType({
  name: "player",
  title: "Player",
  type: "document",
  icon: UserIcon,
  groups: [
    { name: "main", title: "Основное", default: true },
    { name: "profile", title: "Профиль" },
    { name: "media", title: "Медиа" },
    { name: "career", title: "Карьера" },
  ],
  fields: [
    /* ---- Основное (обязательное для карточки) ---- */
    defineField({
      name: "name",
      title: "Имя",
      type: "string",
      group: "main",
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      description:
        "Латиница для URL /player/[slug]. Генерируется автоматом из имени, но можно поменять руками.",
      type: "slug",
      group: "main",
      options: {
        source: "name",
        maxLength: 96,
        slugify: (input) => slugifyName(input),
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "num",
      title: "Номер",
      description: "Игровой номер. Для тренеров оставь пустым.",
      type: "number",
      group: "main",
      validation: (r) => r.integer().min(1).max(99),
      hidden: ({ parent }) => parent?.pos === "COACH",
    }),
    defineField({
      name: "pos",
      title: "Позиция",
      type: "string",
      group: "main",
      options: { list: [...POSITIONS], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "age",
      title: "Возраст",
      description:
        "Число лет. Если задано birthDate в профиле — на сайте возраст пересчитается автоматом.",
      type: "number",
      group: "main",
      validation: (r) => r.required().integer().min(14).max(85),
    }),
    defineField({
      name: "country",
      title: "Гражданство",
      description: "ISO-3 либо короткий код для бейджа: BLR, RUS, UKR.",
      type: "string",
      group: "main",
      validation: (r) => r.required().max(4),
      initialValue: "BLR",
    }),
    defineField({
      name: "photo",
      title: "Фото",
      type: "image",
      group: "main",
      options: { hotspot: true },
      description: "Портрет 3:4. Если пусто — рендерим SVG-силуэт.",
    }),
    defineField({
      name: "isArchived",
      title: "В архиве",
      description:
        "Игрок ушёл из команды / тренер не работает. Документ остаётся в БД (исторические голы и события продолжают показывать имя), но он исчезает из публичного состава и из админ-форм. Сними галочку, если вернётся.",
      type: "boolean",
      group: "main",
      initialValue: false,
    }),

    /* ---- Профиль (для страницы игрока) ---- */
    defineField({
      name: "birthDate",
      title: "Дата рождения",
      description:
        "Опционально. Если задано — на странице игрока возраст считается автоматом на текущую дату.",
      type: "date",
      group: "profile",
      options: {
        dateFormat: "DD.MM.YYYY",
      },
    }),
    defineField({
      name: "height",
      title: "Рост (см)",
      type: "number",
      group: "profile",
      validation: (r) => r.integer().min(140).max(220),
    }),
    defineField({
      name: "weight",
      title: "Вес (кг)",
      type: "number",
      group: "profile",
      validation: (r) => r.integer().min(40).max(140),
    }),
    defineField({
      name: "preferredFoot",
      title: "Ведущая нога",
      type: "string",
      group: "profile",
      options: { list: [...FEET], layout: "radio" },
    }),
    defineField({
      name: "bio",
      title: "Bio (короткая)",
      description:
        "Устаревшее поле, простой текст. Оставлено для обратной совместимости. Для новых профилей используй «Био (полное)» ниже.",
      type: "text",
      group: "profile",
      rows: 4,
    }),
    defineField({
      name: "bioLong",
      title: "Био (полное)",
      description:
        "Богатый текст для страницы игрока. Поддерживает заголовки, цитаты, фото внутри, ссылки. То же что и в новостях.",
      type: "array",
      group: "profile",
      of: [
        {
          type: "block",
          styles: [
            { title: "Обычный", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Цитата", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Жирный", value: "strong" },
              { title: "Курсив", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Ссылка",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (r) => r.required(),
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          name: "imageBlock",
          title: "Фото внутри био",
          options: { hotspot: true },
          fields: [
            { name: "caption", title: "Подпись", type: "string" },
            { name: "alt", title: "Alt (SEO / a11y)", type: "string" },
          ],
        },
      ],
    }),

    /* ---- Медиа ---- */
    defineField({
      name: "gallery",
      title: "Галерея фото",
      description:
        "Дополнительные фотографии игрока. Показываются на странице /player/[slug] в блоке «Фотогалерея».",
      type: "array",
      group: "media",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "caption", title: "Подпись", type: "string" },
            { name: "alt", title: "Alt (SEO / a11y)", type: "string" },
          ],
        },
      ],
    }),

    /* ---- Карьера ---- */
    defineField({
      name: "previousClubs",
      title: "Предыдущие клубы",
      description:
        "Хронологический список клубов до ФК Полоцк. Показывается как timeline на странице игрока.",
      type: "array",
      group: "career",
      of: [
        {
          type: "object",
          name: "career",
          title: "Клуб",
          fields: [
            defineField({
              name: "clubName",
              title: "Название клуба",
              type: "string",
              validation: (r) => r.required().max(120),
            }),
            defineField({
              name: "from",
              title: "С какого года",
              type: "number",
              validation: (r) => r.integer().min(1900).max(2100),
            }),
            defineField({
              name: "to",
              title: "По какой год",
              description:
                "Оставь пустым, если игрок ещё выступал за этот клуб до перехода в Полоцк без чёткого конца.",
              type: "number",
              validation: (r) => r.integer().min(1900).max(2100),
            }),
            defineField({
              name: "note",
              title: "Комментарий",
              description: "Например «дубль», «академия», «в аренде».",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "clubName", from: "from", to: "to" },
            prepare({ title, from, to }) {
              const range =
                from && to
                  ? `${from}–${to}`
                  : from
                  ? `с ${from}`
                  : to
                  ? `до ${to}`
                  : "";
              return {
                title: title ?? "?",
                subtitle: range,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      num: "num",
      pos: "pos",
      media: "photo",
      archived: "isArchived",
    },
    prepare({ title, num, pos, media, archived }) {
      const prefix = num != null ? `#${num} ` : "";
      const archivedTag = archived ? " · 📦 архив" : "";
      return {
        title: `${prefix}${title ?? "?"}${archivedTag}`,
        subtitle: pos ? POSITIONS.find((p) => p.value === pos)?.title : "",
        media,
      };
    },
  },
  orderings: [
    { title: "Номер", name: "numAsc", by: [{ field: "num", direction: "asc" }] },
    { title: "Имя", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
});
