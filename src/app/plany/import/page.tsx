import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ImportWorkspace } from "@/components/import-workspace";
import { getSupabaseConfig } from "@/lib/supabase/config";

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const config = getSupabaseConfig();
  if (!config) notFound();
  const { id } = await searchParams;
  return <AppShell section="Plany"><Link className="back-link" href="/plany">← Wróć do planów</Link>
    <div className="eyebrow">PRYWATNY PLAN / IMPORT</div><div className="page-heading"><div><h1>Import planu<span className="accent">.</span></h1>
      <p>Wybierz źródło, popraw szkic i zatwierdź go świadomie.</p></div></div>
    <ImportWorkspace initialId={id ?? null} supabaseUrl={config.url} supabaseKey={config.key} />
  </AppShell>;
}
