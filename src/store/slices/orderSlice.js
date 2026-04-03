import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  step: 1,
  certificateType: "",
  applicant: {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: ""
  },
  shipping: {
    addressLine1: "",
    city: "",
    state: "",
    zip: ""
  },
  reviewAccepted: false,
  checkout: {
    transactionId: "",
    paymentRedirectUrl: "",
    status: "idle",
    error: "",
    veraReferenceId: ""
  }
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setStep(state, action) {
      state.step = action.payload;
    },
    setCertificateType(state, action) {
      state.certificateType = action.payload;
    },
    updateApplicant(state, action) {
      state.applicant = { ...state.applicant, ...action.payload };
    },
    updateShipping(state, action) {
      state.shipping = { ...state.shipping, ...action.payload };
    },
    setReviewAccepted(state, action) {
      state.reviewAccepted = action.payload;
    },
    setCheckoutPending(state) {
      state.checkout.status = "pending";
      state.checkout.error = "";
    },
    setCheckoutReady(state, action) {
      state.checkout.status = "redirect-ready";
      state.checkout.transactionId = action.payload.transactionId;
      state.checkout.paymentRedirectUrl = action.payload.paymentRedirectUrl;
      state.checkout.error = "";
      state.checkout.veraReferenceId = "";
    },
    setCheckoutStatus(state, action) {
      state.checkout.status = action.payload.status;
      state.checkout.error = action.payload.error ?? "";
      state.checkout.veraReferenceId = action.payload.veraReferenceId ?? state.checkout.veraReferenceId;
    },
    resetOrder() {
      return initialState;
    }
  }
});

export const {
  setStep,
  setCertificateType,
  updateApplicant,
  updateShipping,
  setReviewAccepted,
  setCheckoutPending,
  setCheckoutReady,
  setCheckoutStatus,
  resetOrder
} = orderSlice.actions;

export const orderInitialState = initialState;
export default orderSlice.reducer;
