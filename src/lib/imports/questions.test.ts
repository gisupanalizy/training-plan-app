import { expect, it } from "vitest";
import { checkClarificationAnswers, importQuestions } from "./questions";

it("wymaga liczby serii i jawnej odpowiedzi przed zatwierdzeniem niepełnego szkicu", () => {
  const draft = { sessions: [{ exercises: [{ name: "Przysiad", sets: [] }] }] };
  const questions = importQuestions(draft, [{ path: "sessions.0.exercises.0.sets", code: "missing_sets", message: "Brak serii." }]);
  expect(questions).toMatchObject([{ answerType: "number", unit: "serii", min: 1, max: 30 }]);
  const document = { sessions: [{ dayLabel: "A", exercises: [{ name: "Przysiad", sets: [{ repsMin: 8 }] }] }] };
  expect(checkClarificationAnswers(questions, null, document)).toBeTruthy();
  expect(checkClarificationAnswers(questions, { [questions[0].id]: 2 }, document)).toBeTruthy();
  expect(checkClarificationAnswers(questions, { [questions[0].id]: 1 }, document)).toBeNull();
});

it("pyta o znaczenie procentu w zamkniętym wyborze", () => {
  const draft = { sessions: [{ exercises: [{ name: "Podciąganie", sets: [{ load_type: "unspecified", target_percent: 90 }] }] }] };
  const questions = importQuestions(draft, [{ path: "sessions.0.exercises.0.sets.0", code: "ambiguous_percent", message: "Niejasny procent." }]);
  expect(questions).toMatchObject([{ answerType: "choice", options: [{ value: "percent_1rm" }, { value: "other" }] }]);
  const document = { sessions: [{ dayLabel: "A", exercises: [{ name: "Podciąganie", sets: [{ repsMin: 8, loadType: "unspecified", targetPercent: null, note: "Niejednoznaczne 90% ze źródła" }] }] }] };
  expect(checkClarificationAnswers(questions, { [questions[0].id]: "other" }, document)).toBeNull();
  expect(checkClarificationAnswers(questions, { [questions[0].id]: "percent_1rm" }, document)).toBeTruthy();
});

it("żąda jednostki i liczby dla nieznanego celu serii", () => {
  const question = importQuestions({ sessions: [] }, [{ path: "sessions.0.exercises.0.sets.0", code: "missing_reps", message: "Brak celu." }])[0];
  expect(question).toMatchObject({ answerType: "quantity", min: 1, max: 10000 });
  const document = { sessions: [{ exercises: [{ sets: [{ repsMin: null, repsMax: null, durationSeconds: 30, distanceMeters: null }] }] }] };
  expect(checkClarificationAnswers([question], { [question.id]: { unit: "duration_seconds", value: 30 } }, document)).toBeNull();
  expect(checkClarificationAnswers([question], { [question.id]: { unit: "reps", value: 30 } }, document)).toBeTruthy();
});
