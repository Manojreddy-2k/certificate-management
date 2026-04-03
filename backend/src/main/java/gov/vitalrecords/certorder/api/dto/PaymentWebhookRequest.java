package gov.vitalrecords.certorder.api.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentWebhookRequest(
        @NotBlank(message = "transactionId is required")
        String transactionId,
        @NotBlank(message = "eventType is required")
        String eventType
) {
}
