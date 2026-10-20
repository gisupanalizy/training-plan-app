import type { ReactNode } from "react";
import styles from "./ui.module.css";

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return <section className={styles.card}>{title && <h3>{title}</h3>}{children}</section>;
}
