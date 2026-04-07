const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function newCorrelationId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `corr-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function withCorrelationHeader(headers = {}) {
  const hasCorrelation = Object.keys(headers).some((k) => k.toLowerCase() === "x-correlation-id");
  if (hasCorrelation) {
    return headers;
  }
  return {
    "X-Correlation-Id": newCorrelationId(),
    ...headers
  };
}

function withAuthHeader(headers = {}, accessToken) {
  if (!accessToken) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${accessToken}`
  };
}

async function requestJson(path, options = {}) {
  const mergedHeaders = withCorrelationHeader({
    ...(options.headers ?? {})
  });
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...mergedHeaders
    }
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export async function createPaymentSession(orderPayload, accessToken) {
  return requestJson("/api/payments/session", {
    method: "POST",
    headers: withAuthHeader({}, accessToken),
    body: JSON.stringify({
      certificateType: orderPayload?.certificateType,
      amount: orderPayload?.amount,
      applicant: orderPayload?.applicant,
      shipping: orderPayload?.shipping
    })
  });
}

export async function fetchTransactionStatus(transactionId, accessToken) {
  if (!transactionId) {
    throw new Error("transactionId is required");
  }

  return requestJson(`/api/transactions/${transactionId}/status`, {
    method: "GET",
    headers: withAuthHeader({}, accessToken)
  });
}

// Local development helper to simulate gateway callbacks.
export async function sendPaymentWebhookEvent(transactionId, eventType, accessToken) {
  if (!transactionId) {
    throw new Error("transactionId is required");
  }

  return requestJson("/api/payments/webhook", {
    method: "POST",
    headers: withAuthHeader({
      "X-Payment-Signature": "mock-payment-secret"
    }, accessToken),
    body: JSON.stringify({
      transactionId,
      eventType
    })
  });
}
