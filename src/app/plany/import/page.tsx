import { Icon } from "@/components/ui";
import styles from "@/components/plan-authoring.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ImportWorkspace } from "@/components/import-workspace";
import { getSupabaseConfig } from "@/lib/supabase/config";

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const config = getSupabaseConfig();
  if (!config) notFound();
  const { id } = await searchParams;
  return <AppShell section="Plany"><div className={styles.importSurface}><Link className={styles.back} href="/plany"><Icon name="arrowLeft" size={18} />Wróć do planów</Link>
    <div className={styles.heading}><div><h1>Import planu</h1>
      <p>Plik i zdjęcie prowadzą import. Tekst, głos i ręczny edytor są obok, a plan powstaje dopiero po korekcie.</p></div></div>
    <ImportWorkspace initialId={id ?? null} supabaseUrl={config.url} supabaseKey={config.key} />
  </div></AppShell>;
}
