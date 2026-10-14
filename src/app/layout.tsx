import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forma — prototyp planu treningowego",
  description: "Lokalny prototyp planu i widoku treningu na syntetycznych danych.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pl"><body>{children}</body></html>;
}
