"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import styles from "./account.module.css";

function Submit({ navigating, label, pendingLabel }: { navigating: boolean; label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending || navigating} aria-busy={pending || navigating}>{pending || navigating ? pendingLabel : label}</Button>;
}
/** Natywny POST logowania i istniejące server actions zachowują własne kontrakty. */
export function AccountForm({ action, children, submitLabel, pendingLabel, error }: {
  action: string | ((data: FormData) => void | Promise<void>); children?: ReactNode;
  submitLabel: string; pendingLabel: string; error?: string;
}) {
  const [navigating, setNavigating] = useState(false);
  const alert = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (error) alert.current?.focus(); }, [error]);
  return <form action={action} method={typeof action === "string" ? "post" : undefined} className={styles.form}
    onSubmit={(event) => { if (navigating) { event.preventDefault(); return; } if (typeof action === "string") setNavigating(true); }}>
    {error && <p ref={alert} tabIndex={-1} role="alert" className={styles.error}>{error}</p>}
    {children}<Submit navigating={navigating} label={submitLabel} pendingLabel={pendingLabel} />
  </form>;
}
