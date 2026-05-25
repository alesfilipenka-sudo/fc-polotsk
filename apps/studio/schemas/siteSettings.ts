import { defineType, defineField } from "sanity";
import { CogIcon } from "@sanity/icons";

/**
 * Singleton с настройками сайта. Один документ навсегда (id фиксирован
 * через structure.ts на 'siteSettings').
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "hero", title: "Hero" },
    { name: "contacts", title: "Контакты" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    // Hero
    defineField({
      name: "heroBadge",
      title: "Бейдж сезона",
      type: "string",
      group: "hero",
      initialValue: "Сезон 2025/26 · Высшая лига",
    }),
    defineField({
      name: "heroLine1",
      title: "Hero — строка 1",
      type: "string",
      group: "hero",
      initialValue: "НОВАЯ",
      validation: (r) => r.required().max(20),
    }),
    defineField({
      name: "heroLine2",
      title: "Hero — строка 2 (акцент)",
      type: "string",
      group: "hero",
      initialValue: "ЭРА",
      validation: (r) => r.required().max(20),
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero — подзаголовок",
      type: "text",
      rows: 3,
      group: "hero",
      initialValue:
        "ФК Полоцк — клуб с историей и амбициями. Следи за командой, ближайшими матчами и новостями клуба.",
    }),
    defineField({
      name: "city",
      title: "Город",
      type: "string",
      group: "hero",
      initialValue: "Полоцк, Беларусь",
    }),

    // Contacts
    defineField({
      name: "phone",
      title: "Телефон",
      type: "string",
      group: "contacts",
      initialValue: "+375 (00) 000-00-00",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "contacts",
      initialValue: "info@fcpolotsk.by",
    }),
    defineField({
      name: "address",
      title: "Адрес",
      type: "string",
      group: "contacts",
      initialValue: "Полоцк, Беларусь",
    }),

    // Footer
    defineField({
      name: "footerDescription",
      title: "Footer — описание клуба",
      type: "text",
      rows: 3,
      group: "footer",
      initialValue:
        "Профессиональный футбольный клуб из Полоцка. Высшая лига Беларуси.",
    }),
    defineField({
      name: "establishedYear",
      title: "Год основания",
      type: "number",
      group: "footer",
      initialValue: 2019,
      validation: (r) => r.integer().min(1900).max(2100),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
