"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchTransactionStatus } from "@/lib/api/paymentClient";
import ProtectedRoute from "@/components/ProtectedRoute";

function normalizeOrderId(raw) {
  return (raw ?? "").trim().toUpperCase();
}

export default function OrderStatusPage() {
  const router = useRouter();
  const { data: authSession, status: sessionStatus } = useSession();

  const [orderId, setOrderId] = useState("");
  const [pin, setPin] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return Boolean(normalizeOrderId(orderId) && pin.trim().length >= 4);
  }, [orderId, pin]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    const normalizedId = normalizeOrderId(orderId);
    if (!normalizedId) {
      setError("Order ID is required.");
      return;
    }
    if (!pin.trim()) {
      setError("PIN is required.");
      return;
    }

    if (sessionStatus !== "authenticated" || !authSession?.accessToken) {
      setError("Please sign in to check order status.");
      return;
    }

    setIsLoading(true);
    try {
      const statusData = await fetchTransactionStatus(normalizedId, authSession.accessToken);
      setResult(statusData);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <section className="ui-card space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-type-2xl-bold">My Order Status</h1>
          <button className="ui-btn ui-btn-tertiary touch-target-min" onClick={() => router.push("/home")} type="button">
            Back
          </button>
        </div>

        <p className="text-type-sm-regular" style={{ color: "hsl(var(--foreground) / 0.75)" }}>
          Enter your <span className="font-medium">Order ID</span> and <span className="font-medium">PIN</span>.
        </p>

        <form className="grid gap-4 sm:max-w-xl sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-1">
            <span className="text-type-sm-medium">Order ID</span>
            <input
              className="ui-input"
              inputMode="text"
              placeholder="TX-ABC123..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-type-sm-medium">PIN</span>
            <input
              className="ui-input"
              inputMode="numeric"
              placeholder="4+ digits"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </label>

          <div className="sm:col-span-2">
            <button className="ui-btn ui-btn-primary touch-target-min disabled:opacity-60" disabled={!canSubmit || isLoading} type="submit">
              {isLoading ? "Checking..." : "Check status"}
            </button>
          </div>
        </form>

        {error ? (
          <p className="rounded border p-3 text-type-sm-medium" style={{ borderColor: "hsl(var(--destructive))", background: "hsl(var(--destructive) / 0.10)", color: "hsl(var(--destructive))" }}>
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="ui-card p-4">
            <p className="text-type-sm-regular">Order ID: {result.transactionId}</p>
            <p className="text-type-sm-regular">Status: {result.status}</p>
            {result.veraReferenceId ? <p className="text-type-sm-medium" style={{ color: "hsl(var(--secondary))" }}>VERA Ref: {result.veraReferenceId}</p> : null}
            {result.error ? <p className="text-type-sm-medium" style={{ color: "hsl(var(--destructive))" }}>{result.error}</p> : null}
            <p className="mt-2 text-type-xs-regular" style={{ color: "hsl(var(--foreground) / 0.6)" }}>
              Note: PIN is collected for the real system. This demo currently uses authenticated lookup against the backend transaction id.
            </p>
          </div>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}

