import { getSupabaseConfig } from "@/lib/supabase/config";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ powod?: string; blad?: string }> }) {
  const configured = Boolean(getSupabaseConfig());
  const { powod, blad } = await searchParams;
  return <main className="auth-page"><section className="auth-card">
    <div className="eyebrow">FORMA / KONTO TESTERA</div>
    <h1>Logowanie<span className="accent">.</span></h1>
    {!configured ? <p>Logowanie jest dostępne po połączeniu z prywatnym środowiskiem Supabase. Teraz działa lokalny prototyp demonstracyjny.</p> : <>
      <p>Wejdź na konto otrzymane w zaproszeniu. Dostęp mają tylko dodani testerzy.</p>
      {powod === "sesja" && <p role="status" className="auth-message">Sesja wygasła lub jest nieprawidłowa. Zaloguj się ponownie.</p>}
      {powod === "wylogowano" && <p role="status" className="auth-message">Wylogowano.</p>}
      {blad && <p role="alert" className="auth-error">{blad === "profil" ? "Nie udało się przygotować prywatnego profilu. Spróbuj ponownie." : "Nie udało się zalogować. Sprawdź dane lub zaproszenie."}</p>}
      <form action="/auth/login" method="post" className="auth-form">
        <label>Adres e-mail<input name="email" type="email" autoComplete="email" required /></label>
        <label>Hasło<input name="password" type="password" autoComplete="current-password" required /></label>
        <button className="button button-dark" type="submit">Zaloguj się</button>
      </form>
    </>}
  </section></main>;
}
