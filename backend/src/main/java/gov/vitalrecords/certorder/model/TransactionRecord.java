package gov.vitalrecords.certorder.model;

import java.time.Instant;

public class TransactionRecord {

    private final String transactionId;
    private final String certificateType;
    private final String amount;
    private TransactionStatus status;
    private String paymentRedirectUrl;
    private String veraReferenceId;
    private String errorMessage;
    private final Instant createdAt;
    private Instant updatedAt;

    public TransactionRecord(String transactionId, String certificateType, String amount) {
        this.transactionId = transactionId;
        this.certificateType = certificateType;
        this.amount = amount;
        this.status = TransactionStatus.CHECKOUT_STARTED;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public String getCertificateType() {
        return certificateType;
    }

    public String getAmount() {
        return amount;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public String getPaymentRedirectUrl() {
        return paymentRedirectUrl;
    }

    public void setPaymentRedirectUrl(String paymentRedirectUrl) {
        this.paymentRedirectUrl = paymentRedirectUrl;
        this.updatedAt = Instant.now();
    }

    public String getVeraReferenceId() {
        return veraReferenceId;
    }

    public void setVeraReferenceId(String veraReferenceId) {
        this.veraReferenceId = veraReferenceId;
        this.updatedAt = Instant.now();
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
        this.updatedAt = Instant.now();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
