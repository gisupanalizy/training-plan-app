import type { ReactNode } from "react";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { Icon } from "@/components/ui/icon";
import { BottomNav, Sidebar } from "@/components/ui/navigation";

export function AppShell({ children, section }: { children: ReactNode; section: string }) {
  const configured = Boolean(getSupabaseConfig());
  const mode = configured ? "private" : "demo";
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Przejdź do treści</a>
      <Sidebar section={section} mode={mode} />
      <div className="main-column">
        <header className="topbar"><span className="mobile-brand">forma<span>.</span></span><span className="topbar-tag"><span className="status-dot" /> {configured ? "KONTO PRYWATNE" : "TRYB DEMO"}</span><span className="topbar-avatar">{configured ? "T" : "D"}</span></header>
        <main id="main-content" tabIndex={-1} className="content">{children}<footer className="asset-credit">Ilustracje: <a href="https://github.com/bryllim/workout-guide">Workout Guide · Bryl Lim / Everkinetic</a> · <a href="/exercise-assets/LICENSE-ASSETS">CC BY-SA 4.0</a> · <a href="/exercise-assets/manifest.json">Pochodzenie grafik</a></footer></main>
      </div>
      <BottomNav section={section} />
    </div>
  );
}

export function DemoNotice() {
  return <div className="demo-notice" role="status"><Icon name="info" size={18} /><span>Ten ekran pokazuje dane syntetyczne. Wpisy w podglądzie treningu nie są zapisywane.</span></div>;
}
