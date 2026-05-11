import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

/**
 * Sanity webhook receiver.
 *
 * Sanity Studio is configured to POST here on create/update/delete of any
 * document. We verify the HMAC signature using SANITY_REVALIDATE_SECRET, then
 * call revalidatePath('/') so the landing rebuilds with fresh content.
 *
 * Sanity webhook setup: sanity.io/manage → API → Webhooks → Add webhook
 *   - URL: https://<your-vercel-domain>/api/revalidate
 *   - Trigger on: Create / Update / Delete
 *   - Filter: _type in ["news","match","player","team","standingsTable","socialChannel","siteSettings"]
 *   - Secret: same value as SANITY_REVALIDATE_SECRET in Vercel env
 */

const SECRET = process.env.SANITY_REVALIDATE_SECRET || "";

function isValidSignature(body: string, signatureHeader: string | null) {
  if (!signatureHeader || !SECRET) return false;
  // Sanity sends header as: "t=<timestamp>,v1=<hex hmac>"
  const parts = signatureHeader.split(",").reduce<Record<string, string>>(
    (acc, part) => {
      const [k, v] = part.split("=");
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    },
    {},
  );
  const timestamp = parts.t;
  const provided = parts.v1;
  if (!timestamp || !provided) return false;

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  // Constant-time compare
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(provided, "hex"),
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("sanity-webhook-signature");

  if (!isValidSignature(body, signature)) {
    return NextResponse.json(
      { revalidated: false, error: "Invalid signature" },
      { status: 401 },
    );
  }

  try {
    revalidatePath("/");
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      {
        revalidated: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "POST with Sanity webhook signature to revalidate",
  });
}
