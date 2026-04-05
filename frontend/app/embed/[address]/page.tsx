"use client";

import dynamic from "next/dynamic";

const EmbedContent = dynamic(
  () => import("@/components/EmbedContent").then((m) => m.EmbedContent),
  { ssr: false, loading: () => <div className="min-h-screen bg-[var(--black)]" /> }
);

export default function EmbedPage() {
  return <EmbedContent />;
}
