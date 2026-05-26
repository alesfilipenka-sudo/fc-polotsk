import "server-only";
import { createClient, type SanityClient } from "@sanity/client";

/**
 * Sanity write client. Использовать ТОЛЬКО в server actions / route handlers.
 *
 * Env:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_WRITE_TOKEN — Editor token (sanity.io/manage → API → Tokens)
 *
 * Если токен не задан — клиент null, вызовы должны бросать понятную ошибку.
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN || "";

let cached: SanityClient | null = null;

export function getWriteClient(): SanityClient {
  if (cached) return cached;
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set");
  }
  if (!token) {
    throw new Error(
      "SANITY_WRITE_TOKEN is not set. Add it as Vercel env var (Editor token from sanity.io/manage).",
    );
  }
  cached = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2024-10-01",
    useCdn: false,
    perspective: "raw",
  });
  return cached;
}
