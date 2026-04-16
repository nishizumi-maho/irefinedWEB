import {
  bridgeStorageGet,
  bridgeStorageSet,
  MEMBERSHIP_SUMMARY_KEY,
} from "./bridge-storage.js";

const accountInfoUrl = "https://members-ng.iracing.com/web/settings/account/info";
const labelAliases = {
  memberSince: [
    "Member since",
    "Membro desde",
    "Miembro desde",
    "Mitglied seit",
  ],
  nextBilling: [
    "Next Billing Date",
    "Next billing date",
    "Proxima cobranca",
    "Proxima data de cobranca",
    "Proxima facturacion",
    "Nachstes Abrechnungsdatum",
  ],
  currentPlan: [
    "Current plan",
    "Plano atual",
    "Plan actual",
    "Aktuelles Abo",
  ],
  autoRenewal: [
    "Auto Renewal",
    "Auto renewal",
    "Renovacao automatica",
    "Renovacion automatica",
    "Automatische Verlangerung",
  ],
  membershipStatus: [
    "Membership Status",
    "Subscription Status",
    "Status da assinatura",
    "Estado de la suscripcion",
    "Mitgliederschaftsstatus",
    "Abo-Status",
  ],
  currentPrice: [
    "Current Price",
    "Preco atual",
    "Precio actual",
    "Aktueller Preis",
  ],
};

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
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

function parseBooleanish(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const text = normalizeText(value).toLowerCase();

  if (!text) {
    return null;
  }

  if (
    [
      "true",
      "on",
      "enabled",
      "yes",
      "active",
      "auto renew on",
      "automatic renewal on",
    ].includes(text)
  ) {
    return true;
  }

  if (
    [
      "false",
      "off",
      "disabled",
      "no",
      "inactive",
      "auto renew off",
      "automatic renewal off",
    ].includes(text)
  ) {
    return false;
  }

  return null;
}

function formatAutoRenewal(value) {
  const boolValue = parseBooleanish(value);

  if (boolValue === true) {
    return "On";
  }

  if (boolValue === false) {
    return "Off";
  }

  return normalizeText(value);
}

function parseDateValue(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return new Date(value.getTime());
  }

  if (typeof value === "number") {
    const ms = value > 1e12 ? value : value > 1e10 ? value : value * 1000;
    const date = new Date(ms);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  const text = normalizeText(value);

  if (!text || /^-+$/.test(text)) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const date = new Date(`${text}T00:00:00`);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  let match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);

  if (match) {
    const year =
      match[3].length === 2 ? Number(`20${match[3]}`) : Number(match[3]);
    const month = Number(match[1]) - 1;
    const day = Number(match[2]);
    const date = new Date(year, month, day);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  const cleaned = text
    .replace(/\bat\b.*$/i, "")
    .replace(/\s+\([^)]*\)\s*$/, "")
    .trim();
  const date = new Date(cleaned);
  return Number.isFinite(date.getTime()) ? date : null;
}

function toDateKey(date) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateKeyToDate(dateKey) {
  const match = String(dateKey || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isFinite(date.getTime()) ? date : null;
}

function formatDateKey(dateKey) {
  const date = dateKeyToDate(dateKey);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function normalizePrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  const text = normalizeText(value);

  if (!text) {
    return "";
  }

  if (/[$€£]/.test(text)) {
    return text;
  }

  const parsed = Number(text.replace(/[^0-9.-]+/g, ""));

  if (!Number.isFinite(parsed)) {
    return text;
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);
}

function createCandidateBuckets() {
  return {
    memberSince: [],
    nextBilling: [],
    currentPlan: [],
    autoRenewal: [],
    membershipStatus: [],
    currentPrice: [],
  };
}

function addCandidate(bucket, value, score) {
  const text = normalizeText(value);

  if (!text && typeof value !== "number" && typeof value !== "boolean") {
    return;
  }

  bucket.push({
    score,
    value,
  });
}

function pathScore(path) {
  const lowerPath = String(path || "").toLowerCase();
  let score = 0;

  if (lowerPath.includes("account")) {
    score += 2;
  }

  if (lowerPath.includes("subscription")) {
    score += 5;
  }

  if (lowerPath.includes("membership")) {
    score += 5;
  }

  if (lowerPath.includes("billing")) {
    score += 6;
  }

  if (lowerPath.includes("renew")) {
    score += 4;
  }

  if (lowerPath.includes("plan")) {
    score += 3;
  }

  if (lowerPath.includes("price")) {
    score += 2;
  }

  return score;
}

function scanObjectForCandidates(source, buckets, path = "", depth = 0, seen = new WeakSet()) {
  if (!source || typeof source !== "object" || depth > 6 || seen.has(source)) {
    return;
  }

  seen.add(source);

  Object.entries(source).forEach(([key, value]) => {
    const nextPath = path ? `${path}.${key}` : key;
    const lowerKey = key.toLowerCase();
    const scoreBase = pathScore(nextPath);

    if (
      (lowerKey === "member_since" || lowerKey.includes("member_since")) &&
      parseDateValue(value)
    ) {
      addCandidate(buckets.memberSince, value, scoreBase + 12);
    }

    if (
      (lowerKey.includes("billing") || lowerKey.includes("renewal")) &&
      !lowerKey.includes("auto") &&
      parseDateValue(value)
    ) {
      addCandidate(buckets.nextBilling, value, scoreBase + 11);
    }

    if (
      lowerKey.includes("plan") &&
      typeof value === "string" &&
      normalizeText(value).length <= 80
    ) {
      addCandidate(buckets.currentPlan, value, scoreBase + 8);
    }

    if (
      (lowerKey.includes("auto_renew") ||
        lowerKey.includes("autorenew") ||
        (lowerKey.includes("auto") && lowerKey.includes("renew"))) &&
      normalizeText(value)
    ) {
      addCandidate(buckets.autoRenewal, value, scoreBase + 10);
    }

    if (
      lowerKey.includes("status") &&
      typeof value === "string" &&
      /active|inactive|expired|cancel|renew|trial/i.test(value)
    ) {
      addCandidate(buckets.membershipStatus, value, scoreBase + 8);
    }

    if (
      lowerKey.includes("price") &&
      (typeof value === "number" || typeof value === "string")
    ) {
      addCandidate(buckets.currentPrice, value, scoreBase + 5);
    }

    if (Array.isArray(value)) {
      value.slice(0, 12).forEach((item, index) => {
        scanObjectForCandidates(item, buckets, `${nextPath}[${index}]`, depth + 1, seen);
      });
      return;
    }

    if (value && typeof value === "object") {
      scanObjectForCandidates(value, buckets, nextPath, depth + 1, seen);
    }
  });
}

function pickBestCandidate(candidates, formatter = normalizeText) {
  if (!Array.isArray(candidates) || !candidates.length) {
    return "";
  }

  const best = [...candidates]
    .sort((left, right) => right.score - left.score)
    .find((candidate) => normalizeText(formatter(candidate.value)));

  return best ? formatter(best.value) : "";
}

function extractAccountInfoFromRedux(win) {
  try {
    const keys = Object.getOwnPropertyNames(win);

    for (const key of keys) {
      let value = null;

      try {
        value = win[key];
      } catch {
        continue;
      }

      if (!value || typeof value !== "object" || typeof value.getState !== "function") {
        continue;
      }

      const state = value.getState();
      const accountInfo = state?.account?.accountInfo?.data;

      if (accountInfo && typeof accountInfo === "object") {
        return accountInfo;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function extractAccountInfoFromReact(doc) {
  const buckets = createCandidateBuckets();
  const elements = Array.from(doc.querySelectorAll("*"));
  const seen = new WeakSet();

  for (const element of elements) {
    for (const key of Object.keys(element)) {
      if (key.startsWith("__reactProps$")) {
        scanObjectForCandidates(element[key], buckets, key, 0, seen);
      }

      if (key.startsWith("__reactFiber$")) {
        let fiber = element[key];
        let depth = 0;

        while (fiber && depth <= 6) {
          scanObjectForCandidates(fiber.memoizedProps, buckets, `${key}.memoizedProps`, 0, seen);
          scanObjectForCandidates(fiber.pendingProps, buckets, `${key}.pendingProps`, 0, seen);
          scanObjectForCandidates(fiber.memoizedState, buckets, `${key}.memoizedState`, 0, seen);
          fiber = fiber.return;
          depth += 1;
        }
      }
    }

    if (buckets.memberSince.length && buckets.nextBilling.length) {
      break;
    }
  }

  return buckets;
}

function matchesLabel(text, aliases) {
  const normalized = normalizeText(text).toLowerCase();

  return aliases.some((alias) => {
    const target = normalizeText(alias).toLowerCase();
    return normalized === target || normalized.startsWith(`${target}:`);
  });
}

function stripKnownControls(text) {
  return normalizeText(text)
    .replace(/\bManage\b/gi, "")
    .replace(/\bRenew Early\b/gi, "")
    .replace(/\bUpdate Address\b/gi, "")
    .replace(/\bOpen\b/gi, "")
    .replace(/\bHere\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractValueNearLabel(element, aliases) {
  const attempts = [];
  const row = element.closest("tr");

  if (row) {
    const cells = Array.from(row.children).filter((child) => child !== element);
    attempts.push(...cells);
  }

  if (element.nextElementSibling) {
    attempts.push(element.nextElementSibling);
  }

  let parent = element.parentElement;
  let depth = 0;

  while (parent && depth <= 3) {
    const siblings = Array.from(parent.children).filter((child) => child !== element);
    attempts.push(...siblings);

    if (parent.nextElementSibling) {
      attempts.push(parent.nextElementSibling);
    }

    parent = parent.parentElement;
    depth += 1;
  }

  for (const candidate of attempts) {
    const text = stripKnownControls(candidate?.textContent || "");

    if (!text || matchesLabel(text, aliases)) {
      continue;
    }

    if (!aliases.some((alias) => text.includes(alias))) {
      return text;
    }
  }

  if (row) {
    let text = stripKnownControls(row.textContent || "");

    aliases.forEach((alias) => {
      text = normalizeText(text.replace(alias, ""));
    });

    return text;
  }

  return "";
}

function extractLabelValueMap(doc) {
  const fields = {};
  const candidates = Array.from(
    doc.querySelectorAll("td, th, div, span, p, strong, label, h1, h2, h3, h4")
  );

  Object.entries(labelAliases).forEach(([field, aliases]) => {
    const labelNode = candidates.find((element) =>
      matchesLabel(element.textContent || "", aliases)
    );

    if (!labelNode) {
      return;
    }

    fields[field] = extractValueNearLabel(labelNode, aliases);
  });

  return fields;
}

function buildMembershipSummary({ reduxData, reactBuckets, labelValues }) {
  const buckets = reactBuckets || createCandidateBuckets();

  if (reduxData) {
    scanObjectForCandidates(reduxData, buckets, "redux.accountInfo");
  }

  if (labelValues?.memberSince) {
    addCandidate(buckets.memberSince, labelValues.memberSince, 100);
  }

  if (labelValues?.nextBilling) {
    addCandidate(buckets.nextBilling, labelValues.nextBilling, 100);
  }

  if (labelValues?.currentPlan) {
    addCandidate(buckets.currentPlan, labelValues.currentPlan, 100);
  }

  if (labelValues?.autoRenewal) {
    addCandidate(buckets.autoRenewal, labelValues.autoRenewal, 100);
  }

  if (labelValues?.membershipStatus) {
    addCandidate(buckets.membershipStatus, labelValues.membershipStatus, 100);
  }

  if (labelValues?.currentPrice) {
    addCandidate(buckets.currentPrice, labelValues.currentPrice, 100);
  }

  const memberSinceDate = parseDateValue(pickBestCandidate(buckets.memberSince, (value) => value));
  const nextBillingDate = parseDateValue(
    pickBestCandidate(buckets.nextBilling, (value) => value)
  );
  const membershipStatus = pickBestCandidate(buckets.membershipStatus);
  const currentPlan = pickBestCandidate(buckets.currentPlan);
  const autoRenewal = formatAutoRenewal(pickBestCandidate(buckets.autoRenewal, (value) => value));
  const currentPrice = normalizePrice(pickBestCandidate(buckets.currentPrice, (value) => value));

  if (
    !memberSinceDate &&
    !nextBillingDate &&
    !membershipStatus &&
    !currentPlan &&
    !autoRenewal &&
    !currentPrice
  ) {
    return null;
  }

  return {
    version: 1,
    source: "members-ng-account-info",
    syncedAt: new Date().toISOString(),
    memberSinceDateKey: toDateKey(memberSinceDate),
    memberSinceLabel: memberSinceDate ? formatDateKey(toDateKey(memberSinceDate)) : "",
    nextBillingDateKey: toDateKey(nextBillingDate),
    nextBillingLabel: nextBillingDate ? formatDateKey(toDateKey(nextBillingDate)) : "",
    membershipStatus,
    currentPlan,
    autoRenewal,
    currentPrice,
  };
}

function looksReady(doc) {
  const text = normalizeText(doc?.body?.innerText || "");

  if (!text) {
    return false;
  }

  return (
    /member since|membro desde|miembro desde|mitglied seit/i.test(text) ||
    /next billing date|current plan|auto renewal|membership status/i.test(text)
  );
}

async function collectMembershipSummary() {
  const iframe = createHiddenIframe(accountInfoUrl);
  const startedAt = Date.now();

  try {
    return await new Promise((resolve, reject) => {
      const cleanup = () => {
        iframe.remove();
      };

      const poll = () => {
        try {
          const doc = iframe.contentDocument;
          const win = iframe.contentWindow;

          if (!doc || !doc.body) {
            if (Date.now() - startedAt > 20000) {
              cleanup();
              reject(new Error("Timed out loading members-ng account info."));
              return;
            }

            window.setTimeout(poll, 350);
            return;
          }

          if (!looksReady(doc) && Date.now() - startedAt <= 20000) {
            window.setTimeout(poll, 350);
            return;
          }

          const reduxData = extractAccountInfoFromRedux(win);
          const reactBuckets = extractAccountInfoFromReact(doc);
          const labelValues = extractLabelValueMap(doc);
          const summary = buildMembershipSummary({
            reduxData,
            reactBuckets,
            labelValues,
          });

          if (!summary) {
            cleanup();
            reject(new Error("Members-ng account info did not expose renewal data."));
            return;
          }

          cleanup();
          resolve(summary);
        } catch (error) {
          if (Date.now() - startedAt > 20000) {
            cleanup();
            reject(error);
            return;
          }

          window.setTimeout(poll, 350);
        }
      };

      iframe.addEventListener(
        "load",
        () => {
          window.setTimeout(poll, 700);
        },
        { once: true }
      );

      window.setTimeout(poll, 1000);
    });
  } finally {
    iframe.remove();
  }
}

export async function getStoredMembershipSummary() {
  const stored = await bridgeStorageGet([MEMBERSHIP_SUMMARY_KEY]);

  return {
    membershipSummary: stored[MEMBERSHIP_SUMMARY_KEY] || null,
  };
}

export async function syncMembershipSummary(options = {}) {
  const persist = options?.persist !== false;
  const summary = await collectMembershipSummary();

  if (persist) {
    await bridgeStorageSet({
      [MEMBERSHIP_SUMMARY_KEY]: summary,
    });
  }

  return summary;
}

export function isMembershipSummaryFresh(summary, maxAgeMs = 1000 * 60 * 60) {
  if (!summary?.syncedAt) {
    return false;
  }

  const syncedAt = Date.parse(summary.syncedAt);

  if (!Number.isFinite(syncedAt)) {
    return false;
  }

  return Date.now() - syncedAt <= maxAgeMs;
}

export function formatMembershipSyncTime(value) {
  if (!value) {
    return "Not synced yet";
  }

  const parsed = new Date(value);

  if (!Number.isFinite(parsed.getTime())) {
    return "Not synced yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function openAccountInfoPage() {
  window.open(accountInfoUrl, "_blank", "noopener,noreferrer");
}
