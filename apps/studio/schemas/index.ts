import type { SchemaTypeDefinition } from "sanity";

import { season } from "./season";
import { competition } from "./competition";
import { team } from "./team";
import { player } from "./player";
import { match, lineupEntry } from "./match";
import { news } from "./news";
import { standingsTable } from "./standingsTable";
import { socialChannel } from "./socialChannel";
import { siteSettings } from "./siteSettings";
import { historyEra } from "./historyEra";

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  season,
  competition,
  team,
  player,
  match,
  news,
  standingsTable,
  socialChannel,
  siteSettings,
  historyEra,
  // objects
  lineupEntry,
];
