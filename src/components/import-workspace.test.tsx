// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { emptySet, type PlanEditorDocument } from "@/lib/domain/plan-editor";
import type { ImportQuestion } from "@/lib/imports/questions";
import { PlanEditor } from "./plan-editor";
import { ImportWorkspace } from "./import-workspace";

vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ storage: { from: () => ({ uploadToSignedUrl: vi.fn() }) } }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
afterEach(() => { vi.unstubAllGlobals(); });

const document: PlanEditorDocument = { name: "Szkic", sessions: [{ weekNumber: 1, dayLabel: "A", note: null,
  exercises: [{ exerciseId: null, name: "Przysiad", variant: null, equipment: null, supersetGroup: null, note: null, sets: [emptySet(1)] }] }] };
const question = (index: number): ImportQuestion => ({ id: `missing_sets:sessions.0.exercises.0.sets-${index}`, path: `sessions.${Math.floor(index / 30)}.exercises.${index % 30}.sets`,
  prompt: `Ile serii ${index}?`, answerType: "number", required: true, unit: "serii", min: 1, max: 30, options: [] });

describe("T07 ekran importu", () => {
  it("dzieli 55 pytań na strony i zapisuje poprawiony dokument bez publikowania", async () => {
    const requests: { url: string; body: { document: PlanEditorDocument; answers: Record<string, unknown> } }[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
      requests.push({ url, body: JSON.parse(String(init.body)) });
      return { ok: true, json: async () => ({ saved: true }) };
    }));
    const questions = Array.from({ length: 55 }, (_, index) => question(index));
    const many: PlanEditorDocument = { name: "Duży szkic", sessions: [30,25].map((count, index) => ({ ...structuredClone(document.sessions[0]), dayLabel: index ? "B" : "A", exercises: Array.from({ length: count }, (_, ei) => ({ ...structuredClone(document.sessions[0].exercises[0]), name: `Ćwiczenie ${index * 30 + ei}` })) })) };
    render(<PlanEditor initial={many} planId={null} expectedVersionId={null} catalog={[]}
      importReview={{ id: "00000000-0000-4000-8000-000000000001", questions, draft: { sessions: [] } }} />);
    expect(screen.getByText("Strona 1 z 6")).toBeTruthy();
    fireEvent.change(screen.getByRole("spinbutton", { name: "Ile serii 0?" }), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Następne →" }));
    expect(screen.getByText("Strona 2 z 6")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Zapisz korektę" }));
    await waitFor(() => expect(requests.length).toBe(1));
    expect(requests[0].url).toMatch(/\/api\/imports\//);
    expect(requests[0].body.document.sessions[0].exercises[0].sets).toHaveLength(2);
    expect(requests[0].body.answers[questions[0].id]).toBe(2);
  });

  it("pokazuje odmowę dostępu do aparatu i możliwość wyboru pliku", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ jobs: [] }) })));
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: vi.fn().mockRejectedValue(new Error("denied")) } });
    render(<ImportWorkspace initialId={null} supabaseUrl="http://127.0.0.1:54321" supabaseKey="anon" />);
    fireEvent.click(screen.getByRole("button", { name: "Aparat" }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", expect.stringContaining("Odmówiono dostępu"));
    fireEvent.click(screen.getByRole("button", { name: "Plik" }));
    expect(screen.getByLabelText(/PDF \(1–6 stron\)/)).toBeTruthy();
  });
});
