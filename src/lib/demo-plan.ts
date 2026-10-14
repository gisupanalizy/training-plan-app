export type DemoSet = {
  repetitions: string;
  load: string;
  note?: string;
};

export type DemoExercise = {
  name: string;
  category: string;
  sets: DemoSet[];
  previous: string | null;
  note?: string;
};

export type DemoDay = {
  id: "a" | "b";
  label: string;
  title: string;
  focus: string;
  duration: string;
  exercises: DemoExercise[];
};

// Wyłącznie syntetyczne dane prezentacyjne. Nie są planem konkretnej osoby.
export const demoDays: DemoDay[] = [
  {
    id: "a",
    label: "Dzień A",
    title: "Siła podstawowa",
    focus: "Nogi · klatka · plecy",
    duration: "około 65 min",
    exercises: [
      {
        name: "Przysiad ze sztangą",
        category: "Nogi",
        sets: [
          { repetitions: "6", load: "75% 1RM · 90 kg" },
          { repetitions: "6", load: "75% 1RM · 90 kg" },
          { repetitions: "6", load: "75% 1RM · 90 kg" },
          { repetitions: "6", load: "75% 1RM · 90 kg" },
        ],
        previous: null,
        note: "Przerwa 2–3 min. Przykładowe 1RM: 120 kg.",
      },
      {
        name: "Wyciskanie leżąc",
        category: "Klatka",
        sets: [
          { repetitions: "5", load: "70 kg" },
          { repetitions: "5", load: "70 kg" },
          { repetitions: "5", load: "70 kg" },
        ],
        previous: null,
      },
      {
        name: "Wiosłowanie hantlą",
        category: "Plecy",
        sets: [
          { repetitions: "8–10", load: "24 kg / ręka" },
          { repetitions: "8–10", load: "24 kg / ręka" },
          { repetitions: "8–10", load: "24 kg / ręka" },
        ],
        previous: null,
      },
    ],
  },
  {
    id: "b",
    label: "Dzień B",
    title: "Siła i akcesoria",
    focus: "Tył ciała · barki · core",
    duration: "około 60 min",
    exercises: [
      {
        name: "Martwy ciąg",
        category: "Tył ciała",
        sets: [
          { repetitions: "5", load: "80 kg" },
          { repetitions: "5", load: "85 kg" },
          { repetitions: "5", load: "90 kg" },
        ],
        previous: null,
        note: "Przykład narastającego obciążenia.",
      },
      {
        name: "Wyciskanie nad głowę",
        category: "Barki",
        sets: [
          { repetitions: "8", load: "35 kg" },
          { repetitions: "8", load: "35 kg" },
          { repetitions: "8", load: "35 kg" },
        ],
        previous: null,
      },
      {
        name: "Deska",
        category: "Core",
        sets: [
          { repetitions: "45 s", load: "masa ciała" },
          { repetitions: "45 s", load: "masa ciała" },
          { repetitions: "45 s", load: "masa ciała" },
        ],
        previous: null,
      },
    ],
  },
];

export function getDemoDay(id: string): DemoDay | undefined {
  return demoDays.find((day) => day.id === id);
}
