"use client";

import dynamic from "next/dynamic";
import { useAccount } from "wagmi";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useEffect, useState } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import Link from "next/link";

export const dynamic_config = "force-dynamic";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Stats {
  totalTips: number;
  totalAmount: string;
  activeSubscribers: number;
}

interface Tip {
  id: string;
  fromAddress: string;
  amount: string;
  fee: string;
  token: string | null;
  message: string;
  blockTimestamp: string;
}

export default function DashboardPage() {
  const { address } = useAccount();
  const { login } = useLoginWithAbstract();
  const [stats, setStats] = useState<Stats | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [tab, setTab] = useState<"overview" | "tips">("overview");

  useEffect(() => {
    if (!address) return;

    // For now, fetch without auth for demo purposes
    // In production, sign a message and send the signature
    fetch(`${API}/api/dashboard/stats`, {
      headers: {
        Authorization: "Signature 0x",
        "X-Message": "dashboard",
      },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});

    fetch(`${API}/api/dashboard/tips`, {
      headers: {
        Authorization: "Signature 0x",
        "X-Message": "dashboard",
      },
    })
      .then((r) => r.json())
      .then((d) => setTips(d.data ?? []))
      .catch(() => {});
  }, [address]);

  if (!address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <span className="font-mono text-xs text-[var(--acid)] tracking-widest mb-4">
          DASHBOARD
        </span>
        <h1 className="font-mono text-3xl font-bold text-[var(--text)] mb-4">
          Connect to continue.
        </h1>
        <p className="text-[var(--text-dim)] mb-8">
          Sign in with your wallet to access your creator dashboard.
        </p>
        <button
          onClick={() => login()}
          className="font-mono px-6 py-3 bg-[var(--acid)] text-black font-bold text-sm hover:bg-[var(--acid-dim)] transition-colors"
        >
          CONNECT WALLET →
        </button>
      </div>
    );
  }

  const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--black)]/90 backdrop-blur-sm">
        <Link href="/" className="font-mono text-sm font-bold text-[var(--acid)]">
          FLOWW
        </Link>
        <ConnectButton />
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-mono text-2xl font-bold text-[var(--text)]">Dashboard</h1>
            <p className="font-mono text-xs text-[var(--text-dim)] mt-1">{shortAddr}</p>
          </div>
          <Link
            href={`/${shortAddr}`}
            className="font-mono text-xs text-[var(--acid)] border border-[var(--acid)]/30 px-3 py-1.5 hover:bg-[var(--acid)]/10 transition-colors"
          >
            VIEW PAGE →
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-0 border border-[var(--border)] mb-10">
          <div className="p-6 border-r border-[var(--border)]">
            <p className="font-mono text-xs text-[var(--text-dim)] tracking-wider mb-2">TOTAL TIPS</p>
            <p className="font-mono text-3xl font-bold text-[var(--acid)]">
              {stats?.totalTips ?? "—"}
            </p>
          </div>
          <div className="p-6 border-r border-[var(--border)]">
            <p className="font-mono text-xs text-[var(--text-dim)] tracking-wider mb-2">REVENUE</p>
            <p className="font-mono text-3xl font-bold text-[var(--text)]">
              {stats ? `${parseFloat(stats.totalAmount).toFixed(2)}` : "—"}
            </p>
          </div>
          <div className="p-6">
            <p className="font-mono text-xs text-[var(--text-dim)] tracking-wider mb-2">SUBSCRIBERS</p>
            <p className="font-mono text-3xl font-bold text-[var(--text)]">
              {stats?.activeSubscribers ?? "—"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] mb-6">
          {(["overview", "tips"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-mono text-xs px-4 py-3 tracking-wider transition-colors ${
                tab === t
                  ? "text-[var(--acid)] border-b-2 border-[var(--acid)]"
                  : "text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" ? (
          <div className="border border-[var(--border)] p-8 text-center">
            <p className="font-mono text-sm text-[var(--text-dim)]">
              Analytics charts coming in V2.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {tips.length === 0 ? (
              <div className="border border-[var(--border)] p-8 text-center">
                <p className="font-mono text-sm text-[var(--text-dim)]">No tips yet.</p>
              </div>
            ) : (
              tips.map((tip) => (
                <div
                  key={tip.id}
                  className="flex items-center justify-between py-4 border-b border-[var(--border)]"
                >
                  <div>
                    <p className="font-mono text-sm text-[var(--text)]">
                      {tip.fromAddress.slice(0, 6)}...{tip.fromAddress.slice(-4)}
                    </p>
                    {tip.message && (
                      <p className="text-xs text-[var(--text-dim)] mt-1">"{tip.message}"</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-[var(--acid)]">
                      {tip.amount} {tip.token ? "USDC" : "ETH"}
                    </p>
                    <p className="font-mono text-xs text-[var(--text-dim)]">
                      {new Date(tip.blockTimestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
