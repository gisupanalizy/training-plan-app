export const formatRange = (minimum: number | null | undefined, maximum?: number | null) => minimum == null ? "—" : maximum != null && maximum !== minimum ? `${minimum}–${maximum}` : String(minimum);
export const setKindLabel: Record<string, string> = { work: "robocza", warmup: "rozgrzewkowa", ramp: "rampa", backoff: "back-off", drop: "drop" };
