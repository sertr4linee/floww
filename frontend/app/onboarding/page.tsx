"use client";

import dynamic from "next/dynamic";

const OnboardingContent = dynamic(
  () => import("@/components/OnboardingContent").then((m) => m.OnboardingContent),
  { ssr: false, loading: () => <div className="min-h-screen bg-[var(--black)]" /> }
);

export default function OnboardingPage() {
  return <OnboardingContent />;
}
