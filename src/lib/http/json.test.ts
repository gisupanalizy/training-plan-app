// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { readJsonObject } from "./json";
import { POST as savePlan } from "@/app/api/plans/route";
import { POST as saveWorkout } from "@/app/api/workouts/route";
import { POST as saveMaximum } from "@/app/api/one-rep-max/route";
import { POST as saveRounding } from "@/app/api/profile/rounding/route";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(() => { throw new Error("Błędne wejście nie może dotrzeć do bazy."); }) }));
const request = (body: string) => new Request("http://localhost/api/test", { method: "POST", body });

describe("odczyt JSON przed zapisem prywatnych danych", () => {
  it("mierzy bajty strumienia także bez Content-Length", async () => {
    await expect(readJsonObject(request('{"note":"ąć"}'), 15)).resolves.toEqual({ note: "ąć" });
    await expect(readJsonObject(request('{"note":"ąć"}'), 14)).rejects.toThrow("Za duże");
  });
  it("odrzuca przekroczony deklarowany limit i niepoprawny UTF-8", async () => {
    const declared = new Request("http://localhost", { method: "POST", headers: { "content-length": "100" }, body: "{}" });
    await expect(readJsonObject(declared, 20)).rejects.toThrow("Za duże");
    const invalid = new Request("http://localhost", { method: "POST", body: new Uint8Array([123, 34, 255, 34, 58, 49, 125]) });
    await expect(readJsonObject(invalid, 20)).rejects.toThrow();
  });
  for (const [name, post, limit] of [
    ["plan", savePlan, 1_048_576], ["trening", saveWorkout, 65_536],
    ["1RM", saveMaximum, 16_384], ["zaokrąglenie", saveRounding, 1_024],
  ] as const) {
    it.each(["null", "[]", '"tekst"', "0", "true", "{", ""])(`${name}: błędny dokument %s daje 400 bez zapisu`, async body => {
      const response = await post(request(body));
      expect(response.status).toBe(400);
      expect(await response.json()).toHaveProperty("error");
    });
    it(`${name}: zbyt duży strumień daje 400 bez zapisu`, async () => {
      expect((await post(request(JSON.stringify({ value: "x".repeat(limit) })))).status).toBe(400);
    });
  }
});
