import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, DemoNotice } from "@/components/app-shell";
import { TrainingPreview } from "@/components/training-preview";
import { getDemoDay } from "@/lib/demo-plan";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getWorkout } from "@/lib/workouts/repository";
import { historyReturnHref } from "@/lib/workouts/presentation";
import styles from "@/components/plan-workout.module.css";
import editorStyles from "@/components/workout-editor.module.css";
import { Icon } from "@/components/ui";
import { WorkoutEditor } from "@/components/workout-editor";

export default async function TrainingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ historyMonth?: string | string[]; historyDay?: string | string[] }> }) {
  const { id } = await params;
  const { historyMonth, historyDay } = await searchParams;
  const returnHref = historyReturnHref(historyMonth, historyDay);
  if (getSupabaseConfig()) {
    const loaded = await getWorkout(id);
    if (!loaded) notFound();
    return <AppShell section="Trening"><div className={`${styles.workoutPage} ${editorStyles.page}`}><Link className="back-link workout-history-back" href={returnHref}>← Historia treningów</Link><WorkoutEditor key={loaded.workout.id} loaded={loaded} /></div></AppShell>;
  }
  const day = getDemoDay(id);
  if (!day) notFound();
  return <AppShell section="Trening"><div className={styles.surface}><Link className={styles.back} href={`/plany/${day.id}`}><Icon name="arrowLeft" size={18} />Wróć do planu</Link><DemoNotice /><TrainingPreview day={day} /></div></AppShell>;
}
