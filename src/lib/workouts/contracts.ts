/** Stare pola i payloady T05 pozostają obsługiwane; pola czasu są addytywne. */
export interface WorkoutRow {
  id: string; plan_version_id: string | null; plan_session_id: string | null;
  performed_on: string; status: string; revision: number; comment: string | null;
  created_at: string; completed_at: string | null;
  name?: string; started_at?: string | null; performed_at?: string | null;
  performed_time_zone?: string | null; snapshot_on?: string; stored_performed_on?: string;
  time_zone?: string; time_known?: boolean;
}
type NumericTarget = "target_reps_min_snapshot" | "target_reps_max_snapshot" | "target_kg_snapshot" |
  "target_kg_max_snapshot" | "target_percent_snapshot" | "one_rep_max_kg_snapshot" | "raw_target_kg_snapshot" |
  "rounded_target_kg_snapshot" | "rounding_increment_kg_snapshot" | "target_duration_seconds_snapshot" |
  "target_duration_seconds_max_snapshot" | "target_distance_meters_snapshot" | "target_rest_seconds_snapshot" |
  "target_rest_seconds_max_snapshot" | "target_rpe_snapshot" | "target_rir_snapshot" |
  "actual_reps" | "actual_kg" | "actual_duration_seconds" | "actual_distance_meters" | "actual_rpe" | "actual_rir";
export type WorkoutSet = Record<NumericTarget, number | null> & {
  id: string; performed_exercise_id: string; position: number; source_kind: string; status: string;
  target_optional_snapshot: boolean; target_amrap_snapshot: boolean;
  target_kind_snapshot: string | null; target_load_type_snapshot: string | null;
  one_rep_max_record_id: string | null; target_tempo_snapshot: string | null;
  target_note_snapshot: string | null; actual_note: string | null;
  [key: string]: unknown;
};
export interface WorkoutExercise {
  id: string; exercise_id: string; position: number; source_kind: string;
  target_name_snapshot: string; target_original_name_snapshot: string | null;
  target_note_snapshot: string | null; superset_group_snapshot: string | null;
  sets: WorkoutSet[]; previousResult: string | null;
  previousSet?: WorkoutSet | null;
}
export interface LoadedWorkout { workout: WorkoutRow; exercises: WorkoutExercise[] }
export interface WorkoutSummary {
  id: string; name: string; status: string; revision: number; performedOn: string;
  performedAt: string | null; timeZone: string; timeKnown: boolean;
}
