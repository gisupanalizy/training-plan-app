import { matchExerciseName } from "../exercises/names";
import type { ImportIssue } from "./domain";
import { resizeSets, withReviewIds, type PlanEditorDocument, type PlanEditorExercise } from "../domain/plan-editor";
import type { PlannedSetInput } from "../domain/model";

export type QuestionTarget = { sessionId: string; exerciseId?: string; setId?: string };
export type ImportQuestion = {
  id: string; path: string; prompt: string; answerType: "number" | "choice" | "quantity";
  required: true; unit: string | null; min: number | null; max: number | null;
  options: { value: string; label: string }[];
  scope?: "source";
  sourceLoad?: { minimum: number; maximum: number | null };
  context?: string; sourceRef?: string | null; reason?: string; targets?: QuestionTarget[];
};
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const goalOptions = [{ value: "reps", label: "Powtórzenia" }, { value: "duration_seconds", label: "Sekundy" }, { value: "distance_meters", label: "Metry" }, { value: "amrap", label: "Maksymalna liczba powtórzeń" }];
const parts = (path: string) => /^sessions\.(\d+)(?:\.exercises\.(\d+)(?:\.sets\.(\d+))?)?/.exec(path);

export function importQuestions(draft: unknown, issues: ImportIssue[]): ImportQuestion[] {
  if (!record(draft) || !Array.isArray(draft.sessions)) return [];
  const questions: ImportQuestion[] = [];
  const groups = new Map<string, ImportQuestion>();
  for (const issue of issues) {
    if (issue.code === "missing_source" || issue.code === "missing_plan_name") continue;
    const match = parts(issue.path);
    const si = Number(match?.[1] ?? 0), ei = Number(match?.[2] ?? 0), ti = match?.[3] === undefined ? undefined : Number(match[3]);
    const session = draft.sessions[si];
    const exercise = record(session) && Array.isArray(session.exercises) ? session.exercises[ei] : null;
    const set = record(exercise) && Array.isArray(exercise.sets) && ti !== undefined ? (exercise.sets[ti] ?? (exercise.sets.length === 1 ? exercise.sets[0] : null)) : null;
    const name = record(exercise) && typeof exercise.name === "string" ? matchExerciseName(exercise.name)?.pl ?? exercise.name : "Ćwiczenie";
    const source = record(set) && typeof set.source_ref === "string" ? set.source_ref : record(exercise) && typeof exercise.source_ref === "string" ? exercise.source_ref : null;
    const shared = record(exercise) && typeof exercise.prescription_group === "string" ? exercise.prescription_group : null;
    const target: QuestionTarget = { sessionId: `session:${si}`, ...(match?.[2] === undefined ? {} : { exerciseId: `exercise:${si}:${ei}` }), ...(ti === undefined ? {} : { setId: `set:${si}:${ei}:${ti}` }) };
    const context = `${record(session) && typeof session.day_label === "string" ? session.day_label : `Trening ${si + 1}`} → ${name}`;
    let q: ImportQuestion = { id: `${issue.code}:${issue.path}`, path: issue.path, prompt: issue.message, reason: issue.message, context, sourceRef: source, targets: [target], answerType: "choice", required: true, unit: null, min: null, max: null, options: [{ value: "reviewed", label: "Sprawdziłem źródło i poprawiłem szkic" }] };
    if (!match) { q.scope = "source"; q.context = "Uwagi do całego źródła"; q.sourceRef = issue.message; q.targets = draft.sessions.map((_, index) => ({ sessionId: `session:${index}` })); }
    if (issue.code === "missing_sets") {
      if (!record(exercise)) continue;
      q = { ...q, prompt: `Ile serii ma ${shared ? "ten blok ćwiczeń" : `ćwiczenie „${name}”`}? Możesz podać zakres.`,
        answerType: draft.schema_version === 2 ? "quantity" : "number", unit: "serii", min: 1, max: 30,
        options: draft.schema_version === 2 ? [{ value: "sets", label: "Serie" }] : [] };
      const related = issues.filter((entry) => entry.code === "unresolved" && entry.path.startsWith(`sessions.${si}.exercises.${ei}`));
      if (related.length) q.reason = related.map((entry) => entry.message).join(" · ");
      else if (typeof exercise.note === "string") q.reason = exercise.note;
      if (typeof exercise.set_count_source === "string") q.sourceRef = exercise.set_count_source;
      if (/Tabata/i.test(q.reason ?? "")) q.prompt = "Jak podzielić wskazany blok Tabata na serie? Czas bloku jest podany, ale czas pracy i przerw poszczególnych ćwiczeń wymaga wyjaśnienia.";
      if (/data|datę|date|EXCELA/i.test(q.reason ?? "")) q.prompt = `Komórka liczby serii wygląda jak data Excela. Jaki zapis serii miał tu być?`;
    } else if (issue.code === "missing_day_label") q = { ...q, prompt: "Który numer ma ten dzień treningowy?", answerType: "number", unit: "dzień", min: 1, max: 7, options: [] };
    else if (issue.code === "missing_reps") q = { ...q, prompt: `Jaki cel mają wskazane serie ćwiczenia „${name}”?`, answerType: "quantity", min: 1, max: 10000, options: goalOptions };
    else if (issue.code === "ambiguous_percent") {
      if (!record(set) || typeof set.target_percent !== "number") continue;
      q = { ...q, prompt: `Czego dotyczy ${set.target_percent}% w tej serii?`, options: [{ value: "percent_1rm", label: "% rzeczywistego 1RM" }, { value: "other", label: "Inny parametr; zachowaj w uwadze" }] };
    } else if (issue.code === "missing_load") q = { ...q, prompt: record(set) && set.load_type === "percent_1rm" ? "Jaki procent rzeczywistego 1RM podano?" : "Jakie obciążenie w kg podano?", answerType: "quantity", unit: record(set) && set.load_type === "percent_1rm" ? "% 1RM" : "kg", min: 0, max: 10000, options: [{ value: record(set) && set.load_type === "percent_1rm" ? "percent_1rm" : "kg", label: record(set) && set.load_type === "percent_1rm" ? "% 1RM" : "kg" }] };
    else if (issue.code === "unresolved" && /hantl|ręk|łączn/i.test(issue.message) && ti !== undefined) q = { ...q, id: `dumbbell_basis:${issue.path}`, prompt: "Czy ciężar hantli dotyczy jednej ręki czy obu łącznie?", options: [{ value: "per_hand", label: "Na jedną rękę" }, { value: "total", label: "Łącznie" }] };
    else if (issue.code === "unresolved" && /Niejasny sprzęt:/i.test(issue.message)) {
      q.id = `equipment_basis:${issue.path}`;
      q.prompt = "Jaki sprzęt i sposób liczenia ciężaru wybrać dla tego ćwiczenia?";
      q.options = [
        ...(/sztang/i.test(issue.message) ? [{ value: "barbell_total", label: "Sztanga — ciężar łącznie" }] : []),
        ...(/maszyn/i.test(issue.message) ? [{ value: "machine_total", label: "Maszyna — ciężar wskazany w kg" }] : []),
        { value: "dumbbell_per_hand", label: "Hantle — ciężar na jedną rękę" }, { value: "dumbbell_total", label: "Hantle — ciężar obu łącznie" },
      ];
    }
    else if (issue.code === "unresolved") {
      // Braki ilościowe mają już konkretne pytanie; nie dokładaj potwierdzenia tej samej rzeczy.
      if (issues.some((other) => other.code !== "unresolved" && other.code !== "missing_source" && other.path === issue.path)) continue;
      if (issues.some((other) => other.code === "missing_sets" && other.path === `sessions.${si}.exercises.${ei}.sets`) && !/przypisania|wspólna wskazówka|sprzęt|super/i.test(issue.message)) continue;
      q.prompt = /super|\bss\d|grup/i.test(issue.message) ? "Jak oznaczono grupy superserii? Popraw grupy w szkicu i potwierdź." : "Sprawdź niejednoznaczny fragment źródła i popraw wskazany blok.";
    }
    if (q.id.startsWith("dumbbell_basis:")) {
      q.sourceRef = issue.message;
      const values = /(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*kg/i.exec(issue.message);
      if (values) q.sourceLoad = { minimum: Number(values[1].replace(",", ".")), maximum: values[2] ? Number(values[2].replace(",", ".")) : null };
      if (record(exercise) && Array.isArray(exercise.sets) && exercise.sets.length === 1 && typeof exercise.set_count_max === "number") q.targets = Array.from({ length: exercise.set_count_max }, (_, index) => ({ sessionId: `session:${si}`, exerciseId: `exercise:${si}:${ei}`, setId: `set:${si}:${ei}:${index}` }));
    }
    const groupKey = `${si}:${issue.code}:${shared && (issue.code === "missing_sets" || issue.code === "unresolved") ? shared : `${ei}:${issue.code === "missing_reps" ? source ?? "goal" : ti ?? "exercise"}:${q.prompt}`}`;
    const previous = groups.get(groupKey);
    if (previous) {
      if (!previous.targets!.some((item) => JSON.stringify(item) === JSON.stringify(target))) previous.targets!.push(target);
      continue;
    }
    if (shared && record(session) && Array.isArray(session.exercises) && (issue.code === "missing_sets" || issue.code === "unresolved")) {
      q.targets = session.exercises.flatMap((item, index) => record(item) && item.prescription_group === shared ? [{ sessionId: `session:${si}`, exerciseId: `exercise:${si}:${index}` }] : []);
      q.context = `${record(session) ? session.day_label : "Trening"} → wspólny blok ćwiczeń`;
      q.sourceRef = record(exercise) && typeof exercise.set_count_source === "string" ? exercise.set_count_source : source;
    }
    groups.set(groupKey, q); questions.push(q);
  }
  return questions;
}

export function questionTargets(question: ImportQuestion, document: PlanEditorDocument): { session: PlanEditorDocument["sessions"][number]; exercise?: PlanEditorExercise; set?: PlannedSetInput }[] {
  if (question.targets?.length && document.sessions.some((session) => session.reviewId)) return question.targets.flatMap((target) => {
    const session = target.exerciseId ? document.sessions.find((item) => item.exercises.some((exercise) => exercise.reviewId === target.exerciseId)) : document.sessions.find((item) => item.reviewId === target.sessionId);
    if (!session) return [];
    const exercise = target.exerciseId ? session.exercises.find((item) => item.reviewId === target.exerciseId) : undefined;
    if (target.exerciseId && !exercise) return [];
    const set = target.setId ? exercise?.sets.find((item) => item.reviewId === target.setId) : undefined;
    if (target.setId && !set) return [];
    return [{ session, exercise, set }];
  });
  const p = question.path.split("."); const session = document.sessions[Number(p[1])];
  if (!session) return [];
  const exercise = session.exercises[Number(p[3])]; return [{ session, exercise, set: exercise?.sets[Number(p[5])] }];
}
const hasGoal = (set?: PlannedSetInput) => !!set && (set.isAmrap || typeof set.repsMin === "number" || typeof set.durationSeconds === "number" || typeof set.distanceMeters === "number");
export function questionResolved(q: ImportQuestion, document: PlanEditorDocument, answers: Record<string, unknown> = {}): boolean {
  const targets = questionTargets(q, document);
  if (!targets.length) return !!q.targets?.length;
  const answer = answers[q.id];
  const quantity = record(answer) ? answer : null;
  if (q.id.startsWith("missing_sets:")) return targets.every(({ exercise }) => !!exercise && (
    exercise.setCountMin != null && exercise.setCountMax != null ||
    (typeof answer === "number" && exercise.sets.length === answer) ||
    (quantity?.unit === "sets" && exercise.sets.length === (quantity.max ?? quantity.value))));
  if (q.id.startsWith("missing_day_label:")) return targets.every(({ session }) => !!session.dayLabel?.trim() && session.dayLabel !== "Dzień do wyjaśnienia");
  if (q.id.startsWith("missing_reps:") || q.id.startsWith("goal:")) return targets.every(({ set }) => hasGoal(set));
  if (q.id.startsWith("missing_load:")) return targets.every(({ set }) => set && ((set.loadType === "absolute" && set.targetKg !== null) || (set.loadType === "percent_1rm" && set.targetPercent !== null)));
  if (q.id.startsWith("equipment_basis:")) return targets.every(({ exercise }) => exercise && (["sztanga", "maszyna"].includes(exercise.equipment ?? "") || exercise.equipment === "hantle" && exercise.sets.every((set) => !!set.dumbbellBasis)));
  if (q.id.startsWith("dumbbell_basis:")) return targets.every(({ set }) => !!set?.dumbbellBasis && (!q.sourceLoad || set.loadType === "absolute" && typeof set.targetKg === "number"));
  if (q.id.startsWith("ambiguous_percent:")) return targets.every(({ set }) => set && (set.loadType === "percent_1rm" && set.targetPercent !== null || answer === "other" && set.loadType === "unspecified" && !!set.note?.includes("%")));
  return answer === "reviewed";
}

export function pendingQuestions(questions: ImportQuestion[], document: PlanEditorDocument, answers: Record<string, unknown> = {}): ImportQuestion[] {
  const result = questions.filter((q) => !questionResolved(q, document, answers));
  if (document.schemaVersion === 2) for (const session of document.sessions) for (const exercise of session.exercises) {
    if (result.some((q) => q.id.startsWith("missing_sets:") && questionTargets(q, document).some((target) => target.exercise?.reviewId === exercise.reviewId))) continue;
    const missing = exercise.sets.filter((set) => !hasGoal(set));
    if (!missing.length || result.some((q) => questionTargets(q, document).some((target) => target.exercise?.reviewId === exercise.reviewId) && q.id.startsWith("missing_reps:"))) continue;
    result.push({ id: `goal:${exercise.reviewId}`, path: "", context: `${session.dayLabel} → ${exercise.name}`, sourceRef: exercise.sourceRef, reason: "Liczba serii jest ustalona, ale wskazane serie nie mają celu.", prompt: `Jaki cel mają wskazane serie ćwiczenia „${exercise.name}”?`, answerType: "quantity", required: true, unit: null, min: 1, max: 10000, options: goalOptions,
      targets: missing.map((set) => ({ sessionId: session.reviewId!, exerciseId: exercise.reviewId!, setId: set.reviewId! })) });
  }
  return result;
}

export function applyQuestionAnswer(document: PlanEditorDocument, q: ImportQuestion, answer: unknown) {
  const quantity = record(answer) ? answer : null;
  for (const { session, exercise, set } of questionTargets(q, document)) {
    if (q.id.startsWith("missing_day_label:") && typeof answer === "number") session.dayLabel = `Dzień ${answer}`;
    if (q.id.startsWith("missing_sets:") && exercise) resizeSets(exercise, Number(quantity?.value ?? answer), Number(quantity?.max ?? quantity?.value ?? answer));
    if (q.id.startsWith("equipment_basis:") && exercise && typeof answer === "string") {
      exercise.equipment = answer === "barbell_total" ? "sztanga" : answer === "machine_total" ? "maszyna" : "hantle";
      exercise.originalName ??= exercise.name;
      if (answer === "barbell_total") exercise.name = exercise.name.replace(/z hantlami\s*\/\s*sztangą/i, "ze sztangą");
      if (answer === "machine_total") exercise.name = exercise.name.replace(/hantli/i, "na maszynie").replace(/\s*\(maszyna\)/i, "");
      if (answer.startsWith("dumbbell")) exercise.name = exercise.name.replace(/z hantlami\s*\/\s*sztangą/i, "z hantlami").replace(/\s*\(maszyna\)/i, "");
      exercise.sets.forEach((item) => { item.dumbbellBasis = answer === "dumbbell_per_hand" ? "per_hand" : answer === "dumbbell_total" ? "total" : null; });
    }
    if (!set) continue;
    if ((q.id.startsWith("missing_reps:") || q.id.startsWith("goal:")) && quantity) {
      set.repsMin = null; set.repsMax = null; set.durationSeconds = null; set.durationSecondsMax = null; set.distanceMeters = null;
      set.isAmrap = quantity.unit === "amrap";
      if (quantity.unit === "reps") { set.repsMin = Number(quantity.value); set.repsMax = quantity.max == null ? null : Number(quantity.max); }
      if (quantity.unit === "duration_seconds") { set.durationSeconds = Number(quantity.value); set.durationSecondsMax = quantity.max == null ? null : Number(quantity.max); }
      if (quantity.unit === "distance_meters") set.distanceMeters = Number(quantity.value);
    }
    if (q.id.startsWith("missing_load:")) {
      set.loadType = q.unit === "% 1RM" ? "percent_1rm" : "absolute";
      set.targetKg = q.unit === "% 1RM" ? null : Number(quantity?.value ?? answer);
      set.targetKgMax = q.unit === "% 1RM" || quantity?.max == null ? null : Number(quantity.max);
      set.targetPercent = q.unit === "% 1RM" ? Number(quantity?.value ?? answer) : null;
    }
    if (q.id.startsWith("dumbbell_basis:") && (answer === "per_hand" || answer === "total")) {
      set.dumbbellBasis = answer;
      if (q.sourceLoad) { set.loadType = "absolute"; set.targetKg = q.sourceLoad.minimum; set.targetKgMax = q.sourceLoad.maximum; set.targetPercent = null; }
    }
    if (q.id.startsWith("ambiguous_percent:") && answer === "other") { set.loadType = "unspecified"; set.targetPercent = null; set.targetKg = null; }
  }
}

export function checkClarificationAnswers(questions: ImportQuestion[], answers: unknown, document: unknown): string | null {
  if (!record(document) || !Array.isArray(document.sessions)) return "Niepoprawny szkic do korekty.";
  const data = withReviewIds({ ...document, schemaVersion: 2 } as unknown as PlanEditorDocument);
  const responses = record(answers) ? answers : {};
  for (const q of questions) {
    const answer = responses[q.id];
    // Ręczna poprawka pól jest równorzędną odpowiedzią. Jeśli odpowiedź została przesłana, sprawdź również zgodność.
    if (answer === undefined && questionResolved(q, data, responses)) continue;
    if (q.answerType === "choice" && !q.options.some((option) => option.value === answer)) return `Wybierz odpowiedź: ${q.prompt}`;
    if (q.answerType === "number" && (typeof answer !== "number" || !Number.isFinite(answer) || answer < q.min! || answer > q.max! || !Number.isInteger(answer))) return `Podaj poprawną liczbę: ${q.prompt}`;
    if (q.answerType === "quantity" && (!record(answer) || !q.options.some((option) => option.value === answer.unit) || answer.unit !== "amrap" &&
      (typeof answer.value !== "number" || !Number.isFinite(answer.value) || answer.value < q.min! || answer.value > q.max! ||
        (answer.unit !== "kg" && answer.unit !== "distance_meters" && !Number.isInteger(answer.value)) ||
        answer.max != null && (typeof answer.max !== "number" || !Number.isFinite(answer.max) || answer.max < answer.value || answer.max > q.max! ||
          (answer.unit !== "kg" && answer.unit !== "distance_meters" && !Number.isInteger(answer.max)))))) return `Podaj poprawny cel lub zakres: ${q.prompt}`;
    if (!questionResolved(q, data, responses)) return `Uzupełnij wskazane pola: ${q.context ?? q.prompt}`;
    const targets = questionTargets(q, data);
    const quantity = record(answer) ? answer : null;
    if (q.id.startsWith("missing_sets:") && answer !== undefined && !targets.every(({ exercise }) => exercise?.sets.length === (quantity?.max ?? quantity?.value ?? answer))) return "Liczba serii różni się od odpowiedzi.";
    if ((q.id.startsWith("missing_reps:") || q.id.startsWith("goal:")) && quantity && !targets.every(({ set }) => {
      if (!set) return false;
      if (quantity.unit === "amrap") return set.isAmrap;
      if (quantity.unit === "reps") return set.repsMin === quantity.value && (quantity.max != null ? set.repsMax === quantity.max : set.repsMax == null || set.repsMax === quantity.value);
      if (quantity.unit === "duration_seconds") return set.durationSeconds === quantity.value && (quantity.max == null || set.durationSecondsMax === quantity.max);
      return set.distanceMeters === quantity.value;
    })) return "Cel serii różni się od odpowiedzi.";
    if (q.id.startsWith("missing_load:") && answer !== undefined && !targets.every(({ set }) => (q.unit === "% 1RM" ? set?.targetPercent : set?.targetKg) === (quantity?.value ?? answer))) return "Obciążenie różni się od odpowiedzi.";
    if (q.id.startsWith("dumbbell_basis:") && answer !== undefined && !targets.every(({ set }) => set?.dumbbellBasis === answer)) return "Podstawa ciężaru różni się od odpowiedzi.";
    if (q.id.startsWith("equipment_basis:") && typeof answer === "string" && !targets.every(({ exercise }) => exercise && exercise.equipment === (answer === "barbell_total" ? "sztanga" : answer === "machine_total" ? "maszyna" : "hantle") && (!answer.startsWith("dumbbell") || exercise.sets.every((set) => set.dumbbellBasis === (answer === "dumbbell_per_hand" ? "per_hand" : "total"))))) return "Wybrany sprzęt nie odpowiada polom szkicu.";
    if (q.id.startsWith("ambiguous_percent:") && answer === "percent_1rm" && !questionTargets(q, data).every(({ set }) => set?.loadType === "percent_1rm" && typeof set.targetPercent === "number")) return "Wyjaśnij procent w szkicu.";
  }
  const pending = pendingQuestions(questions, data, responses);
  return pending.length ? `Uzupełnij: ${pending[0].context ?? pending[0].prompt}` : null;
}

/** Tylko pola, o których pyta dane pytanie; zmiana kolejności nie unieważnia odpowiedzi. */
export function questionState(q: ImportQuestion, document: PlanEditorDocument): unknown {
  if (q.scope === "source" && /przerw/i.test(q.reason ?? "")) return document.sessions.flatMap((session) => session.exercises.flatMap((exercise) => exercise.sets.map((set) => [set.reviewId, set.restSeconds, set.restSecondsMax]))).sort((a,b) => String(a[0]).localeCompare(String(b[0])));
  return questionTargets(q, document).map(({ session, exercise, set }) => {
    if (q.id.startsWith("missing_sets:")) return [exercise?.reviewId, exercise?.setCountMin, exercise?.setCountMax, exercise?.sets.length];
    if (q.id.startsWith("missing_day_label:")) return [session.reviewId, session.dayLabel];
    if (q.id.startsWith("missing_reps:") || q.id.startsWith("goal:")) return [set?.reviewId, set?.repsMin, set?.repsMax, set?.isAmrap, set?.durationSeconds, set?.durationSecondsMax, set?.distanceMeters];
    if (q.id.startsWith("missing_load:")) return [set?.reviewId, set?.loadType, set?.targetKg, set?.targetKgMax, set?.targetPercent];
  if (q.id.startsWith("equipment_basis:")) return [exercise?.reviewId, exercise?.equipment, exercise?.sets.map((set) => set.dumbbellBasis)];
    if (q.id.startsWith("dumbbell_basis:")) return [set?.reviewId, set?.dumbbellBasis, set?.loadType, set?.targetKg, set?.targetKgMax];
    if (q.id.startsWith("ambiguous_percent:")) return [set?.reviewId, set?.loadType, set?.targetPercent, set?.note];
    if (/przypisania/i.test(q.reason ?? "")) return [exercise?.reviewId, session.reviewId, session.dayLabel];
    return q.scope === "source" ? [session.reviewId, session.note, session.exercises.map((item) => [item.reviewId, item.supersetGroup, item.note])] : [exercise?.reviewId, exercise?.supersetGroup, exercise?.setCountMin, exercise?.setCountMax, exercise?.note];
  }).sort((a,b) => String(a[0]).localeCompare(String(b[0])));
}
