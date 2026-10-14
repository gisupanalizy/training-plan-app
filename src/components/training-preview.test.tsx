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
  expect(screen.getByText("02 / 10")).toBeDefined();
  expect(repetitions.value).toBe("");
  expect(screen.getByText(/prototyp nie zapisuje wyniku/i)).toBeDefined();
});

test("pozwala przejść do innego ćwiczenia", () => {
  render(<TrainingPreview day={demoDays[1]} />);
  fireEvent.click(screen.getByRole("button", { name: /Wyciskanie nad głowę/ }));
  expect(screen.getByRole("heading", { name: "Wyciskanie nad głowę" })).toBeDefined();
  expect(screen.getByText("04 / 09")).toBeDefined();
});
