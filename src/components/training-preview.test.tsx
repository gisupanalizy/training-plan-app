import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { cleanup } from "@testing-library/react";
import { TrainingPreview } from "./training-preview";
import { demoDays } from "../lib/demo-plan";

afterEach(cleanup);

test("przechodzi między seriami i czyści niezapisany formularz", () => {
  render(<TrainingPreview day={demoDays[0]} />);
  const repetitions = screen.getByPlaceholderText("Wpisz wynik") as HTMLInputElement;
  fireEvent.change(repetitions, { target: { value: "6" } });
  expect(repetitions.value).toBe("6");
  fireEvent.click(screen.getByRole("button", { name: /Następna seria/ }));
  expect(screen.getByRole("heading", { name: "Seria 2 z 4" })).toBeDefined();
  expect(repetitions.value).toBe("");
  expect(screen.getByText(/Podgląd nie zapisuje danych/i)).toBeDefined();
});

test("pozwala przejść do innego ćwiczenia", () => {
  render(<TrainingPreview day={demoDays[1]} />);
  const repetitions = screen.getByPlaceholderText("Wpisz wynik") as HTMLInputElement;
  const load = screen.getByPlaceholderText("Wpisz ciężar") as HTMLInputElement;
  fireEvent.change(repetitions, { target: { value: "0" } });
  fireEvent.change(load, { target: { value: "0" } });
  fireEvent.click(screen.getByRole("button", { name: /Wyciskanie nad głowę/ }));
  expect(repetitions.value).toBe("");
  expect(load.value).toBe("");
  expect(screen.getByRole("heading", { name: "Wyciskanie nad głowę" })).toBeDefined();
  expect(screen.getByRole("heading", { name: "Seria 1 z 3" })).toBeDefined();
});

test("nawigacja między seriami przekracza granicę ćwiczenia w obie strony", () => {
  render(<TrainingPreview day={demoDays[0]} />);
  for (let index = 0; index < 4; index++) fireEvent.click(screen.getByRole("button", { name: "Następna seria" }));
  expect(screen.getByRole("heading", { name: "Wyciskanie leżąc" })).toBeDefined();
  expect(screen.getByRole("heading", { name: "Seria 1 z 3" })).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Poprzednia seria" }));
  expect(screen.getByRole("heading", { name: "Przysiad ze sztangą" })).toBeDefined();
  expect(screen.getByRole("heading", { name: "Seria 4 z 4" })).toBeDefined();
});
