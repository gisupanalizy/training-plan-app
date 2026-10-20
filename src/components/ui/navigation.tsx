import Link from "next/link";
import { Icon, type IconName } from "./icon";

export const appNavigation = [
  { href: "/", label: "Trening", icon: "training" },
  { href: "/plany", label: "Plany", icon: "plans" },
  { href: "/historia", label: "Historia", icon: "history" },
  { href: "/postep", label: "Postęp", icon: "progress" },
  { href: "/profil", label: "Profil", icon: "profile" },
] as const satisfies readonly { href: string; label: string; icon: IconName }[];

export function BottomNav({ section }: { section: string }) {
  return (
    <nav className="mobile-nav" aria-label="Nawigacja główna">
      {appNavigation.map((item) => <Link key={item.href} href={item.href} aria-current={section === item.label ? "page" : undefined} className={section === item.label ? "active" : ""}><Icon name={item.icon} /><small>{item.label}</small></Link>)}
    </nav>
  );
}

export function Sidebar({ section, mode }: { section: string; mode: "private" | "demo" }) {
  const configured = mode === "private";
  return (
    <aside className="sidebar">
      <Link className="brand" href="/" aria-label="Forma — strona główna">
        <span className="brand-mark">F<span>.</span></span>
        <span className="brand-name">forma<span>.</span><small>TWÓJ PLAN, TWÓJ RYTM</small></span>
      </Link>
      <div className="sidebar-group-label">PRZESTRZEŃ TRENINGOWA</div>
      <nav aria-label="Nawigacja główna" className="sidebar-nav">
        {appNavigation.map((item) => (
          <Link key={item.href} href={item.href} aria-current={section === item.label ? "page" : undefined} className={`nav-link${section === item.label ? " active" : ""}`}>
            <Icon name={item.icon} className="nav-icon" />{item.label}
            {section === item.label && <Icon name="chevronRight" className="nav-arrow" size={18} />}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note"><span className="status-dot" /> {configured ? "KONTO PRYWATNE" : "TRYB DEMONSTRACYJNY"}<br /><small>{configured ? "Plany i maksima zapisane na koncie" : "Dane wyłącznie przykładowe"}</small></div>
        <div className="avatar-row"><span className="avatar">{configured ? "T" : "D"}</span><span><strong>{configured ? "Tester" : "Demo"}</strong><small>{configured ? "Prywatne dane" : "Widok prototypu"}</small></span></div>
      </div>
    </aside>
  );
}
