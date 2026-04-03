package gov.vitalrecords.certorder.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreatePaymentSessionRequest(
        @NotBlank(message = "certificateType is required")
        String certificateType,
        @NotBlank(message = "amount is required")
        @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "amount must be a valid number")
        String amount
) {
}
