package gov.vitalrecords.certorder.observability;

/**
 * HTTP header and {@link org.slf4j.MDC} keys for request tracing.
 */
public final class CorrelationIdConstants {

    public static final String HEADER_NAME = "X-Correlation-Id";
    public static final String MDC_CORRELATION_ID = "correlationId";
    public static final String MDC_TRANSACTION_ID = "transactionId";
    public static final String MDC_STRIPE_EVENT_ID = "stripeEventId";

    private CorrelationIdConstants() {}
}
