import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { OneRepMaxEditor } from "./one-rep-max-editor";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("zachowuje identyfikator ponowienia i dane rzeczywistego maksimum po braku potwierdzenia", async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error("offline"));
  vi.stubGlobal("fetch", fetcher);
  render(<OneRepMaxEditor exercises={[{ id: "squat", name: "Przysiad", variant: null }]} increment={2.5} />);
  fireEvent.change(screen.getByLabelText("Rzeczywiste 1RM, kg"), { target: { value: "100" } });
  fireEvent.change(screen.getByLabelText("Data obowiązywania"), { target: { value: "2026-10-18" } });
  fireEvent.submit(screen.getByRole("form", { name: "Dodaj rzeczywisty 1RM" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Brak potwierdzenia"));
  expect(document.activeElement).toBe(screen.getByRole("alert"));
  const first = JSON.parse(fetcher.mock.calls[0][1].body);
  expect(first).toMatchObject({ exerciseId: "squat", valueKg: 100, effectiveOn: "2026-10-18", note: null });
  fireEvent.submit(screen.getByRole("form", { name: "Dodaj rzeczywisty 1RM" }));
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  expect(JSON.parse(fetcher.mock.calls[1][1].body).operationId).toBe(first.operationId);
  await screen.findByRole("alert");
  fireEvent.change(screen.getByLabelText("Rzeczywiste 1RM, kg"), { target: { value: "105" } });
  fireEvent.submit(screen.getByRole("form", { name: "Dodaj rzeczywisty 1RM" }));
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));
  expect(JSON.parse(fetcher.mock.calls[2][1].body).operationId).not.toBe(first.operationId);
  await screen.findByRole("alert");
});

it("blokuje edycję podczas zapisu i odzyskuje formularz po błędzie serwera", async () => {
  let resolve!: (value: unknown) => void;
  vi.stubGlobal("fetch", vi.fn(() => new Promise(done => { resolve = done; })));
  render(<OneRepMaxEditor exercises={[{ id: "squat", name: "Przysiad", variant: null }]} increment={2.5} />);
  fireEvent.submit(screen.getByRole("form", { name: "Zaokrąglanie celu" }));
  expect((screen.getByLabelText("Krok kg") as HTMLInputElement).disabled).toBe(true);
  resolve({ ok: false, json: async () => ({ error: "Nieprawidłowy krok" }) });
  await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Nieprawidłowy krok"));
  expect((screen.getByLabelText("Krok kg") as HTMLInputElement).disabled).toBe(false);
});
