import features from "../feature-manager.js";
import {
  formatRelativeFromNow,
  formatShortDateTime,
  formatUsd,
  getIntelligenceSnapshot,
  INTELLIGENCE_DASHBOARD_PATH,
} from "../helpers/intelligence-analytics.js";
import {
  cleanupDashboardWidgetRow,
  ensureDashboardWidgetRow,
} from "../helpers/dashboard-widget-row.js";
import "./dashboard-widget-row.css";
import "./intelligence-center.css";

const id = "dashboard-intelligence-center";
const selector = "body";
const bodyClass = `iref-${id}`;
const state = {
  snapshot: null,
  loading: false,
  error: "",
  expanded: false,
};

let booted = false;
let tickHandle = 0;
let loadPromise = null;

function formatRolling30DayRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);

  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatActivityDelta(currentValue, previousValue) {
  const current = Number(currentValue) || 0;
  const previous = Number(previousValue) || 0;
  const delta = current - previous;

  if (delta > 0) {
    return `+${delta} vs previous 30 days`;
  }

  if (delta < 0) {
    return `${delta} vs previous 30 days`;
  }

  return "No change vs previous 30 days";
}

function isDashboardPage() {
  return location.pathname === INTELLIGENCE_DASHBOARD_PATH;
}

function getRoot() {
  return document.querySelector("#iref-dashboard-intelligence-center");
}

function removeRoot() {
  getRoot()?.remove();
  cleanupDashboardWidgetRow();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ensureRoot() {
  if (!isDashboardPage()) {
    return null;
  }

  const row = ensureDashboardWidgetRow();

  if (!row) {
    return null;
  }

  let root = getRoot();

  if (!root) {
    root = document.createElement("section");
    root.id = "iref-dashboard-intelligence-center";
    root.className = "iref-dashboard-intelligence-center";
  }

  if (root.parentNode !== row) {
    row.appendChild(root);
  }

  return root;
}

function renderMetric(label, value, note = "") {
  const noteLines = Array.isArray(note) ? note.filter(Boolean) : [note].filter(Boolean);

  return `
    <article class="iref-intelligence-metric">
      <span class="iref-intelligence-metric-label">${escapeHtml(label)}</span>
      <strong class="iref-intelligence-metric-value">${escapeHtml(value)}</strong>
      <div class="iref-intelligence-metric-note">${noteLines
        .map(
          (line) =>
            `<span class="iref-intelligence-metric-note-line">${escapeHtml(line)}</span>`
        )
        .join("")}</div>
    </article>
  `;
}

function renderCompactCards(items, formatter) {
  if (!items.length) {
    return `<div class="iref-intelligence-empty">No data returned on this refresh.</div>`;
  }

  return `<div class="iref-intelligence-card-grid">${items.map(formatter).join("")}</div>`;
}

function renderCompactCard(title, meta, pills = []) {
  return `
    <article class="iref-intelligence-compact-card">
      <strong class="iref-intelligence-compact-card-title">${escapeHtml(title)}</strong>
      <div class="iref-intelligence-compact-card-meta">${escapeHtml(meta)}</div>
      ${
        pills.length
          ? `<div class="iref-intelligence-inline-actions">${pills
              .filter(Boolean)
              .map(
                (pill) =>
                  `<span class="iref-intelligence-pill${pill.kind ? ` ${pill.kind}` : ""}">${escapeHtml(
                    pill.label
                  )}</span>`
              )
              .join("")}</div>`
          : ""
      }
    </article>
  `;
}

function renderProgress(snapshot) {
  const progress = snapshot?.progress || {};
  const membership = progress.membership || {};
  const activity = progress.activity || {};
  const licenses = Array.isArray(progress.licenses) ? progress.licenses : [];
  const credits = Array.isArray(progress.participationCredits)
    ? progress.participationCredits.slice(0, 6)
    : [];
  const awards = Array.isArray(progress.awards?.recent)
    ? progress.awards.recent.slice(0, 6)
    : [];
  const events = Array.isArray(progress.recentEvents)
    ? progress.recentEvents.slice(0, 6)
    : [];
  const activityRange = formatRolling30DayRange();
  const activityDelta = formatActivityDelta(
    activity.recent30DaysCount,
    activity.previous30DaysCount
  );

  return `
    <div class="iref-intelligence-grid">
      ${renderMetric(
        "Member anniversary",
        membership.anniversary?.isToday
          ? "Today"
          : membership.anniversary?.daysRemaining == null
          ? "Unavailable"
          : `${membership.anniversary.daysRemaining} days`,
        membership.anniversary?.detail || ""
      )}
      ${renderMetric(
        "30 day activity",
        `${activity.recent30DaysCount || 0} active days`,
        [activityDelta, activityRange]
      )}
      ${renderMetric(
        "Streak",
        String(activity.consecutiveWeeks || 0),
        `Best ${activity.bestConsecutiveWeeks || 0} weeks`
      )}
      ${renderMetric(
        "Member since",
        membership.memberSince || "Unavailable",
        membership.lastLogin
          ? `Last login ${membership.lastLoginRelative || membership.lastLogin}`
          : "Last login unavailable"
      )}
    </div>
    ${
      state.expanded
        ? `
          <div class="iref-intelligence-sections-grid">
            <section class="iref-intelligence-section">
              <div class="iref-intelligence-section-title">License snapshot</div>
              ${renderCompactCards(licenses, (license) =>
                renderCompactCard(
                  license.category,
                  `${license.licenseLevel} • SR ${license.safetyRating.toFixed(2)} • iR ${license.irating}`,
                  [{ label: `CPI ${license.cpi}` }]
                )
              )}
            </section>
            <section class="iref-intelligence-section">
              <div class="iref-intelligence-section-title">Participation credits</div>
              ${renderCompactCards(credits, (credit) =>
                renderCompactCard(
                  credit.seriesName,
                  `${credit.weeksDone}/${credit.minWeeks} weeks • ${formatUsd(
                    credit.earnedCredits
                  )} of ${formatUsd(credit.totalCredits)}`,
                  [
                    {
                      label: `${credit.remainingWeeks} week${
                        credit.remainingWeeks === 1 ? "" : "s"
                      } left`,
                      kind: credit.remainingWeeks === 0 ? "is-positive" : "",
                    },
                  ]
                )
              )}
            </section>
            <section class="iref-intelligence-section">
              <div class="iref-intelligence-section-title">Recent awards</div>
              ${renderCompactCards(awards, (award) =>
                renderCompactCard(
                  award.title,
                  `${award.groupName || "Award"} • ${formatShortDateTime(award.date)}`,
                  [
                    award.hasPdf ? { label: "PDF" } : null,
                    award.viewed ? null : { label: "New", kind: "is-positive" },
                  ]
                )
              )}
            </section>
            <section class="iref-intelligence-section iref-intelligence-section-wide">
              <div class="iref-intelligence-section-title">Recent events</div>
              ${renderCompactCards(events, (event) =>
                renderCompactCard(
                  event.title,
                  `${event.trackName || event.carName || "Event"} • ${
                    event.result || event.sessionType || ""
                  }`,
                  [{ label: formatRelativeFromNow(event.startTime) }]
                )
              )}
            </section>
          </div>
        `
        : ""
    }
  `;
}

function render() {
  const root = ensureRoot();

  if (!root) {
    return;
  }

  const snapshot = state.snapshot;
  root.innerHTML = `
    <div class="iref-intelligence-header">
      <div class="iref-intelligence-copy">
        <span class="iref-intelligence-label">iRefined V4</span>
        <h3 class="iref-intelligence-title">Intelligence Center</h3>
        <p class="iref-intelligence-subtitle">Member progress, awards, credits and recent activity from members-ng.</p>
      </div>
      <div class="iref-intelligence-header-actions">
        <button type="button" id="iref-intelligence-toggle" class="iref-intelligence-toolbar-btn iref-intelligence-toggle-btn" aria-expanded="${
          state.expanded ? "true" : "false"
        }">
          ${state.expanded ? "Compact" : "Expand"}
        </button>
        <button type="button" id="iref-intelligence-refresh" class="iref-intelligence-toolbar-btn">${
          state.loading ? "Refreshing..." : "Refresh"
        }</button>
      </div>
    </div>
    <div class="iref-intelligence-body">
      ${
        state.loading && !snapshot
          ? `<div class="iref-intelligence-empty">Loading intelligence snapshot...</div>`
          : snapshot
          ? renderProgress(snapshot)
          : `<div class="iref-intelligence-empty">${escapeHtml(
              state.error || "No data loaded yet."
            )}</div>`
      }
    </div>
    <div class="iref-intelligence-status">${escapeHtml(
      state.error ||
        (snapshot?.meta?.partial
          ? snapshot.meta.errors.join(" | ")
          : snapshot?.meta?.generatedLabel
          ? `Last refresh ${snapshot.meta.generatedLabel}`
          : "")
    )}</div>
  `;

  root.querySelector("#iref-intelligence-toggle")?.addEventListener("click", () => {
    state.expanded = !state.expanded;
    render();
  });

  root.querySelector("#iref-intelligence-refresh")?.addEventListener("click", () => {
    void loadSnapshot(true);
  });
}

async function loadSnapshot(force = false) {
  if (loadPromise) {
    return loadPromise;
  }

  state.loading = true;
  state.error = "";
  render();

  loadPromise = getIntelligenceSnapshot(force)
    .then((snapshot) => {
      state.snapshot = snapshot;
      state.error = "";
    })
    .catch((error) => {
      state.error =
        error?.message || "Could not load the members-ng intelligence snapshot.";
    })
    .finally(() => {
      state.loading = false;
      loadPromise = null;
      render();
    });

  return loadPromise;
}

function tick() {
  if (!isDashboardPage()) {
    removeRoot();
    return;
  }

  render();

  if (!state.snapshot && !state.loading) {
    void loadSnapshot();
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
  tick();
  tickHandle = window.setInterval(tick, 30000);
}

features.add(id, true, selector, bodyClass, init);
