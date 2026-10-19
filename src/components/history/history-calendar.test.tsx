import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { WorkoutSummary } from "@/lib/workouts/contracts";
import { HistoryCalendar } from "./history-calendar";
const item=(id:string,extra:Partial<WorkoutSummary>={}):WorkoutSummary=>({id,name:id,status:"completed",revision:1,performedOn:"2026-10-14",performedAt:"2026-10-14T16:00:00Z",timeZone:"Europe/Warsaw",timeKnown:true,...extra});
const props={completed:[item("Siła"),item("Mobilność",{performedAt:null,timeKnown:false})],active:[item("Aktywny",{status:"in_progress"})],today:"2026-10-19",timeZone:"Europe/Warsaw",initialMonth:"2026-10",initialDay:"2026-10-14"};
beforeEach(()=>{window.history.replaceState(null,"","/historia?month=2026-10&day=2026-10-14");vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>setTimeout(()=>callback(0),0));});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe("Historia — wybór i przegląd",()=>{
 it("pokazuje wiele sesji, nieznaną godzinę i aktywne osobno, linkuje wspólny przegląd",()=>{
  render(<HistoryCalendar {...props}/>);
  expect(screen.getByText("18:00 · Zakończony")).toBeTruthy();
  expect(screen.getByText("godzina nieznana · Zakończony")).toBeTruthy();
  expect(screen.getByRole("heading",{name:"Do wznowienia"})).toBeTruthy();
  expect(screen.getByRole("link",{name:/Siła/}).getAttribute("href")).toContain("/trening/Si%C5%82a?historyMonth=2026-10&historyDay=2026-10-14");
  expect(screen.getByRole("button",{name:/środa, 14 października 2026 · zakończone treningi: 2/}).getAttribute("aria-pressed")).toBe("true");
 });
 it("wybór pustego dnia, miesiąca i Dzisiaj zapisuje kontekst w URL",()=>{
  render(<HistoryCalendar {...props}/>);
  fireEvent.click(screen.getByRole("button",{name:/czwartek, 15 października/}));
  expect(screen.getByText("Brak zakończonych treningów tego dnia.")).toBeTruthy();
  expect(window.location.search).toBe("?month=2026-10&day=2026-10-15");
  fireEvent.click(screen.getByRole("button",{name:"Następny miesiąc"}));
  expect(window.location.search).toBe("?month=2026-11&day=2026-11-15");
  fireEvent.click(screen.getByRole("button",{name:"Dzisiaj"}));
  expect(window.location.search).toBe("?month=2026-10&day=2026-10-19");
 });
 it("strzałki przechodzą przez granicę miesiąca i przywracają fokus; popstate odtwarza wybór",async()=>{
  render(<HistoryCalendar {...props} initialDay="2026-10-31"/>);
  fireEvent.keyDown(screen.getByRole("button",{name:/sobota, 31 października/}),{key:"ArrowRight"});
  await waitFor(()=>expect(document.activeElement?.getAttribute("data-day")).toBe("2026-11-01"));
  expect(window.location.search).toContain("2026-11-01");
  window.history.replaceState(null,"","/historia?month=2024-02&day=2024-02-29");
  fireEvent.popState(window);
  expect(screen.getByRole("button",{name:/czwartek, 29 lutego/}).getAttribute("aria-pressed")).toBe("true");
 });
});
