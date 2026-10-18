import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({ src: "../../public/fonts/InterVariable.woff2", variable: "--font-inter", display: "swap", weight: "100 900" });
export const viewport: Viewport = { themeColor: "#11181f", colorScheme: "dark", viewportFit: "cover", width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  title: "Forma — prototyp planu treningowego",
  description: "Lokalny prototyp planu i widoku treningu na syntetycznych danych.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pl" data-theme="night" className={inter.variable}><body>{children}</body></html>;
}
