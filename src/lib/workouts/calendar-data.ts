import { createClient } from "@/lib/supabase/server";
import { getWorkoutList } from "./repository";
import { historyCalendarData } from "./calendar";
import { projectWorkoutTime } from "./time";

export async function getHistoryCalendarData() {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Sesja wygasła.");
  const { data: profile, error } = await client.from("profiles").select("time_zone").eq("id", auth.user.id).single();
  if (error) throw error;
  const timeZone = profile.time_zone;
  const rows = await getWorkoutList();
  const today = projectWorkoutTime({ performed_on: "", performed_at: new Date().toISOString() }, timeZone).performedOn;
  return { ...historyCalendarData(rows, timeZone), timeZone, today };
}
