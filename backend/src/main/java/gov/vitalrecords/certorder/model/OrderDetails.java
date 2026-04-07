package gov.vitalrecords.certorder.model;

public record OrderDetails(
        String certificateType,
        String amount,
        Applicant applicant,
        Shipping shipping
) {
    public record Applicant(
            String firstName,
            String lastName,
            String dateOfBirth,
            String email,
            String phone
    ) {}

    public record Shipping(
            String addressLine1,
            String city,
            String state,
            String zip
    ) {}
}

