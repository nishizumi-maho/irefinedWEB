import features from "../feature-manager.js";
import {
  checkForUpdates,
  CURRENT_DISPLAY_VERSION,
  getCachedUpdateInfo,
  openLatestRelease,
} from "../helpers/updates.js";
import "./update-notice.css";

const selector = "body";
const popupSeenStorageKey = "iref_update_popup_seen_tag";

function getSeenPopupTag() {
  try {
    return sessionStorage.getItem(popupSeenStorageKey) || "";
  } catch {
    return "";
  }
}

function markPopupSeen(latestTag = "") {
  if (!latestTag) {
    return;
  }

  try {
    sessionStorage.setItem(popupSeenStorageKey, latestTag);
  } catch {}
}

function ensureUpdatePopup() {
  let popup = document.querySelector("#iref-update-popup");

  if (popup) {
    return popup;
  }

  popup = document.createElement("div");
  popup.id = "iref-update-popup";
  popup.className = "iref-update-popup";
  popup.innerHTML = `
    <div class="iref-update-popup-backdrop"></div>
    <div
      class="iref-update-popup-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="iref-update-popup-title"
      aria-describedby="iref-update-popup-description"
    >
      <button
        type="button"
        class="iref-update-popup-close"
        aria-label="Close update notice"
      >
        ×
      </button>
      <div class="iref-update-popup-label">Update available</div>
      <h3 id="iref-update-popup-title" class="iref-update-popup-title"></h3>
      <p id="iref-update-popup-description" class="iref-update-popup-description"></p>
      <div class="iref-update-popup-versions">
        <div class="iref-update-popup-version">
          <span class="iref-update-popup-version-label">Current</span>
          <strong id="iref-update-popup-current-version"></strong>
        </div>
        <div class="iref-update-popup-version">
          <span class="iref-update-popup-version-label">Latest</span>
          <strong id="iref-update-popup-latest-version"></strong>
        </div>
      </div>
      <p class="iref-update-popup-help">
        Download the latest release zip, extract it, then reload the unpacked extension.
      </p>
      <div class="iref-update-popup-actions">
        <button type="button" class="iref-update-popup-secondary">
          Close
        </button>
        <button type="button" class="iref-update-popup-primary">
          Open latest release
        </button>
      </div>
    </div>
  `;

  const closePopup = () => {
    popup.classList.remove("open");
  };

  popup
    .querySelector(".iref-update-popup-backdrop")
    .addEventListener("click", closePopup);
  popup
    .querySelector(".iref-update-popup-close")
    .addEventListener("click", closePopup);
  popup
    .querySelector(".iref-update-popup-secondary")
    .addEventListener("click", closePopup);
  popup
    .querySelector(".iref-update-popup-primary")
    .addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closePopup();
      openLatestRelease();
    });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && popup.classList.contains("open")) {
      closePopup();
    }
  });

  document.body.appendChild(popup);
  return popup;
}

function syncPopupContent(info = getCachedUpdateInfo()) {
  const popup = ensureUpdatePopup();

  if (!info.available) {
    popup.classList.remove("open");
    return popup;
  }

  popup.querySelector("#iref-update-popup-title").textContent =
    `${info.latestTag} is ready`;
  popup.querySelector("#iref-update-popup-description").textContent =
    `You are using ${CURRENT_DISPLAY_VERSION}. A newer GitHub release is available for download.`;
  popup.querySelector("#iref-update-popup-current-version").textContent =
    CURRENT_DISPLAY_VERSION;
  popup.querySelector("#iref-update-popup-latest-version").textContent =
    info.latestTag;

  return popup;
}

function openUpdatePopup(info = getCachedUpdateInfo(), options = {}) {
  const { automatic = false } = options;

  if (!info.available) {
    return;
  }

  const popup = syncPopupContent(info);

  if (automatic) {
    markPopupSeen(info.latestTag);
  }

  popup.classList.add("open");
  popup.querySelector(".iref-update-popup-primary")?.focus();
}

function maybeOpenUpdatePopup(info = getCachedUpdateInfo()) {
  if (!info.available || getSeenPopupTag() === info.latestTag) {
    return;
  }

  openUpdatePopup(info, { automatic: true });
}

function ensureToolbarButton() {
  const toolbar = document.querySelector(".iref-bar-right");

  if (!toolbar) {
    return null;
  }

  let button = document.querySelector("#iref-update-button");

  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.id = "iref-update-button";
    button.className = "iref-update-btn hidden";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openUpdatePopup(getCachedUpdateInfo());
    });
    toolbar.prepend(button);
  }

  return button;
}

function syncButton(info = getCachedUpdateInfo()) {
  const button = ensureToolbarButton();

  if (!button) {
    return;
  }

  if (!info.available) {
    button.classList.add("hidden");
    button.textContent = "";
    return;
  }

  button.classList.remove("hidden");
  button.textContent = `Update ${info.latestTag}`;
  button.title = `A newer iRefined release is available on GitHub: ${info.latestTag}`;
}

async function init(activate = true) {
  if (!activate || !document.body) {
    return;
  }

  syncButton();
  maybeOpenUpdatePopup(getCachedUpdateInfo());
  checkForUpdates().then((info) => {
    syncButton(info);
    maybeOpenUpdatePopup(info);
  });
}

window.addEventListener("iref-update-info", (event) => {
  syncButton(event.detail);
  maybeOpenUpdatePopup(event.detail);
});

const id = "update-notice";
const bodyClass = `iref-${id}`;

features.add(id, true, selector, bodyClass, init);
