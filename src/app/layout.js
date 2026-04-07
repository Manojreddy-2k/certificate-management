import "./globals.css";
import AppProviders from "./providers";
import { Montserrat } from "next/font/google";
import TopNav from "@/components/TopNav";

export const metadata = {
  title: "Vital Records Certificate Ordering",
  description: "Session-only frontend flow for certificate ordering"
};

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat"
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>
        <AppProviders>
          <a className="skip-nav" href="#main-content">
            Skip to content
          </a>
          <TopNav />
          <main className="mx-auto min-h-screen max-w-5xl p-6" id="main-content">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
