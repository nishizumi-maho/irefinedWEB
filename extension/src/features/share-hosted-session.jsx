import features from "../feature-manager.js";
import { downloadJson } from "../helpers/download.js";
import { cloneJsonSafe } from "../helpers/json-safe.js";
import { normalizeImportedWeatherPayload } from "../helpers/weather-import.js";
import { log } from "./logger.js";
import { findStateComponent } from "../helpers/react-resolver.js";
import "./share-hosted-session.css";

let persistInterval = 0;

function normalizeText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function slugify(text = "") {
  return normalizeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getJsonUpload() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener(
      "change",
      async (event) => {
        const files = [...(event.target.files || [])];

        if (files.length < 1) {
          resolve([]);
          return;
        }

        resolve(await Promise.all(files.map((file) => file.text())));
      },
      false
    );

    input.click();
  });
}

function getWizardHeading() {
  return [...document.querySelectorAll("h1")].find(
    (el) => normalizeText(el.textContent) === "Create a Race"
  );
}

function getCreateRaceComponent() {
  const heading = getWizardHeading();

  if (!heading) {
    return null;
  }

  return findStateComponent(
    heading,
    (state) => !!state.session && !!state.settings && Array.isArray(state.wizard)
  );
}

function stripSessionForExport(session = {}) {
  const exportedSession = cloneJsonSafe(session, {}) || {};

  [
    "admins",
    "allowed_leagues",
    "allowed_teams",
    "entry_count",
    "ended_waiting",
    "farm",
    "friends",
    "guid",
    "host",
    "image",
    "league_id",
    "league_name",
    "league_season_id",
    "order_id",
    "owner",
    "pending",
    "populated",
    "private_session_id",
    "search_filters",
    "session_full",
    "session_id",
    "small_logo",
    "source",
    "subsession_id",
    "watched",
  ].forEach((key) => {
    delete exportedSession[key];
  });

  return exportedSession;
}

function exportWeather(component) {
  const session = component?.state?.session;
  const sessionName = session?.session_name || "hosted-session";
  const filename = `${slugify(sessionName)}-weather.json`;

  downloadJson(filename, {
    exportType: "irefined-weather",
    exportedAt: new Date().toISOString(),
    url: location.href,
    sessionName,
    trackName: session?.track_name || session?.track?.track_name || null,
    weather: cloneJsonSafe(session?.weather || {}, {}),
  });

  log(`Downloaded ${filename}`);
}

function exportSession(component) {
  const session = component?.state?.session;
  const sessionName = session?.session_name || "hosted-session";
  const filename = `${slugify(sessionName)}-session.json`;

  downloadJson(filename, {
    exportType: "irefined-session",
    exportedAt: new Date().toISOString(),
    url: location.href,
    summary: {
      sessionName,
      trackName: session?.track_name || session?.track?.track_name || null,
      sessionType: session?.session_type || null,
    },
    session: stripSessionForExport(session),
    weather: cloneJsonSafe(session?.weather || {}, {}),
    trackState: cloneJsonSafe(session?.track_state || {}, {}),
  });

  log(`Downloaded ${filename}`);
}

function resolveImportedSession(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (Array.isArray(payload.sessions) && payload.sessions.length > 0) {
    const selected = selectSessionEntry(payload.sessions, "session");
    if (!selected) {
      return null;
    }

    return selected.session && typeof selected.session === "object"
      ? selected.session
      : selected;
  }

  if (payload.session && typeof payload.session === "object") {
    return payload.session;
  }

  if (payload.session_name || payload.weather || payload.track_state) {
    return payload;
  }

  return null;
}

function getSessionEntryLabel(entry, index) {
  const summary = entry?.summary || entry;
  const session = entry?.session || entry;
  const name =
    summary?.sessionName ||
    session?.session_name ||
    summary?.trackName ||
    `Session ${index + 1}`;
  const start =
    summary?.launchAt ||
    session?.launch_at ||
    summary?.openRegExpires ||
    null;
  const host = summary?.hostName || session?.host_name || null;
  const parts = [name];

  if (host) {
    parts.push(host);
  }

  if (start) {
    const date = new Date(start);
    parts.push(Number.isNaN(date.getTime()) ? String(start) : date.toLocaleString());
  }

  return parts.join(" | ");
}

function selectSessionEntry(entries, label) {
  if (!Array.isArray(entries) || entries.length < 1) {
    return null;
  }

  if (entries.length === 1) {
    return entries[0];
  }

  const preview = entries
    .slice(0, 12)
    .map((entry, index) => `${index + 1}. ${getSessionEntryLabel(entry, index)}`)
    .join("\n");
  const suffix =
    entries.length > 12
      ? `\n... and ${entries.length - 12} more sessions`
      : "";
  const response = window.prompt(
    `Import which ${label} config?\n\n${preview}${suffix}`,
    "1"
  );

  if (!response) {
    return null;
  }

  const selectedIndex = parseInt(response, 10) - 1;

  if (
    Number.isNaN(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex >= entries.length
  ) {
    log(`Import cancelled: invalid ${label} selection`);
    return null;
  }

  return entries[selectedIndex];
}

async function importWeather(component) {
  const files = await getJsonUpload();

  if (files.length < 1) {
    return;
  }

  const payload = JSON.parse(files[0]);
  const selectedPayload =
    Array.isArray(payload.sessions) && payload.sessions.length > 0
      ? selectSessionEntry(payload.sessions, "weather")
      : payload;
  const weather = normalizeImportedWeatherPayload(
    selectedPayload,
    component?.state?.session?.weather || {}
  );

  if (!weather || Object.keys(weather).length < 1) {
    log("Weather import failed: no weather payload found");
    return;
  }

  component.setState((previous) => ({
    session: {
      ...previous.session,
      weather: {
        ...previous.session.weather,
        ...cloneJsonSafe(weather, {}),
      },
    },
  }));

  log("Applied imported weather to the current session");
}

async function importSession(component) {
  const files = await getJsonUpload();

  if (files.length < 1) {
    return;
  }

  const payload = JSON.parse(files[0]);
  const importedSession = resolveImportedSession(payload);

  if (!importedSession) {
    log("Session import failed: no session payload found");
    return;
  }

  component.setState((previous) => ({
      session: {
        ...previous.session,
        ...cloneJsonSafe(importedSession, {}),
        weather: {
          ...previous.session.weather,
          ...cloneJsonSafe(importedSession.weather || {}, {}),
        },
        track_state: {
          ...previous.session.track_state,
          ...cloneJsonSafe(importedSession.track_state || {}, {}),
        },
      },
    }));

  log("Applied imported session settings");
}

function ensureActionRow(component) {
  const heading = getWizardHeading();
  const panel = heading?.parentElement?.parentElement;

  if (!component || !heading || !panel) {
    return null;
  }

  let row = panel.querySelector("#iref-hosted-tools");

  if (row) {
    row.querySelector("#iref-import-weather")?.remove();
    row.querySelector("#iref-export-weather")?.remove();
    return row;
  }

  row = document.createElement("div");
  row.id = "iref-hosted-tools";
  row.className = "iref-hosted-buttons";

  const buttons = [
    {
      id: "iref-import-session",
      label: "Import Session",
      onClick: async () => importSession(component),
    },
    {
      id: "iref-export-session",
      label: "Export Session",
      onClick: () => exportSession(component),
    },
  ];

  buttons.forEach(({ id, label, onClick }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.id = id;
    button.className = "iref-hosted-btn";
    button.textContent = label;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });
    row.appendChild(button);
  });

  panel.insertBefore(row, panel.children[1] || null);
  return row;
}

async function initHostedSession(activate = true) {
  clearInterval(persistInterval);

  if (!activate) {
    return;
  }

  persistInterval = setInterval(() => {
    const component = getCreateRaceComponent();

    if (!component) {
      return;
    }

    ensureActionRow(component);
  }, 400);
}

const id = "share-hosted-session";
const bodyClass = "iref-" + id;
const selector = "body";

features.add(id, true, selector, bodyClass, initHostedSession);
