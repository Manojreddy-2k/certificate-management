"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return <p className="text-sm text-slate-600">Checking sign-in status...</p>;
  }

  if (!isAuthenticated) {
    return <p className="text-sm text-slate-600">Redirecting to login...</p>;
  }

  return children;
}
