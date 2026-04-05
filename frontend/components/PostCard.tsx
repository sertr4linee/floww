"use client";

interface Post {
  id: string;
  title: string;
  contentIpfsHash: string | null;
  isExclusive: boolean;
  locked?: boolean;
  publishedAt: string;
}

export function PostCard({
  post,
  creatorAddress,
}: {
  post: Post;
  creatorAddress: string;
}) {
  const isLocked = post.isExclusive && post.locked;
  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`border transition-colors ${
        isLocked
          ? "border-[var(--border)] bg-[var(--surface)]"
          : "border-[var(--border)] hover:border-[var(--muted)]"
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {post.isExclusive && (
              <span className="font-mono text-[10px] px-2 py-0.5 border border-[var(--acid)]/30 text-[var(--acid)] tracking-wider">
                EXCLUSIVE
              </span>
            )}
            <span className="font-mono text-xs text-[var(--text-dim)]">{date}</span>
          </div>
          {isLocked && (
            <span className="font-mono text-xs text-[var(--muted)]">🔒</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-mono text-base font-bold text-[var(--text)] mb-3">
          {post.title}
        </h3>

        {/* Content or locked state */}
        {isLocked ? (
          <div className="border border-dashed border-[var(--border)] p-4 text-center">
            <p className="font-mono text-xs text-[var(--muted)] mb-2">
              This post is exclusive to subscribers.
            </p>
            <span className="font-mono text-xs text-[var(--acid)] cursor-pointer hover:underline">
              SUBSCRIBE TO UNLOCK →
            </span>
          </div>
        ) : post.contentIpfsHash ? (
          <p className="text-sm text-[var(--text-dim)] leading-relaxed">
            Content loaded from IPFS: {post.contentIpfsHash.slice(0, 12)}...
          </p>
        ) : null}
      </div>
    </div>
  );
}
