"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import styles from "./account.module.css";

export const passwordDraftKey = "forma-new-password-draft";

function rememberPassword(password: string) {
  try { sessionStorage.setItem(passwordDraftKey, password); } catch { /* storage niedostępny */ }
}

function takePasswordDraft() {
  try {
    const value = sessionStorage.getItem(passwordDraftKey);
    sessionStorage.removeItem(passwordDraftKey);
    return value;
  } catch {
    return null;
  }
}

/** Kasuje szkic hasła po udanym przejściu albo powrocie do logowania. Nie wyświetla wartości. */
export function PasswordDraftCleaner() {
  useEffect(() => { takePasswordDraft(); }, []);
  return null;
}

function Submit({ locked, label, pendingLabel, variant = "primary" }: {
  locked: boolean; label: string; pendingLabel: string; variant?: "primary" | "danger";
}) {
  const { pending } = useFormStatus();
  const busy = pending || locked;
  return <Button type="submit" variant={variant} className={styles.submit} disabled={busy} aria-busy={busy}>{busy ? pendingLabel : label}</Button>;
}

/** Natywny POST logowania i istniejące server actions zachowują własne kontrakty. */
export function AccountForm({ action, children, submitLabel, pendingLabel, error, variant = "primary" }: {
  action: string | ((data: FormData) => void | Promise<void>); children?: ReactNode;
  submitLabel: string; pendingLabel: string; error?: string; variant?: "primary" | "danger";
}) {
  const [navigating, setNavigating] = useState(false);
  const alert = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (error) alert.current?.focus(); }, [error]);
  return <form action={action} method={typeof action === "string" ? "post" : undefined} className={styles.form}
    onSubmit={(event) => { if (navigating) { event.preventDefault(); return; } if (typeof action === "string") setNavigating(true); }}>
    {error && <p id="account-error" ref={alert} tabIndex={-1} role="alert" className={styles.error}>{error}</p>}
    {children}<Submit locked={navigating} label={submitLabel} pendingLabel={pendingLabel} variant={variant} />
  </form>;
}

export function PasswordForm({ action, errorCode }: {
  action: (data: FormData) => void | Promise<void>; errorCode?: string;
}) {
  const [password, setPassword] = useState("");
  const [clientShort, setClientShort] = useState(false);
  const [hideServer, setHideServer] = useState(false);
  const [locked, setLocked] = useState(false);
  const lock = useRef(false);
  const alert = useRef<HTMLParagraphElement>(null);
  const tooShort = clientShort || (!hideServer && errorCode === "dlugosc");
  const saveError = !tooShort && !hideServer && errorCode === "zapis";
  const message = tooShort
    ? "Hasło musi mieć co najmniej 12 znaków."
    : saveError
      ? "Nie udało się zapisać hasła. Wpisane hasło zostało zachowane. Spróbuj ponownie."
      : undefined;

  useEffect(() => {
    const draft = takePasswordDraft();
    if (draft && errorCode) setPassword(draft);
  }, [errorCode]);
  useEffect(() => { if (message) alert.current?.focus(); }, [message]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (lock.current) { event.preventDefault(); return; }
    if (password.length < 12) {
      event.preventDefault();
      setClientShort(true);
      setHideServer(false);
      return;
    }
    lock.current = true;
    setLocked(true);
    rememberPassword(password);
  }

  return <form action={action} className={styles.form} noValidate onSubmit={onSubmit}>
    {message && <p id="new-password-error" ref={alert} tabIndex={-1} role="alert" className={tooShort ? styles.fieldError : styles.error}>{message}</p>}
    <Field id="new-password" label="Nowe hasło" name="password" type="password" autoComplete="new-password" minLength={12} required value={password}
      onChange={(event) => { setPassword(event.target.value); setClientShort(false); setHideServer(true); }}
      hint="Co najmniej 12 znaków." aria-invalid={tooShort ? true : undefined} aria-describedby={message ? "new-password-error" : undefined} />
    <Submit locked={locked} label="Zapisz hasło" pendingLabel="Zapisywanie…" />
  </form>;
}
