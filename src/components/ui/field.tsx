"use client";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import styles from "./ui.module.css";

export function Field({ label, hint, error, id, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; hint?: ReactNode; error?: ReactNode }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = [props["aria-describedby"], hint && `${inputId}-hint`, error && `${inputId}-error`].filter(Boolean).join(" ") || undefined;
  return <div className={`${styles.field} ${className}`}><label htmlFor={inputId}>{label}</label><input {...props} id={inputId} aria-describedby={describedBy} aria-invalid={error ? true : props["aria-invalid"]} />{hint && <small id={`${inputId}-hint`}>{hint}</small>}{error && <small id={`${inputId}-error`} className={styles.error} role="alert">{error}</small>}</div>;
}
