import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolveExerciseAsset } from "./exercise-assets";

describe("Dokładne lokalne ilustracje", () => {
  it("rozróżnia chwyty, sprzęt, asystę i ruch statyczny", () => {
    expect(resolveExerciseAsset("Podciąganie nachwytem")).toBe("/exercise-assets/pull-up.svg");
    expect(resolveExerciseAsset("Podciąganie podchwytem")).toBeNull();
    expect(resolveExerciseAsset("Podciąganie nachwytem z gumą")).toBeNull();
    expect(resolveExerciseAsset("Wyciskanie hantli na ławce")).toBeNull();
    expect(resolveExerciseAsset("Nauka stania na rękach")).toBeNull();
    expect(resolveExerciseAsset("Handstand push-up")).toBe("/exercise-assets/handstand-push-up.svg");
    expect(resolveExerciseAsset("Przysiad przedni pauza")).toBeNull();
    expect(resolveExerciseAsset("Bench press", { variant: "skos dodatni" })).toBeNull();
    expect(resolveExerciseAsset("Bench press", { equipment: "hantle" })).toBeNull();
    expect(resolveExerciseAsset("Bench press", { variant: null, equipment: "" })).toBe("/exercise-assets/bench-press.svg");
  });
  it("zachowuje bajty, pochodzenie i odrębną licencję zasobów", () => {
    const assets = JSON.parse(readFileSync("public/exercise-assets/manifest.json", "utf8"));
    for (const asset of assets.assets) {
      expect(createHash("sha256").update(readFileSync(`public/exercise-assets/${asset.filename}`)).digest("hex")).toBe(asset.sha256);
      expect(asset.attribution.license).toBe("CC BY-SA 4.0");
    }
    const fonts = JSON.parse(readFileSync("public/fonts/manifest.json", "utf8"));
    expect(fonts.license).toBe("OFL-1.1");
    for (const asset of fonts.assets) expect(createHash("sha256").update(readFileSync(`public/fonts/${asset.name}`)).digest("hex")).toBe(asset.sha256);
  });
});
