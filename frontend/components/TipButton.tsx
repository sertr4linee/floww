"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useTip } from "@/hooks/useTip";

const PRESETS = ["1", "5", "10"];

export function TipButton({
  creatorAddress,
  creatorName,
}: {
  creatorAddress: string;
  creatorName: string;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("5");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<"ETH" | "USDC">("ETH");

  const { address } = useAccount();
  const { login } = useLoginWithAbstract();
  const { tipETH, tipUSDC, isPending, isConfirming, isSuccess } = useTip();

  const handleTip = async () => {
    if (!address) {
      login();
      return;
    }
    try {
      if (token === "ETH") {
        await tipETH(creatorAddress, amount, message);
      } else {
        await tipUSDC(creatorAddress, amount, message);
      }
    } catch (err) {
      console.error("Tip failed:", err);
    }
  };

  const status = isSuccess ? "success" : isConfirming ? "confirming" : isPending ? "pending" : "idle";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="font-mono text-sm px-5 py-2.5 bg-[var(--acid)] text-black font-bold hover:bg-[var(--acid-dim)] transition-colors"
      >
        TIP_
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-sm border border-[var(--border)] bg-[var(--black)] p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs text-[var(--acid)] tracking-widest">
                TIP {creatorName.toUpperCase()}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="font-mono text-xs text-[var(--text-dim)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>

            {status === "success" ? (
              <div className="text-center py-8">
                <div className="font-mono text-2xl text-[var(--acid)] mb-2">✓</div>
                <p className="font-mono text-sm text-[var(--acid)]">Tip sent!</p>
                <p className="text-xs text-[var(--text-dim)] mt-2">
                  {amount} {token} → {creatorName}
                </p>
                <button
                  onClick={() => { setOpen(false); }}
                  className="font-mono mt-6 text-sm px-6 py-2 border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--acid)] transition-colors"
                >
                  CLOSE
                </button>
              </div>
            ) : (
              <>
                {/* Token selector */}
                <div className="flex border border-[var(--border)] mb-4">
                  {(["ETH", "USDC"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setToken(t)}
                      className={`flex-1 font-mono text-xs py-2 transition-colors ${
                        token === t
                          ? "bg-[var(--acid)] text-black font-bold"
                          : "text-[var(--text-dim)] hover:text-[var(--text)]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Presets */}
                <div className="flex gap-2 mb-4">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setAmount(p)}
                      className={`flex-1 font-mono text-sm py-2 border transition-colors ${
                        amount === p
                          ? "border-[var(--acid)] text-[var(--acid)]"
                          : "border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--muted)]"
                      }`}
                    >
                      {token === "ETH" ? `${p}$` : `${p}$`}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="w-full font-mono text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--acid)] mb-4"
                />

                {/* Message */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message (optional)"
                  rows={2}
                  className="w-full text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--acid)] mb-6 resize-none"
                />

                {/* Submit */}
                <button
                  onClick={handleTip}
                  disabled={isPending || isConfirming || !amount || parseFloat(amount) <= 0}
                  className="w-full font-mono text-sm py-3 bg-[var(--acid)] text-black font-bold hover:bg-[var(--acid-dim)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {!address
                    ? "CONNECT WALLET"
                    : isPending
                    ? "CONFIRM IN WALLET..."
                    : isConfirming
                    ? "CONFIRMING..."
                    : `SEND ${amount} ${token} →`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
