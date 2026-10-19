import { NextResponse } from "next/server";

export function workoutJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
export function workoutError(error: { code?: string; message: string; details?: string }) {
  const status = ["PT409", "40001", "23505"].includes(error.code ?? "") ? 409 :
    error.code === "PT410" ? 410 : error.code === "P0002" ? 404 : error.code === "28000" ? 401 : 400;
  const codes: Record<string, string> = {
    ACTIVE_WORKOUT_EXISTS: "Masz już aktywny trening. Wybierz dalsze działanie.",
    MULTIPLE_ACTIVE_WORKOUTS: "Masz kilka aktywnych treningów. Rozstrzygnij je pojedynczo.",
    OPERATION_PAYLOAD_CONFLICT: "Ta operacja została wysłana z inną treścią.",
    REVISION_CONFLICT: "Trening zmienił się. Odczytaj aktualny stan.",
    PLAN_VERSION_CHANGED: "Plan ma nową wersję. Wybierz aktualny trening.",
    WORKOUT_CLOSED: "Trening jest już zakończony.",
    TIME_ZONE_CHANGED: "Strefa profilu zmieniła się. Wybierz ponownie datę i godzinę.",
    INVALID_TIME: "Sprawdź datę, godzinę i offset strefy. Czas nie może być w przyszłości.",
    WORKOUT_DELETED: "Ten trening został trwale usunięty.",
  };
  const code = codes[error.message] ? error.message : status === 404 ? "WORKOUT_NOT_FOUND" :
    status === 409 ? "REVISION_CONFLICT" : status === 401 ? "UNAUTHENTICATED" : "INVALID_COMMAND";
  let activeWorkouts: unknown;
  if (["ACTIVE_WORKOUT_EXISTS", "MULTIPLE_ACTIVE_WORKOUTS"].includes(code)) {
    try { activeWorkouts = JSON.parse(error.details ?? "[]"); } catch { activeWorkouts = []; }
  }
  return workoutJson({ code, error: codes[code] ?? (status === 404 ? "Nie znaleziono własnego treningu lub elementu." :
    status === 401 ? "Sesja wygasła." : "Nie udało się zapisać. Sprawdź pola."),
    ...(activeWorkouts ? { activeWorkouts } : {}) }, status);
}
