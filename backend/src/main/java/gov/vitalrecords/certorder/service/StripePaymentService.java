package gov.vitalrecords.certorder.service;

import com.stripe.Stripe;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import gov.vitalrecords.certorder.model.TransactionRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
public class StripePaymentService {

    private static final Logger log = LoggerFactory.getLogger(StripePaymentService.class);

    private final String webhookSecret;
    private final String currency;
    private final String successUrl;
    private final String cancelUrl;

    public StripePaymentService(
            @Value("${app.payment.stripe-secret-key}") String stripeSecretKey,
            @Value("${app.payment.stripe-webhook-secret}") String webhookSecret,
            @Value("${app.payment.currency:usd}") String currency,
            @Value("${app.payment.success-url}") String successUrl,
            @Value("${app.payment.cancel-url}") String cancelUrl
    ) {
        Stripe.apiKey = stripeSecretKey;
        this.webhookSecret = webhookSecret;
        this.currency = currency;
        this.successUrl = successUrl;
        this.cancelUrl = cancelUrl;
    }

    public Session createCheckoutSession(TransactionRecord record) throws StripeException {
        long amountCents = toCents(record.getAmount());

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl + "?transactionId=" + record.getTransactionId())
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(currency)
                                                .setUnitAmount(amountCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Vital record certificate (" + record.getCertificateType() + ")")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("transactionId", record.getTransactionId())
                .build();

        Session session = Session.create(params);
        log.info("Stripe Checkout Session created sessionId={} transactionId={}", session.getId(), record.getTransactionId());
        return session;
    }

    public Optional<String> parseStripeEventId(String payload) {
        try {
            JsonObject root = JsonParser.parseString(payload).getAsJsonObject();
            if (root.has("id") && !root.get("id").isJsonNull()) {
                return Optional.of(root.get("id").getAsString());
            }
        } catch (RuntimeException ignored) {
            // malformed JSON handled upstream
        }
        return Optional.empty();
    }

    /**
     * Verifies the webhook signature only. Avoids {@link Webhook#constructEvent}: newer Checkout Session payloads
     * can fail full {@code Event} deserialization while the signature is still valid.
     */
    public void verifyWebhookSignature(String payload, String signatureHeader) throws SignatureVerificationException {
        Webhook.Signature.verifyHeader(payload, signatureHeader, webhookSecret, Webhook.DEFAULT_TOLERANCE);
    }

    public String parseEventType(String payload) {
        JsonObject root = JsonParser.parseString(payload).getAsJsonObject();
        return root.get("type").getAsString();
    }

    public Optional<String> extractCheckoutTransactionIdFromPayload(String payload) {
        JsonObject root = JsonParser.parseString(payload).getAsJsonObject();
        if (!root.has("data")) {
            return Optional.empty();
        }
        JsonObject data = root.getAsJsonObject("data");
        if (!data.has("object") || data.get("object").isJsonNull()) {
            return Optional.empty();
        }
        JsonObject obj = data.getAsJsonObject("object");
        if (!obj.has("metadata") || obj.get("metadata").isJsonNull()) {
            return Optional.empty();
        }
        JsonObject metadata = obj.getAsJsonObject("metadata");
        if (!metadata.has("transactionId") || metadata.get("transactionId").isJsonNull()) {
            return Optional.empty();
        }
        String transactionId = metadata.get("transactionId").getAsString();
        return Optional.ofNullable(transactionId.isBlank() ? null : transactionId);
    }

    private long toCents(String amount) {
        BigDecimal dollars = new BigDecimal(amount);
        BigDecimal cents = dollars.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP);
        return cents.longValueExact();
    }
}

