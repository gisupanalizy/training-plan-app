import type { ReactNode } from "react";
import { Icon, type IconName } from "./icon";
import styles from "./ui.module.css";

const tones = {
  info: { icon: "info", className: styles.noticeInfo, role: "status" },
  success: { icon: "check", className: styles.noticeSuccess, role: "status" },
  warning: { icon: "warning", className: styles.noticeWarning, role: "alert" },
  danger: { icon: "close", className: styles.noticeDanger, role: "alert" },
} as const satisfies Record<string, { icon: IconName; className: string; role: "status" | "alert" }>;

export function Notice({ tone = "info", title, children }: { tone?: keyof typeof tones; title: string; children: ReactNode }) {
  const variant = tones[tone];
  return (
    <div className={`${styles.notice} ${variant.className}`} role={variant.role}>
      <Icon name={variant.icon} size={18} />
      <span><strong>{title}</strong><p>{children}</p></span>
    </div>
  );
}
