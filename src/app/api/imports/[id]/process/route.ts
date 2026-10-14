import { NextResponse } from "next/server";
import { authContext, processImportJob, UUID } from "@/lib/imports/server";
export const maxDuration = 150;
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Niepoprawny identyfikator." }, { status: 400 });
  const context = await authContext();
  if (!context) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const result = await processImportJob(context.admin, context.user.id, id);
  return NextResponse.json(result.result, { status: result.status });
}
