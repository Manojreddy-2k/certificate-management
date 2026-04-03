"use client";

import { useMemo } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  setCertificateType,
  setReviewAccepted,
  setStep,
  updateApplicant,
  updateShipping
} from "@/store/slices/orderSlice";
import { logout } from "@/store/slices/authSlice";
import { clearSession } from "@/store/slices/sessionSlice";
import { sessionEnded } from "@/store/sessionActions";

const CERTIFICATE_OPTIONS = [
  { value: "birth", label: "Birth Certificate" },
  { value: "death", label: "Death Certificate" },
  { value: "marriage", label: "Marriage Certificate" }
];

export default function OrderPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const order = useSelector((state) => state.order);

  const validation = useMemo(() => {
    const errors = [];
    if (!order.certificateType) {
      errors.push("Certificate type is required.");
    }
    if (!order.applicant.firstName || !order.applicant.lastName) {
      errors.push("Applicant first and last name are required.");
    }
    if (!order.applicant.dateOfBirth) {
      errors.push("Applicant date of birth is required.");
    }
    if (!order.shipping.addressLine1 || !order.shipping.city || !order.shipping.state || !order.shipping.zip) {
      errors.push("Complete shipping address is required.");
    }
    if (!order.reviewAccepted) {
      errors.push("You must confirm review before checkout.");
    }
    return errors;
  }, [order]);

  const stepTitle = {
    1: "Step 1: Select certificate",
    2: "Step 2: Applicant and shipping details",
    3: "Step 3: Review and confirm"
  }[order.step];

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(clearSession());
    dispatch(sessionEnded());
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <ProtectedRoute>
      <section className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Certificate Order Flow</h1>
          <button className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>

        <p className="text-sm font-medium text-blue-700">{stepTitle}</p>

        {order.step === 1 ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700" htmlFor="certificateType">
              Certificate Type
            </label>
            <select
              className="w-full rounded border border-slate-300 p-2"
              id="certificateType"
              value={order.certificateType}
              onChange={(event) => dispatch(setCertificateType(event.target.value))}
            >
              <option value="">Select a certificate</option>
              {CERTIFICATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
              disabled={!order.certificateType}
              onClick={() => dispatch(setStep(2))}
              type="button"
            >
              Continue
            </button>
          </div>
        ) : null}

        {order.step === 2 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">First Name</span>
              <input
                className="w-full rounded border border-slate-300 p-2"
                value={order.applicant.firstName}
                onChange={(event) => dispatch(updateApplicant({ firstName: event.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Last Name</span>
              <input
                className="w-full rounded border border-slate-300 p-2"
                value={order.applicant.lastName}
                onChange={(event) => dispatch(updateApplicant({ lastName: event.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Date of Birth</span>
              <input
                className="w-full rounded border border-slate-300 p-2"
                type="date"
                value={order.applicant.dateOfBirth}
                onChange={(event) => dispatch(updateApplicant({ dateOfBirth: event.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                className="w-full rounded border border-slate-300 p-2"
                type="email"
                value={order.applicant.email}
                onChange={(event) => dispatch(updateApplicant({ email: event.target.value }))}
              />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Address Line 1</span>
              <input
                className="w-full rounded border border-slate-300 p-2"
                value={order.shipping.addressLine1}
                onChange={(event) => dispatch(updateShipping({ addressLine1: event.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">City</span>
              <input
                className="w-full rounded border border-slate-300 p-2"
                value={order.shipping.city}
                onChange={(event) => dispatch(updateShipping({ city: event.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">State</span>
              <input
                className="w-full rounded border border-slate-300 p-2"
                value={order.shipping.state}
                onChange={(event) => dispatch(updateShipping({ state: event.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">ZIP</span>
              <input
                className="w-full rounded border border-slate-300 p-2"
                value={order.shipping.zip}
                onChange={(event) => dispatch(updateShipping({ zip: event.target.value }))}
              />
            </label>
            <div className="flex gap-3 md:col-span-2">
              <button className="rounded border border-slate-300 px-4 py-2 text-slate-700" onClick={() => dispatch(setStep(1))} type="button">
                Back
              </button>
              <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={() => dispatch(setStep(3))} type="button">
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {order.step === 3 ? (
          <div className="space-y-4">
            <div className="rounded border border-slate-200 p-4">
              <p className="text-sm text-slate-700">Certificate: {order.certificateType || "-"}</p>
              <p className="text-sm text-slate-700">
                Applicant: {order.applicant.firstName || "-"} {order.applicant.lastName || "-"}
              </p>
              <p className="text-sm text-slate-700">
                Shipping: {order.shipping.addressLine1 || "-"}, {order.shipping.city || "-"}, {order.shipping.state || "-"}{" "}
                {order.shipping.zip || "-"}
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                checked={order.reviewAccepted}
                onChange={(event) => dispatch(setReviewAccepted(event.target.checked))}
                type="checkbox"
              />
              I confirm all entered data is accurate for this session.
            </label>

            {validation.length > 0 ? (
              <ul className="list-inside list-disc rounded bg-amber-50 p-3 text-sm text-amber-800">
                {validation.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            ) : (
              <p className="rounded bg-emerald-50 p-3 text-sm text-emerald-700">Ready for checkout.</p>
            )}

            <div className="flex gap-3">
              <button className="rounded border border-slate-300 px-4 py-2 text-slate-700" onClick={() => dispatch(setStep(2))} type="button">
                Back
              </button>
              <button
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
                disabled={validation.length > 0}
                onClick={() => router.push("/checkout?autopay=1")}
                type="button"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}
