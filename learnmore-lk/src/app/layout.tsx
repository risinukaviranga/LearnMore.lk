import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "LearnMore.lk - Online Learning Platform",
  description: "Live classes, past papers and e-books for Sri Lankan students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} LearnMore.lk - EC4307 Web Application Development Mini Project
        </footer>
      </body>
    </html>
  );
}
/*export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}*/