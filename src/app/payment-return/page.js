"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchTransactionStatus } from "@/lib/api/paymentClient";
import { setCheckoutStatus } from "@/store/slices/orderSlice";

const FINAL_STATUSES = new Set(["VERA_SUBMITTED", "PAYMENT_FAILED", "VERA_SUBMIT_FAILED"]);

function mapBackendStatus(status) {
  const byStatus = {
    PAYMENT_PENDING: "payment-pending",
    PAYMENT_SUCCEEDED: "payment-succeeded",
    VERA_SUBMITTING: "submitting-to-vera",
    VERA_SUBMITTED: "submitted-to-vera",
    PAYMENT_FAILED: "payment-failed",
    VERA_SUBMIT_FAILED: "vera-submit-failed"
  };

  return byStatus[status] ?? "processing";
}

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: authSession } = useSession();
  const checkout = useSelector((state) => state.order.checkout);
  const [isPolling, setIsPolling] = useState(true);
  const transactionId = searchParams.get("transactionId") || checkout.transactionId;

  const helperText = useMemo(() => {
    if (!checkout.status || checkout.status === "processing" || checkout.status === "payment-pending") {
      return "Waiting for payment confirmation and VERA processing...";
    }
    if (checkout.status === "submitted-to-vera") {
      return "Order successfully submitted to VERA.";
    }
    if (checkout.status === "payment-failed") {
      return "Payment failed. Return to checkout and retry.";
    }
    if (checkout.status === "vera-submit-failed") {
      return "Payment completed, but VERA submission failed. Retry in backend.";
    }
    return "Processing transaction.";
  }, [checkout.status]);

  useEffect(() => {
    if (!transactionId || !isPolling) {
      return undefined;
    }

    let isMounted = true;

    const pollOnce = async () => {
      try {
        const statusData = await fetchTransactionStatus(transactionId, authSession?.accessToken);
        if (!isMounted) {
          return;
        }

        dispatch(
          setCheckoutStatus({
            status: mapBackendStatus(statusData.status),
            error: statusData.error ?? "",
            veraReferenceId: statusData.veraReferenceId ?? ""
          })
        );

        if (FINAL_STATUSES.has(statusData.status)) {
          setIsPolling(false);
        }
      } catch (error) {
        if (isMounted) {
          dispatch(setCheckoutStatus({ status: "status-check-failed", error: error.message }));
        }
      }
    };

    pollOnce();
    const timerId = window.setInterval(pollOnce, 2500);
    return () => {
      isMounted = false;
      window.clearInterval(timerId);
    };
  }, [authSession?.accessToken, dispatch, isPolling, transactionId]);

  return (
    <ProtectedRoute>
      <section className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Payment Return</h1>
          <button className="rounded border border-slate-300 px-4 py-2 text-slate-700" onClick={() => router.push("/checkout")} type="button">
            Back to Checkout
          </button>
        </div>

        {!transactionId ? (
          <p className="rounded bg-amber-50 p-3 text-sm text-amber-800">No transaction ID found. Start checkout again.</p>
        ) : (
          <>
            <div className="rounded border border-slate-200 p-4">
              <p className="text-sm text-slate-700">Transaction ID: {transactionId}</p>
              <p className="text-sm text-slate-700">Frontend Status: {checkout.status || "processing"}</p>
              <p className="text-sm text-slate-700">{helperText}</p>
              {checkout.veraReferenceId ? <p className="text-sm text-emerald-700">VERA Ref: {checkout.veraReferenceId}</p> : null}
              {checkout.error ? <p className="text-sm text-red-700">{checkout.error}</p> : null}
            </div>
          </>
        )}
      </section>
    </ProtectedRoute>
  );
}
