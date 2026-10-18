import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./button";
import { Field } from "./field";
import { InfoPopover } from "./info-popover";
import { ExerciseIllustration } from "./exercise-illustration";

afterEach(cleanup);
describe("Wspólne kontrolki Nocy", () => {
  it("przycisk domyślnie nie wysyła formularza", () => {
    render(<Button>Zapisz</Button>);
    expect(screen.getByRole("button").getAttribute("type")).toBe("button");
  });
  it("pole łączy etykietę, pomoc i błąd bez utraty zewnętrznego opisu", () => {
    render(<Field label="Ciężar" hint="W kilogramach" error="Popraw wartość" aria-describedby="external" />);
    const input = screen.getByLabelText("Ciężar");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const ids = input.getAttribute("aria-describedby")!.split(" ");
    expect(ids[0]).toBe("external");
    expect(ids.slice(1).map(id => document.getElementById(id)?.textContent)).toEqual(["W kilogramach", "Popraw wartość"]);
  });
  it("pomoc otwiera się przyciskiem, zamyka poza nią i przez Escape z powrotem fokusu", () => {
    render(<><InfoPopover label="Metoda">Treść pomocy</InfoPopover><button>Poza pomocą</button></>);
    const trigger = screen.getByRole("button", { name: "Metoda" });
    fireEvent.click(trigger);
    expect(screen.getByRole("note").textContent).toBe("Treść pomocy");
    fireEvent.pointerDown(screen.getByText("Poza pomocą"));
    expect(screen.queryByRole("note")).toBeNull();
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("note")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it("nie podstawia ilustracji innego wariantu", () => {
    render(<ExerciseIllustration name="Nauka stania na rękach" decorative={false} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("Brak dokładnej ilustracji");
    expect(document.querySelector("img")).toBeNull();
  });
});
