"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface CreatorProfile {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarIpfsHash: string | null;
  email: string | null;
}

export function useCreatorProfile() {
  const { address, isConnected } = useAccount();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !address) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API}/api/creators/${address}`)
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setProfile(null);
        setLoading(false);
      });
  }, [address, isConnected]);

  return {
    profile,
    loading,
    isConnected,
    address,
    hasProfile: !!profile,
  };
}
