import Link from "next/link";
import { AppShell, DemoNotice } from "@/components/app-shell";
import { OneRepMaxEditor } from "@/components/one-rep-max-editor";
import { getOneRepMaxData } from "@/lib/plans/repository";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/logowanie/actions";

export default async function ProfilePage() {
  const configured = Boolean(getSupabaseConfig());
  const user = configured ? (await (await createClient()).auth.getUser()).data.user : null;
  const data = configured ? await getOneRepMaxData() : null;
  return <AppShell section="Profil"><div className="eyebrow">TWOJA PRZESTRZEŃ / PROFIL</div><div className="page-heading"><div><h1>Profil<span className="accent">.</span></h1><p>{configured ? "Twoje rzeczywiste maksima i ustawienia obciążenia." : "Przykładowe ustawienia wyłącznie do podglądu."}</p></div></div>
    {!configured && <DemoNotice />}
    <div className="profile-card"><span className="profile-avatar">{configured ? "T" : "D"}</span><div><div className="eyebrow">{configured ? "KONTO TESTERA" : "KONTO DEMONSTRACYJNE"}</div><h2>{configured ? (user?.email ?? "Tester") : "Użytkownik Demo"}</h2><p>{configured ? "Prywatne konto. Maksima są dostępne tylko dla Ciebie." : "Bez logowania i prywatnych danych."}</p></div></div>
    {configured && <form action={signOut} className="profile-signout"><button className="button button-dark" type="submit">Wyloguj się</button></form>}
    {configured && data ? <><div className="section-heading"><div><div className="eyebrow">RZECZYWISTE MAKSIMA</div><h2>Historia 1RM</h2></div></div>
      <OneRepMaxEditor exercises={data.exercises} increment={data.profile.rounding_increment_kg} />
      {data.records.length ? <div className="detail-list max-list">{data.records.map((record) => { const exercise = data.exercises.find((item) => item.id === record.exerciseId); return <div key={record.id}><span>{exercise?.name ?? "Ćwiczenie"}{exercise?.variant ? ` · ${exercise.variant}` : ""}<small>Obowiązuje od {record.effectiveOn}{record.note ? ` · ${record.note}` : ""}</small></span><strong>{record.valueKg} kg</strong></div>; })}</div> : <p className="small-muted">Nie ma jeszcze zapisanego 1RM. Plany z procentami można tworzyć bez niego.</p>}
      <p className="small-muted">Wartości historyczne pozostają zapisane. Zmiana 1RM nie przelicza wcześniejszych treningów.</p></> : <><div className="section-heading"><div><div className="eyebrow">PRZYKŁADOWE DANE</div><h2>Ustawienia treningowe</h2></div></div><div className="detail-list"><div><span>Przykładowy 1RM · przysiad</span><strong>120 kg</strong></div><div><span>Jednostka obciążenia</span><strong>kg</strong></div></div><p className="small-muted">Wartości są syntetyczne. <Link href="/plany">Zobacz przykładowy plan</Link>.</p></>}
  </AppShell>;
}
