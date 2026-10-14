import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PlanEditor } from "@/components/plan-editor";
import { getPlanDocument, getOneRepMaxData } from "@/lib/plans/repository";
import { getSupabaseConfig } from "@/lib/supabase/config";

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  if (!getSupabaseConfig()) notFound();
  const { plan: planId } = await searchParams;
  const existing = planId ? await getPlanDocument(planId) : null;
  if (planId && !existing) notFound();
  const { exercises } = await getOneRepMaxData();
  return <AppShell section="Plany"><Link className="back-link" href={planId ? `/plany/${planId}` : "/plany"}>← Wróć do planów</Link>
    <div className="eyebrow">PRYWATNY PLAN / EDYTOR</div><div className="page-heading"><div><h1>{existing ? "Edytuj plan" : "Nowy plan"}<span className="accent">.</span></h1>
      <p>{existing ? `Edycja opublikuje wersję ${existing.version.version_number + 1}. Poprzednia pozostanie w historii.` : "Utwórz dni A/B i dodaj własne ćwiczenia."}</p></div></div>
    <PlanEditor initial={existing?.document} planId={planId ?? null} expectedVersionId={existing?.version.id ?? null} catalog={exercises} />
  </AppShell>;
}
