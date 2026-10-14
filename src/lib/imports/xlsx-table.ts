import { readXlsxSource, type SourceSheet, type SourceCell } from "./xlsx";

type RawSet = ReturnType<typeof blank>;
const blank = () => ({ kind: "work", reps_min: null as number | null, reps_max: null as number | null, is_amrap: false, load_type: "unspecified", target_kg: null as number | null, target_kg_max: null as number | null, target_percent: null, duration_seconds: null as number | null, duration_seconds_max: null as number | null, distance_meters: null, rest_seconds: null as number | null, rest_seconds_max: null as number | null, note: null as string | null, source_ref: null as string | null });
const pair = (text: string) => { const match = /^(\d+(?:[.,]\d+)?)(?:\s*[-–/]\s*(\d+(?:[.,]\d+)?))?/.exec(text.trim()); return match ? [Number(match[1].replace(",", ".")), match[2] ? Number(match[2].replace(",", ".")) : null] as const : null; };
function quantities(text: string, ref: string): RawSet[] {
  const set = blank(); set.source_ref = `${ref}: ${text}`.slice(0, 500);
  if (/^X$/i.test(text.trim())) { set.is_amrap = true; return [set]; }
  if (/^\d+(?:-\d+){2,}/.test(text.trim())) return text.trim().match(/^\d+(?:-\d+){2,}/)![0].split("-").map((value) => ({ ...set, reps_min: Number(value) }));
  const values = pair(text);
  if (!values || /ćwiczeni/i.test(text) || values[1] !== null && values[1] < values[0]) return [];
  if (/sek|\bs\b|minut|\bmin\b/i.test(text)) {
    const multiplier = /minut|\bmin\b/i.test(text) ? 60 : 1;
    set.duration_seconds = values[0] * multiplier; set.duration_seconds_max = values[1] === null ? null : values[1] * multiplier;
  } else { set.reps_min = values[0]; set.reps_max = values[1]; }
  if (/na nog|na rę|na stron|łącznie|obie nog/i.test(text)) set.note = text;
  return [set];
}
function rest(set: RawSet, text: string) { const values = pair(text); if (!values) return; const multiplier = /min/i.test(text) ? 60 : 1; set.rest_seconds = values[0] * multiplier; set.rest_seconds_max = values[1] === null ? null : values[1] * multiplier; }
const exerciseTargetText = (text: string) => /^\d/.test(text);
function rawExercise(name: string, ref: string) { return { name, variant: null, equipment: null, superset_group: null, note: null as string | null, source_ref: ref.slice(0, 500), is_optional: false, set_count_min: null as number | null, set_count_max: null as number | null, set_count_source: null as string | null, prescription_group: null as string | null, sets: [] as RawSet[] }; }
type RawExercise = ReturnType<typeof rawExercise>;
type RawSession = { week_number: number; day_label: string; note: string | null; exercises: RawExercise[] };
const cellAt = (sheet: SourceSheet, row: number, col: number) => sheet.rows.find((item) => item.number === row)?.cells.find((cell) => cell.column === col);

/** Rozpoznawane układy mają jawne nagłówki; pozostałe trafiają do adaptera AI. Nie zależy od nazw plików. */
export async function readStructuredXlsx(bytes: Uint8Array) {
  const source = await readXlsxSource(bytes);
  const trainingSheets = source.sheets.filter((sheet) => sheet.rows.length && !/^(uwagi|notes?|instrukcje|wymiary|measurements?)$/i.test(sheet.name.trim()));
  const sessions: RawSession[] = [];
  const unresolved: { path: string; reason: string }[] = [];
  const warn: string[] = [];
  const addIssue = (si: number, ei: number, reason: string) => unresolved.push({ path: `sessions.${si}.exercises.${ei}`, reason: reason.slice(0, 300) });
  for (const sheet of trainingSheets) {
    const header = sheet.rows[0];
    const seriesColumn = header.cells.find((cell) => /seri.*pow/i.test(cell.text));
    const exerciseColumn = header.cells.find((cell) => /^(ćwiczenie|exercise)$/i.test(cell.text));
    if (seriesColumn && exerciseColumn) {
      const session: RawSession = { week_number: 1, day_label: sheet.name, note: null, exercises: [] };
      const si = sessions.length;
      const restColumn = header.cells.find((cell) => /przerwa|rest/i.test(cell.text));
      const loadColumn = header.cells.find((cell) => /sugerowany ciężar|planned.*load/i.test(cell.text));
      for (const row of sheet.rows.slice(1)) {
        const name = row.cells.find((cell) => cell.column === exerciseColumn.column);
        if (!name) continue;
        const ref = `${sheet.name}!${name.address}`;
        if (name.strike) { session.note = `${session.note ?? ""}\nPrzekreślony wiersz pominięty: ${ref}: ${name.text}`.trim(); warn.push(`Przekreślony wiersz ${ref} wymaga sprawdzenia.`); continue; }
        const prescription = row.cells.find((cell) => cell.column === seriesColumn.column);
        const exercise = rawExercise(name.text, `${ref}${prescription ? `; ${sheet.name}!${prescription.address}: ${prescription.text}` : ""}`);
        if (prescription?.kind === "date") addIssue(si, session.exercises.length, `Komórka ${sheet.name}!${prescription.address} wygląda jak data Excela (${prescription.text}). Podaj właściwy zapis serii i celu.`);
        else {
          const match = prescription && /^(\d+)\s*[x×]\s*(.+)$/i.exec(prescription.text);
          if (match) { exercise.set_count_min = Number(match[1]); exercise.set_count_max = Number(match[1]); exercise.set_count_source = `${sheet.name}!${prescription!.address}: ${prescription!.text}`; exercise.sets = quantities(match[2], `${sheet.name}!${prescription!.address}`); }
          else if (prescription) { exercise.sets = quantities(prescription.text, `${sheet.name}!${prescription.address}`); addIssue(si, session.exercises.length, `Niejasny zapis ${sheet.name}!${prescription.address}: ${prescription.text}`); }
        }
        const pause = restColumn && row.cells.find((cell) => cell.column === restColumn.column);
        const load = loadColumn && row.cells.find((cell) => cell.column === loadColumn.column);
        for (const set of exercise.sets) {
          if (pause) rest(set, pause.text);
          if (load) {
            if (/masa ciała|bodyweight/i.test(load.text)) set.load_type = "bodyweight";
            else { const values = pair(load.text.replace(/^hantel\s*/i, "")); if (values) { set.load_type = "absolute"; set.target_kg = values[0]; set.target_kg_max = values[1]; } }
          }
        }
        const ambiguousEquipment = /hantl.*(?:sztang|maszyn)/i.test(name.text);
        if (load && ambiguousEquipment) {
          addIssue(si, session.exercises.length, `Niejasny sprzęt: ${name.text}. Cel ${load.text} (${sheet.name}!${load.address}); wybierz sprzęt i podstawę ciężaru.`);
        } else if (/jednorącz|na jedną rękę/i.test(name.text)) {
          for (const set of exercise.sets) (set as RawSet & { dumbbell_basis?: string }).dumbbell_basis = "per_hand";
        } else if (load && /hantl|dumbbell/i.test(`${name.text} ${load.text}`) && !/łącznie|na hantel|na rękę/i.test(load.text)) {
          exercise.note = `Sugerowane obciążenie: ${load.text}; ${sheet.name}!${load.address}. Nieustalona podstawa ciężaru.`;
          for (const set of exercise.sets) { set.load_type = "unspecified"; set.target_kg = null; set.target_kg_max = null; }
          unresolved.push({ path: `sessions.${si}.exercises.${session.exercises.length}.sets.0`, reason: `Czy ciężar hantli ${load.text} (${sheet.name}!${load.address}) dotyczy jednej ręki czy obu łącznie?` });
        }
        const recorded = row.cells.filter((cell) => cell.column > (loadColumn?.column ?? seriesColumn.column) && cell.column !== restColumn?.column);
        if (recorded.length) exercise.note = `${exercise.note ? `${exercise.note}; ` : ""}Zapisane wyniki/notatki (nie cel): ${recorded.map((cell) => `${sheet.name}!${cell.address}=${cell.text}`).join("; ")}`;
        session.exercises.push(exercise);
      }
      if (session.exercises.length) sessions.push(session);
      continue;
    }
    const weeks = sheet.rows.filter((row) => row.cells.some((cell) => /^Tydzień\s+\d+$/i.test(cell.text)));
    if (!weeks.length || !weeks.every((row) => /FBW|Tabata|Interwał/i.test(sheet.rows.find((item) => item.number === row.number + 1)?.cells.map((cell) => cell.text).join(" ") ?? ""))) return null;
    const notes = source.sheets.filter((sheet) => /^(uwagi|notes?)$/i.test(sheet.name)).flatMap((sheet) => sheet.rows.flatMap((row) => row.cells.map((cell) => `${sheet.name}!${cell.address}: ${cell.text}`))).join("\n").slice(0, 1800);
    for (let wi = 0; wi < weeks.length; wi++) {
      const start = weeks[wi].number;
      const end = (weeks[wi + 1]?.number ?? sheet.rows.at(-1)!.number + 1) - 1;
      const week = Number(/\d+/.exec(weeks[wi].cells[0].text)![0]);
      const headings = sheet.rows.find((row) => row.number === start + 1)!;
      for (const heading of headings.cells) {
        const col = heading.column;
        const session: RawSession = { week_number: week, day_label: heading.text, note: notes || null, exercises: [] };
        const si = sessions.length;
        const blockRows = sheet.rows.filter((row) => row.number > start + 1 && row.number <= end);
        const sharedCell = blockRows.flatMap((row) => row.cells).find((cell) => cell.column === col && /^\d+\s*[-–]\s*\d+\s+seri/i.test(cell.text));
        const sharedCount = sharedCell ? pair(sharedCell.text) : null;
        const scopeGroup = sharedCell ? `${sheet.name}!${sharedCell.address}` : null;
        let sectionGroup: string | null = null;
        let sectionLabel: string | null = null;
        let reviewedScope = false;
        const crossed: SourceCell[] = [];
        for (const row of blockRows) {
          const name = row.cells.find((cell) => cell.column === col);
          const quantity = row.cells.find((cell) => cell.column === col + 1);
          if (!name) continue;
          if (sharedCell?.address === name.address || /^na przemian z:/i.test(name.text)) continue;
          if (/^Buy in EMOM/i.test(name.text)) {
            session.note = `${session.note ?? ""}\nDopisek z nieustalonym dniem ${sheet.name}!${name.address}: ${name.text}; ${quantity?.text ?? ""}`;
            addIssue(si, session.exercises.length, `Dopisek EMOM w ${sheet.name}!${name.address}: nie ustalono przypisania do dnia ani przełożenia rund na serie; sprawdź dopisek w uwadze dnia.`);
            sectionGroup = `${sheet.name}!${name.address}`; sectionLabel = name.text; continue;
          }
          if (/^\d+\s*TABATA/i.test(name.text)) { sectionGroup = `${sheet.name}!${name.address}`; sectionLabel = name.text; continue; }
          if (name.strike) { crossed.push(name); session.note = `${session.note ?? ""}\nPrzekreślone: ${sheet.name}!${name.address}=${name.text} (${quantity?.text ?? ""})`; continue; }
          if (!quantity && /^\d+\s*[-–]\s*\d+\s+minut/i.test(name.text)) { session.note = `${session.note ?? ""}\nCzas bloku: ${sheet.name}!${name.address}: ${name.text}`; continue; }
          if (/Tabata/i.test(sectionLabel ?? "") && quantity && !/ćwiczeni/i.test(quantity.text) && exerciseTargetText(quantity.text)) { sectionGroup = null; sectionLabel = null; }
          const ref = `${sheet.name}!${name.address}`;
          const exercise = rawExercise(name.text, `${ref}${quantity ? `; ${sheet.name}!${quantity.address}: ${quantity.text}` : ""}`);
          exercise.sets = quantity ? quantities(quantity.text, `${sheet.name}!${quantity.address}`) : [];
          if (/^Rozgrzewka/i.test(name.text)) { exercise.set_count_min = exercise.set_count_max = 1; exercise.sets.forEach((set) => set.kind = "warmup"); }
          else if (/OPCJONALNIE/i.test(name.text)) {
            exercise.is_optional = true;
            exercise.note = `Fragment opcjonalny, jedna runda: ${quantity?.text ?? ""}. Zachowano marsz i bieg w uwadze.`;
            const rounds = /(\d+)\s*[-–]\s*(\d+)\s+seri/i.exec(quantity?.text ?? "");
            const walkRun = /(\d+)\s*min.*?(\d+)\s*sek/i.exec(quantity?.text ?? "");
            if (rounds && walkRun) {
              exercise.set_count_min = Number(rounds[1]); exercise.set_count_max = Number(rounds[2]);
              exercise.set_count_source = `${sheet.name}!${quantity!.address}: ${quantity!.text}`;
              exercise.sets = [{ ...blank(), duration_seconds: Number(walkRun[1]) * 60 + Number(walkRun[2]), note: exercise.note, source_ref: `${sheet.name}!${quantity!.address}: ${quantity!.text}` }];
            } else { exercise.prescription_group = `${ref}:optional`; addIssue(si, session.exercises.length, `Opcjonalny interwał ${ref}: ${quantity?.text ?? ""}. Sprawdź liczbę rund i cele części.`); }
          }
          else if (sectionGroup && /Tabata/i.test(sectionLabel ?? "")) { exercise.prescription_group = sectionGroup; exercise.set_count_source = `${sectionGroup}: ${sectionLabel}`; exercise.note = `Blok ${sectionLabel}; ${sectionGroup}. Numer ćwiczenia nie jest liczbą powtórzeń. Nie ustalono czasu pracy/przerwy poszczególnych ćwiczeń.`; }
          else if (sectionGroup && /EMOM/i.test(sectionLabel ?? "")) { exercise.prescription_group = sectionGroup; exercise.note = `Dopisek EMOM; nieustalone przypisanie do dnia: ${sectionLabel}`; }
          else if (sharedCount && sharedCell) {
            exercise.set_count_source = `${scopeGroup}: ${sharedCell.text}`;
            exercise.prescription_group = scopeGroup;
            if (exercise.sets.length > 1) { exercise.set_count_min = exercise.set_count_max = exercise.sets.length; }
            else { exercise.set_count_min = sharedCount[0]; exercise.set_count_max = sharedCount[1] ?? sharedCount[0]; }
            if (!reviewedScope) { addIssue(si, session.exercises.length, `Wspólna wskazówka ${scopeGroup}: ${sharedCell.text}. Zaproponowano zakres dla bloku; potwierdź jego zastosowanie, zwłaszcza względem czterech serii progresji.`); reviewedScope = true; }
          } else if (exercise.sets.length > 1) exercise.set_count_min = exercise.set_count_max = exercise.sets.length;
          else if (/Interwał/i.test(heading.text)) { exercise.prescription_group = `${sheet.name}!${heading.address}:interval`; exercise.note = `Interwały w bloku; zapis źródłowy ${quantity?.text ?? ""}. Nie ustalono liczby rund.`; }
          else if (sectionGroup) { exercise.prescription_group = sectionGroup; exercise.note = `Dopisek: ${sectionLabel}`; }
          if (exercise.set_count_min !== null && exercise.sets.length === 0) exercise.sets = [blank()];
          session.exercises.push(exercise);
        }
        if (crossed.length) warn.push(`Przekreślone wiersze ${crossed.map((cell) => `${sheet.name}!${cell.address}`).join(", ")} zachowano w uwadze dnia i pominięto w ćwiczeniach.`);
        if (session.exercises.length) sessions.push(session);
      }
    }
  }
  if (!sessions.length) return null;
  return { schema_version: 2, reader: "xlsx-table-v1", name: "Zaimportowany plan", sessions, warnings: warn, unresolved_fields: unresolved };
}
