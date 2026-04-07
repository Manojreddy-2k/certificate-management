package gov.vitalrecords.certorder.api;

import gov.vitalrecords.certorder.api.dto.CreatePaymentSessionRequest;
import gov.vitalrecords.certorder.api.dto.CreatePaymentSessionResponse;
import gov.vitalrecords.certorder.model.OrderDetails;
import gov.vitalrecords.certorder.model.TransactionRecord;
import gov.vitalrecords.certorder.observability.CorrelationIdConstants;
import gov.vitalrecords.certorder.service.InMemoryOrderStore;
import gov.vitalrecords.certorder.service.PaymentOrchestrationService;
import gov.vitalrecords.certorder.service.StripePaymentService;
import gov.vitalrecords.certorder.service.TransactionService;
import com.google.gson.JsonSyntaxException;
import com.stripe.exception.SignatureVerificationException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.util.StreamUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final TransactionService transactionService;
    private final StripePaymentService stripePaymentService;
    private final PaymentOrchestrationService paymentOrchestrationService;
    private final InMemoryOrderStore orderStore;

    public PaymentController(
            TransactionService transactionService,
            StripePaymentService stripePaymentService,
            PaymentOrchestrationService paymentOrchestrationService,
            InMemoryOrderStore orderStore
    ) {
        this.transactionService = transactionService;
        this.stripePaymentService = stripePaymentService;
        this.paymentOrchestrationService = paymentOrchestrationService;
        this.orderStore = orderStore;
    }

    @PostMapping("/session")
    public CreatePaymentSessionResponse createSession(@Valid @RequestBody CreatePaymentSessionRequest request) {
        log.info("Payment session requested certificateType={} amount={}", request.certificateType(), request.amount());
        TransactionRecord record = transactionService.createTransaction(request.certificateType(), request.amount());
        MDC.put(CorrelationIdConstants.MDC_TRANSACTION_ID, record.getTransactionId());
        try {
            orderStore.put(record.getTransactionId(), mapOrderDetails(request));
            var session = stripePaymentService.createCheckoutSession(record);
            transactionService.setRedirectUrl(record.getTransactionId(), session.getUrl());
            log.info("Payment session ready transactionId={} status={}", record.getTransactionId(), record.getStatus().name());
            return new CreatePaymentSessionResponse(record.getTransactionId(), session.getUrl(), record.getStatus().name());
        } catch (Exception ex) {
            log.warn("Stripe Checkout session creation failed transactionId={}: {}", record.getTransactionId(), ex.toString());
            transactionService.setError(record.getTransactionId(), "Unable to create payment session.");
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to create Stripe Checkout session");
        } finally {
            MDC.remove(CorrelationIdConstants.MDC_TRANSACTION_ID);
        }
    }

    private static OrderDetails mapOrderDetails(CreatePaymentSessionRequest request) {
        return new OrderDetails(
                request.certificateType(),
                request.amount(),
                new OrderDetails.Applicant(
                        request.applicant().firstName(),
                        request.applicant().lastName(),
                        request.applicant().dateOfBirth(),
                        request.applicant().email(),
                        request.applicant().phone()
                ),
                new OrderDetails.Shipping(
                        request.shipping().addressLine1(),
                        request.shipping().city(),
                        request.shipping().state(),
                        request.shipping().zip()
                )
        );
    }

    @PostMapping("/webhook")
    public void handleStripeWebhook(
            @RequestHeader(name = "Stripe-Signature", required = false) String stripeSignature,
            HttpServletRequest request
    ) {
        if (stripeSignature == null || stripeSignature.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing Stripe-Signature header");
        }

        final String payload;
        try {
            payload = StreamUtils.copyToString(request.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read webhook body");
        }

        stripePaymentService.parseStripeEventId(payload).ifPresent(id -> MDC.put(CorrelationIdConstants.MDC_STRIPE_EVENT_ID, id));

        try {
            stripePaymentService.verifyWebhookSignature(payload, stripeSignature);
        } catch (SignatureVerificationException ex) {
            log.warn("Stripe webhook signature verification failed: {}", ex.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Stripe signature");
        }

        final String type;
        try {
            type = stripePaymentService.parseEventType(payload);
        } catch (JsonSyntaxException | IllegalStateException | NullPointerException ex) {
            log.warn("Stripe webhook JSON parse failed: {}", ex.toString());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Stripe webhook JSON");
        }

        log.info("Stripe webhook received eventType={}", type);

        // Handle only the minimal events we care about for the prototype.
        if (!"checkout.session.completed".equals(type) && !"checkout.session.async_payment_failed".equals(type)) {
            return;
        }

        String transactionId = stripePaymentService.extractCheckoutTransactionIdFromPayload(payload)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing transaction metadata"));

        MDC.put(CorrelationIdConstants.MDC_TRANSACTION_ID, transactionId);

        boolean exists = transactionService.findById(transactionId).isPresent();
        if (!exists) {
            log.warn("Stripe webhook references unknown transactionId={}", transactionId);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found");
        }

        if ("checkout.session.completed".equals(type)) {
            log.info("Processing checkout.session.completed for transactionId={}", transactionId);
            paymentOrchestrationService.handlePaymentSucceeded(transactionId);
        } else {
            log.info("Processing checkout.session.async_payment_failed for transactionId={}", transactionId);
            paymentOrchestrationService.handlePaymentFailed(transactionId);
        }
    }
}
