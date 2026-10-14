export async function readJsonObject(request: Request, maxBytes: number): Promise<Record<string, unknown>> {
  const length = request.headers.get("content-length");
  if (length && Number(length) > maxBytes) throw new Error("Za duże żądanie.");
  if (!request.body) throw new Error("Puste żądanie.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new Error("Za duże żądanie.");
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const parsed: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Niepoprawne żądanie.");
  return parsed as Record<string, unknown>;
}
