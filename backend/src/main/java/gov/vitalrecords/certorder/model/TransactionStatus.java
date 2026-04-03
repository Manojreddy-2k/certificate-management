package gov.vitalrecords.certorder.model;

public enum TransactionStatus {
    CHECKOUT_STARTED,
    PAYMENT_PENDING,
    PAYMENT_SUCCEEDED,
    PAYMENT_FAILED,
    VERA_SUBMITTING,
    VERA_SUBMITTED,
    VERA_SUBMIT_FAILED
}
