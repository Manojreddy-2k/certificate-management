package gov.vitalrecords.certorder.api.dto;

public record CreatePaymentSessionResponse(
        String transactionId,
        String paymentRedirectUrl,
        String status
) {
}
