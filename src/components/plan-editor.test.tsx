import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { PlanEditor } from "./plan-editor";
import { emptyDocument } from "../lib/domain/plan-editor";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); push.mockClear(); refresh.mockClear(); });

test("edytuje A/B i wysyła nową wersję z różnymi seriami", async () => {
  const initial = emptyDocument();
  initial.name = "A/B";
  initial.sessions[0].exercises[0].name = "Przysiad";
  initial.sessions[1].exercises[0].name = "Martwy ciąg";
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ planId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }) });
  vi.stubGlobal("fetch", fetch);
  render(<PlanEditor initial={initial} planId="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" expectedVersionId="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" catalog={[]} />);
  fireEvent.click(screen.getByRole("button", { name: "+ Dodaj blok serii" }));
  fireEvent.click(screen.getByRole("button", { name: "Zastosuj zmiany" }));
  fireEvent.click(screen.getByRole("button", { name: "Opublikuj nową wersję" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  const body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body.document.sessions).toHaveLength(2);
  expect(body.document.sessions[0].exercises[0].sets.map((set: { position: number }) => set.position)).toEqual([1, 2]);
  expect(body.expectedVersionId).toBe("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
  await waitFor(() => expect(push).toHaveBeenCalledWith("/plany/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"));
});
