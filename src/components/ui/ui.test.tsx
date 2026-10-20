import React, { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./button";
import { Card } from "./card";
import { Dialog } from "./dialog";
import { EmptyState } from "./empty-state";
import { Field } from "./field";
import { InfoPopover } from "./info-popover";
import { ExerciseIllustration } from "./exercise-illustration";
import { ListRow } from "./list-row";
import { BottomNav, Sidebar, appNavigation } from "./navigation";
import { Notice } from "./notice";
import { SegmentedControl } from "./segmented-control";
import { StatusBadge } from "./status-badge";
import { Stepper } from "./stepper";

vi.mock("next/link", () => ({ default: ({ href, children, ...props }: { href: string; children?: React.ReactNode }) => <a href={href} {...props}>{children}</a> }));

afterEach(cleanup);
describe("Wspólne kontrolki Tempo", () => {
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
  it("stepper przyjmuje wpis z klawiatury i nie zamienia braku na zero", () => {
    function Harness() {
      const [value, setValue] = useState("");
      return <Stepper label="Powtórzenia" value={value} onValueChange={setValue} min={0} />;
    }
    render(<Harness />);
    const input = screen.getByLabelText("Powtórzenia") as HTMLInputElement;
    fireEvent.click(screen.getByRole("button", { name: "Zwiększ Powtórzenia" }));
    expect(input.value).toBe("");
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Zwiększ Powtórzenia" }));
    expect(input.value).toBe("6");
    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Zmniejsz Powtórzenia" }));
    expect(input.value).toBe("0");
  });
  it("segment zachowuje wybór w atrybucie i na strzałce", () => {
    function Harness() {
      const [value, setValue] = useState("a");
      return <SegmentedControl label="Zakres" value={value} onValueChange={setValue} options={[{ value: "a", label: "Aktywny" }, { value: "b", label: "Drugi" }]} />;
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole("radio", { name: "Drugi" }));
    expect(screen.getByRole("radio", { name: "Drugi" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowLeft" });
    expect(screen.getByRole("radio", { name: "Aktywny" }).getAttribute("aria-checked")).toBe("true");
  });
  it("wiersz, karta, status, komunikat i pusty stan niosą tekst", () => {
    render(<>
      <ListRow title="Wiersz listy" meta="Opis" badge="Gotowe" onSelect={() => undefined} />
      <Card title="Karta"><p>Treść karty</p></Card>
      <StatusBadge tone="success">Zapisane</StatusBadge>
      <Notice title="Komunikat">Krótka informacja.</Notice>
      <EmptyState title="Stan pusty">Brak zapisanych danych.</EmptyState>
    </>);
    expect(screen.getByRole("button", { name: /Wiersz listy/ }).getAttribute("type")).toBe("button");
    expect(screen.getByRole("heading", { name: "Karta" })).toBeTruthy();
    expect(screen.getByText("Zapisane")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Komunikat");
    expect(screen.getByRole("heading", { name: "Stan pusty" })).toBeTruthy();
  });
  it("dialog odrzuca Escape i Anuluj, a zatwierdzenie jest osobne", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      const [confirmed, setConfirmed] = useState(false);
      return <>
        <button onClick={() => setOpen(true)}>Otwórz</button>
        <Dialog open={open} title="Przykładowe pole" onDismiss={() => setOpen(false)} onConfirm={() => setConfirmed(true)}>
          <Field label="Wartość" />
        </Dialog>
        <span>{confirmed ? "zatwierdzono" : "niezatwierdzono"}</span>
      </>;
    }
    render(<Harness />);
    const open = screen.getByRole("button", { name: "Otwórz" });
    open.focus();
    fireEvent.click(open);
    fireEvent.change(screen.getByLabelText("Wartość"), { target: { value: "12" } });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(open);
    expect(screen.getByText("niezatwierdzono")).toBeTruthy();
    fireEvent.click(open);
    expect((screen.getByLabelText("Wartość") as HTMLInputElement).value).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));
    expect(document.activeElement).toBe(open);
    fireEvent.click(open);
    fireEvent.click(screen.getByRole("button", { name: "Zamknij" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(open);
    fireEvent.click(screen.getByRole("button", { name: "Zastosuj" }));
    expect(screen.getByText("zatwierdzono")).toBeTruthy();
  });
  it("nawigacja ma pięć tras i rozróżnia konto prywatne od demo", () => {
    render(<><BottomNav section="Plany" /><Sidebar section="Plany" mode="private" /><Sidebar section="Historia" mode="demo" /></>);
    expect(appNavigation.map((item) => item.label)).toEqual(["Trening", "Plany", "Historia", "Postęp", "Profil"]);
    expect(screen.getAllByRole("link", { name: "Plany" }).length).toBeGreaterThan(0);
    expect(document.querySelector(".mobile-nav a[aria-current=page]")?.textContent).toContain("Plany");
    expect(screen.getByText("KONTO PRYWATNE")).toBeTruthy();
    expect(screen.getByText("TRYB DEMONSTRACYJNY")).toBeTruthy();
  });
});
