package gov.vitalrecords.certorder.api.dto;

public record WebhookAckResponse(
        String transactionId,
        String status
) {
}
