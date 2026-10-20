import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PlanEditor } from "./plan-editor";
import { emptySet } from "@/lib/domain/plan-editor";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("podyktowany plan jest widocznym szkicem i nie publikuje się sam", async () => {
  const document = { name: "Plan z głosu", sessions: [{ weekNumber: 1, dayLabel: "A", note: null,
    exercises: [{ exerciseId: null, name: "Przysiad", variant: null, equipment: null, supersetGroup: null,
      note: null, sets: [{ ...emptySet(1), repsMin: 6, loadType: "percent_1rm", targetPercent: 75 }] }] }] };
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ transcript: "A przysiad sześć na 75 procent maksa",
    target: null, proposal: { document, issues: [] } }) });
  vi.stubGlobal("fetch", fetchMock);
  render(<PlanEditor planId={null} expectedVersionId={null} catalog={[]} />);
  fireEvent.click(screen.getByRole("button", { name: "Dyktuj fragment planu" }));
  fireEvent.change(screen.getByRole("textbox", { name: /Transkrypcja/ }), { target: { value: "A przysiad sześć na 75 procent maksa" } });
  fireEvent.click(screen.getByRole("button", { name: "Przygotuj propozycję" }));
  expect(await screen.findByText(/6 powtórzeń · 75% 1RM/)).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Dodaj propozycję do szkicu" }));
  await waitFor(() => expect(screen.getByRole("textbox", { name: "Nazwa planu" })).toHaveProperty("value", "Plan z głosu"));
  expect(fetchMock.mock.calls.some(([url]) => String(url).includes("/api/plans"))).toBe(false);
  expect(String(fetchMock.mock.calls.at(-1)?.[0])).toBe("/api/exercises/suggest");
});
