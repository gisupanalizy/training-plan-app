import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, DemoNotice } from "@/components/app-shell";
import { TrainingPreview } from "@/components/training-preview";
import { getDemoDay } from "@/lib/demo-plan";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getWorkout } from "@/lib/workouts/repository";
import { WorkoutEditor } from "@/components/workout-editor";

export default async function TrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (getSupabaseConfig()) {
    const loaded = await getWorkout(id);
    if (!loaded) notFound();
    return <AppShell section="Trening"><Link className="back-link workout-history-back" href="/historia">← Historia treningów</Link><WorkoutEditor key={loaded.workout.id} loaded={loaded} /></AppShell>;
  }
  const day = getDemoDay(id);
  if (!day) notFound();
  return <AppShell section="Trening"><Link className="back-link" href={`/plany/${day.id}`}>← Wróć do planu</Link><div className="eyebrow">PODGLĄD TRENINGU / {day.label.toUpperCase()}</div><div className="page-heading"><div><h1>{day.label}<span className="accent">.</span> {day.title}</h1><p>{day.focus}</p></div><span className="outline-tag">PODGLĄD</span></div><DemoNotice /><TrainingPreview day={day} /></AppShell>;
}
