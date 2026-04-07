package gov.vitalrecords.certorder.service;

import gov.vitalrecords.certorder.model.OrderDetails;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryOrderStore {

    private static final Duration DEFAULT_TTL = Duration.ofMinutes(60);

    private final ConcurrentHashMap<String, StoredOrder> store = new ConcurrentHashMap<>();
    private final Clock clock = Clock.systemUTC();

    public void put(String transactionId, OrderDetails orderDetails) {
        store.put(transactionId, new StoredOrder(orderDetails, Instant.now(clock).plus(DEFAULT_TTL)));
    }

    public Optional<OrderDetails> get(String transactionId) {
        StoredOrder value = store.get(transactionId);
        if (value == null) {
            return Optional.empty();
        }
        if (Instant.now(clock).isAfter(value.expiresAt())) {
            store.remove(transactionId);
            return Optional.empty();
        }
        return Optional.of(value.orderDetails());
    }

    public void remove(String transactionId) {
        store.remove(transactionId);
    }

    @Scheduled(fixedDelay = 5 * 60 * 1000L)
    public void purgeExpired() {
        Instant now = Instant.now(clock);
        store.entrySet().removeIf(entry -> now.isAfter(entry.getValue().expiresAt()));
    }

    private record StoredOrder(OrderDetails orderDetails, Instant expiresAt) {}
}

