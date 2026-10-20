import Link from "next/link";
import { AppShell, DemoNotice } from "@/components/app-shell";
import { AccountForm, PasswordDraftCleaner } from "@/components/account-form";
import { OneRepMaxEditor, RealMaximumIntro } from "@/components/one-rep-max-editor";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { getOneRepMaxData } from "@/lib/plans/repository";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/logowanie/actions";
import styles from "@/components/account.module.css";

function polishDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${Number(day)}.${month}.${year}`;
}

function Identity({ title, detail }: { title: string; detail: string }) {
  return <section className={styles.identity} aria-label="Twoje konto"><span className={styles.identityIcon}><Icon name="profile" /></span><div><h2>{title}</h2><p>{detail}</p></div></section>;
}

export default async function ProfilePage() {
  const configured = Boolean(getSupabaseConfig());
  const user = configured ? (await (await createClient()).auth.getUser()).data.user : null;
  const data = configured ? await getOneRepMaxData() : null;
  const number = (value: number) => new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 }).format(value);
  return <AppShell section="Profil"><div className={styles.page}>
    <PasswordDraftCleaner />
    <header className={styles.heading}><p className={styles.eyebrow}>Ustawienia</p><h1>Profil</h1></header>
    {!configured && <DemoNotice />}
    <Identity title={configured ? "Twoje konto" : "Konto demonstracyjne"} detail={configured ? user?.email ?? "Tester" : "Dane syntetyczne · brak zapisu"} />
    {configured && data ? <>
      <OneRepMaxEditor exercises={data.exercises} increment={data.profile.rounding_increment_kg} timeZone={data.profile.time_zone} />
      <section className={styles.history} aria-label="Historia 1RM"><h2>Historia 1RM</h2>
        {data.records.length ? <ul className={styles.records}>{data.records.map((record) => { const exercise = data.exercises.find((item) => item.id === record.exerciseId); return <li key={record.id}><div><strong>{exercise?.name ?? "Ćwiczenie"}{exercise?.variant ? ` · ${exercise.variant}` : ""}</strong><time dateTime={record.effectiveOn}>Obowiązuje od {polishDate(record.effectiveOn)}</time>{record.note && <span>{record.note}</span>}</div><b>{number(record.valueKg)} kg</b></li>; })}</ul> : <EmptyState title="Brak zapisanych maksimów">Dodaj pierwszy rzeczywisty pomiar powyżej.</EmptyState>}
      </section>
      <div className={styles.signout}><AccountForm action={signOut} variant="danger" submitLabel="Wyloguj się" pendingLabel="Wylogowywanie…" /></div>
    </> : <>
      <RealMaximumIntro />
      <fieldset className={styles.demoFields} disabled>
        <label className={styles.field}>Ćwiczenie<select><option>Brak katalogu w podglądzie</option></select></label>
        <div className={styles.pair}>
          <Field label="Ciężar (kg)" value="" readOnly />
          <Field label="Obowiązuje od" type="date" value="" readOnly />
        </div>
        <Button type="button" className={styles.submit} disabled>Zapisz zmierzone 1RM</Button>
      </fieldset>
      <p className={styles.hint}>Krok obciążenia i strefa czasowa pojawią się na prywatnym koncie. Ten podgląd niczego nie zapisuje.</p>
      <EmptyState title="Brak zapisanych maksimów" action={<Link className={styles.primaryLink} href="/plany">Przejdź do przykładu</Link>}>Konto demonstracyjne nie zapisuje danych.</EmptyState>
    </>}
  </div></AppShell>;
}
