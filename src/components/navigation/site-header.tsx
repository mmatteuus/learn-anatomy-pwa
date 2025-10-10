"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useSession } from "@supabase/auth-helpers-react";
import { Menu, User } from "lucide-react";
import { useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";

const links: { href: Route; label: string }[] = [
  { href: "/", label: "InAcio" },
  { href: "/play", label: "Campanha" },
  { href: "/modes", label: "Modos" },
  { href: "/content", label: "ConteAodo" },
];

export function SiteHeader() {
  const session = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            JG
          </span>
          <span>JGAnatomia</span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium sm:flex">
          {links.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "text-primary underline underline-offset-4"
                    : "text-muted-foreground transition hover:text-foreground"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          {session ? (
            <>
              <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                <User className="h-4 w-4" aria-hidden="true" />
                {session.user.user_metadata?.display_name ??
                  session.user.email}
              </span>
              <SignOutButton className="h-9" />
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              className="inline-flex h-9 items-center justify-center rounded-full border border-input px-5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              Entrar
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:text-foreground sm:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-border/80 bg-background px-6 py-4 sm:hidden"
        >
          <nav className="flex flex-col gap-3 text-sm font-medium">
            {links.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "text-primary underline underline-offset-4"
                      : "text-muted-foreground transition hover:text-foreground"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4">
            {session ? (
              <SignOutButton className="w-full justify-center" />
            ) : (
              <Link
                href="/auth/sign-in"
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                onClick={() => setMenuOpen(false)}
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
