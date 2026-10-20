import Link from "next/link";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { AccountForm, PasswordDraftCleaner } from "@/components/account-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import styles from "@/components/account.module.css";

function loginError(code?: string) {
  if (!code) return undefined;
  if (code === "profil") return "Nie udało się przygotować prywatnego profilu. Spróbuj ponownie.";
  if (code === "zaproszenie") return "Nie udało się potwierdzić zaproszenia. Poproś właściciela o nowe.";
  return "Sprawdź adres i hasło. Nie możemy potwierdzić danych logowania.";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ powod?: string; blad?: string }> }) {
  const configured = Boolean(getSupabaseConfig());
  const { powod, blad } = await searchParams;
  const error = loginError(blad);
  const credentialError = blad === "logowanie" || blad === "dane";
  return <main className={styles.auth}><div className={styles.authInner}>
    <PasswordDraftCleaner />
    <p className={styles.mark}>forma<span>.</span></p>
    <header className={styles.heading}>
      <p className={styles.eyebrow}>Prywatny dziennik treningowy</p>
      <h1>Twój plan. Twój rytm.</h1>
      <p className={styles.lede}>Plany, wyniki i postęp w jednym spokojnym miejscu.</p>
    </header>
    {!configured ? <EmptyState title="Tryb demonstracyjny" action={<Link className={styles.primaryLink} href="/plany">Przejdź do przykładu</Link>}>Logowanie nie jest skonfigurowane w tym środowisku. Zobacz wyłącznie dane przykładowe.</EmptyState> : <section className={styles.form} aria-label="Logowanie">
      {powod === "sesja" && <p role="status" className={`${styles.status} ${styles.statusWarning}`}><strong>Sesja wygasła</strong><span>Zaloguj się ponownie, aby wrócić do prywatnych danych.</span></p>}
      {powod === "wylogowano" && <p role="status" className={styles.status}><strong>Wylogowano</strong><span>Twoja prywatna sesja została zakończona.</span></p>}
      <AccountForm action="/auth/login" submitLabel="Zaloguj się" pendingLabel="Logowanie…" error={error}>
        <Field label="Adres e-mail" name="email" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} required aria-invalid={credentialError ? true : undefined} aria-describedby={credentialError ? "account-error" : undefined} />
        <Field label="Hasło" name="password" type="password" autoComplete="current-password" required aria-invalid={credentialError ? true : undefined} aria-describedby={credentialError ? "account-error" : undefined} />
        {credentialError && <p className={styles.privacy}>Dla prywatności używamy tego samego komunikatu niezależnie od istnienia konta.</p>}
      </AccountForm>
      <p className={styles.authNote}>Dostęp dla zaproszonych testerów. Dane kont są prywatne.</p>
    </section>}
  </div></main>;
}
