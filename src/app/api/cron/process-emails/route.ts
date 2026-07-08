import { NextResponse } from "next/server";
import { processDueScheduledEmails } from "@/lib/store";

// Vercel cron authenticates by sending Authorization: Bearer <CRON_SECRET>.
// If CRON_SECRET isn't set (local dev), allow any caller so you can hit the
// endpoint from a browser to test.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const result = await processDueScheduledEmails();
  return NextResponse.json({ ok: true, ...result, at: new Date().toISOString() });
}
