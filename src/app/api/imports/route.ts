import { NextResponse } from "next/server";
import { authContext, BUCKET, ownedJob } from "@/lib/imports/server";
import { IMPORT_LIMITS, XLSX_MIME, validateSource, type SourceKind } from "@/lib/imports/domain";
import { readJsonObject } from "@/lib/imports/http";

export async function POST(request: Request) {
  const context = await authContext();
  if (!context) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await readJsonObject(request, 64_000); } catch { return NextResponse.json({ error: "Niepoprawne żądanie." }, { status: 400 }); }
  const kind = body.kind as SourceKind;
  const mime = body.mime;
  const text = body.text;
  const size = body.size;
  if (!["pdf", "xlsx", "image", "text"].includes(kind) || typeof mime !== "string" || !Number.isInteger(size) || (size as number) < 1 ||
    (kind === "pdf" && (mime !== "application/pdf" || (size as number) > IMPORT_LIMITS.pdfBytes)) ||
    (kind === "xlsx" && (mime !== XLSX_MIME || (size as number) > IMPORT_LIMITS.xlsxBytes)) ||
    (kind === "image" && (!["image/png", "image/jpeg"].includes(mime) || (size as number) > IMPORT_LIMITS.imageBytes)) ||
    (kind === "text" && (mime !== "text/plain" || typeof text !== "string" || (size as number) > IMPORT_LIMITS.textBytes)) ||
    (kind !== "text" && text !== undefined)) return NextResponse.json({ error: "Niepoprawny typ lub rozmiar źródła." }, { status: 400 });
  if (kind === "text") {
    try { const bytes = new TextEncoder().encode(text as string); await validateSource(kind, mime, bytes); if (bytes.length !== size) throw new Error(); }
    catch { return NextResponse.json({ error: "Niepoprawny tekst." }, { status: 400 }); }
  }
  const id = crypto.randomUUID();
  const { data, error } = await context.admin.rpc("create_import_job", { p_owner: context.user.id, p_id: id, p_kind: kind, p_mime: mime, p_size: size, p_text: kind === "text" ? text : null });
  if (error) return NextResponse.json({ error: "Limit importów lub niepoprawne dane." }, { status: 429 });
  const job = data as { source_path: string | null };
  if (kind === "text") return NextResponse.json({ job: await ownedJob(context.admin, context.user.id, id) }, { status: 201 });
  const signed = await context.admin.storage.from(BUCKET).createSignedUploadUrl(job.source_path!);
  if (signed.error) {
    await context.admin.from("imports").update({ status: "cancelled" }).eq("id", id).eq("owner_id", context.user.id);
    return NextResponse.json({ error: "Nie udało się przygotować uploadu." }, { status: 500 });
  }
  return NextResponse.json({ id, path: job.source_path, token: signed.data.token, uploadUrl: signed.data.signedUrl }, { status: 201 });
}

export async function GET() {
  const context = await authContext();
  if (!context) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const { data, error } = await context.userClient.from("imports").select("id,source_kind,status,attempt_number,validation_issues,error_code,created_at,expires_at").order("created_at", { ascending: false }).limit(20);
  if (error) return NextResponse.json({ error: "Nie udało się odczytać importów." }, { status: 500 });
  return NextResponse.json({ jobs: data });
}
