package gov.vitalrecords.certorder.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class VeraService {

    private static final Logger log = LoggerFactory.getLogger(VeraService.class);

    public String submitOrder(String transactionId) {
        log.info("VERA (mock) submit for transactionId={}", transactionId);
        return "VERA-" + transactionId;
    }
}
