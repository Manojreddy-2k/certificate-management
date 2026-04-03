package gov.vitalrecords.certorder.api.dto;

public record TransactionStatusResponse(
        String transactionId,
        String status,
        String veraReferenceId,
        String error
) {
}
