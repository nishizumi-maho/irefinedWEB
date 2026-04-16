import {
  bridgeStorageGet,
  bridgeStorageRemove,
  bridgeStorageSet,
  MISSING_CONTENT_SUMMARY_KEY,
  PURCHASE_HISTORY_SUMMARY_KEY,
  getPurchaseHistorySessionKey,
} from "./bridge-storage.js";

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function parseCurrency(value) {
  if (typeof value === "number") {
    return roundCurrency(value);
  }

  if (typeof value !== "string") {
    return 0;
  }

  const parsed = Number(value.replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(parsed) ? roundCurrency(parsed) : 0;
}


function createHiddenIframe(url) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "1280px";
  iframe.style.height = "900px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  iframe.src = url;
  document.body.appendChild(iframe);
  return iframe;
}

function findPageDataInReact(doc, cardIdPrefix) {
  const target = doc.querySelector(`[id^="${cardIdPrefix}"]`);

  if (!target) {
    return null;
  }

  const reactInternal = Object.keys(target).find((key) =>
    key.startsWith("__reactFiber")
  );

  if (!reactInternal) {
    return null;
  }

  let fiber = target[reactInternal];
  let depth = 0;

  while (fiber && depth <= 40) {
    const props = fiber.memoizedProps;

    if (props && Array.isArray(props.pageData)) {
      return props.pageData;
    }

    fiber = fiber.return;
    depth += 1;
  }

  return null;
}

function summarizeCatalogPageData(pageData = []) {
  const packageMap = new Map();

  pageData.forEach((item) => {
    const packageId = item?.package_id;

    if (!packageId || packageMap.has(packageId)) {
      return;
    }

    const price = Math.max(
      parseCurrency(item?.price),
      parseCurrency(item?.price_display)
    );

    if (price <= 0) {
      return;
    }

    packageMap.set(packageId, {
      packageId,
      price,
      owned: item?.owned === true,
    });
  });

  const items = [...packageMap.values()];
  const ownedItems = items.filter((item) => item.owned);
  const missingItems = items.filter((item) => !item.owned);

  return {
    owned: ownedItems.length,
    missing: missingItems.length,
    ownedCurrentValue: roundCurrency(
      ownedItems.reduce((sum, item) => sum + item.price, 0)
    ),
    remainingCost: roundCurrency(
      missingItems.reduce((sum, item) => sum + item.price, 0)
    ),
  };
}

async function collectCatalogSummary({ url, cardIdPrefix }) {
  const iframe = createHiddenIframe(url);
  const startedAt = Date.now();

  try {
    return await new Promise((resolve, reject) => {
      const cleanup = () => {
        iframe.remove();
      };

      const poll = () => {
        try {
          const doc = iframe.contentDocument;

          if (!doc || !doc.body) {
            if (Date.now() - startedAt > 15000) {
              cleanup();
              reject(new Error(`Timed out loading ${url}`));
              return;
            }

            window.setTimeout(poll, 300);
            return;
          }

          const pageData = findPageDataInReact(doc, cardIdPrefix);
          const noResults = /No results/i.test(doc.body.innerText || "");

          if (!pageData && !noResults && Date.now() - startedAt <= 20000) {
            window.setTimeout(poll, 300);
            return;
          }

          cleanup();
          resolve(
            pageData
              ? summarizeCatalogPageData(pageData)
              : {
                  owned: 0,
                  missing: 0,
                  ownedCurrentValue: 0,
                  remainingCost: 0,
                }
          );
        } catch (error) {
          if (Date.now() - startedAt > 20000) {
            cleanup();
            reject(error);
            return;
          }

          window.setTimeout(poll, 300);
        }
      };

      iframe.addEventListener(
        "load",
        () => {
          window.setTimeout(poll, 500);
        },
        { once: true }
      );

      window.setTimeout(poll, 1000);
    });
  } finally {
    iframe.remove();
  }
}

export async function getStoredPurchaseAnalytics(sessionId = "") {
  const purchaseHistoryKey = getPurchaseHistorySessionKey(sessionId);
  const stored = await bridgeStorageGet([purchaseHistoryKey]);

  return {
    purchaseHistorySummary: stored[purchaseHistoryKey] || null,
    missingContentSummary: null,
  };
}

export async function clearStoredPurchaseAnalytics(sessionId = "") {
  const purchaseHistoryKey = getPurchaseHistorySessionKey(sessionId);

  if (!sessionId) {
    return null;
  }

  return bridgeStorageRemove([purchaseHistoryKey]);
}

export async function syncMissingContentSummary(options = {}) {
  const persist = options?.persist !== false;
  const [carsSummary, tracksSummary] = await Promise.all([
    collectCatalogSummary({
      url: "https://members-ng.iracing.com/web/shop/cars?filter=all&match=any&sort=package_name&tags=unowned&view=grid",
      cardIdPrefix: "store-cars-page-content-content-list-card-",
    }),
    collectCatalogSummary({
      url: "https://members-ng.iracing.com/web/shop/tracks?filter=all&match=any&sort=track_name&tags=unowned&view=grid",
      cardIdPrefix: "store-tracks-page-content-content-list-card-",
    }),
  ]);
  const summary = {
    version: 1,
    mode: "dashboard-catalog-value",
    syncedAt: new Date().toISOString(),
    cars: {
      owned: carsSummary.owned,
      missing: carsSummary.missing,
      ownedCurrentValue: carsSummary.ownedCurrentValue,
      remainingCost: carsSummary.remainingCost,
    },
    tracks: {
      owned: tracksSummary.owned,
      missing: tracksSummary.missing,
      ownedCurrentValue: tracksSummary.ownedCurrentValue,
      remainingCost: tracksSummary.remainingCost,
    },
    totals: {
      owned: carsSummary.owned + tracksSummary.owned,
      missing: carsSummary.missing + tracksSummary.missing,
      ownedCurrentValue: roundCurrency(
        carsSummary.ownedCurrentValue + tracksSummary.ownedCurrentValue
      ),
      remainingCost: roundCurrency(
        carsSummary.remainingCost + tracksSummary.remainingCost
      ),
      currentCatalogValue: roundCurrency(
        carsSummary.ownedCurrentValue +
          tracksSummary.ownedCurrentValue +
          carsSummary.remainingCost +
          tracksSummary.remainingCost
      ),
    },
  };

  if (persist) {
    await bridgeStorageSet({
      [MISSING_CONTENT_SUMMARY_KEY]: summary,
    });
  }

  return summary;
}

export function getContentSpend(summary) {
  if (!summary) {
    return null;
  }

  const categoryTotals = Array.isArray(summary.spendingCategoryTotals)
    ? summary.spendingCategoryTotals
    : [];
  const contentTotals = categoryTotals.find((item) => item?.key === "content");

  if (contentTotals && Number.isFinite(Number(contentTotals.net))) {
    return roundCurrency(contentTotals.net);
  }

  const legacyCategories = Array.isArray(summary.spendingCategories)
    ? summary.spendingCategories
    : [];
  const legacyContent = legacyCategories.find((item) => item?.key === "content");

  if (legacyContent && Number.isFinite(Number(legacyContent.amount))) {
    return roundCurrency(legacyContent.amount);
  }

  return null;
}

export function getPendingContentCost(summary) {
  if (!summary || !summary.totals) {
    return null;
  }

  const value = Number(summary.totals.remainingCost);
  return Number.isFinite(value) ? roundCurrency(value) : null;
}

export function getOwnedCatalogValue(summary) {
  if (!summary || !summary.totals) {
    return null;
  }

  const value = Number(summary.totals.ownedCurrentValue);
  return Number.isFinite(value) ? roundCurrency(value) : null;
}

function dateKeyToMs(dateKey) {
  const match = String(dateKey || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return 0;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isFinite(date.getTime()) ? date.getTime() : 0;
}

function getRecordMs(record) {
  const explicitMs = Number(record?.dateMs);

  if (Number.isFinite(explicitMs) && explicitMs > 0) {
    return explicitMs;
  }

  return dateKeyToMs(record?.dateKey);
}

export function getRecentSpend(summary, days = 30) {
  if (!summary) {
    return null;
  }

  const orderRecords = Array.isArray(summary.orderRecords)
    ? summary.orderRecords
    : [];
  const adjustmentRecords = Array.isArray(summary.adjustmentRecords)
    ? summary.adjustmentRecords
    : [];
  const now = new Date();
  const endMs = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  ).getTime();
  const start = new Date(endMs);
  start.setDate(start.getDate() - Math.max(1, Number(days) || 30) + 1);
  start.setHours(0, 0, 0, 0);
  const startMs = start.getTime();

  let gross = 0;
  let netBeforeAutoCredit = 0;
  let orders = 0;
  let autoCreditApplied = 0;

  orderRecords.forEach((record) => {
    const recordMs = getRecordMs(record);

    if (!recordMs || recordMs < startMs || recordMs > endMs) {
      return;
    }

    orders += 1;
    gross = roundCurrency(gross + Number(record.gross || 0));
    netBeforeAutoCredit = roundCurrency(netBeforeAutoCredit + Number(record.net || 0));
  });

  adjustmentRecords.forEach((record) => {
    const recordMs = getRecordMs(record);

    if (
      record?.key !== "auto-credit-applied" ||
      !recordMs ||
      recordMs < startMs ||
      recordMs > endMs
    ) {
      return;
    }

    autoCreditApplied = roundCurrency(autoCreditApplied + Number(record.amount || 0));
  });

  return {
    days: Math.max(1, Number(days) || 30),
    gross: roundCurrency(gross),
    net: roundCurrency(Math.max(0, netBeforeAutoCredit - autoCreditApplied)),
    autoCreditApplied: roundCurrency(autoCreditApplied),
    orders,
    startDateKey: start.toISOString().slice(0, 10),
    endDateKey: new Date(endMs).toISOString().slice(0, 10),
  };
}

export function isSyncedRecently(summary, maxAgeMs = 1000 * 60 * 60 * 6) {
  if (!summary?.syncedAt) {
    return false;
  }

  const syncedAt = Date.parse(summary.syncedAt);

  if (!Number.isFinite(syncedAt)) {
    return false;
  }

  return Date.now() - syncedAt <= maxAgeMs;
}

export function formatUsd(value) {
  return currencyFormatter.format(roundCurrency(value));
}

export function formatSyncTime(value) {
  if (!value) {
    return "Not synced yet";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not synced yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function openOrderHistoryPage(sessionId = "") {
  const targetUrl = new URL(
    "https://members.iracing.com/membersite/account/OrderHistory.do"
  );

  if (sessionId) {
    targetUrl.searchParams.set("irefSession", sessionId);
  }

  window.open(
    targetUrl.toString(),
    "_blank",
    "noopener,noreferrer"
  );
}
