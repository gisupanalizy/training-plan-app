import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./icon";
import { StatusBadge } from "./status-badge";
import styles from "./ui.module.css";

export function ListRow({ title, meta, code, badge, href, onSelect }: {
  title: string;
  meta?: ReactNode;
  code?: string;
  badge?: string;
  href?: string;
  onSelect?: () => void;
}) {
  const body = <>
    {code && <span className={styles.rowCode}>{code}</span>}
    <span className={styles.listMain}><strong>{title}</strong>{meta && <small>{meta}</small>}</span>
    {badge ? <StatusBadge>{badge}</StatusBadge> : <Icon name="chevronRight" size={18} />}
  </>;
  if (href) return <Link href={href} className={styles.listRow}>{body}</Link>;
  return <button type="button" className={styles.listRow} onClick={onSelect}>{body}</button>;
}
