"use client";

import { useState, useEffect, type ReactNode } from "react";

export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[var(--black)]" />;
  }

  return <>{children}</>;
}
