import { NextResponse } from "next/server";
import { authContext, ownedJob, sourceBytes, UUID } from "@/lib/imports/server";
import { xlsxChunks, readXlsxSource } from "@/lib/imports/xlsx";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Niepoprawny identyfikator." }, { status: 400 });
  const context = await authContext();
  if (!context) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const job = await ownedJob(context.admin, context.user.id, id);
  if (!job) return NextResponse.json({ error: "Nie znaleziono importu." }, { status: 404 });
  if (job.status === "cancelled" || new Date(job.expires_at).getTime() <= Date.now())
    return NextResponse.json({ error: "Źródło nie jest już dostępne." }, { status: 410 });
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox" };
  try {
    const bytes = await sourceBytes(context.admin, job);
    if (job.source_kind === "xlsx") {
      if (new URL(request.url).searchParams.get("view") === "grid") return NextResponse.json(await readXlsxSource(bytes), { headers });
      const chunks = await xlsxChunks(bytes);
      return new Response(chunks.map((chunk) => chunk.text).join("\n\n"), { headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" } });
    }
    const mime = job.source_kind === "text" ? "text/plain; charset=utf-8" : job.mime_type;
    return new Response(Buffer.from(bytes), { headers: { ...headers, "Content-Type": mime, "Content-Disposition": "inline" } });
  } catch { return NextResponse.json({ error: "Nie udało się odczytać źródła." }, { status: 422 }); }
}
