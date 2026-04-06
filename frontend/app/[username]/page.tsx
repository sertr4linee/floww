import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TipButton } from "@/components/TipButton";
import { SubscribeButton } from "@/components/SubscribeButton";
import { PostCard } from "@/components/PostCard";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function getCreator(username: string) {
  try {
    const res = await fetch(`${API}/api/creators/${username}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getPosts(username: string) {
  try {
    const res = await fetch(`${API}/api/${username}/posts`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const creator = await getCreator(username);
  if (!creator) return { title: "Creator not found — Floww" };

  return {
    title: `${creator.displayName ?? creator.username} — Floww`,
    description: creator.bio ?? `Support ${creator.username} on Floww`,
    openGraph: {
      title: `${creator.displayName ?? creator.username} on Floww`,
      description: creator.bio ?? `Support ${creator.username} on Floww`,
      type: "profile",
    },
  };
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [creator, posts] = await Promise.all([
    getCreator(username),
    getPosts(username),
  ]);

  if (!creator) notFound();

  const displayName = creator.displayName ?? creator.username;
  const shortAddress = `${creator.id.slice(0, 6)}...${creator.id.slice(-4)}`;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--black)]/90 backdrop-blur-sm">
        <Link href="/" className="font-mono text-sm font-bold text-[var(--acid)]">
          FLOWW
        </Link>
        <span className="font-mono text-xs text-[var(--text-dim)]">{shortAddress}</span>
      </nav>

      {/* Profile header */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Avatar placeholder */}
          <div className="w-16 h-16 rounded-none border border-[var(--acid)] flex items-center justify-center mb-6 bg-[var(--black)]">
            {creator.avatarIpfsHash ? (
              <img
                src={`https://gateway.pinata.cloud/ipfs/${creator.avatarIpfsHash}`}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-mono text-xl font-bold text-[var(--acid)]">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <h1 className="font-mono text-3xl font-bold text-[var(--text)] mb-1">
            {displayName}
          </h1>
          <p className="font-mono text-xs text-[var(--text-dim)] mb-4">
            @{creator.username} · {shortAddress}
          </p>

          {creator.bio && (
            <p className="text-[var(--text-dim)] max-w-lg leading-relaxed mb-8">
              {creator.bio}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <TipButton creatorAddress={creator.id} creatorName={displayName} />
            <SubscribeButton creatorAddress={creator.id} />
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-xs text-[var(--acid)] tracking-widest">POSTS</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="font-mono text-xs text-[var(--text-dim)]">{posts.length}</span>
        </div>

        {posts.length === 0 ? (
          <div className="border border-[var(--border)] p-12 text-center">
            <p className="font-mono text-sm text-[var(--text-dim)]">No posts yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} creatorAddress={creator.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
