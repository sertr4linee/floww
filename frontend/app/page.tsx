import Link from "next/link";

const FEES = [
  { platform: "Patreon", tip: "8–12%", sub: "8–12%", nft: "—" },
  { platform: "Ko-fi", tip: "5–15%", sub: "5–15%", nft: "—" },
  { platform: "Floww", tip: "2.5%", sub: "5%", nft: "2.5%", highlight: true },
];

const STEPS = [
  {
    n: "01",
    title: "Login with email",
    desc: "No wallet, no seed phrase. Fans connect via email or Google — AGW handles the rest.",
  },
  {
    n: "02",
    title: "Support onchain",
    desc: "Tips, subscriptions, and NFT passes are settled onchain in seconds. Gas is covered.",
  },
  {
    n: "03",
    title: "Creators get paid",
    desc: "Instant payouts, 180+ countries, 2.5% fee. No chargebacks, no censorship.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--black)]/90 backdrop-blur-sm">
        <span className="font-mono text-lg font-bold tracking-tight text-[var(--acid)] acid-text-glow">
          FLOWW
        </span>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
            Dashboard
          </Link>
          <Link
            href="/onboarding"
            className="font-mono text-sm px-4 py-2 bg-[var(--acid)] text-black font-bold hover:bg-[var(--acid-dim)] transition-colors"
          >
            START_
          </Link>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative grid-bg min-h-[92vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          {/* Decorative vertical lines */}
          <div className="absolute left-1/4 top-0 bottom-0 w-px bg-[var(--border)]" />
          <div className="absolute right-1/4 top-0 bottom-0 w-px bg-[var(--border)]" />

          {/* Tag */}
          <div className="animate-fade-up delay-1 font-mono text-xs text-[var(--acid)] border border-[var(--acid)]/30 px-3 py-1 mb-8 tracking-widest">
            BUILT ON ABSTRACT CHAIN
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-2 font-mono text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tighter max-w-4xl">
            <span className="block text-[var(--text)]">Support creators</span>
            <span className="block text-[var(--acid)] acid-text-glow">onchain.</span>
          </h1>

          <p className="animate-fade-up delay-3 mt-6 text-lg text-[var(--text-dim)] max-w-xl leading-relaxed">
            Tips, subscriptions, and NFT passes — gasless for fans,
            instant for creators. No banks, no Stripe, no censorship.
          </p>

          <div className="animate-fade-up delay-4 flex flex-col sm:flex-row gap-3 mt-10">
            <Link
              href="/onboarding"
              className="font-mono px-8 py-4 bg-[var(--acid)] text-black font-bold text-sm tracking-wider hover:bg-[var(--acid-dim)] transition-colors acid-glow"
            >
              CREATE YOUR PAGE →
            </Link>
            <Link
              href="/alice"
              className="font-mono px-8 py-4 border border-[var(--border)] text-[var(--text-dim)] text-sm tracking-wider hover:border-[var(--acid)] hover:text-[var(--acid)] transition-colors"
            >
              SEE DEMO →
            </Link>
          </div>

          {/* Stats bar */}
          <div className="animate-fade-up delay-5 absolute bottom-0 left-0 right-0 border-t border-[var(--border)] grid grid-cols-3">
            {[
              ["2.5%", "tip fee"],
              ["~0s", "settlement"],
              ["180+", "countries"],
            ].map(([val, label]) => (
              <div key={label} className="flex flex-col items-center py-5 border-r border-[var(--border)] last:border-r-0">
                <span className="font-mono text-2xl font-bold text-[var(--acid)]">{val}</span>
                <span className="font-mono text-xs text-[var(--text-dim)] mt-1 tracking-wider uppercase">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-24 max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <span className="font-mono text-xs text-[var(--acid)] tracking-widest">HOW IT WORKS</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>
          <div className="grid md:grid-cols-3 gap-0 border border-[var(--border)]">
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className="p-8 border-r border-[var(--border)] last:border-r-0 group hover:bg-[var(--surface)] transition-colors"
              >
                <div className="font-mono text-4xl font-bold text-[var(--border)] group-hover:text-[var(--acid)] transition-colors mb-6">
                  {step.n}
                </div>
                <h3 className="font-mono text-base font-bold text-[var(--text)] mb-3">{step.title}</h3>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fee comparison */}
        <section className="px-6 py-24 bg-[var(--surface)] border-y border-[var(--border)]">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-16">
              <span className="font-mono text-xs text-[var(--acid)] tracking-widest">FEE COMPARISON</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="font-mono text-xs text-[var(--text-dim)] text-left py-3 pr-8 tracking-wider">PLATFORM</th>
                  <th className="font-mono text-xs text-[var(--text-dim)] text-right py-3 pr-8 tracking-wider">TIPS</th>
                  <th className="font-mono text-xs text-[var(--text-dim)] text-right py-3 pr-8 tracking-wider">SUBSCRIPTIONS</th>
                  <th className="font-mono text-xs text-[var(--text-dim)] text-right py-3 tracking-wider">NFT PASSES</th>
                </tr>
              </thead>
              <tbody>
                {FEES.map((row) => (
                  <tr
                    key={row.platform}
                    className={`border-b border-[var(--border)] ${row.highlight ? "bg-[var(--acid)]/5" : ""}`}
                  >
                    <td className={`py-4 pr-8 font-mono text-sm font-bold ${row.highlight ? "text-[var(--acid)]" : "text-[var(--text-dim)]"}`}>
                      {row.highlight ? "→ " : ""}{row.platform}
                    </td>
                    <td className={`py-4 pr-8 text-right font-mono text-sm ${row.highlight ? "text-[var(--acid)] font-bold" : "text-[var(--muted)]"}`}>
                      {row.tip}
                    </td>
                    <td className={`py-4 pr-8 text-right font-mono text-sm ${row.highlight ? "text-[var(--acid)] font-bold" : "text-[var(--muted)]"}`}>
                      {row.sub}
                    </td>
                    <td className={`py-4 text-right font-mono text-sm ${row.highlight ? "text-[var(--acid)] font-bold" : "text-[var(--muted)]"}`}>
                      {row.nft}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-6 text-xs text-[var(--text-dim)] font-mono">
              * Gas fees covered by Abstract Paymaster. Fans pay 0 gas.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-32 text-center max-w-2xl mx-auto">
          <h2 className="font-mono text-3xl md:text-5xl font-bold text-[var(--text)] mb-6 leading-tight">
            Your audience.<br />
            <span className="text-[var(--acid)]">Your terms.</span>
          </h2>
          <p className="text-[var(--text-dim)] mb-10 leading-relaxed">
            No platform risk. No chargebacks. Your subscribers are wallets —
            you own the relationship, onchain, forever.
          </p>
          <Link
            href="/onboarding"
            className="font-mono inline-block px-10 py-4 bg-[var(--acid)] text-black font-bold text-sm tracking-wider hover:bg-[var(--acid-dim)] transition-colors acid-glow"
          >
            CREATE YOUR PAGE →
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-6 flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-[var(--acid)]">FLOWW</span>
        <span className="font-mono text-xs text-[var(--text-dim)]">BUILT ON ABSTRACT CHAIN</span>
      </footer>
    </div>
  );
}
