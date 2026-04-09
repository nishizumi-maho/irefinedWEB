import features from "../feature-manager.js";
import {
  checkForUpdates,
  getCachedUpdateInfo,
  openLatestRelease,
} from "../helpers/updates.js";
import "./update-notice.css";

const selector = "body";

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
      openLatestRelease();
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
  checkForUpdates().then(syncButton);
}

window.addEventListener("iref-update-info", (event) => {
  syncButton(event.detail);
});

const id = "update-notice";
const bodyClass = `iref-${id}`;

features.add(id, true, selector, bodyClass, init);
