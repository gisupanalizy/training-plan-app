import { AppShell, DemoNotice } from "@/components/app-shell";
import { HistoryCalendar } from "@/components/history/history-calendar";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getHistoryCalendarData } from "@/lib/workouts/calendar-data";
import { projectWorkoutTime } from "@/lib/workouts/time";

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ month?: string | string[]; day?: string | string[] }> }) {
  const query = await searchParams;
  const configured = Boolean(getSupabaseConfig());
  const data = configured ? await getHistoryCalendarData() : { completed: [], active: [], today: projectWorkoutTime({ performed_on: "", performed_at: new Date().toISOString() }, "Europe/Warsaw").performedOn, timeZone: "Europe/Warsaw" };
  return <AppShell section="Historia">{!configured && <DemoNotice />}<HistoryCalendar {...data} initialMonth={query.month} initialDay={query.day} /></AppShell>;
}
