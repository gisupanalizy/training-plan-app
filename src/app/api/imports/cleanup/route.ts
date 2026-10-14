import { NextResponse } from "next/server";
import { adminClient } from "@/lib/imports/server";
import { authorizedCleanup, cleanupImports } from "@/lib/imports/cleanup";
export async function GET(request: Request) {
  if (!authorizedCleanup(request.headers.get("authorization"), process.env.CRON_SECRET))
    return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });
  const result = await cleanupImports(adminClient());
  return NextResponse.json(result, { status: result.failed ? 500 : 200 });
}
export const POST = GET;
