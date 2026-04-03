import "./globals.css";
import AppProviders from "./providers";

export const metadata = {
  title: "Vital Records Certificate Ordering",
  description: "Session-only frontend flow for certificate ordering"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <main className="mx-auto min-h-screen max-w-5xl p-6">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
