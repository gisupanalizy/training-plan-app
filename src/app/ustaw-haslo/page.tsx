import { setPassword } from "./actions";
import { AccountForm } from "@/components/account-form";
import { Icon } from "@/components/ui/icon";
import styles from "@/components/account.module.css";

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ blad?: string }> }) {
  const { blad } = await searchParams;
  return <main className={styles.auth}><div className={styles.authInner}>
    <header className={styles.intro}><Icon name="profile" /><h1>Ustaw hasło</h1><p>Zaproszenie zostało potwierdzone. Ustaw hasło do kolejnych logowań.</p></header>
    <section className={styles.panel} aria-label="Ustawienie hasła"><AccountForm action={setPassword} submitLabel="Zapisz hasło" pendingLabel="Zapisywanie…" error={blad ? blad === "dlugosc" ? "Hasło musi mieć co najmniej 12 znaków." : "Nie udało się zapisać hasła." : undefined}>
      <label>Nowe hasło<input name="password" type="password" autoComplete="new-password" minLength={12} required aria-describedby="password-hint" /></label>
      <p id="password-hint" className={styles.hint}>Co najmniej 12 znaków.</p>
    </AccountForm></section>
  </div></main>;
}
