import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function NotFound() { return <AppShell section=""><div className="empty-state"><div className="eyebrow">404 / NIE ZNALEZIONO</div><h1>Nie ma takiej strony.</h1><Link className="button button-dark" href="/">Wróć na start ↗</Link></div></AppShell>; }
