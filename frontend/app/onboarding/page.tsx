"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function OnboardingPage() {
  const { address } = useAccount();
  const { login } = useLoginWithAbstract();
  const router = useRouter();

  const [step, setStep] = useState(address ? 2 : 1);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    await login();
    setStep(2);
  };

  const handleCreateProfile = async () => {
    if (!address || !username) return;
    setLoading(true);
    setError("");

    try {
      // In production, sign a message for auth
      const res = await fetch(`${API}/api/creators/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Signature 0x", // placeholder
          "X-Message": "create-profile",
        },
        body: JSON.stringify({
          username,
          displayName: displayName || username,
          bio,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create profile");
        setLoading(false);
        return;
      }

      setStep(3);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <Link href="/" className="font-mono text-sm font-bold text-[var(--acid)]">
          FLOWW
        </Link>
        <span className="font-mono text-xs text-[var(--text-dim)]">ONBOARDING</span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Progress bar */}
          <div className="flex gap-1 mb-10">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-0.5 ${
                  s <= step ? "bg-[var(--acid)]" : "bg-[var(--border)]"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Connect wallet */}
          {step === 1 && (
            <div className="animate-fade-up">
              <span className="font-mono text-xs text-[var(--acid)] tracking-widest">
                STEP 01
              </span>
              <h1 className="font-mono text-3xl font-bold text-[var(--text)] mt-2 mb-4">
                Connect your wallet
              </h1>
              <p className="text-[var(--text-dim)] mb-8 leading-relaxed">
                Sign in with your email, Google, or existing wallet.
                This creates your creator identity onchain.
              </p>
              <button
                onClick={handleConnect}
                className="w-full font-mono py-3 bg-[var(--acid)] text-black font-bold text-sm hover:bg-[var(--acid-dim)] transition-colors"
              >
                CONNECT →
              </button>
            </div>
          )}

          {/* Step 2: Create profile */}
          {step === 2 && (
            <div className="animate-fade-up">
              <span className="font-mono text-xs text-[var(--acid)] tracking-widest">
                STEP 02
              </span>
              <h1 className="font-mono text-3xl font-bold text-[var(--text)] mt-2 mb-4">
                Create your page
              </h1>
              <p className="text-[var(--text-dim)] mb-8 leading-relaxed">
                Pick a username — this will be your public URL: <span className="text-[var(--acid)]">floww.xyz/username</span>
              </p>

              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="font-mono text-xs text-[var(--text-dim)] mb-1 block">USERNAME *</label>
                  <div className="flex items-center border border-[var(--border)] focus-within:border-[var(--acid)]">
                    <span className="font-mono text-xs text-[var(--text-dim)] px-3">floww.xyz/</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      placeholder="your-name"
                      className="flex-1 font-mono text-sm bg-transparent py-2 pr-3 text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-xs text-[var(--text-dim)] mb-1 block">DISPLAY NAME</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--acid)] placeholder:text-[var(--muted)]"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs text-[var(--text-dim)] mb-1 block">BIO</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="What do you create?"
                    rows={3}
                    className="w-full text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--acid)] resize-none placeholder:text-[var(--muted)]"
                  />
                </div>
              </div>

              {error && (
                <p className="font-mono text-xs text-red-400 mb-4">{error}</p>
              )}

              <button
                onClick={handleCreateProfile}
                disabled={!username || username.length < 3 || loading}
                className="w-full font-mono py-3 bg-[var(--acid)] text-black font-bold text-sm hover:bg-[var(--acid-dim)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "CREATING..." : "CREATE PAGE →"}
              </button>
            </div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <div className="animate-fade-up text-center">
              <span className="font-mono text-xs text-[var(--acid)] tracking-widest">
                STEP 03
              </span>
              <h1 className="font-mono text-3xl font-bold text-[var(--text)] mt-2 mb-4">
                You're live.
              </h1>
              <p className="text-[var(--text-dim)] mb-8 leading-relaxed">
                Your page is ready at{" "}
                <span className="text-[var(--acid)] font-mono">floww.xyz/{username}</span>.
                Share it with your audience.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href={`/${username}`}
                  className="w-full font-mono py-3 bg-[var(--acid)] text-black font-bold text-sm text-center hover:bg-[var(--acid-dim)] transition-colors"
                >
                  VIEW YOUR PAGE →
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full font-mono py-3 border border-[var(--border)] text-[var(--text-dim)] text-sm text-center hover:border-[var(--acid)] hover:text-[var(--acid)] transition-colors"
                >
                  GO TO DASHBOARD →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
