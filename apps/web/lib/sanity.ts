import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

/**
 * Sanity read client for the FC Polotsk site.
 *
 * If NEXT_PUBLIC_SANITY_PROJECT_ID is not set we don't create a client.
 * `sanityFetch` will return null in that case and components fall back to
 * placeholder content — this keeps local dev runnable even without `.env.local`.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const sanityClient: SanityClient | null = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2024-10-01",
      useCdn: true,
      perspective: "published",
    })
  : null;

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

/**
 * Build an image URL via Sanity CDN. Returns null when there's no client or
 * source — call site can fall back to a placeholder.
 */
export function urlFor(source: unknown) {
  if (!builder || !source) return null;
  return builder.image(source as Parameters<typeof builder.image>[0]);
}

/**
 * ISR-aware fetch wrapper. Returns null if client is not configured or fetch
 * fails — never throws. Components handle null by showing placeholder data.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  revalidate: number = 60,
): Promise<T | null> {
  if (!sanityClient) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is not set — returning null. Add it to apps/web/.env.local to enable CMS data.",
      );
    }
    return null;
  }
  try {
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[sanity] fetch failed:", err);
    }
    return null;
  }
}
