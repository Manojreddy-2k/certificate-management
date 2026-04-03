package gov.vitalrecords.certorder.api;

import gov.vitalrecords.certorder.api.dto.TransactionStatusResponse;
import gov.vitalrecords.certorder.model.TransactionRecord;
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
@RequestMapping("/api/vera")
public class VeraController {

    private static final Logger log = LoggerFactory.getLogger(VeraController.class);

    private final PaymentOrchestrationService paymentOrchestrationService;
    private final TransactionService transactionService;

    public VeraController(PaymentOrchestrationService paymentOrchestrationService, TransactionService transactionService) {
        this.paymentOrchestrationService = paymentOrchestrationService;
        this.transactionService = transactionService;
    }

    @PostMapping("/submit/{transactionId}")
    public TransactionStatusResponse submitToVera(@PathVariable String transactionId) {
        MDC.put(CorrelationIdConstants.MDC_TRANSACTION_ID, transactionId);
        try {
            log.info("Manual VERA submit endpoint invoked");
            TransactionRecord existing = transactionService.findById(transactionId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

            paymentOrchestrationService.handlePaymentSucceeded(existing.getTransactionId());
            TransactionRecord updated = transactionService.findById(existing.getTransactionId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

            return new TransactionStatusResponse(
                    updated.getTransactionId(),
                    updated.getStatus().name(),
                    updated.getVeraReferenceId(),
                    updated.getErrorMessage()
            );
        } finally {
            MDC.remove(CorrelationIdConstants.MDC_TRANSACTION_ID);
        }
    }
}
