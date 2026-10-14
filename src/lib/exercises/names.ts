import reference from "./en-reference.json";

export type ExerciseName = { key: string; pl: string; en: string; aliases: string[]; equipment?: string; variant?: string };
// Nazwy redakcyjnie sprawdzone dla źródeł T06-R1. Odrębne chwyty, sprzęt i asysta pozostają odrębne.
const entry = (key: string, pl: string, en: string, aliases: string[] = [], equipment?: string, variant?: string): ExerciseName => ({ key, pl, en, aliases, equipment, variant });
export const exerciseNames: ExerciseName[] = [
  entry("handstand-practice", "Nauka stania na rękach", "Handstand practice", ["handstand", "handstand nauka", "handstand* nauka"]),
  entry("band-muscle-up", "Muscle-up z gumą", "Band-assisted muscle-up", ["muscle up z gumą", "muscle up z guma"], "guma", "z asystą gumy"),
  entry("front-squat", "Przysiad przedni", "Front squat", [], "sztanga"),
  entry("bench-press", "Wyciskanie sztangi leżąc", "Bench press", ["wyciskanie sztangi na ławce"], "sztanga"),
  entry("pull-up", "Podciąganie nachwytem", "Pull up", ["pull-up", "pull ups", "podciąganie nachwytem"]),
  entry("chin-up-weighted", "Podciąganie podchwytem z obciążeniem", "Weighted chin-up", ["chin up z obciążeniem"], undefined, "podchwyt, dodatkowy ciężar"),
  entry("chin-up", "Podciąganie podchwytem", "Chin up", ["chin-up"], undefined, "podchwyt"),
  entry("bar-dip", "Dipy na poręczach", "Bar dip", ["dips", "bar dips"]),
  entry("weighted-dip", "Dipy z obciążeniem", "Weighted dip", ["dip z obciążeniem"], undefined, "dodatkowy ciężar"),
  entry("step-up-lunge", "Wejście z kopnięciem i wykrok w tył", "Step up kick + reverse lunge", []),
  entry("external-rotation", "Rotacja zewnętrzna ramienia", "External rotation", []),
  entry("ring-curl", "Uginanie ramion na kółkach", "Ring biceps curl", [], "kółka gimnastyczne"),
  entry("ring-triceps", "Prostowanie ramion na kółkach", "Ring triceps extension", [], "kółka gimnastyczne"),
  entry("kneeling-arnold", "Jednorącz wyciskanie Arnolda w półklęku", "Half kneeling single arm Arnold press", [], undefined, "jednorącz, półklęk"),
  entry("rdl", "Rumuński martwy ciąg", "Romanian deadlift", [], "sztanga"),
  entry("pike-push-up", "Pompki w pozycji pike", "Pike push up", ["pike push-up"]),
  entry("ring-row", "Podciąganie australijskie na kółkach", "Australian pull up on gymnastic rings", [], "kółka gimnastyczne"),
  entry("jump-squat", "Przysiad z wyskokiem", "Plyo jump squat", ["jump squat"]),
  entry("dragon-flag-negative", "Dragon flag — faza opuszczania", "Dragon flag negative", [], undefined, "faza ekscentryczna"),
  entry("slow-sit-up", "Powolne brzuszki", "Slow sit-ups", []),
  entry("windshield-wiper", "Wycieraczki", "Windshield wiper", []),
  entry("hip-abduction", "Odwodzenie nóg na maszynie", "Hip abduction machine", [], "maszyna"),
  entry("bar-push-up", "Pompki na pojedynczej poręczy", "Push up single bar", ["push up single bar (na paraletce)"], "paraletka"),
  entry("pistol-box-squat", "Przysiad jednonóż do skrzyni", "Pistol box squat", [], "skrzynia", "jednonóż"),
  entry("side-plank", "Deska bokiem", "Side plank", ["plank boczny"]),
  entry("reverse-plank", "Deska tyłem", "Reverse plank", []),
  entry("single-leg-hip-thrust", "Unoszenie bioder jednonóż", "Single leg hip thrust", ["single leg hip thrust*"], undefined, "jednonóż"),
  entry("leg-press", "Wyciskanie nóg na suwnicy", "Leg press", ["suwnica"], "suwnica"),
  entry("goblet-squat", "Przysiad goblet", "Goblet squat", []),
  entry("dumbbell-row", "Wiosłowanie hantlem jednorącz", "One-arm dumbbell row", ["wiosłowanie hantlem (jednorącz)", "wiosłowanie hantlem w opadzie"], "hantel", "jednorącz"),
  entry("dumbbell-bench", "Wyciskanie hantli na ławce", "Dumbbell bench press", [], "hantle"),
  entry("lateral-raise", "Unoszenie hantli bokiem", "Dumbbell lateral raise", [], "hantle"),
  entry("dumbbell-curl", "Uginanie ramion z hantlami", "Dumbbell curl", [], "hantle"),
  entry("plank", "Deska", "Plank", []),
  entry("lat-pulldown", "Ściąganie drążka do klatki", "Lat pulldown", [], "wyciąg"),
  entry("machine-chest-press", "Wyciskanie na maszynie na klatkę", "Machine chest press", ["wyciskanie maszyny na klatkę"], "maszyna"),
  entry("cable-triceps", "Prostowanie ramienia na wyciągu", "Cable triceps extension", [], "wyciąg"),
  entry("russian-twist", "Skręty tułowia w siadzie", "Russian twist", []),
  entry("machine-row", "Wiosłowanie na maszynie", "Machine row", [], "maszyna"),
  entry("preacher-curl", "Uginanie ramion na modlitewniku", "Preacher curl", ["uginanie na modlitewniku"], "modlitewnik"),
  entry("leg-extension", "Prostowanie nóg na maszynie", "Leg extension", ["prostowanie nog w kolanie na maszynie"], "maszyna"),
  entry("burpee", "Burpees", "Burpee", ["burpees"]),
  entry("barbell-row", "Wiosłowanie sztangą w opadzie", "Bent-over barbell row", [], "sztanga"),
  entry("bench-dip", "Pompki odwrotne", "Bench dip", []),
  entry("jumping-jack", "Pajacyki", "Jumping jack", []),
  entry("scissor-kick", "Nożyce leżąc", "Scissor kick", []),
  entry("barbell-curl", "Uginanie ramion ze sztangą", "Barbell curl", ["uginanie ramion z pustą sztangą na biceps"], "sztanga"),
  entry("hip-thrust", "Unoszenie bioder", "Hip thrust", ["unoszenia bioder"]),
  entry("dumbbell-sumo-squat", "Przysiad sumo z hantlem", "Dumbbell sumo squat", ["przysiady sumo hantlem między nogami"], "hantel", "sumo"),
];
export const normalizeAlias = (name: string) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").toLowerCase().replace(/[*]/g, "").replace(/[-–]/g, " ").replace(/\s+/g, " ").trim();
const aliases = new Map(exerciseNames.flatMap((item) => [item.pl, item.en, ...item.aliases].map((name) => [normalizeAlias(name), item] as const)));
export function matchExerciseName(name: string): ExerciseName | null { return aliases.get(normalizeAlias(name)) ?? null; }
export function suggestExerciseName(name: string): ExerciseName | null {
  const normalized = normalizeAlias(name);
  return exerciseNames.find((item) => [item.en, ...item.aliases].some((alias) => normalized.startsWith(`${normalizeAlias(alias)} `))) ?? null;
}
export const englishExerciseReference = reference;
