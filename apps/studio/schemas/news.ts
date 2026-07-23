import { defineType, defineField } from "sanity";
import { DocumentTextIcon } from "@sanity/icons";

const PLACEHOLDER_CLASSES = [
  { title: "Градиент 1 (синий → голубой)", value: "ph-news-1" },
  { title: "Градиент 2 (тёмный синий)", value: "ph-news-2" },
  { title: "Градиент 3 (ink → синий)", value: "ph-news-3" },
  { title: "Градиент 4 (синий → navy)", value: "ph-news-4" },
  { title: "Градиент 5 (navy → голубой)", value: "ph-news-5" },
  { title: "Градиент 6 (мягкий синий)", value: "ph-news-6" },
];

const TAGS = [
  "Трансфер",
  "Матч",
  "Клуб",
  "Интервью",
  "Болельщикам",
  "Академия",
  "Анонс",
  "Тренировка",
  "Партнёры",
];

export const news = defineType({
  name: "news",
  title: "News",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Заголовок",
      type: "string",
      validation: (r) => r.required().max(140),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "date",
      title: "Дата публикации",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tag",
      title: "Тег",
      description: "Категория. Выбирай из списка либо пиши свою.",
      type: "string",
      options: { list: TAGS },
      validation: (r) => r.required().max(40),
    }),
    defineField({
      name: "excerpt",
      title: "Краткое описание (карточка)",
      description: "2–3 строки, виден в карточке на главной и в RelatedNews.",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(280),
    }),
    defineField({
      name: "subtitle",
      title: "Лид (на странице статьи)",
      description: "Подзаголовок над основным текстом. Можно оставить пустым — тогда страница начнётся сразу с body.",
      type: "text",
      rows: 2,
      validation: (r) => r.max(400),
    }),
    defineField({
      name: "readTime",
      title: "Время чтения (мин)",
      description: "Опционально. Если не задано — на странице не показываем.",
      type: "number",
      validation: (r) => r.integer().min(1).max(60),
    }),
    defineField({
      name: "coverImage",
      title: "Обложка",
      type: "image",
      options: { hotspot: true },
      description: "16:9 или 4:3. Если пусто — берём градиент-плейсхолдер. На странице статьи hero убран (по дизайну), обложка только в карточках.",
    }),
    defineField({
      name: "placeholderClass",
      title: "Класс плейсхолдера",
      description: "Используется когда нет обложки.",
      type: "string",
      options: { list: PLACEHOLDER_CLASSES },
      initialValue: "ph-news-1",
    }),
    defineField({
      name: "body",
      title: "Текст статьи",
      type: "array",
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
          // Изображение внутри статьи. Поле caption — для подписи под фото.
          type: "image",
          name: "imageBlock",
          title: "Фото внутри текста",
          options: { hotspot: true },
          fields: [
            {
              name: "caption",
              title: "Подпись",
              type: "string",
            },
            {
              name: "alt",
              title: "Alt (для SEO/доступности)",
              type: "string",
            },
          ],
        },
        {
          // YouTube видео. Просто вставь URL — сайт сам развернёт preview + iframe.
          type: "object",
          name: "youtubeBlock",
          title: "YouTube видео",
          fields: [
            defineField({
              name: "url",
              title: "Ссылка YouTube",
              description:
                "Полная ссылка: youtu.be/XXX, youtube.com/watch?v=XXX или youtube.com/shorts/XXX",
              type: "url",
              validation: (r) =>
                r.required().uri({
                  scheme: ["http", "https"],
                }),
            }),
            defineField({
              name: "caption",
              title: "Подпись (необязательно)",
              type: "string",
            }),
          ],
          preview: {
            select: { url: "url", caption: "caption" },
            prepare({ url, caption }) {
              return {
                title: caption ?? "YouTube видео",
                subtitle: url ?? "",
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "tag", media: "coverImage", date: "date" },
    prepare({ title, subtitle, media, date }) {
      const dateLabel = date
        ? new Date(date).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "short",
          })
        : "";
      return { title, subtitle: `${subtitle} · ${dateLabel}`, media };
    },
  },
  orderings: [
    {
      title: "Свежие",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
});
