package gov.vitalrecords.certorder.service;

import gov.vitalrecords.certorder.model.TransactionRecord;
import gov.vitalrecords.certorder.model.TransactionStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final Map<String, TransactionRecord> transactions = new ConcurrentHashMap<>();
    private final Duration transactionTtl;

    public TransactionService(@Value("${app.session.transaction-ttl-minutes:30}") long ttlMinutes) {
        this.transactionTtl = Duration.ofMinutes(ttlMinutes);
    }

    public TransactionRecord createTransaction(String certificateType, String amount) {
        String transactionId = "TX-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        TransactionRecord record = new TransactionRecord(transactionId, certificateType, amount);
        record.setStatus(TransactionStatus.PAYMENT_PENDING);
        transactions.put(transactionId, record);
        log.info("Transaction created transactionId={} certificateType={} amount={}", transactionId, certificateType, amount);
        return record;
    }

    public Optional<TransactionRecord> findById(String transactionId) {
        return Optional.ofNullable(transactions.get(transactionId));
    }

    public void updateStatus(String transactionId, TransactionStatus status) {
        TransactionRecord record = transactions.get(transactionId);
        if (record != null) {
            record.setStatus(status);
        }
    }

    public void setRedirectUrl(String transactionId, String redirectUrl) {
        TransactionRecord record = transactions.get(transactionId);
        if (record != null) {
            record.setPaymentRedirectUrl(redirectUrl);
        }
    }

    public void setVeraReference(String transactionId, String veraReferenceId) {
        TransactionRecord record = transactions.get(transactionId);
        if (record != null) {
            record.setVeraReferenceId(veraReferenceId);
        }
    }

    public void setError(String transactionId, String message) {
        TransactionRecord record = transactions.get(transactionId);
        if (record != null) {
            record.setErrorMessage(message);
        }
    }

    @Scheduled(fixedDelay = 60000)
    public void evictExpiredTransactions() {
        Instant now = Instant.now();
        int before = transactions.size();
        transactions.entrySet().removeIf(entry -> Duration.between(entry.getValue().getCreatedAt(), now).compareTo(transactionTtl) > 0);
        int removed = before - transactions.size();
        if (removed > 0) {
            log.info("Evicted {} expired transaction(s); remaining={}", removed, transactions.size());
        }
    }
}
