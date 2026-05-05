import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

if (!projectId) {
  // Dev-only friendly hint. In prod the build will still complete; the studio
  // simply won't authenticate without a project id.
  // eslint-disable-next-line no-console
  console.warn(
    "[FC Polotsk Studio] SANITY_STUDIO_PROJECT_ID is not set. Add it to .env.local — studio cannot connect without it."
  );
}

export default defineConfig({
  name: "fc-polotsk",
  title: "FC Polotsk Studio",

  projectId,
  dataset,

  plugins: [
    structureTool({ structure }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
