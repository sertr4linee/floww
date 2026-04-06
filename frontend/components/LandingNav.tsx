"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";

export function LandingNav() {
  const { isConnected, hasProfile, profile, loading } = useCreatorProfile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const showButtons = mounted && !loading;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--black)]/90 backdrop-blur-sm">
      <Link href="/" className="font-mono text-lg font-bold tracking-tight text-[var(--acid)] acid-text-glow">
        FLOWW
      </Link>
      <div className="flex items-center gap-6">
        {!showButtons ? (
          <div className="w-24 h-8" />
        ) : isConnected && hasProfile ? (
          <>
            <Link href={`/${profile!.username}`} className="text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
              My Page
            </Link>
            <Link
              href="/dashboard"
              className="font-mono text-sm px-4 py-2 bg-[var(--acid)] text-black font-bold hover:bg-[var(--acid-dim)] transition-colors"
            >
              DASHBOARD_
            </Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className="text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
              Dashboard
            </Link>
            <Link
              href="/onboarding"
              className="font-mono text-sm px-4 py-2 bg-[var(--acid)] text-black font-bold hover:bg-[var(--acid-dim)] transition-colors"
            >
              START_
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
