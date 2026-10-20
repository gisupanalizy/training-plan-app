export type PdfPartRange = { partIndex: number; pageFrom: number; pageTo: number };

/** Części po dwie strony, z oryginalnymi numerami. Ostatnia część może być krótsza. */
export function pdfPartRanges(pageCount: number, size = 2): PdfPartRange[] {
  if (!Number.isInteger(pageCount) || pageCount < 1 || !Number.isInteger(size) || size < 1) throw new Error("Niepoprawny podział PDF.");
  const parts: PdfPartRange[] = [];
  for (let pageFrom = 1; pageFrom <= pageCount; pageFrom += size) {
    parts.push({ partIndex: parts.length, pageFrom, pageTo: Math.min(pageFrom + size - 1, pageCount) });
  }
  return parts;
}

export function mergeDraftParts(drafts: unknown[]) {
  const sessions: Record<string, unknown>[] = [];
  const positions = new Map<string, number>();
  const warnings: string[] = [];
  const unresolved: { path: string; reason: string }[] = [];
  let name = "Zaimportowany plan";
  const seen = new Set<string>();
  for (const value of drafts) {
    const draft = value as Record<string, unknown>;
    if (!draft || !Array.isArray(draft.sessions) || !Array.isArray(draft.warnings) || !Array.isArray(draft.unresolved_fields)) throw new Error("Niepoprawny szkic części.");
    if (typeof draft.name === "string" && name === "Zaimportowany plan") name = draft.name;
    const sourcePositions = new Map<number, { session: number; exerciseOffset: number }>();
    for (const [sourceIndex, sessionValue] of draft.sessions.entries()) {
      const session = sessionValue as Record<string, unknown>;
      const key = `${session.week_number}:${session.day_label}`;
      const signature = JSON.stringify(session.exercises ?? []);
      const duplicateKey = `${key}:${signature}`;
      if (seen.has(duplicateKey)) continue;
      seen.add(duplicateKey);
      const index = positions.get(key);
      if (index === undefined) {
        sourcePositions.set(sourceIndex, { session: sessions.length, exerciseOffset: 0 });
        positions.set(key, sessions.length);
        sessions.push(structuredClone(session));
      } else {
        const existing = sessions[index];
        sourcePositions.set(sourceIndex, { session: index, exerciseOffset: (existing.exercises as unknown[]).length });
        existing.exercises = [...(existing.exercises as unknown[]), ...(session.exercises as unknown[])];
        if (!existing.note && session.note) existing.note = session.note;
      }
    }
    warnings.push(...draft.warnings as string[]);
    for (const field of draft.unresolved_fields as { path?: string; reason?: string }[]) {
      if (typeof field.reason !== "string") continue;
      const match = typeof field.path === "string" ? /^sessions\.(\d+)(?:\.exercises\.(\d+)(.*))?$/.exec(field.path) : null;
      const position = match ? sourcePositions.get(Number(match[1])) : undefined;
      const path = position ? match?.[2] === undefined ? `sessions.${position.session}` : `sessions.${position.session}.exercises.${position.exerciseOffset + Number(match[2])}${match[3] ?? ""}` : "sessions";
      unresolved.push({ path, reason: field.reason });
    }
  }
  if (!sessions.length) throw new Error("no_training_sessions");
  return { schema_version: 2, name, sessions, warnings, unresolved_fields: unresolved };
}
