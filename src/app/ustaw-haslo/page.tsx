import { setPassword } from "./actions";

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ blad?: string }> }) {
  const { blad } = await searchParams;
  return <main className="auth-page"><section className="auth-card">
    <div className="eyebrow">FORMA / KONTO TESTERA</div><h1>Ustaw hasło<span className="accent">.</span></h1>
    <p>Zaproszenie zostało potwierdzone. Ustaw hasło do kolejnych logowań.</p>
    {blad && <p role="alert" className="auth-error">{blad === "dlugosc" ? "Hasło musi mieć co najmniej 12 znaków." : "Nie udało się zapisać hasła."}</p>}
    <form action={setPassword} className="auth-form"><label>Nowe hasło<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label><button className="button button-dark" type="submit">Zapisz hasło</button></form>
  </section></main>;
}
