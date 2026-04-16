import features from "../feature-manager.js";
import {
  activateQueueItem,
  clearRegistrationState,
  confirmRegistrationState,
  getCurrentTime,
  getCurrentRegistrationState,
  isCurrentPageWithdrawPending,
  removeQueuedSession,
  requestCurrentSessionWithdraw,
} from "./auto-register.js";
import React from "dom-chef";
import "./status-bar.css";
import logo from "../assets/logo.png";

const selector = "body";

const uiRootEl = (
  <div id="iref-ui-root">
    <div id="iref-registration-banner" className="iref-registration-banner hidden">
      <div className="iref-registration-banner-left">
        <div className="iref-registration-pill">Registered</div>
        <div className="iref-registration-copy">
          <div className="iref-registration-title"></div>
          <div className="iref-registration-subtitle"></div>
        </div>
      </div>
      <div className="iref-registration-banner-right"></div>
    </div>
    <div className="iref-bar-wrapper">
      <div id="iref-bar">
        <div className="iref-bar-left">
          <div className="iref-logo">
            <img src={logo} />
          </div>
          <div className="iref-queue-items"></div>
        </div>
        <div className="iref-bar-right"></div>
      </div>
    </div>
  </div>
);

function normalizeText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function isVisible(el) {
  return !!el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function findClosest(el, predicate) {
  let node = el;

  while (node && node !== document.body) {
    if (predicate(node)) {
      return node;
    }

    node = node.parentElement;
  }

  return null;
}

function findHeading(matcher) {
  return [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].find((el) =>
    matcher(normalizeText(el.textContent))
  );
}

function getTextLines(text = "") {
  return text
    .split("\n")
    .map((line) => normalizeText(line))
    .filter(Boolean);
}

function findNextRaceSection() {
  const heading = findHeading((text) => text.startsWith("Next Race @"));

  if (!heading) {
    return null;
  }

  return findClosest(heading, (node) => {
    const text = normalizeText(node.innerText || "");
    return text.includes("More way") || text.includes("Race Duration");
  });
}

function findAction(pattern, root = document, visibleOnly = true) {
  return [...root.querySelectorAll("button, a")]
    .filter((el) => !el.closest("#iref-ui-root"))
    .filter((el) => !el.closest("#iref-top-action-row"))
    .filter((el) => !el.closest("#iref-top-queue-row"))
    .filter((el) => !el.closest(".iref-session-register-btn"))
    .filter((el) => !el.closest(".iref-queue-btn"))
    .filter((el) => !visibleOnly || isVisible(el))
    .find((el) => pattern.test(normalizeText(el.innerText || el.textContent || "")));
}

function clickActionElement(el) {
  if (!el) {
    return false;
  }

  el.click();
  return true;
}

function getCurrentSeriesName() {
  return normalizeText(document.querySelector("h2")?.textContent || "");
}

function isCurrentSeriesRegistration(state) {
  const currentSeriesName = getCurrentSeriesName();

  if (!state?.season_name || !currentSeriesName) {
    return false;
  }

  return normalizeText(state.season_name) === currentSeriesName;
}

function getCurrentCarName(section) {
  if (!section) {
    return null;
  }

  const lines = getTextLines(section.innerText || "");
  const carsCompetingIndex = lines.findIndex((line) => /Cars Competing$/i.test(line));

  if (carsCompetingIndex < 1) {
    return null;
  }

  const candidate = lines[carsCompetingIndex - 1];

  if (!candidate || /No Car Selected/i.test(candidate)) {
    return null;
  }

  return candidate;
}

function getSiteRegistrationState() {
  if (isCurrentPageWithdrawPending()) {
    return null;
  }

  const nextRaceSection = findNextRaceSection();
  const withdrawAction =
    (nextRaceSection && findAction(/^Withdraw$/i, nextRaceSection, false)) ||
    findAction(/^Withdraw$/i, document, false);

  if (!withdrawAction) {
    return null;
  }

  const actionSection =
    findClosest(withdrawAction, (node) => {
      const text = normalizeText(node.innerText || "");
      return text.includes("Event Start") || text.includes("Race Duration");
    }) || nextRaceSection;

  return {
    status: "registered",
    source: "site",
    season_name: getCurrentSeriesName() || null,
    car_name: getCurrentCarName(nextRaceSection || actionSection),
    withdrawAction,
    joinAction:
      (nextRaceSection &&
        findAction(/^(Join Race|View in iRacing|Launch iRacing)$/i, nextRaceSection, false)) ||
      findAction(/^(Join Race|View in iRacing|Launch iRacing)$/i, actionSection || document, false),
  };
}

function getCurrentPageJoinAction() {
  const nextRaceSection = findNextRaceSection();

  if (!nextRaceSection) {
    return null;
  }

  return findAction(/^(Join Race|View in iRacing|Launch iRacing)$/i, nextRaceSection, false);
}

function getRegistrationBannerState() {
  const storedState = getCurrentRegistrationState();
  const siteState = getSiteRegistrationState();
  const nextRaceSection = findNextRaceSection();

  if (isCurrentPageWithdrawPending()) {
    clearRegistrationState();
    return null;
  }

  if (siteState) {
    return confirmRegistrationState({
      season_name: siteState.season_name || storedState?.season_name || null,
      car_name: siteState.car_name || storedState?.car_name || null,
    });
  }

  if (!storedState) {
    return null;
  }

  if (
    nextRaceSection &&
    storedState.confirmed_by_site === true &&
    isCurrentSeriesRegistration(storedState) &&
    location.pathname.includes("/go-racing")
  ) {
    clearRegistrationState();
    return null;
  }

  if (storedState.status !== "registered" && storedState.status !== "registering") {
    return null;
  }

  return storedState;
}

function formatRegistrationTitle(state) {
  const label = state?.status === "registering" ? "Registering" : "Registered";
  const details = [state?.season_name, state?.car_name].filter(Boolean).join(" · ");

  return details ? `${label} ${details}` : label;
}

function formatRegistrationSubtitle(state) {
  if (state?.status === "registering") {
    if (state?.source === "queue") {
      return "Withdrawing from the current session and sending the queued race registration.";
    }

    if (state?.source === "direct") {
      return "Register request sent from the browser. Waiting for the site to reflect the new session.";
    }

    return "Finishing your registration in the background.";
  }

  return "You are registered for your race session.";
}

function renderActionButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });
  return button;
}

function syncRegistrationBanner() {
  const banner = uiRootEl.querySelector("#iref-registration-banner");
  const titleEl = banner.querySelector(".iref-registration-title");
  const subtitleEl = banner.querySelector(".iref-registration-subtitle");
  const pillEl = banner.querySelector(".iref-registration-pill");
  const actionsEl = banner.querySelector(".iref-registration-banner-right");
  const registrationState = getRegistrationBannerState();
  const siteState = getSiteRegistrationState();
  const joinAction =
    siteState?.joinAction ||
    (registrationState && isCurrentSeriesRegistration(registrationState)
      ? getCurrentPageJoinAction()
      : null);

  actionsEl.innerHTML = "";

  if (!registrationState) {
    banner.classList.add("hidden");
    return;
  }

  pillEl.textContent = registrationState.status === "registering" ? "Registering" : "Registered";
  titleEl.textContent = formatRegistrationTitle(registrationState);
  subtitleEl.textContent = formatRegistrationSubtitle(registrationState);
  banner.classList.toggle("is-registering", registrationState.status === "registering");
  banner.classList.remove("hidden");

  const withdrawHandler = () => {
    requestCurrentSessionWithdraw();
  };

  actionsEl.appendChild(
    renderActionButton(
      "Withdraw",
      "iref-registration-action iref-registration-action-secondary",
      withdrawHandler
    )
  );

  if (joinAction) {
    actionsEl.appendChild(
      renderActionButton(
        normalizeText(joinAction.innerText || joinAction.textContent || "Join Race"),
        "iref-registration-action iref-registration-action-primary",
        () => {
          clickActionElement(joinAction);
        }
      )
    );
  }
}

function formatCountdown(targetTime) {
  const target = new Date(targetTime);
  const diff = target.getTime() - getCurrentTime();

  if (diff <= 5 * 60 * 1000) {
    return "Registering";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function getQueueTypeTag(item) {
  const sessionLabel = normalizeText(item?.event_type_name || "Race").toLowerCase();

  if (sessionLabel.includes("qual")) {
    return "(Q)";
  }

  if (sessionLabel.includes("race")) {
    return "(R)";
  }

  return "";
}

function syncQueueBar() {
  const queueItemsContainer = uiRootEl.querySelector(".iref-queue-items");
  queueItemsContainer.innerHTML = "";

  if (!window.watchQueue || window.watchQueue.length < 1) {
    return;
  }

  window.watchQueue.forEach((item, index) => {
    item.originalIndex = index;
  });

  const sortedQueue = [...window.watchQueue].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time)
  );

  sortedQueue.forEach((item) => {
    let tooltipText;
    const sessionLabel = normalizeText(
      item.event_type_name || "Race"
    ).toLowerCase();
    const queueTypeTag = getQueueTypeTag(item);

    switch (item.status) {
      case "found":
        tooltipText =
          `${item.event_type_name || "Race"} session found. Automatic register starts 5 minutes before the start time. Click to register now.`;
        break;
      case "registering":
        tooltipText = "Registering, this can take up to 30 seconds.";
        break;
      case "queued":
        tooltipText = `Searching for ${sessionLabel} session.`;
        break;
      default:
        tooltipText = "";
    }

    const itemEl = (
      <div className="iref-queue-item">
        <span
          className={`iref-queue-status ${item.status}`}
          title={tooltipText}
          onClick={() => activateQueueItem(item.originalIndex, { manual: true })}
        ></span>
        <span className="iref-queue-text-fixed">
          {formatCountdown(item.start_time)}
        </span>
        <span> {queueTypeTag ? `${queueTypeTag} ` : ""}{item.season_name}</span>
        <button
          className="iref-remove-btn"
          onClick={() => {
            removeQueuedSession(item);
          }}
          style={{
            marginRight: "5px",
            color: "var(--iref-bar-highlight)",
          }}
        >
          ×
        </button>
      </div>
    );
    queueItemsContainer.appendChild(itemEl);
  });
}

window.setInterval(() => {
  if (document.hidden) {
    return;
  }

  syncRegistrationBanner();
  syncQueueBar();
}, 1000);

let appended = false;

async function init(activate = true) {
  if (!activate || appended || !document.body) {
    return;
  }

  document.body.appendChild(uiRootEl);
  appended = true;
}

const id = "status-bar";
const bodyClass = "iref-" + id;

features.add(id, true, selector, bodyClass, init);
