"use client";

import { useParams } from "next/navigation";
import { TipButton } from "@/components/TipButton";

export default function EmbedPage() {
  const params = useParams();
  const address = params.address as string;
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--black)] p-4">
      <div className="w-full max-w-xs border border-[var(--border)] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 border border-[var(--acid)] flex items-center justify-center">
            <span className="font-mono text-xs font-bold text-[var(--acid)]">
              {address.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-mono text-xs text-[var(--text)]">{short}</p>
            <p className="font-mono text-[10px] text-[var(--text-dim)]">on Floww</p>
          </div>
        </div>
        <TipButton creatorAddress={address} creatorName={short} />
      </div>
      <a
        href="https://floww.xyz"
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[10px] text-[var(--text-dim)] mt-3 hover:text-[var(--acid)] transition-colors"
      >
        Powered by FLOWW
      </a>
    </div>
  );
}
