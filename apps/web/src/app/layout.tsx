import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mutlu 3D",
  description: "Metinden ve görselden 3D model üretim platformu",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="tr"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
          <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-4 dark:border-white/[.08]">
            <Link href="/" className="font-semibold tracking-tight">
              Mutlu 3D
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Show when="signed-in">
                <Link href="/generate">Üret</Link>
                <Link href="/gallery">Galerim</Link>
                <UserButton />
              </Show>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="rounded-full bg-foreground px-4 py-2 text-background text-sm font-medium">
                    Giriş yap
                  </button>
                </SignInButton>
              </Show>
            </nav>
          </header>
          <main className="flex flex-1 flex-col">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
