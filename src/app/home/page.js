"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AuthHomePage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <section className="ui-card space-y-6 p-6">
        <div>
          <h1 className="text-type-2xl-bold">Welcome</h1>
          <p className="mt-2 text-type-sm-regular" style={{ color: "hsl(var(--foreground) / 0.75)" }}>
            Choose what you want to do. Order details are session-only and cleared if the session ends.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            className="ui-card touch-target-min p-5 text-left"
            onClick={() => router.push("/order")}
            type="button"
          >
            <p className="text-type-lg-semibold">Order a certificate</p>
            <p className="mt-1 text-type-sm-regular" style={{ color: "hsl(var(--foreground) / 0.75)" }}>
              Start a new certificate order.
            </p>
          </button>

          <button
            className="ui-card touch-target-min p-5 text-left"
            onClick={() => router.push("/order-status")}
            type="button"
          >
            <p className="text-type-lg-semibold">My order status</p>
            <p className="mt-1 text-type-sm-regular" style={{ color: "hsl(var(--foreground) / 0.75)" }}>
              Look up an existing order with Order ID and PIN.
            </p>
          </button>
        </div>
      </section>
    </ProtectedRoute>
  );
}

