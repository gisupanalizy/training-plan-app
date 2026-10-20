import type { ReactNode } from "react";
import styles from "./ui.module.css";

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className={styles.empty}>
      <span className={styles.emptyIcon} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </section>
  );
}
