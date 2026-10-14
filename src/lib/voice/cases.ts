import type { VoiceProposal } from "./domain";

export const examples: { speech: string; intent: "set" | "comment" | "exercise"; proposal: Partial<VoiceProposal> }[] = [
  { speech: "Pięć po sto", intent: "set", proposal: { reps: 5, kg: 100 } },
  { speech: "Pięć powtórzeń, sto kilo", intent: "set", proposal: { reps: 5, kg: 100 } },
  { speech: "Sześć razy dziewięćdziesiąt dwa i pół", intent: "set", proposal: { reps: 6, kg: 92.5 } },
  { speech: "Nie osiem, siedem powtórzeń", intent: "set", proposal: { reps: 7 } },
  { speech: "W ostatniej serii było siedem, nie osiem", intent: "set", proposal: { reps: 7 } },
  { speech: "Zero kilogramów, osiem powtórzeń", intent: "set", proposal: { reps: 8, kg: 0 } },
  { speech: "Dziś tylko trzy powtórzenia", intent: "set", proposal: { reps: 3 } },
  { speech: "Sto dwadzieścia pięć kilogramów", intent: "set", proposal: { kg: 125 } },
  { speech: "Szum zagłusza liczby, wynik jest nieczytelny", intent: "set", proposal: { intent: "clarify", question: "Powtórz wynik." } },
  { speech: "Rozmowy w tle, bez czytelnego wyniku", intent: "set", proposal: { intent: "clarify", question: "Powtórz wynik." } },
  { speech: "Dopisz do treningu: dzisiaj słabszy chwyt", intent: "comment", proposal: { comment: "Dzisiaj słabszy chwyt" } },
  { speech: "Komentarz: bolało prawe ramię", intent: "comment", proposal: { comment: "Bolało prawe ramię" } },
  { speech: "Dopisz uwagę: dłuższe przerwy", intent: "comment", proposal: { comment: "Dłuższe przerwy" } },
  { speech: "Zrobiłem jeszcze podciąganie trzy serie po osiem", intent: "exercise", proposal: { name: "Podciąganie", series: 3, reps: 8 } },
  { speech: "Dodatkowo wykroki dwie serie po dziesięć", intent: "exercise", proposal: { name: "Wykroki", series: 2, reps: 10 } },
  { speech: "Pompki cztery serie po dwanaście bez ciężaru", intent: "exercise", proposal: { name: "Pompki", series: 4, reps: 12 } },
  { speech: "Wiosłowanie trzy razy osiem po czterdzieści kilogramów", intent: "exercise", proposal: { name: "Wiosłowanie", series: 3, reps: 8, kg: 40 } },
  { speech: "Szum i urwane słowo: podcią...", intent: "exercise", proposal: { intent: "clarify", question: "Podaj ćwiczenie i serie." } },
  { speech: "Dodaj trzy serie po osiem", intent: "exercise", proposal: { intent: "clarify", question: "Które ćwiczenie?" } },
  { speech: "Osiemdziesiąt", intent: "set", proposal: { intent: "clarify", question: "Podaj jednostkę." } },
];
