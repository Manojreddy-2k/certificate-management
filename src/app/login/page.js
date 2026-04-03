"use client";

import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { clearSession } from "@/store/slices/sessionSlice";
import { sessionEnded } from "@/store/sessionActions";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, data } = useSession();
  const isAuthenticated = status === "authenticated";
  const statusMessage = useSelector((state) => state.session.statusMessage);
  const reason = searchParams.get("reason");
  const effectiveMessage =
    reason === "expired" ? "Session expired. Please sign in again." : statusMessage;
  const displayName = data?.user?.name ?? "User";

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/order");
    }
  }, [isAuthenticated, router]);

  const handleKeycloakLogin = async () => {
    await signIn("keycloak", { callbackUrl: "/order" });
  };

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(clearSession());
    dispatch(sessionEnded());
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <section className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
      <p className="text-slate-700">
        Sign in with Keycloak for local OIDC testing. This will be swapped with MI-Login later.
      </p>
      {effectiveMessage ? <p className="rounded bg-amber-50 p-3 text-sm text-amber-800">{effectiveMessage}</p> : null}

      {!isAuthenticated ? (
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white"
          onClick={handleKeycloakLogin}
          type="button"
        >
          Sign in with Keycloak
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-slate-700">Signed in as {displayName}.</p>
          <div className="flex gap-3">
            <button className="rounded bg-slate-800 px-4 py-2 text-white" onClick={() => router.push("/order")} type="button">
              Go to Order
            </button>
            <button className="rounded border border-slate-300 px-4 py-2 text-slate-700" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
