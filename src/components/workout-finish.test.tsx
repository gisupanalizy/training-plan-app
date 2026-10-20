import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { WorkoutFinish } from "./workout-finish";
import { workoutFixture } from "./workout-fixture";

afterEach(() => cleanup());

test("podwójna godzina wymaga jawnego offsetu i go nie zgaduje", () => {
  const onConfirm = vi.fn();
  render(<WorkoutFinish loaded={workoutFixture()} blocked={false} onConfirm={onConfirm} />);
  fireEvent.click(screen.getByRole("checkbox", { name: "Popraw datę i godzinę wykonania" }));
  fireEvent.change(screen.getByLabelText("Data i godzina wykonania"), { target: { value: "2026-10-25T02:30" } });
  const confirm = screen.getByRole("button", { name: "Potwierdź zakończenie" }) as HTMLButtonElement;
  expect(confirm.disabled).toBe(true);
  fireEvent.click(screen.getByRole("radio", { name: /UTC\+01:00/ }));
  expect(confirm.disabled).toBe(false);
  fireEvent.click(confirm);
  expect(onConfirm).toHaveBeenCalledWith({ performedAt: "2026-10-25T02:30:00+01:00", timeZone: "Europe/Warsaw" });
});

test("nieistniejąca godzina nie kończy treningu", () => {
  const onConfirm = vi.fn();
  render(<WorkoutFinish loaded={workoutFixture()} blocked={false} onConfirm={onConfirm} />);
  fireEvent.click(screen.getByRole("checkbox", { name: "Popraw datę i godzinę wykonania" }));
  fireEvent.change(screen.getByLabelText("Data i godzina wykonania"), { target: { value: "2026-03-29T02:30" } });
  expect(screen.getByRole("alert").textContent).toMatch(/nie istnieje/);
  expect((screen.getByRole("button", { name: "Potwierdź zakończenie" }) as HTMLButtonElement).disabled).toBe(true);
  expect(onConfirm).not.toHaveBeenCalled();
});
