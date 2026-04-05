"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function OnboardingContent() {
  const { address, isConnected, isConnecting } = useAccount();
  const { login, logout } = useLoginWithAbstract();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-advance to step 2 when wallet connects
  useEffect(() => {
    if (isConnected && address && step === 1) {
      setStep(2);
    }
  }, [isConnected, address, step]);

  const handleConnect = async () => {
    try {
      await login();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleCreateProfile = async () => {
    if (!address || !username) {
      console.error("[onboarding] Missing address or username", { address, username });
      setError(!address ? "Wallet not connected" : "Username required");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/creators/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Wallet-Address": address,
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
    } catch (err) {
      console.error("[onboarding] Network error:", err);
      setError("Network error — is the backend running?");
    }
    setLoading(false);
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <Link href="/" className="font-mono text-sm font-bold text-[var(--acid)]">
          FLOWW
        </Link>
        <div className="flex items-center gap-3">
          {isConnected && shortAddress ? (
            <>
              <span className="font-mono text-xs text-[var(--acid)]">
                ● {shortAddress}
              </span>
              <button
                onClick={() => logout()}
                className="font-mono text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                ✕
              </button>
            </>
          ) : (
            <span className="font-mono text-xs text-[var(--text-dim)]">ONBOARDING</span>
          )}
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Progress bar */}
          <div className="flex gap-1 mb-10">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-0.5 transition-colors ${
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
                disabled={isConnecting}
                className="w-full font-mono py-3 bg-[var(--acid)] text-black font-bold text-sm hover:bg-[var(--acid-dim)] transition-colors disabled:opacity-60"
              >
                {isConnecting ? "CONNECTING..." : "CONNECT →"}
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

              {/* Connection status */}
              <div className="flex items-center gap-2 mb-6 px-3 py-2 border border-[var(--acid)]/20 bg-[var(--acid)]/5">
                <span className="w-2 h-2 rounded-full bg-[var(--acid)]" />
                <span className="font-mono text-xs text-[var(--acid)]">
                  Connected as {shortAddress}
                </span>
              </div>

              <p className="text-[var(--text-dim)] mb-6 leading-relaxed">
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
