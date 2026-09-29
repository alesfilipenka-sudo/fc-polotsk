import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: {
    /**
     * Pinned strictly to the version declared in package.json.
     * Auto-updates caused a v3.99 → v4.22 runtime drift that broke
     * @sanity/vision exports — keep it manual.
     */
    autoUpdates: false,
    /** Чтобы `sanity deploy` не спрашивал application id каждый раз. */
    appId: "xpxfg7k1i3rm8b9b27o8owu9",
  },
});
