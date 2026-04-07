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
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  const handleKeycloakLogin = async () => {
    await signIn("keycloak", { callbackUrl: "/home" });
  };

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(clearSession());
    dispatch(sessionEnded());
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <section className="ui-card space-y-6 p-6">
      <h1 className="text-type-2xl-bold">Login</h1>
      <p className="text-type-md-regular" style={{ color: "hsl(var(--foreground) / 0.85)" }}>
        Sign in with Keycloak for local OIDC testing. This will be swapped with MI-Login later.
      </p>
      {effectiveMessage ? (
        <p className="rounded border p-3 text-type-sm-medium" style={{ borderColor: "hsl(var(--warning))", background: "hsl(var(--warning) / 0.15)" }}>
          {effectiveMessage}
        </p>
      ) : null}

      {!isAuthenticated ? (
        <button
          className="ui-btn ui-btn-primary touch-target-min"
          onClick={handleKeycloakLogin}
          type="button"
        >
          Sign in with Keycloak
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-type-md-regular">Signed in as {displayName}.</p>
          <div className="flex gap-3">
            <button className="ui-btn ui-btn-primary touch-target-min" onClick={() => router.push("/home")} type="button">
              Go to Home
            </button>
            <button className="ui-btn ui-btn-tertiary touch-target-min" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
