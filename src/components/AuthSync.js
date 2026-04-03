"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import { clearSession, startSession } from "@/store/slices/sessionSlice";
import { sessionEnded } from "@/store/sessionActions";

const DEFAULT_SESSION_MS = 15 * 60 * 1000;

export default function AuthSync() {
  const { status, data } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(
        loginSuccess({
          loginMethod: "keycloak",
          user: {
            subjectId: data?.user?.email ?? data?.user?.name ?? "user",
            displayName: data?.user?.name ?? "Authenticated User"
          }
        })
      );
      dispatch(startSession({ sessionDurationMs: DEFAULT_SESSION_MS }));
      return;
    }

    if (status === "unauthenticated") {
      dispatch(logout());
      dispatch(clearSession());
      dispatch(sessionEnded());
    }
  }, [data, dispatch, status]);

  return null;
}
