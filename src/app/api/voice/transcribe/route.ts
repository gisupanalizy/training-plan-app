import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reserveVoice, transcribe } from "@/lib/voice/openai";

export const maxDuration = 60;
const maxBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  if (Number(request.headers.get("content-length")) > maxBytes + 4096) return NextResponse.json({ error: "Nagranie jest za duże." }, { status: 413 });
  let file: File;
  try {
    if (!request.body) throw new Error();
    const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length;
      if (size > maxBytes + 4096) { await reader.cancel(); throw new Error(); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const parsed = await new Request("http://local/voice", { method: "POST",
      headers: { "content-type": request.headers.get("content-type") ?? "" }, body: bytes }).formData();
    const entry = parsed.get("audio"); if (!(entry instanceof File)) throw new Error(); file = entry;
  } catch { return NextResponse.json({ error: "Brak nagrania lub za duże żądanie." }, { status: 400 }); }
  if (file.size < 100 || file.size > maxBytes || !["audio/webm", "audio/mp4", "audio/mpeg", "audio/wav"].includes(file.type))
    return NextResponse.json({ error: "Nieobsługiwany lub za duży plik audio." }, { status: 400 });
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const webm = file.type === "audio/webm" && head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3;
  const mp4 = file.type === "audio/mp4" && String.fromCharCode(...head.slice(4, 8)) === "ftyp";
  const wav = file.type === "audio/wav" && String.fromCharCode(...head.slice(0, 4)) === "RIFF";
  const mp3 = file.type === "audio/mpeg" && (String.fromCharCode(...head.slice(0, 3)) === "ID3" || head[0] === 0xff);
  if (!webm && !mp4 && !wav && !mp3) return NextResponse.json({ error: "Plik audio nie odpowiada deklarowanemu formatowi." }, { status: 400 });
  try {
    await reserveVoice(auth.user.id);
    const text = await transcribe(file, AbortSignal.timeout(45_000));
    return NextResponse.json({ text }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 503 }); }
}
