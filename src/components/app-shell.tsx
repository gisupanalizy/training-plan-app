import Link from "next/link";
import type { ReactNode } from "react";
import { getSupabaseConfig } from "@/lib/supabase/config";

const navigation = [
  { href: "/", label: "Trening", icon: "◉" },
  { href: "/plany", label: "Plany", icon: "▤" },
  { href: "/historia", label: "Historia", icon: "◷" },
  { href: "/postep", label: "Postęp", icon: "↗" },
  { href: "/profil", label: "Profil", icon: "◎" },
];

export function AppShell({ children, section }: { children: ReactNode; section: string }) {
  const configured = Boolean(getSupabaseConfig());
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Forma — strona główna">
          <span className="brand-mark">F<span>.</span></span>
          <span className="brand-name">forma<span>.</span><small>TWÓJ PLAN, TWÓJ RYTM</small></span>
        </Link>
        <div className="sidebar-group-label">PRZESTRZEŃ TRENINGOWA</div>
        <nav aria-label="Nawigacja główna" className="sidebar-nav">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} aria-current={section === item.label ? "page" : undefined} className={`nav-link ${section === item.label ? "active" : ""}`}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
              {section === item.label && <span className="nav-arrow" aria-hidden="true">↗</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><span className="status-dot" /> {configured ? "KONTO PRYWATNE" : "TRYB DEMONSTRACYJNY"}<br /><small>{configured ? "Plany i maksima zapisane na koncie" : "Dane wyłącznie przykładowe"}</small></div>
          <div className="avatar-row"><span className="avatar">{configured ? "T" : "D"}</span><span><strong>{configured ? "Tester" : "Demo"}</strong><small>{configured ? "Prywatne dane" : "Widok prototypu"}</small></span></div>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar"><span className="mobile-brand">forma<span>.</span></span><span className="topbar-tag"><span className="status-dot" /> {configured ? "KONTO PRYWATNE" : "TRYB DEMO"}</span><span className="topbar-avatar">{configured ? "T" : "D"}</span></header>
        <main id="main-content" className="content">{children}</main>
      </div>
      <nav className="mobile-nav" aria-label="Nawigacja główna">
        {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={section === item.label ? "page" : undefined} className={section === item.label ? "active" : ""}><span aria-hidden="true">{item.icon}</span><small>{item.label}</small></Link>)}
      </nav>
    </div>
  );
}

export function DemoNotice() {
  return <div className="demo-notice" role="status"><span aria-hidden="true">ⓘ</span><span>Ten ekran pokazuje dane syntetyczne. Wpisy w podglądzie treningu nie są zapisywane.</span></div>;
}
