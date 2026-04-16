const bridgeRequestSource = "irefined-bridge-request";
const bridgeResponseSource = "irefined-bridge-response";
const bridgeTimeoutMs = 5000;
const bridgeTargetOrigin = window.location.origin;

export const PURCHASE_HISTORY_SUMMARY_KEY = "iref_purchase_history_summary";
export const MISSING_CONTENT_SUMMARY_KEY = "iref_missing_content_summary";
export const MEMBERSHIP_SUMMARY_KEY = "iref_membership_summary";
export const PURCHASE_HISTORY_SESSION_KEY_PREFIX =
  "iref_purchase_history_summary::";

export function getPurchaseHistorySessionKey(sessionId = "") {
  const normalized = String(sessionId || "").trim();
  return normalized
    ? `${PURCHASE_HISTORY_SESSION_KEY_PREFIX}${normalized}`
    : PURCHASE_HISTORY_SUMMARY_KEY;
}

function createRequestId() {
  return `iref-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function waitForBridgeResponse(requestId) {
  return new Promise((resolve, reject) => {
    let timeoutId = 0;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };

    const handleMessage = (event) => {
      if (event.source !== window) {
        return;
      }

      const data = event.data;

      if (
        !data ||
        data.source !== bridgeResponseSource ||
        data.requestId !== requestId
      ) {
        return;
      }

      cleanup();

      if (data.success === false) {
        reject(new Error(data.error || "Bridge request failed."));
        return;
      }

      resolve(data.payload ?? null);
    };

    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Bridge request timed out."));
    }, bridgeTimeoutMs);

    window.addEventListener("message", handleMessage);
  });
}

function sendBridgeRequest(action, payload = {}) {
  const requestId = createRequestId();
  const pendingResponse = waitForBridgeResponse(requestId);

  window.postMessage(
    {
      source: bridgeRequestSource,
      requestId,
      action,
      payload,
    },
    bridgeTargetOrigin
  );

  return pendingResponse;
}

export async function bridgeStorageGet(keys) {
  return (
    (await sendBridgeRequest("storage-get", {
      keys: Array.isArray(keys) ? keys : [keys],
    })) || {}
  );
}

export async function bridgeStorageSet(values) {
  return (
    (await sendBridgeRequest("storage-set", {
      values: values && typeof values === "object" ? values : {},
    })) || {}
  );
}

export async function bridgeStorageRemove(keys) {
  return (
    (await sendBridgeRequest("storage-remove", {
      keys: Array.isArray(keys) ? keys : [keys],
    })) || {}
  );
}
