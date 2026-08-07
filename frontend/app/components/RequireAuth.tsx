"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-[var(--muted)]">กำลังโหลด...</p>
      </main>
    );
  }

  return <>{children}</>;
}
