import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PasswordForm, passwordDraftKey } from "./account-form";
import { OneRepMaxEditor } from "./one-rep-max-editor";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); sessionStorage.clear(); });
it("zachowuje identyfikator ponowienia i dane rzeczywistego maksimum po braku potwierdzenia", async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error("offline"));
  vi.stubGlobal("fetch", fetcher);
  render(<OneRepMaxEditor exercises={[{ id: "squat", name: "Przysiad", variant: null }]} increment={2.5} timeZone="Europe/Warsaw" />);
  fireEvent.change(screen.getByLabelText("Ciężar (kg)"), { target: { value: "100" } });
  fireEvent.change(screen.getByLabelText("Obowiązuje od"), { target: { value: "2026-10-18" } });
  fireEvent.submit(screen.getByRole("form", { name: "Dodaj rzeczywisty 1RM" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Brak potwierdzenia"));
  expect(document.activeElement).toBe(screen.getByRole("alert"));
  const first = JSON.parse(fetcher.mock.calls[0][1].body);
  expect(first).toMatchObject({ exerciseId: "squat", valueKg: 100, effectiveOn: "2026-10-18", note: null });
  fireEvent.submit(screen.getByRole("form", { name: "Dodaj rzeczywisty 1RM" }));
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  expect(JSON.parse(fetcher.mock.calls[1][1].body).operationId).toBe(first.operationId);
  await screen.findByRole("alert");
  fireEvent.change(screen.getByLabelText("Ciężar (kg)"), { target: { value: "105" } });
  fireEvent.submit(screen.getByRole("form", { name: "Dodaj rzeczywisty 1RM" }));
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));
  expect(JSON.parse(fetcher.mock.calls[2][1].body).operationId).not.toBe(first.operationId);
  await screen.findByRole("alert");
});

it("blokuje edycję podczas zapisu i odzyskuje formularz po błędzie serwera", async () => {
  let resolve!: (value: unknown) => void;
  vi.stubGlobal("fetch", vi.fn(() => new Promise(done => { resolve = done; })));
  render(<OneRepMaxEditor exercises={[{ id: "squat", name: "Przysiad", variant: null }]} increment={2.5} timeZone="Europe/Warsaw" />);
  fireEvent.submit(screen.getByRole("form", { name: "Zaokrąglanie celu" }));
  expect((screen.getByLabelText("Krok obciążenia") as HTMLInputElement).disabled).toBe(true);
  resolve({ ok: false, json: async () => ({ error: "Nieprawidłowy krok" }) });
  await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Nieprawidłowy krok"));
  expect((screen.getByLabelText("Krok obciążenia") as HTMLInputElement).disabled).toBe(false);
});

it("zostawia jedno pole nowego hasła i zachowuje za krótką wartość", () => {
  const action = vi.fn();
  render(<PasswordForm action={action} />);
  const input = screen.getByLabelText("Nowe hasło") as HTMLInputElement;
  expect(document.querySelectorAll('input[type="password"]')).toHaveLength(1);
  expect(input.getAttribute("autocomplete")).toBe("new-password");
  expect(input.minLength).toBe(12);
  expect(screen.getByText("Co najmniej 12 znaków.")).toBeTruthy();
  fireEvent.change(input, { target: { value: "krotkie" } });
  fireEvent.submit(input.closest("form")!);
  expect(action).not.toHaveBeenCalled();
  expect(input.value).toBe("krotkie");
  expect(screen.getByRole("alert").textContent).toContain("12 znaków");
  expect(input.getAttribute("aria-invalid")).toBe("true");
});

it("przywraca hasło po błędzie zapisu i nie pokazuje drugiego pola", async () => {
  sessionStorage.setItem(passwordDraftKey, "poprawne-haslo");
  render(<PasswordForm action={vi.fn()} errorCode="zapis" />);
  const input = await screen.findByDisplayValue("poprawne-haslo");
  expect(input.getAttribute("autocomplete")).toBe("new-password");
  expect(document.querySelectorAll('input[type="password"]')).toHaveLength(1);
  expect(sessionStorage.getItem(passwordDraftKey)).toBeNull();
  expect(screen.getByRole("alert").textContent).toContain("zostało zachowane");
});

it("blokuje drugie wysłanie poprawnego hasła", () => {
  const action = vi.fn();
  render(<PasswordForm action={action} />);
  const input = screen.getByLabelText("Nowe hasło");
  fireEvent.change(input, { target: { value: "poprawne-haslo" } });
  const form = input.closest("form")!;
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(action).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "Zapisywanie…" })).toHaveProperty("disabled", true);
});
