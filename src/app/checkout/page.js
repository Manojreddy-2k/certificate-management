"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createPaymentSession } from "@/lib/api/paymentClient";
import { setCheckoutPending, setCheckoutReady, setCheckoutStatus } from "@/store/slices/orderSlice";

const AUTOPAY_LOCK_KEY = "vital-checkout-autopay-ts";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { data: authSession, status: sessionStatus } = useSession();
  const order = useSelector((state) => state.order);

  const wantAutopay = searchParams.get("autopay") === "1";

  const canCheckout = useMemo(() => {
    return Boolean(order.reviewAccepted && order.certificateType);
  }, [order.certificateType, order.reviewAccepted]);

  const orderSummary = useMemo(() => {
    return {
      certificateType: order.certificateType,
      amount: "39.00"
    };
  }, [order.certificateType]);

  const startPayment = useCallback(async () => {
    if (!authSession?.accessToken) {
      return;
    }
    try {
      dispatch(setCheckoutPending());
      const paymentSession = await createPaymentSession(orderSummary, authSession.accessToken);
      dispatch(
        setCheckoutReady({
          transactionId: paymentSession.transactionId,
          paymentRedirectUrl: paymentSession.paymentRedirectUrl
        })
      );
      router.replace("/checkout", { scroll: false });
      window.location.assign(paymentSession.paymentRedirectUrl);
    } catch (error) {
      dispatch(setCheckoutStatus({ status: "session-create-failed", error: error.message }));
    }
  }, [authSession?.accessToken, dispatch, orderSummary, router]);

  const autopayRanRef = useRef(false);

  useEffect(() => {
    if (!wantAutopay || autopayRanRef.current) {
      return;
    }
    if (!canCheckout || sessionStatus !== "authenticated" || !authSession?.accessToken) {
      return;
    }
    if (order.checkout.status !== "idle") {
      return;
    }

    const now = Date.now();
    const last = Number.parseInt(sessionStorage.getItem(AUTOPAY_LOCK_KEY) || "0", 10);
    if (now - last < 2500) {
      return;
    }
    sessionStorage.setItem(AUTOPAY_LOCK_KEY, String(now));

    autopayRanRef.current = true;
    void startPayment();
  }, [
    authSession?.accessToken,
    canCheckout,
    order.checkout.status,
    router,
    sessionStatus,
    startPayment,
    wantAutopay
  ]);

  const retryPayment = () => {
    sessionStorage.removeItem(AUTOPAY_LOCK_KEY);
    autopayRanRef.current = false;
    void startPayment();
  };

  const showManualContinue =
    canCheckout &&
    sessionStatus === "authenticated" &&
    order.checkout.status === "idle" &&
    !wantAutopay;

  const showRedirecting =
    order.checkout.status === "pending" ||
    (wantAutopay && canCheckout && sessionStatus === "authenticated" && order.checkout.status === "idle");

  return (
    <ProtectedRoute>
      <section className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Checkout</h1>
          <button className="rounded border border-slate-300 px-4 py-2 text-slate-700" onClick={() => router.push("/order")} type="button">
            Back to Order
          </button>
        </div>

        {!canCheckout ? (
          <p className="rounded bg-amber-50 p-3 text-sm text-amber-800">Complete order review before checkout.</p>
        ) : (
          <>
            <div className="rounded border border-slate-200 p-4">
              <p className="text-sm text-slate-700">Certificate: {order.certificateType}</p>
              <p className="text-sm text-slate-700">Amount: ${orderSummary.amount}</p>
              <p className="text-xs text-slate-500">Payment opens in this window; Stripe will send you back when done.</p>
            </div>

            {order.checkout.status === "session-create-failed" ? (
              <div className="space-y-3 rounded border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm text-rose-800">Could not start payment: {order.checkout.error}</p>
                <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={retryPayment} type="button">
                  Try again
                </button>
              </div>
            ) : null}

            {showRedirecting ? (
              <div className="rounded border border-slate-200 p-6 text-center">
                <p className="text-sm font-medium text-slate-800">Redirecting to secure payment…</p>
                <p className="mt-2 text-xs text-slate-500">Stay on this page.</p>
              </div>
            ) : null}

            {showManualContinue ? (
              <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={() => void startPayment()} type="button">
                Continue to secure payment
              </button>
            ) : null}

            {sessionStatus === "loading" ? <p className="text-sm text-slate-600">Checking your session…</p> : null}
          </>
        )}
      </section>
    </ProtectedRoute>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Loading checkout…</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
