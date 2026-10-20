"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./button";
import { Icon } from "./icon";
import styles from "./ui.module.css";

const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({ open, title, children, onDismiss, onConfirm, confirmLabel = "Zastosuj", dismissLabel = "Anuluj", tone = "default" }: {
  open: boolean;
  title: string;
  children?: ReactNode;
  onDismiss: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  dismissLabel?: string;
  tone?: "default" | "danger";
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (typeof dialog.showModal !== "function") {
      dialog.showModal = () => { dialog.setAttribute("open", ""); };
      dialog.close = () => { dialog.removeAttribute("open"); };
    }
    if (!dialog.open) dialog.showModal();
    dialog.querySelector<HTMLElement>("[data-dialog-title]")?.focus();
    const onCancel = (event: Event) => { event.preventDefault(); dismiss.current(); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); dismiss.current(); return; }
      if (event.key !== "Tab") return;
      const items = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)];
      if (!items.length) { event.preventDefault(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const heading = dialog.querySelector("[data-dialog-title]");
      if (event.shiftKey && (active === first || active === heading || !dialog.contains(active))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (active === last || !dialog.contains(active))) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener("cancel", onCancel);
    document.addEventListener("keydown", onKey);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      document.removeEventListener("keydown", onKey);
      if (dialog.open && typeof dialog.close === "function") dialog.close();
      opener.current?.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <dialog ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header className={styles.dialogHeader}>
        <h2 id={titleId} tabIndex={-1} data-dialog-title>{title}</h2>
        <button type="button" className={styles.dialogClose} aria-label="Zamknij" onClick={() => onDismiss()}><Icon name="close" /></button>
      </header>
      <div className={styles.dialogBody}>{children}</div>
      <footer className={styles.dialogFooter}>
        <Button variant="ghost" onClick={() => onDismiss()}>{dismissLabel}</Button>
        {onConfirm && <Button variant={tone === "danger" ? "danger" : "primary"} onClick={() => onConfirm()}>{confirmLabel}</Button>}
      </footer>
    </dialog>
  );
}
