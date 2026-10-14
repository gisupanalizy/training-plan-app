import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { VoiceInput } from "./voice-input";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("brak mikrofonu zostawia tekstowy odpowiednik", async () => {
  const onProposal = vi.fn();
  render(<VoiceInput scope="plan" label="Plan" onProposal={onProposal} />);
  fireEvent.click(screen.getByRole("button", { name: /Nagraj/ }));
  expect(await screen.findByText(/Brak dostępnego mikrofonu/)).toBeTruthy();
  expect(screen.getByRole("textbox", { name: /Transkrypcja/ })).toBeTruthy();
});

test("anulowany, opóźniony wynik interpretacji nie daje propozycji", async () => {
  let finish!: (value: unknown) => void;
  const fetchMock = vi.fn().mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  vi.stubGlobal("fetch", fetchMock);
  const onProposal = vi.fn();
  render(<VoiceInput scope="workout" context={{ workoutId: "a", revision: 1, intent: "set", setId: "x" }} label="Seria" onProposal={onProposal} />);
  fireEvent.change(screen.getByRole("textbox", { name: /Transkrypcja/ }), { target: { value: "Pięć po sto" } });
  fireEvent.click(screen.getByRole("button", { name: "Przygotuj propozycję" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));
  finish({ ok: true, json: async () => ({ transcript: "Pięć po sto", proposal: { intent: "set", reps: 5, kg: 100 } }) });
  await waitFor(() => expect(screen.getByRole("button", { name: "Przygotuj propozycję" })).toBeTruthy());
  expect(onProposal.mock.calls.filter(([value]) => value !== null)).toHaveLength(0);
});

test("anulowanie przed przyznaniem mikrofonu zatrzymuje spóźniony strumień", async () => {
  let grant!: (value: MediaStream) => void;
  const getUserMedia = vi.fn().mockImplementation(() => new Promise((resolve) => { grant = resolve; }));
  const stop = vi.fn();
  vi.stubGlobal("navigator", Object.assign(Object.create(navigator), { mediaDevices: { getUserMedia } }));
  vi.stubGlobal("MediaRecorder", { isTypeSupported: () => true });
  const onProposal = vi.fn();
  render(<VoiceInput scope="plan" label="Plan" onProposal={onProposal} />);
  fireEvent.click(screen.getByRole("button", { name: /Nagraj/ }));
  expect(screen.getByText(/Oczekiwanie na dostęp/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Anuluj" }));
  grant({ getTracks: () => [{ stop }] } as unknown as MediaStream);
  await waitFor(() => expect(stop).toHaveBeenCalledTimes(1));
  expect(onProposal.mock.calls.filter(([value]) => value !== null)).toHaveLength(0);
});

test("zmiana aktywnej serii odrzuca spóźnioną interpretację", async () => {
  let finish!: (value: unknown) => void;
  vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise((resolve) => { finish = resolve; })));
  const onProposal = vi.fn();
  const { rerender } = render(<VoiceInput scope="workout" context={{ workoutId: "a", revision: 1, intent: "set", setId: "x" }}
    label="Seria 1" onProposal={onProposal} />);
  fireEvent.change(screen.getByRole("textbox", { name: /Transkrypcja/ }), { target: { value: "Pięć po sto" } });
  fireEvent.click(screen.getByRole("button", { name: "Przygotuj propozycję" }));
  rerender(<VoiceInput scope="workout" context={{ workoutId: "a", revision: 1, intent: "set", setId: "y" }}
    label="Seria 2" onProposal={onProposal} />);
  finish({ ok: true, json: async () => ({ transcript: "Pięć po sto", proposal: { intent: "set", reps: 5, kg: 100 } }) });
  await waitFor(() => expect(screen.getByRole("button", { name: "Przygotuj propozycję" })).toBeTruthy());
  expect(onProposal.mock.calls.filter(([value]) => value !== null)).toHaveLength(0);
});

test("błąd rejestratora zatrzymuje mikrofon i nie wysyła częściowego nagrania", async () => {
  const stopTrack = vi.fn();
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("navigator", Object.assign(Object.create(navigator), {
    mediaDevices: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] }) },
  }));
  let recorder!: MockRecorder;
  class MockRecorder {
    static isTypeSupported = (type: string) => type === "audio/mp4";
    state: RecordingState = "inactive";
    ondataavailable: ((event: BlobEvent) => void) | null = null;
    onstop: (() => void) | null = null;
    errorHandler: (() => void) | null = null;
    constructor(_stream: MediaStream, options: MediaRecorderOptions) {
      expect(options.mimeType).toBe("audio/mp4"); recorder = this;
    }
    addEventListener(type: string, handler: () => void) { if (type === "error") this.errorHandler = handler; }
    start() { this.state = "recording"; }
    stop() { this.state = "inactive"; this.onstop?.(); }
  }
  vi.stubGlobal("MediaRecorder", MockRecorder);
  render(<VoiceInput scope="plan" label="Plan" onProposal={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /Nagraj/ }));
  await screen.findByRole("button", { name: /Zatrzymaj/ });
  recorder.errorHandler?.();
  recorder.onstop?.();
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Nagrywanie zostało przerwane. Wpisz tekst poniżej.");
  expect(stopTrack).toHaveBeenCalledTimes(1);
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByRole("textbox", { name: /Transkrypcja/ })).toBeTruthy();
});
