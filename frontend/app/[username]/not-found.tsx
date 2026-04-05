import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="font-mono text-xs text-[var(--acid)] tracking-widest mb-4">404</p>
      <h1 className="font-mono text-4xl font-bold text-[var(--text)] mb-4">
        Creator not found.
      </h1>
      <p className="text-[var(--text-dim)] mb-8">
        This page doesn't exist yet — maybe you should create it.
      </p>
      <Link
        href="/onboarding"
        className="font-mono px-6 py-3 bg-[var(--acid)] text-black font-bold text-sm hover:bg-[var(--acid-dim)] transition-colors"
      >
        CREATE YOUR PAGE →
      </Link>
    </div>
  );
}
