import Link from "next/link";
import { AppShell, DemoNotice } from "@/components/app-shell";
import { OneRepMaxEditor } from "@/components/one-rep-max-editor";
import { AccountForm } from "@/components/account-form";
import { Icon } from "@/components/ui/icon";
import { getOneRepMaxData } from "@/lib/plans/repository";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/logowanie/actions";
import styles from "@/components/account.module.css";

export default async function ProfilePage() {
  const configured = Boolean(getSupabaseConfig());
  const user = configured ? (await (await createClient()).auth.getUser()).data.user : null;
  const data = configured ? await getOneRepMaxData() : null;
  const number = (value: number) => new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 }).format(value);
  return <AppShell section="Profil"><div className={styles.profile}>
    <header className={styles.heading}><h1>Profil</h1><p>Prywatne ustawienia treningowe</p></header>
    {!configured && <DemoNotice />}
    <section className={styles.identity} aria-label="Twoje konto"><Icon name="profile" /><div><h2>{configured ? "Twoje konto" : "Konto demonstracyjne"}</h2><p>{configured ? user?.email ?? "Tester" : "Dane syntetyczne"}</p></div></section>
    {configured && data ? <>
      <OneRepMaxEditor exercises={data.exercises} increment={data.profile.rounding_increment_kg} />
      <div className={styles.setting}><span>Strefa czasowa konta</span><strong>{data.profile.time_zone}</strong></div>
      <p className={styles.hint}>Rzeczywiste 1RM służy do procentowych celów planu. Wpis nie tworzy treningu i nie przelicza jego wcześniejszych celów. Szacowany 1RM w Postępie jest osobną analizą wyników.</p>
      <section className={styles.section} aria-label="Historia 1RM"><h2>Historia 1RM</h2>
        {data.records.length ? <ul className={styles.records}>{data.records.map((record) => { const exercise = data.exercises.find((item) => item.id === record.exerciseId); return <li key={record.id}><div><strong>{exercise?.name ?? "Ćwiczenie"}{exercise?.variant ? ` · ${exercise.variant}` : ""}</strong><time dateTime={record.effectiveOn}>Obowiązuje od {record.effectiveOn}</time>{record.note && <span>{record.note}</span>}</div><b>{number(record.valueKg)} kg</b></li>; })}</ul> : <p className={styles.hint}>Nie ma jeszcze zapisanego 1RM. Plan z procentami może działać bez niego — kilogramy pozostają wtedy nieznane.</p>}
      </section>
    </> : <section className={styles.section}><h2>Rzeczywiste maksima i ustawienia</h2><p className={styles.hint}>Na prywatnym koncie zapiszesz zmierzone 1RM z datą oraz krok zaokrąglania obciążenia. W tym podglądzie niczego nie zapisujemy.</p><Link className="button button-outline" href="/plany">Zobacz przykładowy plan</Link></section>}
    {configured && <div className={styles.signout}><AccountForm action={signOut} submitLabel="Wyloguj się" pendingLabel="Wylogowywanie…" /></div>}
  </div></AppShell>;
}
