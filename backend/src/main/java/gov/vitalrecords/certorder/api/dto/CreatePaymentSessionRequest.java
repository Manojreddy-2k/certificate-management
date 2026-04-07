package gov.vitalrecords.certorder.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreatePaymentSessionRequest(
        @NotBlank(message = "certificateType is required")
        String certificateType,
        @NotBlank(message = "amount is required")
        @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "amount must be a valid number")
        String amount,
        @NotNull(message = "applicant is required")
        Applicant applicant,
        @NotNull(message = "shipping is required")
        Shipping shipping
) {
    public record Applicant(
            @NotBlank(message = "applicant.firstName is required")
            String firstName,
            @NotBlank(message = "applicant.lastName is required")
            String lastName,
            @NotBlank(message = "applicant.dateOfBirth is required")
            @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "applicant.dateOfBirth must be YYYY-MM-DD")
            String dateOfBirth,
            String email,
            String phone
    ) {}

    public record Shipping(
            @NotBlank(message = "shipping.addressLine1 is required")
            String addressLine1,
            @NotBlank(message = "shipping.city is required")
            String city,
            @NotBlank(message = "shipping.state is required")
            String state,
            @NotBlank(message = "shipping.zip is required")
            String zip
    ) {}
}
