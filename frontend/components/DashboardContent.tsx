"use client";

import { useAccount } from "wagmi";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@/components/ConnectButton";
import { useCreatorProfile } from "@/hooks/useCreatorProfile";
import Link from "next/link";

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

interface Post {
  id: string;
  title: string;
  contentIpfsHash: string;
  isExclusive: boolean;
  requiredPlanId: number | null;
  requiredPassId: number | null;
  publishedAt: string;
}

export function DashboardContent() {
  const { address } = useAccount();
  const { login } = useLoginWithAbstract();
  const router = useRouter();
  const { profile, loading: profileLoading, hasProfile, isConnected } = useCreatorProfile();

  const [stats, setStats] = useState<Stats | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<"overview" | "tips" | "posts" | "settings">("overview");

  // New post form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newExclusive, setNewExclusive] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  // Settings form
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Redirect to onboarding if connected but no profile
  useEffect(() => {
    if (!profileLoading && isConnected && !hasProfile) {
      router.push("/onboarding");
    }
  }, [profileLoading, isConnected, hasProfile, router]);

  // Populate settings form when profile loads
  useEffect(() => {
    if (profile) {
      setEditDisplayName(profile.displayName ?? "");
      setEditBio(profile.bio ?? "");
      setEditEmail(profile.email ?? "");
    }
  }, [profile]);

  const headers = useCallback(() => {
    return address ? { "X-Wallet-Address": address } : {};
  }, [address]);

  // Fetch data
  useEffect(() => {
    if (!address) return;
    const h = { "X-Wallet-Address": address };

    fetch(`${API}/api/dashboard/stats`, { headers: h })
      .then((r) => r.json()).then(setStats).catch(() => {});

    fetch(`${API}/api/dashboard/tips`, { headers: h })
      .then((r) => r.json()).then((d) => setTips(d.data ?? [])).catch(() => {});

    fetch(`${API}/api/my/posts`, { headers: h })
      .then((r) => r.json()).then(setMyPosts).catch(() => {});
  }, [address]);

  const handleCreatePost = async () => {
    if (!address || !newTitle) return;
    setPosting(true);

    const res = await fetch(`${API}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Wallet-Address": address },
      body: JSON.stringify({
        title: newTitle,
        content: newContent,
        isExclusive: newExclusive,
      }),
    });

    if (res.ok) {
      const post = await res.json();
      setMyPosts((prev) => [post, ...prev]);
      setNewTitle("");
      setNewContent("");
      setNewExclusive(false);
      setShowPostForm(false);
    }
    setPosting(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!address) return;
    await fetch(`${API}/api/posts/${postId}`, {
      method: "DELETE",
      headers: { "X-Wallet-Address": address },
    });
    setMyPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleSaveSettings = async () => {
    if (!address || !profile) return;
    setSaving(true);
    setSaveMsg("");

    const res = await fetch(`${API}/api/creators/me`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Wallet-Address": address },
      body: JSON.stringify({
        username: profile.username,
        displayName: editDisplayName,
        bio: editBio,
        email: editEmail,
      }),
    });

    if (res.ok) {
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
    } else {
      setSaveMsg("Error saving.");
    }
    setSaving(false);
  };

  if (!address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <span className="font-mono text-xs text-[var(--acid)] tracking-widest mb-4">DASHBOARD</span>
        <h1 className="font-mono text-3xl font-bold text-[var(--text)] mb-4">Connect to continue.</h1>
        <p className="text-[var(--text-dim)] mb-8">Sign in with your wallet to access your creator dashboard.</p>
        <button onClick={() => login()} className="font-mono px-6 py-3 bg-[var(--acid)] text-black font-bold text-sm hover:bg-[var(--acid-dim)] transition-colors">
          CONNECT WALLET →
        </button>
      </div>
    );
  }

  if (profileLoading) return <div className="min-h-screen bg-[var(--black)]" />;

  const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const displayName = profile?.displayName ?? profile?.username ?? shortAddr;

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--black)]/90 backdrop-blur-sm">
        <Link href="/" className="font-mono text-sm font-bold text-[var(--acid)]">FLOWW</Link>
        <ConnectButton />
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-mono text-2xl font-bold text-[var(--text)]">{displayName}</h1>
            <p className="font-mono text-xs text-[var(--text-dim)] mt-1">@{profile?.username} · {shortAddr}</p>
          </div>
          {profile && (
            <Link href={`/${profile.username}`} className="font-mono text-xs text-[var(--acid)] border border-[var(--acid)]/30 px-3 py-1.5 hover:bg-[var(--acid)]/10 transition-colors">
              VIEW PAGE →
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-0 border border-[var(--border)] mb-10">
          <div className="p-6 border-r border-[var(--border)]">
            <p className="font-mono text-xs text-[var(--text-dim)] tracking-wider mb-2">TOTAL TIPS</p>
            <p className="font-mono text-3xl font-bold text-[var(--acid)]">{stats?.totalTips ?? "—"}</p>
          </div>
          <div className="p-6 border-r border-[var(--border)]">
            <p className="font-mono text-xs text-[var(--text-dim)] tracking-wider mb-2">REVENUE</p>
            <p className="font-mono text-3xl font-bold text-[var(--text)]">{stats ? parseFloat(stats.totalAmount).toFixed(2) : "—"}</p>
          </div>
          <div className="p-6">
            <p className="font-mono text-xs text-[var(--text-dim)] tracking-wider mb-2">SUBSCRIBERS</p>
            <p className="font-mono text-3xl font-bold text-[var(--text)]">{stats?.activeSubscribers ?? "—"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] mb-6">
          {(["overview", "posts", "tips", "settings"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`font-mono text-xs px-4 py-3 tracking-wider transition-colors ${
                tab === t ? "text-[var(--acid)] border-b-2 border-[var(--acid)]" : "text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="border border-[var(--border)] p-8 text-center">
            <p className="font-mono text-sm text-[var(--text-dim)]">Analytics charts coming in V2.</p>
          </div>
        )}

        {/* Posts */}
        {tab === "posts" && (
          <div>
            {/* New post button / form */}
            {!showPostForm ? (
              <button onClick={() => setShowPostForm(true)}
                className="font-mono text-sm px-5 py-2.5 bg-[var(--acid)] text-black font-bold hover:bg-[var(--acid-dim)] transition-colors mb-6">
                + NEW POST
              </button>
            ) : (
              <div className="border border-[var(--border)] p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-[var(--acid)] tracking-widest">NEW POST</span>
                  <button onClick={() => setShowPostForm(false)} className="font-mono text-xs text-[var(--muted)] hover:text-[var(--text)]">✕</button>
                </div>

                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Post title"
                  className="w-full font-mono text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--acid)] mb-3 placeholder:text-[var(--muted)]" />

                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write your post content..."
                  rows={5}
                  className="w-full text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--acid)] mb-3 resize-none placeholder:text-[var(--muted)]" />

                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setNewExclusive(!newExclusive)}
                    className={`font-mono text-xs px-3 py-1.5 border transition-colors ${
                      newExclusive ? "border-[var(--acid)] text-[var(--acid)] bg-[var(--acid)]/10" : "border-[var(--border)] text-[var(--text-dim)]"
                    }`}>
                    {newExclusive ? "🔒 EXCLUSIVE" : "🌐 PUBLIC"}
                  </button>
                </div>

                <button onClick={handleCreatePost} disabled={!newTitle || posting}
                  className="font-mono text-sm px-5 py-2.5 bg-[var(--acid)] text-black font-bold hover:bg-[var(--acid-dim)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {posting ? "PUBLISHING..." : "PUBLISH →"}
                </button>
              </div>
            )}

            {/* Posts list */}
            {myPosts.length === 0 ? (
              <div className="border border-[var(--border)] p-8 text-center">
                <p className="font-mono text-sm text-[var(--text-dim)]">No posts yet. Create your first one!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myPosts.map((post) => (
                  <div key={post.id} className="border border-[var(--border)] p-4 flex items-start justify-between group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-mono text-sm font-bold text-[var(--text)]">{post.title}</h3>
                        {post.isExclusive && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 border border-[var(--acid)]/30 text-[var(--acid)]">EXCLUSIVE</span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-[var(--text-dim)]">
                        {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <button onClick={() => handleDeletePost(post.id)}
                      className="font-mono text-xs text-[var(--muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        {tab === "tips" && (
          <div className="flex flex-col">
            {tips.length === 0 ? (
              <div className="border border-[var(--border)] p-8 text-center">
                <p className="font-mono text-sm text-[var(--text-dim)]">No tips yet.</p>
              </div>
            ) : (
              tips.map((tip) => (
                <div key={tip.id} className="flex items-center justify-between py-4 border-b border-[var(--border)]">
                  <div>
                    <p className="font-mono text-sm text-[var(--text)]">
                      {tip.fromAddress.slice(0, 6)}...{tip.fromAddress.slice(-4)}
                    </p>
                    {tip.message && <p className="text-xs text-[var(--text-dim)] mt-1">"{tip.message}"</p>}
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

        {/* Settings */}
        {tab === "settings" && profile && (
          <div className="max-w-lg">
            <div className="flex items-center gap-4 mb-8">
              <span className="font-mono text-xs text-[var(--acid)] tracking-widest">PROFILE</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <div>
                <label className="font-mono text-xs text-[var(--text-dim)] mb-1 block">USERNAME</label>
                <div className="font-mono text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[var(--muted)]">
                  @{profile.username} <span className="text-[var(--text-dim)]">(cannot change)</span>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs text-[var(--text-dim)] mb-1 block">DISPLAY NAME</label>
                <input type="text" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full font-mono text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--acid)]" />
              </div>

              <div>
                <label className="font-mono text-xs text-[var(--text-dim)] mb-1 block">BIO</label>
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3}
                  className="w-full text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--acid)] resize-none" />
              </div>

              <div>
                <label className="font-mono text-xs text-[var(--text-dim)] mb-1 block">EMAIL (for notifications)</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full font-mono text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--acid)] placeholder:text-[var(--muted)]" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={handleSaveSettings} disabled={saving}
                className="font-mono text-sm px-5 py-2.5 bg-[var(--acid)] text-black font-bold hover:bg-[var(--acid-dim)] transition-colors disabled:opacity-40">
                {saving ? "SAVING..." : "SAVE CHANGES →"}
              </button>
              {saveMsg && <span className="font-mono text-xs text-[var(--acid)]">{saveMsg}</span>}
            </div>

            {/* Wallet info */}
            <div className="mt-12">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-xs text-[var(--acid)] tracking-widest">WALLET</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
              <div className="font-mono text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[var(--text-dim)]">
                {address}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
