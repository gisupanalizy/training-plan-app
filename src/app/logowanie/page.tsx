import Link from "next/link";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { AccountForm } from "@/components/account-form";
import { Icon } from "@/components/ui/icon";
import styles from "@/components/account.module.css";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ powod?: string; blad?: string }> }) {
  const configured = Boolean(getSupabaseConfig());
  const { powod, blad } = await searchParams;
  const error = blad ? blad === "profil" ? "Nie udało się przygotować prywatnego profilu. Spróbuj ponownie." : "Nie udało się zalogować. Sprawdź dane lub zaproszenie." : undefined;
  return <main className={styles.auth}><div className={styles.authInner}>
    <header className={styles.intro}><Icon name="training" /><h1>Twoja Forma</h1><p>Zaloguj się do prywatnej przestrzeni treningowej.</p></header>
    <section className={styles.panel} aria-label="Logowanie">
      {!configured ? <><p>Logowanie jest dostępne po połączeniu z prywatnym środowiskiem. Teraz możesz obejrzeć dane demonstracyjne.</p><Link className="button button-dark" href="/plany">Zobacz przykładowy plan</Link></> : <>
        {powod === "sesja" && <p role="status" className={styles.message}>Sesja wygasła lub jest nieprawidłowa. Zaloguj się ponownie.</p>}
        {powod === "wylogowano" && <p role="status" className={styles.message}>Wylogowano.</p>}
        <AccountForm action="/auth/login" submitLabel="Zaloguj się" pendingLabel="Logowanie…" error={error}>
          <label>Adres e-mail<input name="email" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} required /></label>
          <label>Hasło<input name="password" type="password" autoComplete="current-password" required /></label>
        </AccountForm>
      </>}
    </section>
    <details className={styles.help}><summary>Kto może korzystać?</summary><p>Zaproszeni testerzy na osobnych, prywatnych kontach. Dostęp otrzymujesz od właściciela aplikacji.</p></details>
  </div></main>;
}
