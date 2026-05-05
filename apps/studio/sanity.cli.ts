import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineCliConfig({
  api: { projectId, dataset },
  /**
   * Pinned strictly to the version declared in package.json.
   * Auto-updates caused a v3.99 → v4.22 runtime drift that broke
   * @sanity/vision exports — keep it manual.
   */
  autoUpdates: false,
});
