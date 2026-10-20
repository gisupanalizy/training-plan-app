import type { ReactNode } from "react";
import styles from "./ui.module.css";

const tones = {
  neutral: styles.badge,
  success: `${styles.badge} ${styles.badgeSuccess}`,
  warning: `${styles.badge} ${styles.badgeWarning}`,
  danger: `${styles.badge} ${styles.badgeDanger}`,
} as const;

export function StatusBadge({ tone = "neutral", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={tones[tone]}>{children}</span>;
}
