import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WorkoutVoice } from "./workout-voice";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("poprawka głosowa zachowuje kotwicę serii i pozostałe wyniki przed jawnym zapisem", async () => {
  const workoutId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const setId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const issue = vi.fn();
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ transcript: "Nie osiem, siedem",
    target: { workoutId, revision: 4, setId, exerciseName: "Przysiad", position: 2 },
    proposal: { intent: "set", reps: 7, kg: null, series: null, name: null, variant: null, comment: null, question: null } }) });
  vi.stubGlobal("fetch", fetchMock);
  render(<WorkoutVoice workoutId={workoutId} revision={4} intent="set" setId={setId} targetName="Przysiad" position={2}
    current={{ reps: 8, kg: 100, duration: null, distance: null, rpe: 8.5, rir: 1, note: "Dobrze" }} blocked={false} issue={issue} />);
  fireEvent.click(screen.getByRole("button", { name: "Dyktuj serię 2" }));
  fireEvent.change(screen.getByRole("textbox", { name: /Transkrypcja/ }), { target: { value: "Nie osiem, siedem" } });
  fireEvent.click(screen.getByRole("button", { name: "Przygotuj propozycję" }));
  await screen.findByText(/Cel:/);
  expect(issue).not.toHaveBeenCalled();
  expect((screen.getByRole("spinbutton", { name: "Kilogramy" }) as HTMLInputElement).value).toBe("100");
  fireEvent.click(screen.getByRole("button", { name: "Zatwierdź i zapisz" }));
  await waitFor(() => expect(issue).toHaveBeenCalledWith("save_set", { setId, status: "completed", actualReps: 7,
    actualKg: 100, actualDurationSeconds: null, actualDistanceMeters: null, actualRpe: 8.5, actualRir: 1, actualNote: "Dobrze" }));
});

test("obcy cel w odpowiedzi nie pozwala zatwierdzić", async () => {
  const issue = vi.fn();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ transcript: "Pięć po sto",
    target: { workoutId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", revision: 1, setId: "inny" },
    proposal: { intent: "set", reps: 5, kg: 100 } }) }));
  render(<WorkoutVoice workoutId="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" revision={1} intent="set" setId="właściwy"
    current={{ reps: null, kg: null, duration: null, distance: null, rpe: null, rir: null, note: null }} blocked={false} issue={issue} />);
  fireEvent.click(screen.getByRole("button", { name: /Dyktuj serię/ }));
  fireEvent.change(screen.getByRole("textbox", { name: /Transkrypcja/ }), { target: { value: "Pięć po sto" } });
  fireEvent.click(screen.getByRole("button", { name: "Przygotuj propozycję" }));
  const confirm = await screen.findByRole("button", { name: "Zatwierdź i zapisz" });
  expect((confirm as HTMLButtonElement).disabled).toBe(true);
  expect(issue).not.toHaveBeenCalled();
});

test("komentarz z obcego treningu nie pozwala zatwierdzić", async () => {
  const issue = vi.fn();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ transcript: "Dziś słabszy chwyt",
    target: { workoutId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", revision: 2 },
    proposal: { intent: "comment", reps: null, kg: null, series: null, name: null, variant: null,
      comment: "Dziś słabszy chwyt", question: null } }) }));
  render(<WorkoutVoice workoutId="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" revision={2} intent="comment"
    blocked={false} issue={issue} />);
  fireEvent.click(screen.getByRole("button", { name: "Dyktuj komentarz" }));
  fireEvent.change(screen.getByRole("textbox", { name: /Transkrypcja/ }), { target: { value: "Dziś słabszy chwyt" } });
  fireEvent.click(screen.getByRole("button", { name: "Przygotuj propozycję" }));
  const confirm = await screen.findByRole("button", { name: "Zatwierdź i zapisz" });
  expect((confirm as HTMLButtonElement).disabled).toBe(true);
  expect(issue).not.toHaveBeenCalled();
});

test("dyktowany komentarz dopisuje się do poprzedniego po zatwierdzeniu", async () => {
  const issue = vi.fn();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ transcript: "Dziś słabszy chwyt",
    target: { workoutId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", revision: 2 },
    proposal: { intent: "comment", reps: null, kg: null, series: null, name: null, variant: null,
      comment: "Dziś słabszy chwyt", question: null } }) }));
  render(<WorkoutVoice workoutId="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" revision={2} intent="comment"
    currentComment="Dobry początek" blocked={false} issue={issue} />);
  fireEvent.click(screen.getByRole("button", { name: "Dyktuj komentarz" }));
  fireEvent.change(screen.getByRole("textbox", { name: /Transkrypcja/ }), { target: { value: "Dziś słabszy chwyt" } });
  fireEvent.click(screen.getByRole("button", { name: "Przygotuj propozycję" }));
  const note = await screen.findByRole("textbox", { name: "Komentarz" });
  expect((note as HTMLTextAreaElement).value).toBe("Dobry początek\nDziś słabszy chwyt");
  expect(issue).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Zatwierdź i zapisz" }));
  expect(issue).toHaveBeenCalledWith("comment", { comment: "Dobry początek\nDziś słabszy chwyt" });
});
