"use client";

import dynamic from "next/dynamic";

const DashboardContent = dynamic(
  () => import("@/components/DashboardContent").then((m) => m.DashboardContent),
  { ssr: false, loading: () => <div className="min-h-screen bg-[var(--black)]" /> }
);

export default function DashboardPage() {
  return <DashboardContent />;
}
