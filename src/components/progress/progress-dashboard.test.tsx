import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { ProgressDashboard } from "./progress-dashboard";
import { analyzeProgress } from "@/lib/progress/analytics";
afterEach(cleanup);
const data = () => analyzeProgress([
  { id: "w1", performed_on: "2020-01-01", status: "completed", created_at: "2026-10-18" },
  { id: "w2", performed_on: "2026-10-01", status: "abandoned", created_at: "2026-10-18" },
], ["w1", "w2"].map((id, i) => ({ id: `p${i}`, workout_session_id: id, exercise_id: "e1", target_name_snapshot: "Przysiad", source_kind: "planned", position: 1 })), ["p0", "p1"].map((id, i) => ({ id: `s${i}`, performed_exercise_id: id, position: 1, source_kind: "planned", status: "completed", target_kind_snapshot: "work", target_load_type_snapshot: "absolute", target_dumbbell_basis_snapshot: null, actual_reps: 3, actual_kg: i ? 100 : 200 })), [{ id: "e1", name: "Przysiad", variant: "high bar", equipment: "sztanga", load_mode: "external" }]);
describe("Postęp interakcje", () => {
  it("domyślne3M i PR całej historii; tylko celowy klik/Enter punktu otwiera informację", () => {
    render(<ProgressDashboard analytics={data()} today="2026-10-18" />);
    const plot = screen.getByTestId("progress-plot");
    expect(plot.getAttribute("data-from")).toBe("2026-07-18");
    expect(screen.getByTestId("progress-records").textContent).toContain("212,8 kg");
    expect(screen.getByTestId("progress-reading").textContent).toContain("106,4");
    expect(screen.getByTestId("progress-change").textContent).toMatch(/brak podstawy porównania/);
    expect(screen.getByTestId("progress-change").textContent).not.toMatch(/%/);
    expect(screen.getByTestId("progress-chart").getAttribute("data-progress-state")).toBe("single-point");
    expect(screen.getByText("Jeden wynik nie pokazuje trendu.")).toBeTruthy();
    expect(screen.getByTestId("progress-line").getAttribute("d") ?? "").not.toMatch(/L/);
    fireEvent.click(plot); expect(screen.queryByTestId("point-note")).toBeNull();
    const point = within(plot).getByRole("button");
    fireEvent.focus(point); expect(screen.queryByTestId("point-note")).toBeNull();
    fireEvent.click(point); expect(screen.getByTestId("point-note").textContent).toContain("Przerwany");
    expect(screen.getByTestId("point-note").textContent).toContain("godzina nieznana");
    fireEvent.pointerDown(document.body); expect(screen.queryByTestId("point-note")).toBeNull();
    fireEvent.click(point); fireEvent.keyDown(document, { key: "Escape" }); expect(screen.queryByTestId("point-note")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^1M$/ }));
    expect(plot.getAttribute("data-from")).toBe("2026-09-18");
    expect(screen.getByTestId("progress-records").textContent).toContain("212,8 kg");
  });
  it("pomoc, alternatywne sterowanie datami i źródła są dostępne", () => {
    render(<ProgressDashboard analytics={data()} today="2026-10-18" />);
    fireEvent.click(screen.getByRole("button", { name: "Jak liczymy szacowany 1RM" }));
    expect(screen.getByRole("note").textContent).toContain("106,4");
    const plot = screen.getByTestId("progress-plot"); fireEvent.keyDown(plot, { key: "+" });
    expect(plot.getAttribute("data-from")).not.toBe("2026-07-18");
    fireEvent.keyDown(plot, { key: "Home" }); expect(plot.getAttribute("data-from")).toBe("2026-07-18");
    expect(screen.getByTestId("analytics-history").textContent).toContain("s1");
  });
  it("jednakowe współrzędne mają osobny wybór punktu myszą i klawiaturą", () => {
    const analytics = data();
    const point = analytics[0].points[1];
    analytics[0].points.push({ ...point, id: "w3:e1", workoutId: "w3", sets: [{ ...point.sets[0], setId: "s3" }] });
    render(<ProgressDashboard analytics={analytics} today="2026-10-18" />);
    const list = screen.getByTestId("progress-point-list");
    const points = within(list).getAllByRole("button", { hidden: true });
    expect(points).toHaveLength(2);
    fireEvent.pointerDown(points[0]); fireEvent.click(points[0], { detail: 1 });
    expect(screen.getByTestId("point-note").textContent).toContain("Punkt 1 z 2");
    fireEvent.click(points[1], { detail: 0 });
    expect(screen.getByTestId("point-note").textContent).toContain("Punkt 2 z 2");
    expect(screen.getByTestId("point-note").textContent).not.toContain("w3");
  });
  it("pusty postęp nie zamienia braku w zero ani w 0%", () => {
    render(<ProgressDashboard analytics={[]} today="2026-10-18" />);
    expect(screen.getByRole("heading", { name: "Brak zapisanych wyników" })).toBeTruthy();
    expect(screen.queryByTestId("progress-plot")).toBeNull();
    expect(screen.queryByText("0%")).toBeNull();
    expect(screen.queryByText("0 kg")).toBeNull();
  });
  it("jeden punkt nie rysuje trendu i nie pokazuje procentu", () => {
    render(<ProgressDashboard analytics={data()} today="2026-10-18" />);
    const plot = screen.getByTestId("progress-plot");
    expect(plot.getAttribute("data-chart-line")).toBe("none");
    expect(plot.getAttribute("data-chart-points")).toBe("1");
    expect(screen.getByText("Jeden wynik nie pokazuje trendu.")).toBeTruthy();
    expect(screen.getByTestId("progress-change").textContent).toMatch(/brak podstawy porównania/);
    expect(screen.getByTestId("progress-change").textContent).not.toMatch(/%/);
    expect(screen.getByTestId("progress-line").getAttribute("d")).not.toMatch(/L/);
    expect(screen.getByRole("status").textContent).toMatch(/Szacunek to nie pomiar/);
    expect(screen.getByRole("link", { name: "Przejdź do Profilu" }).getAttribute("href")).toBe("/profil");
    expect(document.body.textContent).not.toMatch(/Zmierzone maksimum/);
  });
  it("przerwa nie łączy braku z zerem, a zero zostaje pomiarem", () => {
    const gap = analyzeProgress([
      { id: "w1", performed_on: "2026-08-01", status: "completed", created_at: "2026-10-18" },
      { id: "w2", performed_on: "2026-09-01", status: "completed", created_at: "2026-10-18" },
      { id: "w3", performed_on: "2026-10-01", status: "completed", created_at: "2026-10-18" },
    ], [1, 2, 3].map(i => ({ id: `p${i}`, workout_session_id: `w${i}`, exercise_id: "e1", target_name_snapshot: "Przysiad", source_kind: "planned", position: 1 })), [1, 2, 3].map(i => ({ id: `s${i}`, performed_exercise_id: `p${i}`, position: 1, source_kind: "planned", status: "completed", target_kind_snapshot: "work", target_load_type_snapshot: "absolute", target_dumbbell_basis_snapshot: null, actual_reps: i === 2 ? 11 : 3, actual_kg: 100 })), [{ id: "e1", name: "Przysiad", variant: null, equipment: "sztanga", load_mode: "external" }]);
    render(<ProgressDashboard analytics={gap} today="2026-10-18" />);
    expect(screen.getByTestId("progress-plot").getAttribute("data-chart-gap")).toBe("true");
    expect(screen.getByTestId("progress-plot").getAttribute("data-chart-line")).toBe("broken");
    expect(screen.getByText("Przerwa na wykresie to brak pomiaru, nie wynik zero.")).toBeTruthy();
    const broken = screen.getByTestId("progress-line").getAttribute("d") ?? "";
    expect(broken.match(/M/g)).toHaveLength(2);
    expect(broken.includes("L")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Max Ciężar" }));
    expect(screen.getByTestId("progress-plot").getAttribute("data-chart-line")).toBe("continuous");
    expect(screen.queryByText("Przerwa na wykresie to brak pomiaru, nie wynik zero.")).toBeNull();
    expect(screen.queryByText("Szacunek to nie pomiar")).toBeNull();
    const zero = analyzeProgress([
      { id: "z1", performed_on: "2026-08-02", status: "completed", created_at: "2026-10-18" },
      { id: "z2", performed_on: "2026-09-02", status: "completed", created_at: "2026-10-18" },
      { id: "z3", performed_on: "2026-10-02", status: "completed", created_at: "2026-10-18" },
    ], [1, 2, 3].map(i => ({ id: `zp${i}`, workout_session_id: `z${i}`, exercise_id: "e1", target_name_snapshot: "Przysiad", source_kind: "planned", position: 1 })), [1, 2, 3].map(i => ({ id: `zs${i}`, performed_exercise_id: `zp${i}`, position: 1, source_kind: "planned", status: "completed", target_kind_snapshot: "work", target_load_type_snapshot: "absolute", target_dumbbell_basis_snapshot: null, actual_reps: 3, actual_kg: i === 2 ? 0 : 100 })), [{ id: "e1", name: "Przysiad", variant: null, equipment: "sztanga", load_mode: "external" }]);
    cleanup();
    render(<ProgressDashboard analytics={zero} today="2026-10-18" />);
    fireEvent.click(screen.getByRole("button", { name: "Max Ciężar" }));
    expect(screen.getByTestId("progress-plot").getAttribute("data-chart-points")).toBe("3");
    expect(screen.getByTestId("progress-plot").getAttribute("data-chart-line")).toBe("continuous");
    expect(screen.getByTestId("progress-line").getAttribute("d")).toMatch(/L/);
    expect(within(screen.getByTestId("progress-plot")).getByRole("button", { name: /2 września 2026.*0 kg/ })).toBeTruthy();
    expect(screen.getByTestId("progress-change").textContent).toMatch(/Ostatni wynik/);
    expect(screen.getByTestId("progress-change").textContent).not.toMatch(/%/);
    expect(screen.getByTestId("progress-records").textContent).toContain("100 kg");
  });
});
