package gov.vitalrecords.certorder.service;

import gov.vitalrecords.certorder.model.OrderDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class VeraService {

    private static final Logger log = LoggerFactory.getLogger(VeraService.class);

    private final InMemoryOrderStore orderStore;

    public VeraService(InMemoryOrderStore orderStore) {
        this.orderStore = orderStore;
    }

    public String submitOrder(String transactionId) {
        OrderDetails orderDetails = orderStore.get(transactionId)
                .orElseThrow(() -> new IllegalStateException("Order details not found (expired or missing)"));

        // In the real integration, this is where we'd POST JSON to VERA over a secure channel.
        // Avoid logging PII (names/address). Log only transaction identifiers.
        log.info("VERA (mock) submit for transactionId={} certificateType={}", transactionId, orderDetails.certificateType());
        return "VERA-" + transactionId;
    }
}
