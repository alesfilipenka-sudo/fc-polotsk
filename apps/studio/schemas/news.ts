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
      description: "Короткая категория (Матч, Анонс, Интервью, …).",
      type: "string",
      validation: (r) => r.required().max(40),
    }),
    defineField({
      name: "excerpt",
      title: "Краткое описание",
      description: "2–3 строки, виден в карточке на главной.",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(280),
    }),
    defineField({
      name: "coverImage",
      title: "Обложка",
      type: "image",
      options: { hotspot: true },
      description: "16:9 или 4:3. Если пусто — берём градиент-плейсхолдер.",
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
      title: "Текст",
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
        { type: "image", options: { hotspot: true } },
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
