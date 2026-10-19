import { Icon } from "@/components/ui";
import styles from "@/components/plan-authoring.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PlanEditor } from "@/components/plan-editor";
import { getPlanDocument, getOneRepMaxData } from "@/lib/plans/repository";
import { getSupabaseConfig } from "@/lib/supabase/config";

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ plan?: string; voice?: string }> }) {
  if (!getSupabaseConfig()) notFound();
  const { plan: planId, voice } = await searchParams;
  const existing = planId ? await getPlanDocument(planId) : null;
  if (planId && !existing) notFound();
  const { exercises } = await getOneRepMaxData();
  return <AppShell section="Plany"><div className={styles.surface}><Link className={styles.back} href={planId ? `/plany/${planId}` : "/plany"}><Icon name="arrowLeft" size={18} />Wróć do planów</Link>
    <div className={styles.heading}><div><h1>{existing ? "Edytuj plan" : "Nowy plan"}</h1>
      <p>{existing ? `Edycja opublikuje wersję ${existing.version.version_number + 1}. Poprzednia pozostanie w historii.` : "Utwórz dni A/B i dodaj własne ćwiczenia."}</p></div></div>
    <PlanEditor initialVoice={voice === "1"} initial={existing?.document} planId={planId ?? null} expectedVersionId={existing?.version.id ?? null} catalog={exercises} />
  </div></AppShell>;
}
