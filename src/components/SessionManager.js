"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { expireSession, touchActivity } from "@/store/slices/sessionSlice";
import { sessionEnded } from "@/store/sessionActions";

const ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"];

export default function SessionManager() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { active, expiresAt } = useSelector((state) => state.session);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const handleActivity = () => {
      dispatch(touchActivity());
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    const intervalId = window.setInterval(() => {
      if (expiresAt && Date.now() >= expiresAt) {
        dispatch(expireSession({ message: "Session expired. Please sign in again." }));
        dispatch(sessionEnded());
        router.replace("/login?reason=expired");
      }
    }, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      window.clearInterval(intervalId);
    };
  }, [active, dispatch, expiresAt, router]);

  return null;
}
