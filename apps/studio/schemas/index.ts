import type { SchemaTypeDefinition } from "sanity";

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
