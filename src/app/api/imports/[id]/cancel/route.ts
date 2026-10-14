import { NextResponse } from "next/server";
import { authContext, ownedJob, UUID } from "@/lib/imports/server";
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Niepoprawny identyfikator." }, { status: 400 });
  const context = await authContext();
  if (!context) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const job = await ownedJob(context.admin, context.user.id, id);
  if (!job) return NextResponse.json({ error: "Nie znaleziono importu." }, { status: 404 });
  if (job.status === "cancelled") return NextResponse.json({ status: "cancelled" });
  if (job.status === "committed") return NextResponse.json({ error: "Zatwierdzony import ma już zapisany plan." }, { status: 409 });
  const { error } = await context.admin.from("imports").update({ status: "cancelled", lease_token: null, lease_until: null, draft: null, review_data: null, source_text: job.source_kind === "text" ? "" : null, updated_at: new Date().toISOString() })
    .eq("id", id).eq("owner_id", context.user.id);
  if (error) return NextResponse.json({ error: "Nie udało się anulować." }, { status: 500 });
  await context.admin.from("import_attempts").update({ status: "cancelled", ended_at: new Date().toISOString() }).eq("import_id", id).eq("owner_id", context.user.id).eq("status", "processing");
  return NextResponse.json({ status: "cancelled" });
}
