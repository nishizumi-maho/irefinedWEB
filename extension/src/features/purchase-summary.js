import features from "../feature-manager.js";
import {
  clearStoredPurchaseAnalytics,
  formatSyncTime,
  formatUsd,
  getContentSpend,
  getOwnedCatalogValue,
  getPendingContentCost,
  getRecentSpend,
  getStoredPurchaseAnalytics,
  openOrderHistoryPage,
  syncMissingContentSummary,
} from "../helpers/purchase-analytics.js";
import {
  buildPriceCuriosities,
  nextCuriositySeed,
} from "../helpers/price-curiosities.js";
import {
  cleanupDashboardWidgetRow,
  ensureDashboardWidgetRow,
} from "../helpers/dashboard-widget-row.js";
import "./dashboard-widget-row.css";
import "./purchase-summary.css";

const id = "dashboard-purchase-summary";
const selector = "body";
const bodyClass = `iref-${id}`;
const dashboardPath = "/web/racing/home/dashboard";
const sessionStorageKey = "iref_dashboard_purchase_state_v2";
const sessionTokenStorageKey = "iref_dashboard_purchase_session_token_v1";
const autoRefreshSessionKey = "iref_dashboard_purchase_autorefreshed_v2";
const state = {
  purchaseHistorySummary: null,
  missingContentSummary: null,
  purchaseHistoryError: "",
  missingContentError: "",
  loadingStored: false,
  loadingPending: false,
};

let booted = false;
let tickHandle = 0;
let loadPromise = null;
let pendingPromise = null;
const curiositySeed = nextCuriositySeed("dashboard");
let financialsRevealed = false;
let summaryExpanded = false;
let sessionLoaded = false;
let autoRefreshAttempted = false;
let dashboardSessionId = "";
let historySyncRequested = false;
let cleanupBound = false;

function isDashboardPage() {
  return location.pathname === dashboardPath;
}

function getRoot() {
  return document.querySelector("#iref-dashboard-purchase-summary");
}

function removeRoot() {
  getRoot()?.remove();
  cleanupDashboardWidgetRow();
}

function createSessionToken() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  const values = new Uint32Array(4);
  window.crypto?.getRandomValues?.(values);
  const randomPart = [...values]
    .map((value) => value.toString(36).padStart(7, "0"))
    .join("");

  return `iref-${Date.now()}-${randomPart}`;
}

function ensureDashboardSessionId() {
  if (dashboardSessionId) {
    return dashboardSessionId;
  }

  try {
    const stored = sessionStorage.getItem(sessionTokenStorageKey);

    if (stored) {
      dashboardSessionId = stored;
      return dashboardSessionId;
    }

    dashboardSessionId = createSessionToken();
    sessionStorage.setItem(sessionTokenStorageKey, dashboardSessionId);
    return dashboardSessionId;
  } catch {
    dashboardSessionId = createSessionToken();
    return dashboardSessionId;
  }
}

async function clearBudgetSnapshotSession() {
  const sessionId = ensureDashboardSessionId();

  try {
    sessionStorage.removeItem(sessionStorageKey);
    sessionStorage.removeItem(autoRefreshSessionKey);
    sessionStorage.removeItem(sessionTokenStorageKey);
  } catch {}

  if (!sessionId) {
    return;
  }

  try {
    await clearStoredPurchaseAnalytics(sessionId);
  } catch {}
}

function bindSessionCleanup() {
  if (cleanupBound) {
    return;
  }

  cleanupBound = true;
  window.addEventListener("beforeunload", () => {
    void clearBudgetSnapshotSession();
  });
}

function getAnchor() {
  return ensureDashboardWidgetRow();
}

function ensureRoot() {
  if (!isDashboardPage()) {
    return null;
  }

  const row = getAnchor();

  if (!row) {
    return null;
  }

  let root = getRoot();

  if (!root) {
    root = document.createElement("section");
    root.id = "iref-dashboard-purchase-summary";
    root.className = "iref-dashboard-purchase-summary";
    root.innerHTML = `
      <div class="iref-dashboard-purchase-summary-header">
        <div class="iref-dashboard-purchase-summary-copy">
          <span class="iref-dashboard-purchase-summary-label">iRefined</span>
          <h3 class="iref-dashboard-purchase-summary-title">Budget Snapshot</h3>
        </div>
        <div class="iref-dashboard-purchase-summary-actions">
          <button
            type="button"
            id="iref-dashboard-purchase-privacy"
            class="iref-dashboard-purchase-summary-btn"
          >
            Reveal
          </button>
          <button
            type="button"
            id="iref-dashboard-purchase-expand"
            class="iref-dashboard-purchase-summary-btn"
          >
            Expand
          </button>
          <button
            type="button"
            id="iref-dashboard-purchase-refresh"
            class="iref-dashboard-purchase-summary-btn"
          >
            Refresh
          </button>
          <button
            type="button"
            id="iref-dashboard-purchase-history"
            class="iref-dashboard-purchase-summary-btn"
          >
            Order History
          </button>
        </div>
      </div>
      <div
        id="iref-dashboard-purchase-sync-gate"
        class="iref-dashboard-purchase-summary-sync-gate"
      >
        <div class="iref-dashboard-purchase-summary-sync-copy">
          <span class="iref-dashboard-purchase-summary-sync-label">Sync Required</span>
          <strong class="iref-dashboard-purchase-summary-sync-title">
            Sync Order History to continue.
          </strong>
          <p
            id="iref-dashboard-purchase-sync-note"
            class="iref-dashboard-purchase-summary-sync-note"
          >
            This widget refreshes automatically when the sync finishes.
          </p>
        </div>
        <button
          type="button"
          id="iref-dashboard-purchase-sync-open"
          class="iref-dashboard-purchase-summary-sync-btn"
        >
          Open Order History
        </button>
      </div>
      <div class="iref-dashboard-purchase-summary-compact">
        <div class="iref-dashboard-purchase-summary-card iref-dashboard-purchase-summary-card-recent">
          <span class="iref-dashboard-purchase-summary-card-label">Last 30 Days</span>
          <strong
            id="iref-dashboard-purchase-recent-value"
            class="iref-dashboard-purchase-summary-card-value"
          >--</strong>
          <div
            id="iref-dashboard-purchase-recent-note"
            class="iref-dashboard-purchase-summary-card-note"
          >
            Net spend from synced Order History.
          </div>
        </div>
      </div>
      <div class="iref-dashboard-purchase-summary-detail">
        <div class="iref-dashboard-purchase-summary-grid">
          <div class="iref-dashboard-purchase-summary-card">
            <span class="iref-dashboard-purchase-summary-card-label">Content Spend</span>
            <strong
              id="iref-dashboard-purchase-spend-value"
              class="iref-dashboard-purchase-summary-card-value"
            >--</strong>
            <div
              id="iref-dashboard-purchase-spend-note"
              class="iref-dashboard-purchase-summary-card-note"
            >
              Estimating from current catalog.
            </div>
          </div>
          <div class="iref-dashboard-purchase-summary-card">
            <span class="iref-dashboard-purchase-summary-card-label">Content Pending</span>
            <strong
              id="iref-dashboard-purchase-pending-value"
              class="iref-dashboard-purchase-summary-card-value"
            >--</strong>
            <div
              id="iref-dashboard-purchase-pending-note"
              class="iref-dashboard-purchase-summary-card-note"
            >
              Current catalog value of unowned cars and tracks.
            </div>
          </div>
        </div>
        <div class="iref-dashboard-purchase-summary-fact">
          <span class="iref-dashboard-purchase-summary-fact-label">Rotating Curiosities</span>
          <div
            id="iref-dashboard-purchase-fact"
            class="iref-dashboard-purchase-summary-fact-list"
          ></div>
        </div>
      </div>
      <div
        id="iref-dashboard-purchase-status"
        class="iref-dashboard-purchase-summary-status"
      ></div>
    `;

    root
      .querySelector("#iref-dashboard-purchase-privacy")
      ?.addEventListener("click", () => {
        financialsRevealed = !financialsRevealed;
        render();
      });
    root
      .querySelector("#iref-dashboard-purchase-expand")
      ?.addEventListener("click", () => {
        summaryExpanded = !summaryExpanded;
        render();
      });
    root
      .querySelector("#iref-dashboard-purchase-refresh")
      ?.addEventListener("click", () => {
        void refreshPendingSummary(true);
        void loadStoredAnalytics(true);
      });
    root
      .querySelector("#iref-dashboard-purchase-history")
      ?.addEventListener("click", () => {
        historySyncRequested = true;
        saveSessionState();
        openOrderHistoryPage(ensureDashboardSessionId());
      });
    root
      .querySelector("#iref-dashboard-purchase-sync-open")
      ?.addEventListener("click", () => {
        historySyncRequested = true;
        saveSessionState();
        openOrderHistoryPage(ensureDashboardSessionId());
      });
    root
      .querySelectorAll(
        ".iref-dashboard-purchase-summary-card, .iref-dashboard-purchase-summary-fact"
      )
      .forEach((element) => {
        element.addEventListener("click", () => {
          if (!financialsRevealed) {
            financialsRevealed = true;
            render();
          }
        });
      });
  }

  if (root.parentNode !== row) {
    row.appendChild(root);
  }

  return root;
}

function saveSessionState() {
  try {
    sessionStorage.setItem(
      sessionStorageKey,
      JSON.stringify({
        purchaseHistorySummary: state.purchaseHistorySummary,
        missingContentSummary: state.missingContentSummary,
        purchaseHistoryError: state.purchaseHistoryError,
        missingContentError: state.missingContentError,
        financialsRevealed,
        summaryExpanded,
        historySyncRequested,
      })
    );
  } catch {}
}

function loadSessionState() {
  if (sessionLoaded) {
    return;
  }

  sessionLoaded = true;

  try {
    const raw = sessionStorage.getItem(sessionStorageKey);

    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    state.purchaseHistorySummary = parsed?.purchaseHistorySummary || null;
    state.missingContentSummary = parsed?.missingContentSummary || null;
    state.purchaseHistoryError = parsed?.purchaseHistoryError || "";
    state.missingContentError = parsed?.missingContentError || "";
    financialsRevealed = parsed?.financialsRevealed === true;
    summaryExpanded = parsed?.summaryExpanded === true;
    historySyncRequested = parsed?.historySyncRequested === true;
  } catch {}
}

function shouldAutoRefreshThisSession() {
  try {
    return sessionStorage.getItem(autoRefreshSessionKey) !== "1";
  } catch {
    return !autoRefreshAttempted;
  }
}

function markAutoRefreshDone() {
  autoRefreshAttempted = true;

  try {
    sessionStorage.setItem(autoRefreshSessionKey, "1");
  } catch {}
}

function render() {
  const root = ensureRoot();

  if (!root) {
    return;
  }

  root.classList.toggle("is-private", !financialsRevealed);
  root.classList.toggle("is-expanded", summaryExpanded);
  root.classList.toggle("is-compact", !summaryExpanded);

  const recentValue = root.querySelector("#iref-dashboard-purchase-recent-value");
  const recentNote = root.querySelector("#iref-dashboard-purchase-recent-note");
  const spendValue = root.querySelector("#iref-dashboard-purchase-spend-value");
  const spendNote = root.querySelector("#iref-dashboard-purchase-spend-note");
  const pendingValue = root.querySelector("#iref-dashboard-purchase-pending-value");
  const pendingNote = root.querySelector("#iref-dashboard-purchase-pending-note");
  const fact = root.querySelector("#iref-dashboard-purchase-fact");
  const status = root.querySelector("#iref-dashboard-purchase-status");
  const privacyButton = root.querySelector("#iref-dashboard-purchase-privacy");
  const expandButton = root.querySelector("#iref-dashboard-purchase-expand");
  const refreshButton = root.querySelector("#iref-dashboard-purchase-refresh");
  const syncGate = root.querySelector("#iref-dashboard-purchase-sync-gate");
  const syncNote = root.querySelector("#iref-dashboard-purchase-sync-note");

  const hasPurchaseHistorySync = !!state.purchaseHistorySummary;
  const recentSpend = hasPurchaseHistorySync
    ? getRecentSpend(state.purchaseHistorySummary, 30)
    : null;
  const actualContentSpend = getContentSpend(state.purchaseHistorySummary);
  const estimatedContentSpend = getOwnedCatalogValue(state.missingContentSummary);
  const contentSpend = hasPurchaseHistorySync
    ? actualContentSpend === null
      ? estimatedContentSpend
      : actualContentSpend
    : null;
  const pendingCost = hasPurchaseHistorySync
    ? getPendingContentCost(state.missingContentSummary)
    : null;
  const curiosities = hasPurchaseHistorySync
    ? buildPriceCuriosities({
        spendAmount: contentSpend || 0,
        pendingAmount: pendingCost || 0,
        totalAmount: (contentSpend || 0) + (pendingCost || 0),
        seed: curiositySeed,
        limit: 1,
      })
    : [];

  root.classList.toggle("is-sync-required", !hasPurchaseHistorySync);

  if (syncGate) {
    syncGate.hidden = hasPurchaseHistorySync;
  }

  if (syncNote) {
    syncNote.textContent = historySyncRequested
      ? "Waiting for the Order History tab to finish the sync. This widget refreshes automatically."
      : "After the sync finishes, this widget refreshes automatically.";
  }

  if (recentValue) {
    recentValue.textContent = financialsRevealed && hasPurchaseHistorySync
      ? recentSpend === null
        ? "--"
        : formatUsd(recentSpend.net)
      : "Hidden";
  }

  if (recentNote) {
    if (!financialsRevealed) {
      recentNote.textContent =
        "Private by default. Click this card or Reveal to show the 30-day amount.";
    } else if (!hasPurchaseHistorySync) {
      recentNote.textContent = historySyncRequested
        ? "Waiting for Order History sync to finish for this dashboard tab."
        : "Open Order History to sync the real 30-day amount for this dashboard tab.";
    } else if (recentSpend) {
      recentNote.textContent = `${recentSpend.orders} order${
        recentSpend.orders === 1 ? "" : "s"
      } in the last 30 days. Order History synced ${formatSyncTime(
        state.purchaseHistorySummary?.syncedAt
      )}.`;
    } else if (state.loadingStored) {
      recentNote.textContent = "Loading synced Order History data...";
    } else {
      recentNote.textContent =
        "Open Order History by clicking here to sync real recent spend.";
    }
  }

  if (spendValue) {
    spendValue.textContent = financialsRevealed && hasPurchaseHistorySync
      ? contentSpend === null
        ? "--"
        : formatUsd(contentSpend)
      : "Hidden";
  }

  if (spendNote) {
    if (!financialsRevealed) {
      spendNote.textContent = "Click this card or Reveal to show the amount.";
    } else if (!hasPurchaseHistorySync) {
      spendNote.textContent =
        "Order History sync is required before Content Spend can be shown here.";
    } else if (actualContentSpend !== null && state.purchaseHistorySummary) {
      spendNote.textContent = `Order History synced ${formatSyncTime(
        state.purchaseHistorySummary.syncedAt
      )}.`;
    } else if (estimatedContentSpend !== null && state.missingContentSummary) {
      spendNote.textContent = `Estimated from owned catalog value. Catalog synced ${formatSyncTime(
        state.missingContentSummary.syncedAt
      )}.`;
    } else {
      spendNote.textContent = state.loadingPending
        ? "Estimating from current catalog..."
        : "Waiting for catalog sync.";
    }
  }

  if (pendingValue) {
    pendingValue.textContent = financialsRevealed && hasPurchaseHistorySync
      ? pendingCost === null
        ? "--"
        : formatUsd(pendingCost)
      : "Hidden";
  }

  if (pendingNote) {
    pendingNote.textContent = !financialsRevealed
      ? "Click this card or Reveal to show the amount."
      : !hasPurchaseHistorySync
        ? "Order History sync unlocks the pending content estimate for this tab."
        : state.missingContentSummary
          ? `Catalog synced ${formatSyncTime(state.missingContentSummary.syncedAt)}.`
          : state.loadingPending
            ? "Refreshing current catalog values..."
            : "Current catalog value of unowned cars and tracks.";
  }

  if (fact) {
    fact.innerHTML = "";

    if (!financialsRevealed) {
      const item = document.createElement("div");
      item.className = "iref-dashboard-purchase-summary-fact-copy";
      item.textContent = "Curiosities are hidden until you reveal the financial widget.";
      fact.appendChild(item);
    } else if (!hasPurchaseHistorySync) {
      const item = document.createElement("div");
      item.className = "iref-dashboard-purchase-summary-fact-copy";
      item.textContent =
        "Curiosities unlock after the Order History sync finishes for this dashboard tab.";
      fact.appendChild(item);
    } else if (curiosities.length) {
      const item = document.createElement("div");
      item.className = "iref-dashboard-purchase-summary-fact-copy";
      item.textContent = curiosities[0];
      fact.appendChild(item);
    } else {
      const item = document.createElement("div");
      item.className = "iref-dashboard-purchase-summary-fact-copy";
      item.textContent =
        "Waiting for enough data to compare your content budget with real-world racing costs.";
      fact.appendChild(item);
    }
  }

  if (status) {
    const parts = [];

    if (state.purchaseHistoryError) {
      parts.push(state.purchaseHistoryError);
    }

    if (state.missingContentError) {
      parts.push(state.missingContentError);
    }

    if (state.loadingPending) {
      parts.push("Refreshing current catalog...");
    }

    if (!parts.length) {
      if (!hasPurchaseHistorySync) {
        parts.push("");
      } else if (!summaryExpanded) {
        parts.push(
          "Compact mode shows your last 30 days. Expand for total content value and pending content."
        );
      } else if (actualContentSpend !== null && state.purchaseHistorySummary) {
        parts.push(
          "<strong>Content Spend</strong> is using Order History net content spend after gifts and auto credits."
        );
      } else {
        parts.push(
          "<strong>Content Spend</strong> is estimated from the current catalog value of your owned cars and tracks."
        );
      }
    }

    if (
      hasPurchaseHistorySync &&
      summaryExpanded &&
      actualContentSpend === null &&
      estimatedContentSpend !== null
    ) {
      parts.push(
        'For the paid amount instead of the estimate, open Order History by clicking <button type="button" id="iref-dashboard-purchase-status-history" class="iref-dashboard-purchase-summary-link-inline">here</button>.'
      );
    }

    status.innerHTML = parts.join(" ");
    status
      .querySelector("#iref-dashboard-purchase-status-history")
      ?.addEventListener("click", () => {
        historySyncRequested = true;
        saveSessionState();
        openOrderHistoryPage(ensureDashboardSessionId());
      });
  }

  if (refreshButton) {
    refreshButton.disabled =
      state.loadingPending || state.loadingStored || !hasPurchaseHistorySync;
    refreshButton.textContent =
      state.loadingPending || state.loadingStored ? "Refreshing..." : "Refresh";
  }

  if (privacyButton) {
    privacyButton.textContent = financialsRevealed ? "Hide" : "Reveal";
  }

  if (expandButton) {
    expandButton.textContent = summaryExpanded ? "Compact" : "Expand";
  }

  saveSessionState();
}

async function loadStoredAnalytics(force = false) {
  if (loadPromise) {
    return loadPromise;
  }

  const sessionId = ensureDashboardSessionId();

  if (!sessionId) {
    return Promise.resolve(null);
  }

  state.loadingStored = true;
  state.purchaseHistoryError = "";
  render();

  loadPromise = getStoredPurchaseAnalytics(sessionId)
    .then((stored) => {
      const nextSummary = stored.purchaseHistorySummary || null;
      const previousSyncAt = state.purchaseHistorySummary?.syncedAt || "";
      const nextSyncAt = nextSummary?.syncedAt || "";

      state.purchaseHistorySummary = nextSummary;

      if (nextSummary && nextSyncAt !== previousSyncAt) {
        historySyncRequested = false;
      }

      if (nextSummary) {
        void clearStoredPurchaseAnalytics(sessionId);
      }

      state.purchaseHistoryError = "";
    })
    .catch(() => {
      state.purchaseHistoryError = "Could not load saved spend data.";
    })
    .finally(() => {
      state.loadingStored = false;
      loadPromise = null;
      saveSessionState();
      render();
    });

  return loadPromise;
}

async function refreshPendingSummary(force = false) {
  if (pendingPromise) {
    return pendingPromise;
  }

  state.loadingPending = true;
  state.missingContentError = "";
  render();

  pendingPromise = syncMissingContentSummary({ persist: false })
    .then((summary) => {
      state.missingContentSummary = summary;
      state.missingContentError = "";
    })
    .catch(() => {
      state.missingContentError =
        "Could not refresh the pending content total on this page.";
    })
    .finally(() => {
      state.loadingPending = false;
      pendingPromise = null;
      saveSessionState();
      render();
    });

  return pendingPromise;
}

function tick() {
  if (document.hidden) {
    return;
  }

  if (!isDashboardPage()) {
    removeRoot();
    return;
  }

  loadSessionState();
  ensureDashboardSessionId();
  render();

  if (!state.loadingStored && !loadPromise) {
    void loadStoredAnalytics(true);
  }

  if (
    state.purchaseHistorySummary &&
    !autoRefreshAttempted &&
    shouldAutoRefreshThisSession() &&
    !state.loadingPending &&
    !pendingPromise
  ) {
    markAutoRefreshDone();
    void refreshPendingSummary();
  }
}

function init(activate = true) {
  if (!activate) {
    removeRoot();

    if (tickHandle) {
      window.clearInterval(tickHandle);
      tickHandle = 0;
    }

    booted = false;
    return;
  }

  if (booted) {
    return;
  }

  booted = true;
  bindSessionCleanup();
  ensureDashboardSessionId();
  tick();
  tickHandle = window.setInterval(tick, 1500);
}

features.add(id, true, selector, bodyClass, init);
