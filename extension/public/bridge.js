(function () {
  if (window.__irefinedBridgeLoaded) {
    return;
  }

  window.__irefinedBridgeLoaded = true;

  const requestSource = "irefined-bridge-request";
  const responseSource = "irefined-bridge-response";
  const bridgeTargetOrigin = window.location.origin;
  const allowedStaticKeys = new Set([
    "iref_purchase_history_summary",
    "iref_missing_content_summary",
  ]);
  const purchaseHistorySessionKeyPrefix = "iref_purchase_history_summary::";

  function isAllowedKey(key) {
    return (
      allowedStaticKeys.has(key) ||
      key.startsWith(purchaseHistorySessionKeyPrefix)
    );
  }

  function respond(requestId, success, payload, error) {
    window.postMessage(
      {
        source: responseSource,
        requestId,
        success,
        payload: payload || null,
        error: error || "",
      },
      bridgeTargetOrigin
    );
  }

  function sanitizeKeys(keys) {
    return (Array.isArray(keys) ? keys : [])
      .map((key) => String(key || ""))
      .filter((key) => isAllowedKey(key));
  }

  function sanitizeValues(values) {
    const source = values && typeof values === "object" ? values : {};
    const next = {};

    Object.keys(source).forEach((key) => {
      if (!isAllowedKey(key)) {
        return;
      }

      next[key] = source[key];
    });

    return next;
  }

  function storageGet(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (items) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve(items || {});
      });
    });
  }

  function storageSet(values) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(values, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve(values);
      });
    });
  }

  function storageRemove(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve({ removed: keys });
      });
    });
  }

  window.addEventListener("message", async (event) => {
    if (event.source !== window) {
      return;
    }

    const data = event.data;

    if (!data || data.source !== requestSource || !data.requestId) {
      return;
    }

    try {
      if (data.action === "storage-get") {
        const keys = sanitizeKeys(data.payload && data.payload.keys);
        const items = await storageGet(keys);
        respond(data.requestId, true, items);
        return;
      }

      if (data.action === "storage-set") {
        const values = sanitizeValues(data.payload && data.payload.values);
        await storageSet(values);
        respond(data.requestId, true, values);
        return;
      }

      if (data.action === "storage-remove") {
        const keys = sanitizeKeys(data.payload && data.payload.keys);
        const result = await storageRemove(keys);
        respond(data.requestId, true, result);
        return;
      }

      throw new Error("Unsupported bridge action.");
    } catch (error) {
      respond(data.requestId, false, null, error && error.message);
    }
  });
})();
