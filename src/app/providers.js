"use client";

import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import SessionManager from "@/components/SessionManager";
import AuthSync from "@/components/AuthSync";

export default function AppProviders({ children }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <AuthSync />
        <SessionManager />
        {children}
      </Provider>
    </SessionProvider>
  );
}
