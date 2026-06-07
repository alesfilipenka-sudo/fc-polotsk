import type { StructureResolver } from "sanity/structure";
import {
  CogIcon,
  ChartUpwardIcon,
  CalendarIcon,
  UsersIcon,
  DocumentsIcon,
  TagIcon,
  EarthGlobeIcon,
  ClockIcon,
} from "@sanity/icons";

/**
 * Custom desk structure.
 *
 * - `siteSettings` and `standingsTable` are singletons — surfaced at the top
 *   level so editors don't need to think about creating duplicates.
 * - Lists are grouped under categories (Squad, Matches, Content, History) for clarity.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("FC Polotsk")
    .items([
      // Singletons
      S.listItem()
        .title("Site Settings")
        .icon(CogIcon)
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.listItem()
        .title("Standings Table")
        .icon(ChartUpwardIcon)
        .child(
          S.document()
            .schemaType("standingsTable")
            .documentId("standingsTable"),
        ),

      S.divider(),

      // Squad
      S.listItem()
        .title("Squad")
        .icon(UsersIcon)
        .child(
          S.list()
            .title("Squad")
            .items([
              S.documentTypeListItem("player").title("Players"),
              S.documentTypeListItem("team").title("Teams"),
            ]),
        ),

      // Matches
      S.documentTypeListItem("match").title("Matches").icon(CalendarIcon),

      // Content
      S.listItem()
        .title("Content")
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title("Content")
            .items([
              S.documentTypeListItem("news").title("News").icon(TagIcon),
              S.documentTypeListItem("socialChannel")
                .title("Social Channels")
                .icon(EarthGlobeIcon),
            ]),
        ),

      // History (новый раздел)
      S.documentTypeListItem("historyEra")
        .title("История клуба")
        .icon(ClockIcon),
    ]);
