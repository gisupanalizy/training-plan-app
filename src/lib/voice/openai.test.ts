// @vitest-environment node
import { afterEach, expect, test, vi } from "vitest";
import { interpretWorkout, transcribe } from "./openai";

afterEach(() => { vi.unstubAllGlobals(); });

test("mock transkrypcji wysyła plik, polski kontekst i bieżący model", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ text: "Pięć po sto" }) });
  vi.stubGlobal("fetch", fetchMock);
  const actual = await transcribe(new File([new Uint8Array([1, 2, 3])], "syntetyczny.webm", { type: "audio/webm" }), AbortSignal.timeout(1000));
  expect(actual).toBe("Pięć po sto");
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe("https://api.openai.com/v1/audio/transcriptions");
  const body = options.body as FormData;
  expect(body.get("model")).toBe("gpt-transcribe");
  expect(body.get("languages[]")).toBe("pl");
  expect(body.get("file")).toBeInstanceOf(File);
});

test("mock interpretacji nie zapisuje odpowiedzi u dostawcy i waliduje wynik", async () => {
  const proposal = { intent: "set", reps: 5, kg: 100, series: null, name: null, variant: null, comment: null, question: null };
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: "completed", usage: { input_tokens: 100, output_tokens: 20 },
    output: [{ content: [{ type: "output_text", text: JSON.stringify(proposal) }] }] }) });
  vi.stubGlobal("fetch", fetchMock);
  const usage = vi.fn();
  expect(await interpretWorkout("Pięć po sto", "set", AbortSignal.timeout(1000), usage)).toEqual(proposal);
  expect(usage).toHaveBeenCalledWith({ inputTokens: 100, outputTokens: 20 });
  const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(payload.model).toBe("gpt-6-luna"); expect(payload.store).toBe(false);
  expect(payload.text.format.type).toBe("json_schema"); expect(payload.text.format.strict).toBe(true);
});
