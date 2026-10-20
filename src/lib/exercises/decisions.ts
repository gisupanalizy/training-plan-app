import { exerciseNames, normalizeAlias } from "./names";
import { contextConflicts, decisionCandidates, exactCatalogMatch, toSuggestion, type IdentitySuggestion } from "./identity";

export type SuggestItem = { id: string; name: string; variant?: string | null; equipment?: string | null };
export type SuggestResult = { id: string; source: "exact" | "private_alias" | "decision" | null; suggestion: IdentitySuggestion | null; aiError?: boolean };

const ESTIMATED_USD_PER_CALL = 0.001;

export function decisionsConfigured() {
  const budget = Number(process.env.AI_GATEWAY_DECISIONS_BUDGET_USD);
  return process.env.AI_GATEWAY_DECISIONS_ENABLED === "true" && Boolean(process.env.AI_GATEWAY_API_KEY) && Number.isFinite(budget) && budget > 0;
}

export function parseDecisionId(body: unknown, allowed: ReadonlySet<string>): string | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const raw = record.decision ?? record.choice ?? record.output;
  const id = typeof raw === "string" ? raw : raw && typeof raw === "object" && typeof (raw as { id?: unknown }).id === "string" ? (raw as { id: string }).id : null;
  if (!id || id === "none" || !allowed.has(id)) return null;
  return id;
}

export async function suggestExercises(items: SuggestItem[], aliases: { normalized_name: string; variant: string | null; equipment: string | null; canonical_key: string }[], fetchImpl: typeof fetch = fetch): Promise<{ configured: boolean; results: SuggestResult[] }> {
  const configured = decisionsConfigured();
  const results = new Map<string, SuggestResult>();
  const pending: { item: SuggestItem; candidates: ReturnType<typeof decisionCandidates> }[] = [];
  for (const item of items) {
    const exact = exactCatalogMatch(item.name, item.variant, item.equipment);
    if (exact) {
      results.set(item.id, { id: item.id, source: "exact", suggestion: toSuggestion(exact) });
      continue;
    }
    const normalized = normalizeAlias(item.name);
    const alias = aliases.find((row) => row.normalized_name === normalized && !contextConflicts({ variant: row.variant, equipment: row.equipment }, item.variant, item.equipment));
    const entry = alias ? exerciseNames.find((candidate) => candidate.key === alias.canonical_key) : undefined;
    if (entry && !contextConflicts(entry, item.variant, item.equipment)) {
      results.set(item.id, { id: item.id, source: "private_alias", suggestion: toSuggestion(entry) });
      continue;
    }
    const candidates = decisionCandidates(item.name, item.variant, item.equipment);
    if (configured && candidates.length) pending.push({ item, candidates });
    else results.set(item.id, { id: item.id, source: null, suggestion: null });
  }
  const budget = Number(process.env.AI_GATEWAY_DECISIONS_BUDGET_USD);
  const unique = new Map<string, typeof pending>();
  for (const row of pending) {
    const key = `${row.item.name}\u0000${row.item.variant ?? ""}\u0000${row.item.equipment ?? ""}`;
    unique.set(key, [...(unique.get(key) ?? []), row]);
  }
  if (unique.size * ESTIMATED_USD_PER_CALL > budget) {
    for (const row of pending) results.set(row.item.id, { id: row.item.id, source: null, suggestion: null, aiError: true });
    return { configured, results: items.map((item) => results.get(item.id)!) };
  }
  await Promise.all([...unique.values()].map(async (group) => {
    const first = group[0];
    const allowed = new Set(first.candidates.map((candidate) => candidate.key));
    try {
      const response = await fetchImpl("https://ai-gateway.vercel.sh/v1/decisions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-6-luna-decisions",
          input: `Wybierz tylko ten sam ruch, sprzęt, chwyt, asystę i wariant. Przy wątpliwości wybierz none. Nazwa: ${first.item.name}. Wariant: ${first.item.variant ?? "brak"}. Sprzęt: ${first.item.equipment ?? "brak"}.`,
          options: [...first.candidates.map((candidate) => ({ id: candidate.key, label: `${candidate.pl} · ${candidate.en}${candidate.variant ? ` · ${candidate.variant}` : ""}${candidate.equipment ? ` · ${candidate.equipment}` : ""}` })), { id: "none", label: "none" }],
        }),
        signal: AbortSignal.timeout(12_000),
      });
      const body = response.ok ? await response.json() : null;
      const key = response.ok ? parseDecisionId(body, allowed) : null;
      const suggestion = key ? toSuggestion(exerciseNames.find((candidate) => candidate.key === key)!) : null;
      for (const row of group) results.set(row.item.id, { id: row.item.id, source: suggestion ? "decision" : null, suggestion, aiError: !response.ok });
    } catch {
      for (const row of group) results.set(row.item.id, { id: row.item.id, source: null, suggestion: null, aiError: true });
    }
  }));
  return { configured, results: items.map((item) => results.get(item.id)!) };
}
