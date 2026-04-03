package gov.vitalrecords.certorder.service;

import gov.vitalrecords.certorder.model.TransactionStatus;
import gov.vitalrecords.certorder.observability.CorrelationIdConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

@Service
public class PaymentOrchestrationService {

    private static final Logger log = LoggerFactory.getLogger(PaymentOrchestrationService.class);

    private final TransactionService transactionService;
    private final VeraService veraService;

    public PaymentOrchestrationService(TransactionService transactionService, VeraService veraService) {
        this.transactionService = transactionService;
        this.veraService = veraService;
    }

    public void handlePaymentSucceeded(String transactionId) {
        MDC.put(CorrelationIdConstants.MDC_TRANSACTION_ID, transactionId);
        try {
            log.info("Orchestration: payment succeeded; updating status and submitting to VERA");
            transactionService.updateStatus(transactionId, TransactionStatus.PAYMENT_SUCCEEDED);
            transactionService.updateStatus(transactionId, TransactionStatus.VERA_SUBMITTING);
            try {
                String veraRef = veraService.submitOrder(transactionId);
                transactionService.setVeraReference(transactionId, veraRef);
                transactionService.updateStatus(transactionId, TransactionStatus.VERA_SUBMITTED);
                log.info("Orchestration: VERA submit complete veraReferenceId={}", veraRef);
            } catch (Exception ex) {
                log.warn("Orchestration: VERA submit failed transactionId={}: {}", transactionId, ex.toString());
                transactionService.setError(transactionId, "VERA submission failed. Retry required.");
                transactionService.updateStatus(transactionId, TransactionStatus.VERA_SUBMIT_FAILED);
            }
        } finally {
            MDC.remove(CorrelationIdConstants.MDC_TRANSACTION_ID);
        }
    }

    public void handlePaymentFailed(String transactionId) {
        MDC.put(CorrelationIdConstants.MDC_TRANSACTION_ID, transactionId);
        try {
            log.info("Orchestration: payment failed or cancelled");
            transactionService.updateStatus(transactionId, TransactionStatus.PAYMENT_FAILED);
            transactionService.setError(transactionId, "Payment was not completed.");
        } finally {
            MDC.remove(CorrelationIdConstants.MDC_TRANSACTION_ID);
        }
    }
}
