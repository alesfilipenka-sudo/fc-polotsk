import { defineType, defineField } from "sanity";
import { CalendarIcon } from "@sanity/icons";

/**
 * Сезон — календарный год.
 *
 * В Беларуси лига играется весна–осень, поэтому сезон совпадает с годом.
 * Кубок, который тянется через зиму, всё равно привязывается к году, в котором
 * сыгран матч: так у матча всегда ровно один сезон и не возникает развилки
 * «какой сезон сейчас текущий». Подпись вида «2026/27» для кубка собирается
 * из флага «розыгрыш через зиму» у турнира.
 *
 * Форма намеренно короткая: год и галочка. Название и адрес выводятся из года,
 * отдельные поля для них только путали бы редактора.
 */
export const season = defineType({
  name: "season",
  title: "Сезон",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "year",
      title: "Год",
      description:
        "Один документ на год. Матчи и таблицы этого года ссылаются сюда.",
      type: "number",
      initialValue: () => new Date().getFullYear(),
      validation: (r) => r.required().integer().min(1990).max(2100),
    }),
    defineField({
      name: "isCurrent",
      title: "Текущий сезон",
      description:
        "Показывается на сайте по умолчанию. Может стоять только у одного сезона: заводя новый, сними галочку у прошлого.",
      type: "boolean",
      initialValue: false,
      validation: (r) =>
        r.custom(async (isCurrent, context) => {
          if (!isCurrent) return true;
          const id = (context.document?._id ?? "").replace(/^drafts\./, "");
          if (!id) return true;
          const client = context.getClient({ apiVersion: "2024-10-01" });
          const others = await client.fetch<number>(
            `count(*[_type == "season" && isCurrent == true && !(_id in [$id, $draft])])`,
            { id, draft: `drafts.${id}` },
          );
          return others === 0
            ? true
            : "Текущий сезон уже отмечен у другого года — сначала сними галочку там.";
        }),
    }),
    defineField({
      name: "startsAt",
      title: "Первый матч",
      description: "Необязательно. Для подписи «сезон идёт с…».",
      type: "date",
    }),
    defineField({
      name: "endsAt",
      title: "Последний матч",
      description: "Необязательно. Заполняется, когда сезон доигран.",
      type: "date",
    }),
  ],
  orderings: [
    {
      title: "Сначала новые",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
  ],
  preview: {
    select: { year: "year", isCurrent: "isCurrent" },
    prepare: ({ year, isCurrent }) => ({
      title: `Сезон ${year ?? "—"}`,
      subtitle: isCurrent ? "текущий" : "завершён",
    }),
  },
});
