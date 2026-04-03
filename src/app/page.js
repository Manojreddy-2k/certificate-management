"use client";

import Link from "next/link";
import { useSelector } from "react-redux";

export default function HomePage() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <section className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Vital Records Ordering Portal</h1>
      <p className="text-slate-700">
        This frontend keeps certificate order data only in runtime memory. If your session ends or the page
        reloads, data is cleared.
      </p>
      <div className="flex gap-3">
        {isAuthenticated ? (
          <Link className="rounded bg-blue-600 px-4 py-2 text-white" href="/order">
            Continue to Order Flow
          </Link>
        ) : (
          <Link className="rounded bg-blue-600 px-4 py-2 text-white" href="/login">
            Sign In
          </Link>
        )}
      </div>
    </section>
  );
}
