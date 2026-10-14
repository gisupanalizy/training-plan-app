import { NextResponse } from "next/server";
import { authContext, ownedJob, sourceBytes, UUID } from "@/lib/imports/server";
import { validateSource } from "@/lib/imports/domain";
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Niepoprawny identyfikator." }, { status: 400 });
  const context = await authContext();
  if (!context) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const job = await ownedJob(context.admin, context.user.id, id);
  if (!job) return NextResponse.json({ error: "Nie znaleziono importu." }, { status: 404 });
  if (new Date(job.expires_at).getTime() <= Date.now()) return NextResponse.json({ error: "Import wygasł." }, { status: 409 });
  if (job.status === "uploaded") return NextResponse.json({ status: "uploaded" });
  if (job.status !== "upload_pending") return NextResponse.json({ error: "Niepoprawny stan importu." }, { status: 409 });
  try { const bytes = await sourceBytes(context.admin, job); await validateSource(job.source_kind, job.mime_type, bytes); if (bytes.length !== job.byte_size) throw new Error(); }
  catch { return NextResponse.json({ error: "Plik jest błędny, za duży lub niezgodny z deklaracją." }, { status: 422 }); }
  const { data, error } = await context.admin.from("imports").update({ status: "uploaded", updated_at: new Date().toISOString() })
    .eq("id", id).eq("owner_id", context.user.id).eq("status", "upload_pending").select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Stan importu zmienił się." }, { status: 409 });
  return NextResponse.json({ status: "uploaded" });
}
