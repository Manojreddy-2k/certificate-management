package gov.vitalrecords.certorder.api;

import gov.vitalrecords.certorder.api.dto.TransactionStatusResponse;
import gov.vitalrecords.certorder.model.TransactionRecord;
import gov.vitalrecords.certorder.model.TransactionStatus;
import gov.vitalrecords.certorder.observability.CorrelationIdConstants;
import gov.vitalrecords.certorder.service.PaymentOrchestrationService;
import gov.vitalrecords.certorder.service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private static final Logger log = LoggerFactory.getLogger(TransactionController.class);

    private final TransactionService transactionService;
    private final PaymentOrchestrationService paymentOrchestrationService;

    public TransactionController(TransactionService transactionService, PaymentOrchestrationService paymentOrchestrationService) {
        this.transactionService = transactionService;
        this.paymentOrchestrationService = paymentOrchestrationService;
    }

    @GetMapping("/{transactionId}/status")
    public TransactionStatusResponse getStatus(@PathVariable String transactionId) {
        MDC.put(CorrelationIdConstants.MDC_TRANSACTION_ID, transactionId);
        try {
            log.info("Transaction status polled");
            TransactionRecord record = transactionService.findById(transactionId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

            log.info("Transaction status response status={}", record.getStatus().name());
            return buildResponse(record);
        } finally {
            MDC.remove(CorrelationIdConstants.MDC_TRANSACTION_ID);
        }
    }

    private static TransactionStatusResponse buildResponse(TransactionRecord record) {
        return new TransactionStatusResponse(
                record.getTransactionId(),
                record.getStatus().name(),
                record.getVeraReferenceId(),
                record.getErrorMessage()
        );
    }

    @PostMapping("/{transactionId}/retry-vera")
    public TransactionStatusResponse retryVera(@PathVariable String transactionId) {
        MDC.put(CorrelationIdConstants.MDC_TRANSACTION_ID, transactionId);
        try {
            log.info("VERA retry requested");
            TransactionRecord record = transactionService.findById(transactionId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

            if (record.getStatus() != TransactionStatus.VERA_SUBMIT_FAILED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Retry allowed only for VERA_SUBMIT_FAILED");
            }

            paymentOrchestrationService.handlePaymentSucceeded(transactionId);
            TransactionRecord updated = transactionService.findById(transactionId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

            return buildResponse(updated);
        } finally {
            MDC.remove(CorrelationIdConstants.MDC_TRANSACTION_ID);
        }
    }
}
