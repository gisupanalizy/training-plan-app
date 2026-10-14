import { IMPORT_SCHEMA, type SourceKind } from "./domain";
import { xlsxChunks } from "./xlsx";
import { readPdfSource } from "./pdf";
import { readStructuredXlsx } from "./xlsx-table";
import { IMPORT_PROMPT } from "./prompt";
import { PDFDocument } from "pdf-lib";

export const MODEL = "gpt-6-luna";
export const PROMPT_VERSION = "import-pl-v12";
export const MAX_OUTPUT_TOKENS = 16_000;
export type ImportAdapter = (source: { kind: SourceKind; mime: string; bytes: Uint8Array }, signal: AbortSignal) => Promise<{ draft: unknown; inputTokens: number | null; outputTokens: number | null }>;
type Reply = Awaited<ReturnType<ImportAdapter>>;

function stripEmptySessions(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const draft = value as Record<string, unknown>;
  if (!Array.isArray(draft.sessions) || !Array.isArray(draft.warnings) || !Array.isArray(draft.unresolved_fields)) return value;
  const positions = new Map<number, number>();
  const sessions = draft.sessions.filter((session, index) => {
    const keep = !session || typeof session !== "object" || !Array.isArray((session as Record<string, unknown>).exercises) ||
      ((session as Record<string, unknown>).exercises as unknown[]).length > 0;
    if (keep) positions.set(index, positions.size);
    return keep;
  });
  if (sessions.length === draft.sessions.length) return value;
  const unresolved = draft.unresolved_fields.map((field) => {
    if (!field || typeof field !== "object") return field;
    const entry = field as Record<string, unknown>;
    const match = typeof entry.path === "string" ? /^sessions\.(\d+)(.*)$/.exec(entry.path) : null;
    if (!match) return field;
    const newIndex = positions.get(Number(match[1]));
    return { ...entry, path: newIndex === undefined ? "sessions" : `sessions.${newIndex}${match[2]}` };
  });
  return { ...draft, sessions, warnings: [...draft.warnings, `Pominięto ${draft.sessions.length - sessions.length} pustych jednostek bez ćwiczeń.`], unresolved_fields: unresolved };
}

const prompt = IMPORT_PROMPT;

async function requestDraft(content: Record<string, unknown>[], signal: AbortSignal, key: string): Promise<Reply> {
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", signal,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, store: false, max_output_tokens: MAX_OUTPUT_TOKENS,
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }, ...content] }],
      text: { format: { type: "json_schema", name: "training_import", strict: true, schema: IMPORT_SCHEMA } } }) });
  if (!response.ok) throw new Error(response.status === 429 || response.status >= 500 ? "provider_retryable" : "provider_error");
  const json = await response.json() as { status?: string; incomplete_details?: { reason?: string }; output?: { content?: { type: string; text?: string }[] }[]; usage?: { input_tokens?: number; output_tokens?: number } };
  if (json.status !== "completed") throw new Error(json.incomplete_details?.reason === "max_output_tokens" ? "incomplete_response_max_output_tokens" : "incomplete_response");
  const blocks = json.output?.flatMap((item) => item.content ?? []) ?? [];
  if (blocks.some((item) => item.type === "refusal")) throw new Error("provider_refusal");
  const raw = blocks.filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("");
  if (!raw) throw new Error("empty_response");
  return { draft: stripEmptySessions(JSON.parse(raw)), inputTokens: json.usage?.input_tokens ?? null, outputTokens: json.usage?.output_tokens ?? null };
}

function combine(replies: Reply[]): Reply {
  const sessions: Record<string, unknown>[] = [];
  const positions = new Map<string, number>();
  const warnings: string[] = [];
  const unresolved: { path: string; reason: string }[] = [];
  let name = "Zaimportowany plan";
  for (const reply of replies) {
    const draft = reply.draft as Record<string, unknown>;
    if (typeof draft.name === "string" && name === "Zaimportowany plan") name = draft.name;
    if (!Array.isArray(draft.sessions) || !Array.isArray(draft.warnings) || !Array.isArray(draft.unresolved_fields)) throw new Error("Niepoprawny szkic AI.");
    const sourcePositions = new Map<number, { session: number; exerciseOffset: number }>();
    for (const [sourceIndex, value] of draft.sessions.entries()) {
      const session = value as Record<string, unknown>;
      const key = `${session.week_number}:${session.day_label}`;
      const index = positions.get(key);
      if (index === undefined) {
        sourcePositions.set(sourceIndex, { session: sessions.length, exerciseOffset: 0 });
        positions.set(key, sessions.length);
        sessions.push(session);
      }
      else {
        const existing = sessions[index];
        sourcePositions.set(sourceIndex, { session: index, exerciseOffset: (existing.exercises as unknown[]).length });
        existing.exercises = [...(existing.exercises as unknown[]), ...(session.exercises as unknown[])];
        if (!existing.note && session.note) existing.note = session.note;
      }
    }
    warnings.push(...draft.warnings as string[]);
    for (const value of draft.unresolved_fields as { path?: string; reason?: string }[]) {
      if (typeof value.reason !== "string") continue;
      const match = typeof value.path === "string" ? /^sessions\.(\d+)(?:\.exercises\.(\d+)(.*))?$/.exec(value.path) : null;
      const position = match ? sourcePositions.get(Number(match[1])) : undefined;
      const path = position ? match?.[2] === undefined ? `sessions.${position.session}` :
        `sessions.${position.session}.exercises.${position.exerciseOffset + Number(match[2])}${match[3] ?? ""}` : "sessions";
      unresolved.push({ path, reason: value.reason });
    }
  }
  if (!sessions.length) throw new Error("no_training_sessions");
  return { draft: { schema_version: (replies[0].draft as Record<string, unknown>).schema_version ?? 2, name, sessions, warnings, unresolved_fields: unresolved },
    inputTokens: replies.every((reply) => reply.inputTokens !== null) ? replies.reduce((sum, reply) => sum + reply.inputTokens!, 0) : null,
    outputTokens: replies.every((reply) => reply.outputTokens !== null) ? replies.reduce((sum, reply) => sum + reply.outputTokens!, 0) : null };
}

export const openaiImport: ImportAdapter = async (source, signal) => {
  const key = process.env.OPENAI_API_KEY;
  const budget = Number(process.env.OPENAI_IMPORT_BUDGET_USD);
  if (process.env.OPENAI_IMPORT_ENABLED !== "true" || !key || !Number.isFinite(budget) || budget <= 0) throw new Error("ai_not_configured");
  if (source.kind === "xlsx") {
    const table = await readStructuredXlsx(source.bytes);
    if (table) return { draft: table, inputTokens: 0, outputTokens: 0 };
    const chunks = await xlsxChunks(source.bytes);
    const replies: Reply[] = [];
    for (let i = 0; i < chunks.length; i += 4) {
      const batch = await Promise.all(chunks.slice(i, i + 4).map((chunk) => requestDraft([
        { type: "input_text", text: chunk.text },
      ], signal, key)));
      replies.push(...batch);
    }
    return combine(replies);
  }
  if (source.kind === "pdf") {
    const original = await PDFDocument.load(source.bytes, { ignoreEncryption: false, updateMetadata: false });
    let pages: Awaited<ReturnType<typeof readPdfSource>> = [];
    try { pages = await readPdfSource(source.bytes); } catch { /* Skan pozostaje wejściem PDF z obrazami. */ }
    const trainingPages = pages.filter((page) => page.title !== null);
    if (trainingPages.length > 0 && original.getPageCount() > 2) {
      const context = pages.filter((page) => page.title === null).map((page) => page.text).join("\n").slice(0, 8000);
      const replies = await Promise.all(trainingPages.map(async (page) => {
        const split = await PDFDocument.create();
        const [copied] = await split.copyPages(original, [page.number - 1]); split.addPage(copied);
        const reply = await requestDraft([
          { type: "input_text", text: `Oryginalna strona ${page.number} z ${original.getPageCount()}. Odczytaj tylko trening z tej strony. Globalny kontekst innych stron (nie twórz z niego dodatkowych dni):\n${context}\nTabela z położeniem tekstu; x określa kolumnę, y wiersz, obejrzyj także PDF:\n${page.text}` },
          { type: "input_file", filename: "plan.pdf", file_data: `data:application/pdf;base64,${Buffer.from(await split.save()).toString("base64")}`, detail: "high" },
        ], signal, key);
        const draft = reply.draft as Record<string, unknown>;
        if (Array.isArray(draft.sessions) && draft.sessions.length === 1 && page.title) (draft.sessions[0] as Record<string, unknown>).day_label = page.title;
        return reply;
      }));
      return combine(replies);
    }
    if (original.getPageCount() > 2) {
      const parts: { from: number; to: number; data: string }[] = [];
      for (let from = 0; from < original.getPageCount(); from += 2) {
        const split = await PDFDocument.create();
        const to = Math.min(from + 2, original.getPageCount());
        const pages = await split.copyPages(original, Array.from({ length: to - from }, (_, index) => from + index));
        pages.forEach((page) => split.addPage(page));
        parts.push({ from: from + 1, to, data: Buffer.from(await split.save()).toString("base64") });
      }
      const replies = await Promise.all(parts.map((part) => requestDraft([
        { type: "input_text", text: `Część PDF: oryginalne strony ${part.from}-${part.to} z ${original.getPageCount()}. Jeśli na tych stronach nie ma treningu, zwróć sessions=[]. Nie dopisuj ćwiczeń z innych stron.` },
        { type: "input_file", filename: "plan.pdf", file_data: `data:application/pdf;base64,${part.data}`, detail: "high" },
      ], signal, key)));
      return combine(replies);
    }
  }
  const data = Buffer.from(source.bytes).toString("base64");
  const content: Record<string, unknown>[] = source.kind === "text"
    ? [{ type: "input_text", text: new TextDecoder().decode(source.bytes) }]
    : source.kind === "pdf"
      ? [{ type: "input_file", filename: "plan.pdf", file_data: `data:application/pdf;base64,${data}`, detail: "high" }]
      : [{ type: "input_image", image_url: `data:${source.mime};base64,${data}`, detail: "high" }];
  const reply = await requestDraft(content, signal, key);
  if (source.kind === "text") {
    const labels = [...new TextDecoder().decode(source.bytes).matchAll(/(?:^|\n)\s*([A-Z])\s*:/g)].map((match) => match[1]);
    const draft = reply.draft as Record<string, unknown>;
    // Jedno jawne oznaczenie dnia w jednosesyjnym tekście jest informacją źródłową.
    if (labels.length === 1 && Array.isArray(draft.sessions) && draft.sessions.length === 1) (draft.sessions[0] as Record<string, unknown>).day_label = labels[0];
  }
  return reply;
};
