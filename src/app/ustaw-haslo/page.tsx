import Link from "next/link";
import { setPassword } from "./actions";
import { PasswordForm } from "@/components/account-form";
import styles from "@/components/account.module.css";

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ blad?: string }> }) {
  const { blad } = await searchParams;
  return <main className={styles.auth}><div className={styles.authInner}>
    <p className={styles.mark}>forma<span>.</span></p>
    <header className={styles.heading}>
      <p className={styles.eyebrow}>Zaproszenie</p>
      <h1>Ustaw hasło</h1>
      <p className={styles.lede}>Hasło musi mieć co najmniej 12 znaków.</p>
    </header>
    <section aria-label="Ustawienie hasła"><PasswordForm action={setPassword} errorCode={blad} /></section>
    <Link className={styles.ghostLink} href="/logowanie">Wróć do logowania</Link>
  </div></main>;
}
