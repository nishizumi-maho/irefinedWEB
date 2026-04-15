import { log } from "./logger.js";
import features from "../feature-manager.js";
import { findMemoizedProps } from "../helpers/react-resolver.js";
import { getSettings } from "../helpers/settings.js";
import { initSoundSupport, playQueueRegisteredSound } from "../helpers/sound.js";
import ws from "../helpers/websockets.js";
import "./auto-register.css";

const selector = 'a.active[href*="go-racing"]';
const id = "auto-register";
const bodyClass = "iref-" + id;
const persistStorageKey = "iref_watch_queue";
const registrationStorageKey = "iref_registration_state";
const autoRegisterLeadMs = 5 * 60 * 1000;
const autoRegisterGraceMs = 15 * 60 * 1000;
const queueRetentionMs = 12 * 60 * 60 * 1000;
const queueWithdrawRetryDelayMs = 2500;
const queueRegisterDelayMs = 7000;
const raceEventType = 5;
const qualifyEventType = 3;
const practiceEventType = 2;
let persistInterval = 0;

function isQueueCarPromptEnabled() {
  return getSettings()["queue-car-prompt"] === true;
}

function shouldRequeueDisplacedRegistration() {
  return getSettings()["queue-requeue-displaced-registration"] === true;
}

function normalizeText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeSearchText(text = "") {
  return normalizeText(text).toLowerCase();
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function getTextLines(text = "") {
  return text
    .split("\n")
    .map((line) => normalizeText(line))
    .filter(Boolean);
}

function slugify(text = "") {
  return normalizeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatSeasonName(seasonName = "") {
  return seasonName
    .replace(/(?:\s*-\s*)?\d{4}\sSeason(?:\s\d+)?/, "")
    .replace(/Fixed\s(?:-\s)?Fixed/, "Fixed")
    .replace("Series Series", "Series");
}

function ensureWatchQueue() {
  if (!Array.isArray(window.watchQueue)) {
    window.watchQueue = [];
  }

  return window.watchQueue;
}

function isRegistrationStateExpired(state) {
  if (!state || typeof state !== "object") {
    return true;
  }

  const referenceTime = state.start_time || state.updated_at || state.registered_at;

  if (!referenceTime) {
    return false;
  }

  const parsed = new Date(referenceTime).getTime();

  if (Number.isNaN(parsed)) {
    return false;
  }

  return parsed < getCurrentTime() - queueRetentionMs;
}

function loadRegistrationState() {
  try {
    const stored = JSON.parse(localStorage.getItem(registrationStorageKey));

    if (!stored || isRegistrationStateExpired(stored)) {
      window.irefRegistrationState = null;
      localStorage.removeItem(registrationStorageKey);
      return;
    }

    window.irefRegistrationState = stored;
  } catch {
    window.irefRegistrationState = null;
    localStorage.removeItem(registrationStorageKey);
  }
}

function getRegistrationState() {
  if (window.irefRegistrationState === undefined) {
    loadRegistrationState();
  }

  if (isRegistrationStateExpired(window.irefRegistrationState)) {
    clearRegistrationState();
  }

  return window.irefRegistrationState || null;
}

function setRegistrationState(nextState) {
  if (!nextState || typeof nextState !== "object") {
    clearRegistrationState();
    return null;
  }

  window.irefRegistrationState = {
    ...nextState,
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem(
    registrationStorageKey,
    JSON.stringify(window.irefRegistrationState)
  );

  return window.irefRegistrationState;
}

export function clearRegistrationState() {
  window.irefRegistrationState = null;
  localStorage.removeItem(registrationStorageKey);
}

export function getCurrentRegistrationState() {
  return getRegistrationState();
}

export function confirmRegistrationState(extra = {}) {
  const currentState = getRegistrationState();

  if (!currentState) {
    return setRegistrationState({
      status: "registered",
      confirmed_by_site: true,
      source: "site",
      ...extra,
      registered_at: new Date().toISOString(),
    });
  }

  return setRegistrationState({
    ...currentState,
    ...extra,
    status: "registered",
    confirmed_by_site: true,
    source: currentState.source || "site",
    registered_at: currentState.registered_at || new Date().toISOString(),
  });
}

function queueKey(queueItem) {
  return `${queueItem.season_id}:${getQueueEventType(queueItem)}:${new Date(queueItem.start_time).toISOString()}`;
}

function getCurrentTime() {
  return Date.now();
}

function canDirectRegisterSession(sessionPropsOrSession = {}) {
  const session = sessionPropsOrSession?.session || sessionPropsOrSession;

  return !!session?.session_id && session.preregister === true;
}

function isInsideQueueRegisterWindow(startTime) {
  const parsedStartTime = new Date(startTime).getTime();

  if (Number.isNaN(parsedStartTime)) {
    return false;
  }

  const timeUntilStart = parsedStartTime - getCurrentTime();
  return (
    timeUntilStart <= autoRegisterLeadMs &&
    timeUntilStart >= -autoRegisterGraceMs
  );
}

function isQueueItemExpired(queueItem) {
  const startTime = new Date(queueItem.start_time).getTime();

  if (Number.isNaN(startTime)) {
    return true;
  }

  return startTime < getCurrentTime() - queueRetentionMs;
}

function cleanupQueue(queue = ensureWatchQueue()) {
  const deduped = new Map();

  queue.forEach((item) => {
    if (!item || isQueueItemExpired(item)) {
      return;
    }

    deduped.set(queueKey(item), item);
  });

  return [...deduped.values()].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time)
  );
}

function persistQueue() {
  localStorage.setItem(persistStorageKey, JSON.stringify(cleanupQueue()));
}

function setWatchQueue(queue) {
  window.watchQueue = cleanupQueue(queue);
  persistQueue();
}

function formatTimeLabel(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function loadQueue() {
  try {
    const stored = JSON.parse(localStorage.getItem(persistStorageKey));

    if (!Array.isArray(stored)) {
      window.watchQueue = [];
      return;
    }

    window.watchQueue = cleanupQueue(
      stored
        .map((item) => {
          const startTime = new Date(item.start_time);

          if (Number.isNaN(startTime.getTime())) {
            return null;
          }

          return {
            ...item,
            event_type: item.event_type ?? raceEventType,
            event_type_name: item.event_type_name || "Race",
            registration_open: item.registration_open === true,
            start_time: startTime.toISOString(),
            status:
              item.status === "found" &&
              item.session_id &&
              item.registration_open === true
                ? "found"
                : "queued",
            session_id: item.session_id ?? null,
            subsession_id: item.subsession_id ?? null,
            created_at: item.created_at || new Date().toISOString(),
            last_attempt_at: item.last_attempt_at || null,
            last_found_at: item.last_found_at || null,
          };
        })
        .filter(Boolean)
    );

    persistQueue();
  } catch {
    window.watchQueue = [];
  }
}

function removeQueueItem(queueItem) {
  setWatchQueue(
    ensureWatchQueue().filter((item) => queueKey(item) !== queueKey(queueItem))
  );
}

function getQueueEventType(item) {
  if (item?.event_type !== null && item?.event_type !== undefined) {
    return item.event_type;
  }

  if (/qual/i.test(item?.event_type_name || "")) {
    return qualifyEventType;
  }

  return raceEventType;
}

function getSessionEventType(session = {}) {
  const eventType = toNumber(session.event_type);

  if (eventType !== null) {
    return eventType;
  }

  if (/practice/i.test(session.event_type_name || "")) {
    return practiceEventType;
  }

  if (/qual/i.test(session.event_type_name || "")) {
    return qualifyEventType;
  }

  if (/race/i.test(session.event_type_name || "")) {
    return raceEventType;
  }

  return null;
}

function getSessionEventName(session = {}) {
  if (session.event_type_name) {
    return session.event_type_name;
  }

  if (getSessionEventType(session) === practiceEventType) {
    return "Practice";
  }

  if (getSessionEventType(session) === qualifyEventType) {
    return "Qualify";
  }

  if (getSessionEventType(session) === raceEventType) {
    return "Race";
  }

  return "Session";
}

function sessionMatchesQueueEvent(session, queueItem) {
  const sessionEventType = getSessionEventType(session);
  const queueEventType = getQueueEventType(queueItem);

  if (sessionEventType !== null && queueEventType !== null && queueEventType !== undefined) {
    return String(sessionEventType) === String(queueEventType);
  }

  return normalizeSearchText(getSessionEventName(session)) ===
    normalizeSearchText(queueItem?.event_type_name || "");
}

function isRaceSession(session = {}) {
  return getSessionEventType(session) === raceEventType ||
    /race/i.test(session.event_type_name || "");
}

function isQualifySession(session = {}) {
  return getSessionEventType(session) === qualifyEventType ||
    /qual/i.test(session.event_type_name || "");
}

function isPracticeSession(session = {}) {
  return getSessionEventType(session) === practiceEventType ||
    /practice/i.test(session.event_type_name || "");
}

function isQueueableSession(session = {}) {
  return isRaceSession(session) || isQualifySession(session);
}

function isDirectRegisterableSession(session = {}) {
  return isRaceSession(session) || isQualifySession(session) || isPracticeSession(session);
}

function makeQueueSlotKey(contentId, eventType, startTime) {
  return `${contentId}|${eventType ?? raceEventType}|${new Date(startTime).toISOString()}`;
}

function parseQueueSlotKey(queueSlotKey = "") {
  const parts = queueSlotKey.split("|");

  if (parts.length === 2) {
    return {
      seasonId: parts[0],
      eventType: raceEventType,
      startTime: parts[1],
    };
  }

  return {
    seasonId: parts[0],
    eventType: parts[1],
    startTime: parts.slice(2).join("|"),
  };
}

function getQueueItem(seasonId, startTime, eventType = raceEventType) {
  const normalizedTime = new Date(startTime).toISOString();

  return ensureWatchQueue().find(
    (item) =>
      Number(item.season_id) === Number(seasonId) &&
      String(getQueueEventType(item)) === String(eventType) &&
      new Date(item.start_time).toISOString() === normalizedTime
  );
}

function findQueueIndex(seasonId, startTime, eventType = raceEventType) {
  const normalizedTime = new Date(startTime).toISOString();

  return ensureWatchQueue().findIndex(
    (item) =>
      Number(item.season_id) === Number(seasonId) &&
      String(getQueueEventType(item)) === String(eventType) &&
      new Date(item.start_time).toISOString() === normalizedTime
  );
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

function isVisible(el) {
  return !!el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function findNextRaceSection() {
  const heading = findHeading((text) => text.startsWith("Next Race @"));

  if (!heading) {
    return null;
  }

  return findClosest(heading, (node) => {
    const text = normalizeText(node.innerText || "");
    return (
      text.includes("Up Next") &&
      (text.includes("More ways to race") || text.includes("Race Duration"))
    );
  });
}

function findAvailableSessionsSection() {
  const heading = findHeading((text) => normalizeSearchText(text).startsWith("available"));

  if (!heading) {
    return null;
  }

  return findClosest(heading, (node) => {
    const text = normalizeText(node.innerText || "");
    return normalizeSearchText(text).includes("ongoing or upcoming");
  });
}

function findPracticeSessionsSection() {
  const heading = findHeading((text) =>
    normalizeSearchText(text).startsWith("practices")
  );

  if (!heading) {
    return null;
  }

  return findClosest(heading, (node) => {
    const text = normalizeSearchText(node.innerText || "");
    return (
      text.includes("practices") &&
      text.includes("event start") &&
      text.includes("track")
    );
  });
}

function findCurrentlyRacingSection() {
  const heading = findHeading((text) =>
    normalizeSearchText(text).startsWith("currently racing")
  );

  if (!heading) {
    return null;
  }

  return findClosest(heading, (node) => {
    const text = normalizeSearchText(node.innerText || "");
    return (
      text.includes("currently racing") &&
      text.includes("view all drivers currently racing")
    );
  });
}

function restoreNativeSessionActions(section) {
  if (!section) {
    return;
  }

  section.querySelectorAll(".iref-session-view-hidden").forEach((element) => {
    element.classList.remove("iref-session-view-hidden");
  });
  section.querySelectorAll(".iref-queue-btn-inline").forEach((element) => {
    element.remove();
  });
  section.querySelectorAll(".iref-session-register-btn").forEach((element) => {
    element.remove();
  });
}

function findNativeWithdrawAction() {
  const nextRaceSection = findNextRaceSection();

  if (!nextRaceSection) {
    return null;
  }

  return [...nextRaceSection.querySelectorAll("button, a")]
    .filter((el) => !el.closest("#iref-top-action-row"))
    .filter((el) => !el.closest("#iref-ui-root"))
    .filter((el) => isVisible(el))
    .find((el) => /^Withdraw$/i.test(normalizeText(el.innerText || el.textContent || "")));
}

function tryWithdrawCurrentSession() {
  const nativeWithdraw = findNativeWithdrawAction();

  if (nativeWithdraw) {
    nativeWithdraw.click();
    return true;
  }

  return ws.withdraw();
}

function findNextRaceProps(section) {
  const viewButton = [...section.querySelectorAll("button, a")].find((button) =>
    /View in iRacing/i.test(
      normalizeText(button.innerText || button.textContent || "")
    )
  );

  if (!viewButton) {
    return null;
  }

  const props = findMemoizedProps(
    viewButton,
    (candidate) => candidate.session && candidate.contentId
  );

  if (!props?.session) {
    return null;
  }

  return { button: viewButton, props };
}

function seasonsMatch(state, seasonId, seasonName = "") {
  if (!state) {
    return false;
  }

  if (seasonId !== null && seasonId !== undefined && state.season_id !== null && state.season_id !== undefined) {
    return Number(state.season_id) === Number(seasonId);
  }

  if (seasonName && state.season_name) {
    return formatSeasonName(state.season_name) === formatSeasonName(seasonName);
  }

  return false;
}

function registrationMatchesCurrentPage(state, sessionProps) {
  if (!state) {
    return false;
  }

  if (state.source_path && state.source_path === location.pathname) {
    return true;
  }

  if (state.source_url) {
    try {
      if (new URL(state.source_url).pathname === location.pathname) {
        return true;
      }
    } catch {}
  }

  return seasonsMatch(
    state,
    sessionProps?.contentId ?? sessionProps?.session?.season_id ?? null,
    sessionProps?.session?.season_name || ""
  );
}

function hasActiveRegistration(state = getRegistrationState()) {
  return !!state && (state.status === "registering" || state.status === "registered");
}

function registrationTargetsMatch(currentState, nextState) {
  if (!currentState || !nextState) {
    return false;
  }

  if (
    currentState.subsession_id &&
    nextState.subsession_id &&
    Number(currentState.subsession_id) === Number(nextState.subsession_id)
  ) {
    return true;
  }

  if (
    currentState.session_id &&
    nextState.session_id &&
    Number(currentState.session_id) === Number(nextState.session_id)
  ) {
    return true;
  }

  if (
    currentState.season_id !== null &&
    currentState.season_id !== undefined &&
    nextState.season_id !== null &&
    nextState.season_id !== undefined &&
    Number(currentState.season_id) === Number(nextState.season_id) &&
    currentState.start_time &&
    nextState.start_time
  ) {
    return new Date(currentState.start_time).toISOString() === new Date(nextState.start_time).toISOString();
  }

  return false;
}

function getCurrentSlotLabel(section, startTime) {
  const exactLabel = [...section.querySelectorAll("p, span, div")].find((node) =>
    /^\d{1,2}:\d{2}$/.test(normalizeText(node.textContent))
  );

  if (exactLabel) {
    return normalizeText(exactLabel.textContent);
  }

  return formatTimeLabel(startTime);
}

function buildSlotFromLabel(baseDate, label, minimumDate) {
  const match = label.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const candidate = new Date(baseDate);
  candidate.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);

  while (candidate <= minimumDate) {
    candidate.setDate(candidate.getDate() + 1);
  }

  return {
    label,
    start_time: candidate.toISOString(),
  };
}

function getQueueSlots(section, sessionProps) {
  if (!sessionProps?.session?.start_time) {
    return [];
  }

  const sessionStart = new Date(sessionProps.session.start_time);

  if (Number.isNaN(sessionStart.getTime())) {
    return [];
  }

  const slots = [
    {
      label: getCurrentSlotLabel(section, sessionStart),
      start_time: sessionStart.toISOString(),
    },
  ];
  const upNextLine = getTextLines(section.innerText || "").find((line) =>
    line.startsWith("Up Next ")
  );

  if (!upNextLine) {
    return slots;
  }

  const labels = upNextLine
    .replace(/^Up Next\s+/, "")
    .split(",")
    .map((item) => normalizeText(item))
    .filter(Boolean);
  let previousDate = sessionStart;

  labels.forEach((label) => {
    const slot = buildSlotFromLabel(sessionStart, label, previousDate);

    if (!slot) {
      return;
    }

    previousDate = new Date(slot.start_time);
    slots.push(slot);
  });

  return slots;
}

function getCarSelectionProps(section, contentId) {
  const candidates = [...section.querySelectorAll("div, p, h2, h3, button, span")];

  for (const candidate of candidates) {
    const props = findMemoizedProps(
      candidate,
      (value) =>
        Array.isArray(value.cars) &&
        Array.isArray(value.carClassIds) &&
        (value.seasonId === undefined || Number(value.seasonId) === Number(contentId))
    );

    if (props) {
      return props;
    }
  }

  return null;
}

function parseStoredCar(contentId) {
  try {
    const stored = JSON.parse(localStorage.getItem(`selected_car_season_${contentId}`));

    if (!stored || typeof stored !== "object") {
      return null;
    }

    const carId = stored.car_id ?? stored.carId ?? null;
    const carClassId = stored.car_class_id ?? stored.carClassId ?? null;

    if (!carId || !carClassId) {
      return null;
    }

    return {
      car_id: carId,
      car_class_id: carClassId,
      car_name: stored.car_name ?? stored.carName ?? null,
    };
  } catch {
    return null;
  }
}

function storeSelectedCar(contentId, selectedCar) {
  if (!selectedCar?.car_id || !selectedCar?.car_class_id) {
    return;
  }

  localStorage.setItem(
    `selected_car_season_${contentId}`,
    JSON.stringify(selectedCar)
  );
}

function resolveCarClassId(car, fallbackClassIds = []) {
  if (!car) {
    return fallbackClassIds[0] ?? null;
  }

  if (car.car_class_id) {
    return car.car_class_id;
  }

  if (Array.isArray(car.car_classes) && car.car_classes.length > 0) {
    return car.car_classes[0].car_class_id ?? fallbackClassIds[0] ?? null;
  }

  return fallbackClassIds[0] ?? null;
}

function enrichStoredCarSelection(contentId, storedCar, cars = [], carClassIds = []) {
  if (!storedCar?.car_id || !storedCar?.car_class_id) {
    return storedCar;
  }

  const matchedCar = cars.find((car) => Number(car.car_id) === Number(storedCar.car_id));

  if (!matchedCar) {
    return storedCar;
  }

  const enrichedSelection = {
    car_id: storedCar.car_id,
    car_class_id: storedCar.car_class_id || resolveCarClassId(matchedCar, carClassIds),
    car_name: storedCar.car_name || matchedCar.car_name || null,
  };

  storeSelectedCar(contentId, enrichedSelection);
  return enrichedSelection;
}

function promptCarSelection(contentId, cars = [], carClassIds = []) {
  if (!Array.isArray(cars) || cars.length < 1) {
    return null;
  }

  const preview = cars
    .map((car, index) => `${index + 1}. ${car.car_name}`)
    .join("\n");
  const response = window.prompt(
    `Choose a car for queued registration in series ${contentId}:\n\n${preview}`,
    "1"
  );

  if (!response) {
    log("Queue cancelled: no car chosen");
    return null;
  }

  const selectedIndex = parseInt(response, 10) - 1;

  if (
    Number.isNaN(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex >= cars.length
  ) {
    log("Queue cancelled: invalid car selection");
    return null;
  }

  const selectedCar = cars[selectedIndex];
  const resolvedCar = {
    car_id: selectedCar.car_id,
    car_class_id: resolveCarClassId(selectedCar, carClassIds),
    car_name: selectedCar.car_name || null,
  };

  if (!resolvedCar.car_class_id) {
    log("Queue cancelled: could not resolve the selected car class");
    return null;
  }

  storeSelectedCar(contentId, resolvedCar);
  log(`🚗 Queue will use ${selectedCar.car_name}`);
  return resolvedCar;
}

function alertChooseCar() {
  window.alert("Choose a car!");
}

function getSelectedCar(contentId, sessionProps, section) {
  const storedCar = parseStoredCar(contentId);
  const carSelectionProps = getCarSelectionProps(section, contentId);
  const cars = Array.isArray(carSelectionProps?.cars) ? carSelectionProps.cars : [];
  const carClassIds = Array.isArray(carSelectionProps?.carClassIds)
    ? carSelectionProps.carClassIds
    : [];

  if (storedCar) {
    return enrichStoredCarSelection(contentId, storedCar, cars, carClassIds);
  }

  if (!carSelectionProps) {
    return null;
  }

  const preselectedCarId =
    sessionProps?.preselectedCarId ?? carSelectionProps?.preselectedCarId ?? null;

  if (preselectedCarId) {
    const selectedCar = cars.find(
      (car) => Number(car.car_id) === Number(preselectedCarId)
    );

    if (selectedCar) {
      return {
        car_id: selectedCar.car_id,
        car_class_id: resolveCarClassId(selectedCar, carClassIds),
        car_name: selectedCar.car_name || null,
      };
    }
  }

  if (cars.length === 1) {
    const resolvedCar = {
      car_id: cars[0].car_id,
      car_class_id: resolveCarClassId(cars[0], carClassIds),
      car_name: cars[0].car_name || null,
    };

    storeSelectedCar(contentId, resolvedCar);
    return resolvedCar;
  }

  if (!isQueueCarPromptEnabled()) {
    log(`🚫 Queue needs a selected car for series ${contentId}`);
    alertChooseCar();
    return null;
  }

  return promptCarSelection(contentId, cars, carClassIds);
}

function makeQueueItem(sessionProps, slot, selectedCar) {
  const session = sessionProps.session || {};
  const eventType = getSessionEventType(session);

  return {
    car_id: selectedCar.car_id,
    car_class_id: selectedCar.car_class_id,
    car_name: selectedCar.car_name || null,
    event_type: eventType ?? raceEventType,
    event_type_name: getSessionEventName(session),
    season_id: sessionProps.contentId ?? session.season_id,
    season_name: formatSeasonName(session.season_name || ""),
    start_time: new Date(slot.start_time).toISOString(),
    start_label: slot.label || formatTimeLabel(slot.start_time),
    track_name: session.track_name || session.track?.track_name || null,
    source_path: location.pathname,
    source_url: location.href,
    created_at: new Date().toISOString(),
    last_attempt_at: null,
    last_found_at: null,
    registration_open: canDirectRegisterSession(sessionProps),
    status: "queued",
    session_id: null,
    subsession_id: null,
  };
}

function buildRegistrationStateFromQueueItem(queueItem) {
  if (!queueItem) {
    return null;
  }

  return {
    status: "registered",
    source: "queue",
    confirmed_by_site: false,
    season_id: queueItem.season_id,
    season_name: queueItem.season_name,
    car_id: queueItem.car_id,
    car_class_id: queueItem.car_class_id,
    car_name: queueItem.car_name || null,
    event_type: getQueueEventType(queueItem),
    event_type_name: queueItem.event_type_name || "Race",
    session_id: queueItem.session_id ?? null,
    subsession_id: queueItem.subsession_id ?? null,
    start_time: queueItem.start_time,
    start_label: queueItem.start_label,
    track_name: queueItem.track_name || null,
    source_path: queueItem.source_path,
    source_url: queueItem.source_url,
  };
}

function makeQueueItemFromRegistrationState(state) {
  if (
    !state?.season_id ||
    !state.start_time ||
    !state.car_id ||
    !state.car_class_id
  ) {
    return null;
  }

  const startTime = new Date(state.start_time);

  if (Number.isNaN(startTime.getTime())) {
    return null;
  }

  const eventType = state.event_type ?? raceEventType;

  return {
    car_id: state.car_id,
    car_class_id: state.car_class_id,
    car_name: state.car_name || null,
    event_type: eventType,
    event_type_name:
      state.event_type_name ||
      (Number(eventType) === qualifyEventType ? "Qualify" : "Race"),
    season_id: state.season_id,
    season_name: formatSeasonName(state.season_name || ""),
    start_time: startTime.toISOString(),
    start_label: state.start_label || formatTimeLabel(startTime),
    track_name: state.track_name || null,
    source_path: state.source_path || location.pathname,
    source_url: state.source_url || location.href,
    created_at: new Date().toISOString(),
    last_attempt_at: null,
    last_found_at: null,
    registration_open: !!state.session_id,
    status: "queued",
    session_id: state.session_id ?? null,
    subsession_id: state.subsession_id ?? null,
  };
}

function canRequeueDisplacedRegistration(displacedState, nextState) {
  if (
    !shouldRequeueDisplacedRegistration() ||
    !hasActiveRegistration(displacedState) ||
    !displacedState?.season_id ||
    !displacedState.start_time ||
    !displacedState.car_id ||
    !displacedState.car_class_id ||
    registrationTargetsMatch(displacedState, nextState)
  ) {
    return false;
  }

  const displacedStartTime = new Date(displacedState.start_time).getTime();
  const nextStartTime = new Date(nextState?.start_time).getTime();

  if (
    Number.isNaN(displacedStartTime) ||
    Number.isNaN(nextStartTime) ||
    displacedStartTime <= nextStartTime
  ) {
    return false;
  }

  return true;
}

function requeueDisplacedRegistration(displacedState, nextState) {
  if (!canRequeueDisplacedRegistration(displacedState, nextState)) {
    return false;
  }

  const queueItem = makeQueueItemFromRegistrationState(displacedState);

  if (!queueItem) {
    return false;
  }

  if (getQueueItem(queueItem.season_id, queueItem.start_time, queueItem.event_type)) {
    return false;
  }

  setWatchQueue([...ensureWatchQueue(), queueItem]);
  log(
    `📝 Re-queued displaced ${queueItem.event_type_name.toLowerCase()} session for ${queueItem.season_name} ${queueItem.start_label}`
  );
  return true;
}

function setButtonState(button, queueItem, idleLabel) {
  if (!button) {
    return;
  }

  button.classList.remove(
    "iref-queue-btn-queued",
    "iref-queue-btn-found",
    "iref-queue-btn-registering",
    "danger"
  );
  button.disabled = false;

  if (!queueItem) {
    button.textContent = idleLabel;
    return;
  }

  if (queueItem.status === "registering") {
    button.textContent = "Registering";
    button.disabled = true;
    button.classList.add("iref-queue-btn-registering");
    return;
  }

  if (queueItem.status === "found") {
    button.textContent = "Register now";
    button.classList.add("iref-queue-btn-found");
    return;
  }

  button.textContent = "Queued";
  button.classList.add("iref-queue-btn-queued");
}

function createQueueButton(idSuffix, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.id = `iref-queue-${idSuffix}`;
  button.className = "iref-queue-btn";
  button.textContent = label;
  return button;
}

function ensureSessionQueueRow(container, queueSlotKey) {
  if (!container) {
    return null;
  }

  const host = container.parentElement || container;
  const rowId = `iref-session-queue-row-${slugify(queueSlotKey)}`;
  let row = host.querySelector(`#${CSS.escape(rowId)}`);

  if (row) {
    return row;
  }

  row = document.createElement("div");
  row.id = rowId;
  row.className = "iref-session-queue-row";
  host.appendChild(row);
  return row;
}

function handleMissingCar(button, contentId) {
  log(`🚫 No car selected for queue in series ${contentId}`);
  button.textContent = "Select Car";
  button.classList.add("danger");

  window.setTimeout(() => {
    button.classList.remove("danger");
    button.textContent = button.dataset.irefIdleLabel || "Queue";
  }, 2500);
}

function markQueueItemFound(queueItem, session) {
  if (!queueItem || !session?.session_id) {
    return false;
  }

  queueItem.session_id = session.session_id;
  queueItem.subsession_id = session.subsession_id ?? null;
  queueItem.registration_open = canDirectRegisterSession(session);

  if (!queueItem.registration_open) {
    persistQueue();
    return false;
  }

  queueItem.status = "found";
  queueItem.last_found_at = new Date().toISOString();
  persistQueue();
  return true;
}

function canQueueItemRegisterNow(queueItem) {
  if (
    queueItem?.registration_open !== true ||
    !isInsideQueueRegisterWindow(queueItem.start_time)
  ) {
    return false;
  }

  const currentRegistrationState = getRegistrationState();

  if (!hasActiveRegistration(currentRegistrationState)) {
    return true;
  }

  if (currentRegistrationState.status === "registering") {
    return false;
  }

  return !registrationTargetsMatch(
    currentRegistrationState,
    buildRegistrationStateFromQueueItem(queueItem)
  );
}

function resolveImmediateQueueSession(sessionProps, slot, section) {
  if (!sessionProps?.session?.start_time || !slot?.start_time) {
    return null;
  }

  const slotStart = new Date(slot.start_time).toISOString();
  const currentStart = new Date(sessionProps.session.start_time).toISOString();

  if (slotStart !== currentStart) {
    return null;
  }

  const registerableProps = resolveRegisterableSessionProps(section, sessionProps);

  if (!registerableProps?.session?.session_id) {
    return null;
  }

  return registerableProps.session;
}

function updateQueueReadiness(queueItem, session = null) {
  if (!queueItem || queueItem.status !== "queued") {
    return false;
  }

  if (!canQueueItemRegisterNow(queueItem)) {
    return false;
  }

  return markQueueItemFound(
    queueItem,
    session || {
      session_id: queueItem.session_id,
      subsession_id: queueItem.subsession_id ?? null,
    }
  );
}

function queueSlot(sessionProps, slot, button, section) {
  const selectedCar = getSelectedCar(sessionProps.contentId, sessionProps, section);

  if (!selectedCar) {
    handleMissingCar(button, sessionProps.contentId);
    return;
  }

  const queueItem = makeQueueItem(sessionProps, slot, selectedCar);

  if (getQueueItem(queueItem.season_id, queueItem.start_time, queueItem.event_type)) {
    log(`🚫 ${queueItem.season_name} ${queueItem.start_label} is already queued`);
    return;
  }

  const immediateSession = resolveImmediateQueueSession(sessionProps, slot, section);

  if (immediateSession) {
    queueItem.session_id = immediateSession.session_id;
    queueItem.subsession_id = immediateSession.subsession_id ?? null;
  }

  const queue = [...ensureWatchQueue(), queueItem];
  setWatchQueue(queue);

  if (immediateSession && updateQueueReadiness(queueItem, immediateSession)) {
    log(`🟦 ${queueItem.season_name} ${queueItem.start_label} is ready for Register now`);
    return;
  }

  log(`📝 Queued ${queueItem.season_name} for ${queueItem.start_label}`);
}

function syncQueueButtons() {
  document.querySelectorAll("[data-iref-queue-key]").forEach((button) => {
    const { seasonId, eventType, startTime } = parseQueueSlotKey(
      button.dataset.irefQueueKey
    );
    const queueItem = getQueueItem(seasonId, startTime, eventType);

    setButtonState(button, queueItem, button.dataset.irefIdleLabel || "Queue");
  });
}

function createTopQueueGroup(kind, title, subtitle) {
  const group = document.createElement("div");
  group.className = `iref-top-queue-group iref-top-queue-group-${kind}`;
  group.dataset.irefQueueGroup = kind;

  const header = document.createElement("div");
  header.className = "iref-top-queue-header";

  const titleEl = document.createElement("div");
  titleEl.className = "iref-top-queue-title";
  titleEl.textContent = title;

  const subtitleEl = document.createElement("div");
  subtitleEl.className = "iref-top-queue-subtitle";
  subtitleEl.textContent = subtitle;

  const buttonsEl = document.createElement("div");
  buttonsEl.className = "iref-top-queue-buttons";

  header.append(titleEl, subtitleEl);
  group.append(header, buttonsEl);
  return group;
}

function ensureTopQueueGroup(row, kind, title, subtitle) {
  let group = row.querySelector(`[data-iref-queue-group="${kind}"]`);

  if (!group) {
    group = createTopQueueGroup(kind, title, subtitle);
    row.appendChild(group);
  }

  return group;
}

function collectSessionQueueEntries(predicate, skipButtons = []) {
  const skipped = new Set(skipButtons.filter(Boolean));

  return getSessionButtonEntries(document, { skipButtons })
    .filter(({ button, props }) =>
      !skipped.has(button) &&
      props?.session &&
      Number(props.session.max_team_drivers || 1) <= 1 &&
      predicate(props.session)
    )
    .map(({ props }) => ({
      sessionProps: props,
      slot: {
        label: formatTimeLabel(props.session.start_time),
        start_time: new Date(props.session.start_time).toISOString(),
      },
      section: findNextRaceSection() || document.body,
    }));
}

function syncTopQueueButtonList(buttonsEl, entries, labelForEntry) {
  const entryKeys = new Set(
    entries.map(({ sessionProps, slot }) =>
      makeQueueSlotKey(
        sessionProps.contentId,
        getSessionEventType(sessionProps.session),
        slot.start_time
      )
    )
  );

  [...buttonsEl.querySelectorAll("[data-iref-queue-key]")].forEach((button) => {
    if (!entryKeys.has(button.dataset.irefQueueKey)) {
      button.remove();
    }
  });

  entries.forEach((entry, index) => {
    const { sessionProps, slot, section } = entry;
    const eventType = getSessionEventType(sessionProps.session);
    const slotKey = makeQueueSlotKey(
      sessionProps.contentId,
      eventType,
      slot.start_time
    );
    let button = buttonsEl.querySelector(
      `[data-iref-queue-key="${CSS.escape(slotKey)}"]`
    );

    if (!button) {
      const label = labelForEntry(entry, index);
      button = createQueueButton(
        `${slugify(String(sessionProps.contentId))}-${slugify(String(eventType))}-${slugify(slot.start_time)}-top`,
        label
      );
      button.classList.add("iref-queue-btn-top");
      button.dataset.irefIdleLabel = label;
      button.dataset.irefQueueKey = slotKey;
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const currentQueueItem = getQueueItem(
          sessionProps.contentId,
          slot.start_time,
          eventType
        );

        if (currentQueueItem?.status === "found") {
          activateQueueItem(
            findQueueIndex(sessionProps.contentId, slot.start_time, eventType),
            { manual: true }
          );
          return;
        }

        if (currentQueueItem) {
          removeQueueItem(currentQueueItem);
          return;
        }

        queueSlot(sessionProps, slot, button, section);
      });
      buttonsEl.appendChild(button);
    }
  });
}

function ensureTopQueueButtons(section, sessionProps) {
  const nextRace = findNextRaceProps(section);
  const nativeButtonRow = findClosest(
    nextRace?.button,
    (node) => node.querySelector("button")
  );
  const actionAnchor = section.querySelector("#iref-top-action-row") || nativeButtonRow;
  const actionHost = actionAnchor?.parentElement;

  if (!actionAnchor || !actionHost || !sessionProps?.session) {
    return;
  }

  let row = section.querySelector("#iref-top-queue-row");

  if (!row) {
    row = document.createElement("div");
    row.id = "iref-top-queue-row";
    row.className = "iref-top-queue-row";
    actionHost.insertBefore(row, actionAnchor.nextSibling);
  } else if (row.parentElement !== actionHost) {
    actionHost.insertBefore(row, actionAnchor.nextSibling);
  } else if (row.previousElementSibling !== actionAnchor) {
    actionHost.insertBefore(row, actionAnchor.nextSibling);
  }

  const raceGroup = ensureTopQueueGroup(
    row,
    "race",
    "Race Queue",
    "Upcoming race sessions"
  );
  const qualifyGroup = ensureTopQueueGroup(
    row,
    "qualify",
    "Qualify Queue",
    "Upcoming qualify sessions"
  );
  const currentStartTime = new Date(sessionProps.session.start_time).toISOString();
  const raceSlots = getQueueSlots(section, sessionProps)
    .filter((slot) =>
      canDirectRegisterSession(sessionProps) ||
      new Date(slot.start_time).toISOString() !== currentStartTime
    )
    .map((slot) => ({ sessionProps, slot, section }));
  const qualifyEntries = collectSessionQueueEntries(isQualifySession, [nextRace?.button]);

  syncTopQueueButtonList(
    raceGroup.querySelector(".iref-top-queue-buttons"),
    raceSlots,
    ({ slot }) => `Queue ${slot.label}`
  );
  syncTopQueueButtonList(
    qualifyGroup.querySelector(".iref-top-queue-buttons"),
    qualifyEntries,
    ({ slot }) => `Queue ${slot.label}`
  );

  raceGroup.classList.toggle("hidden", raceSlots.length < 1);
  qualifyGroup.classList.toggle("hidden", qualifyEntries.length < 1);
}

function getSessionButtonEntries(section, options = {}) {
  const skipButtons = new Set((options.skipButtons || []).filter(Boolean));
  const currentlyRacingSection = findCurrentlyRacingSection();
  const buttons = [...section.querySelectorAll("button, a")]
    .filter((button) => !skipButtons.has(button))
    .filter((button) => !currentlyRacingSection?.contains(button))
    .filter((button) => !button.closest(".iref-native-action-hidden"))
    .filter((button) => !button.closest("#iref-top-action-row"))
    .filter((button) => !button.closest("#iref-top-queue-row"))
    .filter((button) => {
      const label = normalizeText(button.innerText || button.textContent || "");

      return /View in iRacing/i.test(label) || /^Register$/i.test(label);
    });
  const seen = new Set();

  return buttons
    .map((button) => ({
      button,
      props: findMemoizedProps(
        button,
        (candidate) => candidate.session && candidate.contentId
      ),
    }))
    .filter(({ props }) => {
      const sessionId =
        props?.session?.session_id ||
        props?.session?.subsession_id ||
        props?.session?.start_time;

      if (!props?.session || !sessionId || seen.has(sessionId)) {
        return false;
      }

      seen.add(sessionId);
      return true;
    });
}

function resolveRegisterableSessionProps(section, sessionProps) {
  if (!sessionProps?.session) {
    return null;
  }

  if (canDirectRegisterSession(sessionProps)) {
    return sessionProps;
  }

  const availableSessionsSection = findAvailableSessionsSection();

  if (!availableSessionsSection) {
    return sessionProps;
  }

  const targetSeasonId = toNumber(sessionProps.contentId ?? sessionProps.session.season_id);
  const targetEventType = getSessionEventType(sessionProps.session);
  const targetStartTime = new Date(sessionProps.session.start_time).toISOString();
  const entries = getSessionButtonEntries(availableSessionsSection)
    .map(({ props }) => props)
    .filter((props) => props?.session);
  const exactMatch = entries.find((props) => {
    const sameSeason =
      targetSeasonId === null ||
      Number(props.contentId ?? props.session?.season_id) === targetSeasonId;
    const sameEvent =
      targetEventType === null ||
      String(getSessionEventType(props.session)) === String(targetEventType);

    return (
      sameSeason &&
      sameEvent &&
      props.session.session_id &&
      new Date(props.session.start_time).toISOString() === targetStartTime
    );
  });

  if (exactMatch) {
    return exactMatch;
  }

  return (
    entries.find((props) => {
      const sameSeason =
        targetSeasonId === null ||
        Number(props.contentId ?? props.session?.season_id) === targetSeasonId;
      const sameEvent =
        targetEventType === null ||
        String(getSessionEventType(props.session)) === String(targetEventType);

      return sameSeason && sameEvent && props.session.session_id;
    }) || sessionProps
  );
}

function getDirectRegisterMode(section, sessionProps) {
  const state = getRegistrationState();
  const seasonId = sessionProps?.contentId ?? sessionProps?.session?.season_id ?? null;
  const seasonName = sessionProps?.session?.season_name || "";
  const nativeWithdraw = findNativeWithdrawAction();
  const optimisticMode = section?.dataset?.irefRegistrationMode || "";

  if (optimisticMode === "withdraw") {
    return {
      mode: "withdraw",
      registrationState: state,
    };
  }

  if (nativeWithdraw) {
    return {
      mode: "withdraw",
      registrationState: state,
    };
  }

  if (!hasActiveRegistration(state)) {
    return {
      mode: "register",
      registrationState: null,
    };
  }

  if (
    registrationMatchesCurrentPage(state, sessionProps) ||
    seasonsMatch(state, seasonId, seasonName)
  ) {
    return {
      mode: "withdraw",
      registrationState: state,
    };
  }

  return {
    mode: "elsewhere",
    registrationState: state,
  };
}

function findActionRowAnchor(viewButton) {
  return findClosest(
    viewButton,
    (node) => node !== viewButton && typeof node.querySelector === "function" && !!node.querySelector("button")
  );
}

function createTopActionRow() {
  const row = document.createElement("div");
  row.id = "iref-top-action-row";
  row.className = "iref-top-action-row";

  const primaryButton = document.createElement("button");
  primaryButton.type = "button";
  primaryButton.className = "iref-series-action-btn iref-series-action-primary";
  primaryButton.dataset.irefRole = "primary";

  const secondaryButton = document.createElement("button");
  secondaryButton.type = "button";
  secondaryButton.className = "iref-series-action-btn iref-series-action-secondary";
  secondaryButton.dataset.irefRole = "secondary";

  row.append(primaryButton, secondaryButton);
  return row;
}

function getSeriesActionDescription(state) {
  if (!state) {
    return "Register for this session from the browser.";
  }

  if (state.status === "registering") {
    return "A browser registration request is already in flight.";
  }

  return state.season_name
    ? `You are already registered for ${state.season_name}.`
    : "You are already registered in another series.";
}

function getSecondaryActionLabel(viewButton) {
  const label = normalizeText(viewButton?.innerText || viewButton?.textContent || "");
  return label || "View in iRacing";
}

function syncActionButtonState(button, mode, registrationState, isRegisterAvailable) {
  button.classList.remove(
    "is-register",
    "is-withdraw",
    "is-elsewhere",
    "is-unavailable",
    "is-registering"
  );
  button.disabled = false;
  button.title = "";

  if (mode === "withdraw") {
    button.textContent = "Withdraw";
    button.classList.add("is-withdraw");

    if (registrationState?.status === "registering") {
      button.classList.add("is-registering");
    }

    return;
  }

  if (mode === "elsewhere") {
    button.textContent =
      registrationState?.status === "registering"
        ? "Registering elsewhere"
        : "Registered elsewhere";
    button.title = getSeriesActionDescription(registrationState);
    button.classList.add("is-elsewhere");
    button.disabled = true;
    return;
  }

  if (!isRegisterAvailable) {
    button.textContent = "Register unavailable";
    button.classList.add("is-unavailable");
    button.disabled = true;
    return;
  }

  button.textContent = "Register";
  button.title = "Register for this race from the browser.";
  button.classList.add("is-register");
}

function buildRegistrationState(registerableProps, selectedCar, overrides = {}) {
  const session = registerableProps?.session || {};
  const seasonName = formatSeasonName(session.season_name || "");

  return {
    status: "registering",
    source: "direct",
    confirmed_by_site: false,
    season_id: registerableProps.contentId ?? session.season_id ?? null,
    season_name: seasonName,
    car_id: selectedCar.car_id,
    car_class_id: selectedCar.car_class_id,
    car_name: selectedCar.car_name || null,
    event_type: getSessionEventType(session) ?? raceEventType,
    event_type_name: getSessionEventName(session),
    session_id: session.session_id ?? null,
    subsession_id: session.subsession_id ?? null,
    start_time: session.start_time ? new Date(session.start_time).toISOString() : null,
    start_label: session.start_time ? formatTimeLabel(session.start_time) : null,
    track_name: session.track_name || session.track?.track_name || null,
    source_path: location.pathname,
    source_url: location.href,
    registered_at: null,
    requested_at: new Date().toISOString(),
    ...overrides,
  };
}

function startRegistrationFlow(registrationState, labels = {}, handlers = {}, options = {}) {
  const {
    registerDelayMs = 5000,
    retryWithdrawBeforeRegister = false,
    withdrawRetryDelayMs = queueWithdrawRetryDelayMs,
  } = options;

  if (!ws.isReady()) {
    log("🚫 Cannot register yet because the iRacing websocket is offline");
    window.alert("The iRacing websocket is not ready yet.");
    return false;
  }

  const previousRegistrationState = getRegistrationState();
  const shouldRetryWithdraw =
    retryWithdrawBeforeRegister ||
    (hasActiveRegistration(previousRegistrationState) &&
      !registrationTargetsMatch(previousRegistrationState, registrationState));
  const effectiveRegisterDelayMs = shouldRetryWithdraw
    ? Math.max(registerDelayMs, withdrawRetryDelayMs + 2000)
    : registerDelayMs;

  setRegistrationState({
    ...registrationState,
    status: "registering",
    confirmed_by_site: false,
    registered_at: null,
    requested_at: new Date().toISOString(),
  });

  const withdrew = tryWithdrawCurrentSession();

  if (!withdrew) {
    clearRegistrationState();
    handlers.onWithdrawFailed?.();
    log(labels.withdrawError || "🚫 Could not send the withdraw request");
    return false;
  }

  if (shouldRetryWithdraw) {
    window.setTimeout(() => {
      const currentState = getRegistrationState();

      if (!currentState || currentState.status !== "registering") {
        return;
      }

      if (tryWithdrawCurrentSession()) {
        log(labels.withdrawRetry || "🔁 Retrying withdraw before register");
      }
    }, withdrawRetryDelayMs);
  }

  window.setTimeout(() => {
    const registered = ws.register(
      registrationState.season_name,
      registrationState.car_id,
      registrationState.car_class_id,
      registrationState.session_id,
      registrationState.subsession_id
    );

    if (!registered) {
      clearRegistrationState();
      handlers.onRegisterFailed?.();
      log(labels.registerError || "🚫 Could not send the register request");
      return;
    }

    setRegistrationState({
      ...registrationState,
      status: "registered",
      confirmed_by_site: false,
      registered_at: new Date().toISOString(),
      requested_at: new Date().toISOString(),
    });
    handlers.onRegistered?.();
    log(labels.registered || `✅ Sent register request for ${registrationState.season_name}`);
  }, effectiveRegisterDelayMs);

  return true;
}

function sendDirectRegister(registerableProps, selectedCar) {
  if (!canDirectRegisterSession(registerableProps)) {
    log("🚫 This page did not expose a registerable session id yet");
    return false;
  }

  return startRegistrationFlow(
    buildRegistrationState(registerableProps, selectedCar),
    {
      withdrawError: "🚫 Could not start the direct register flow",
      registerError: "🚫 Could not finish the direct register flow",
      registered: `✅ Sent direct register request for ${formatSeasonName(
        registerableProps.session?.season_name || ""
      )}`,
    }
  );
}

function sendDirectWithdraw() {
  const sent = tryWithdrawCurrentSession();

  if (!sent) {
    log("🚫 Could not send the withdraw request");
    return false;
  }

  clearRegistrationState();
  log("✅ Sent withdraw request");
  return true;
}

function handleDirectRegister(button, section, sessionProps, registerableProps) {
  const currentMode = getDirectRegisterMode(section, sessionProps);

  if (currentMode.mode === "withdraw") {
    if (sendDirectWithdraw()) {
      section.dataset.irefRegistrationMode = "register";
      syncActionButtonState(button, "register", null, true);
    }
    return;
  }

  if (currentMode.mode === "elsewhere") {
    return;
  }

  const selectedCar = getSelectedCar(
    registerableProps?.contentId ?? sessionProps?.contentId,
    registerableProps || sessionProps,
    section
  );

  if (!selectedCar) {
    handleMissingCar(button, sessionProps?.contentId);
    return;
  }

  const sent = sendDirectRegister(registerableProps || sessionProps, selectedCar);

  if (!sent) {
    return;
  }

  section.dataset.irefRegistrationMode = "withdraw";
  syncActionButtonState(button, "withdraw", { status: "registering" }, true);
}

function handleTopQueueClick(button, section, sessionProps) {
  const slot = {
    label: "next race",
    start_time: new Date(sessionProps.session.start_time).toISOString(),
  };
  const eventType = getSessionEventType(sessionProps.session);
  const currentQueueItem = getQueueItem(
    sessionProps.contentId,
    slot.start_time,
    eventType
  );

  if (currentQueueItem?.status === "found") {
    activateQueueItem(
      findQueueIndex(sessionProps.contentId, slot.start_time, eventType),
      { manual: true }
    );
    return;
  }

  if (currentQueueItem) {
    removeQueueItem(currentQueueItem);
    return;
  }

  queueSlot(sessionProps, slot, button, section);
}

function ensureDirectRegisterButtons(section, sessionProps) {
  const nextRace = findNextRaceProps(section);
  const viewButton = nextRace?.button;
  const registerableProps = resolveRegisterableSessionProps(section, sessionProps);

  if (!viewButton || !sessionProps?.session) {
    return;
  }

  const anchorRow = findActionRowAnchor(viewButton);
  const anchorParent = anchorRow?.parentElement;

  if (!anchorRow || !anchorParent) {
    return;
  }

  anchorRow.classList.add("iref-native-action-hidden");

  let actionRow = section.querySelector("#iref-top-action-row");

  if (!actionRow) {
    actionRow = createTopActionRow();
    anchorParent.insertBefore(actionRow, anchorRow);
  }

  const primaryButton = actionRow.querySelector('[data-iref-role="primary"]');
  const secondaryButton = actionRow.querySelector('[data-iref-role="secondary"]');
  const { mode, registrationState } = getDirectRegisterMode(section, sessionProps);
  const canRegister =
    !!registerableProps?.session &&
    canDirectRegisterSession(registerableProps) &&
    Number(registerableProps.session.max_team_drivers || 1) <= 1;

  section.dataset.irefRegistrationMode = mode;

  if (mode === "register" && !canRegister) {
    const startTime = new Date(sessionProps.session.start_time).toISOString();
    const eventType = getSessionEventType(sessionProps.session);
    const queueSlotKey = makeQueueSlotKey(sessionProps.contentId, eventType, startTime);

    primaryButton.className =
      "iref-series-action-btn iref-series-action-primary iref-top-primary-queue iref-queue-btn";
    primaryButton.dataset.irefIdleLabel = "Queue for the next race";
    primaryButton.dataset.irefQueueKey = queueSlotKey;
    setButtonState(
      primaryButton,
      getQueueItem(sessionProps.contentId, startTime, eventType),
      "Queue for the next race"
    );
    primaryButton.title = "Queue this race and register when the site opens registration.";
    primaryButton.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleTopQueueClick(primaryButton, section, sessionProps);
    };
    secondaryButton.classList.add("hidden");
    secondaryButton.onclick = null;
    return;
  }

  primaryButton.className = "iref-series-action-btn iref-series-action-primary";
  delete primaryButton.dataset.irefQueueKey;
  delete primaryButton.dataset.irefIdleLabel;
  syncActionButtonState(primaryButton, mode, registrationState, canRegister);
  primaryButton.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleDirectRegister(primaryButton, section, sessionProps, registerableProps);
  };

  secondaryButton.classList.add("hidden");
  secondaryButton.textContent = "";
  secondaryButton.title = "";
  secondaryButton.onclick = null;
}

function ensureSessionRegisterButton(nativeButton, sessionProps, section) {
  const container = nativeButton.parentElement;

  if (!container || !sessionProps?.session?.session_id) {
    return;
  }

  const contextSection = findNextRaceSection() || section || document.body;
  const startTime = new Date(sessionProps.session.start_time).toISOString();
  const eventType = getSessionEventType(sessionProps.session);
  const registerKey = makeQueueSlotKey(sessionProps.contentId, eventType, startTime);

  nativeButton.classList.add("iref-session-view-hidden");
  container
    .querySelector(`[data-iref-queue-key="${CSS.escape(registerKey)}"]`)
    ?.remove();

  let registerButton = container.querySelector(
    `[data-iref-register-key="${CSS.escape(registerKey)}"]`
  );

  if (!registerButton) {
    registerButton = document.createElement("button");
    registerButton.type = "button";
    registerButton.className = "iref-session-register-btn iref-series-action-btn iref-series-action-primary";
    registerButton.dataset.irefRegisterKey = registerKey;
    container.appendChild(registerButton);
  }

  const { mode, registrationState } = getDirectRegisterMode(
    contextSection,
    sessionProps
  );
  const canRegister =
    canDirectRegisterSession(sessionProps) &&
    Number(sessionProps.session.max_team_drivers || 1) <= 1 &&
    isDirectRegisterableSession(sessionProps.session);

  syncActionButtonState(registerButton, mode, registrationState, canRegister);
  registerButton.title =
    mode === "register"
      ? `Register for this ${getSessionEventName(sessionProps.session).toLowerCase()} session from the browser.`
      : registerButton.title;
  registerButton.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleDirectRegister(
      registerButton,
      contextSection,
      sessionProps,
      sessionProps
    );
  };
}

function ensureSessionQueueButtons(section, options = {}) {
  const { skipNextRaceButton = false } = options;
  const nextRaceSection = skipNextRaceButton ? findNextRaceSection() : null;
  const nextRaceButton = skipNextRaceButton && nextRaceSection
    ? findNextRaceProps(nextRaceSection)?.button
    : null;
  const practiceSessionsSection = findPracticeSessionsSection();

  getSessionButtonEntries(section).forEach(({ button, props }) => {
    if (skipNextRaceButton && button === nextRaceButton) {
      return;
    }

    if (practiceSessionsSection?.contains(button)) {
      return;
    }

    if (
      !props?.session ||
      props.session.max_team_drivers > 1 ||
      !isQueueableSession(props.session)
    ) {
      return;
    }

    const container = button.parentElement;

    if (!container) {
      return;
    }

    button.classList.add("iref-session-view-hidden");
    container.querySelectorAll(".iref-session-register-btn").forEach((element) => {
      element.remove();
    });

    const startTime = new Date(props.session.start_time).toISOString();
    const eventType = getSessionEventType(props.session);
    const queueSlotKey = makeQueueSlotKey(props.contentId, eventType, startTime);
    let queueButton = container.querySelector(
      `[data-iref-queue-key="${CSS.escape(queueSlotKey)}"]`
    );

    if (!queueButton) {
      queueButton = createQueueButton(
        `${slugify(String(props.contentId))}-${slugify(startTime)}-inline`,
        "Queue"
      );
      queueButton.classList.add("iref-queue-btn-inline");
      queueButton.dataset.irefIdleLabel = "Queue";
      queueButton.dataset.irefQueueKey = queueSlotKey;
      queueButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const currentQueueItem = getQueueItem(props.contentId, startTime, eventType);

        if (currentQueueItem?.status === "found") {
          activateQueueItem(
            findQueueIndex(props.contentId, startTime, eventType),
            { manual: true }
          );
          return;
        }

        if (currentQueueItem) {
          removeQueueItem(currentQueueItem);
          return;
        }

        queueSlot(
          props,
          {
            label: formatTimeLabel(startTime),
            start_time: startTime,
          },
          queueButton,
          section
        );
      });
      container.appendChild(queueButton);
    }
  });
}

function ensurePracticeRegisterButtons(section) {
  getSessionButtonEntries(section).forEach(({ button, props }) => {
    const container = button.parentElement;

    if (!container || !props?.session || props.session.max_team_drivers > 1) {
      return;
    }

    if (!canDirectRegisterSession(props) || !isPracticeSession(props.session)) {
      button.classList.remove("iref-session-view-hidden");
      container.querySelectorAll(".iref-session-register-btn").forEach((element) => {
        element.remove();
      });
      return;
    }

    ensureSessionRegisterButton(button, props, section);
  });
}

function checkSession(session, queueItem) {
  if (queueItem.status !== "queued") {
    return;
  }

  const queuedStartTime =
    new Date(queueItem.start_time).toISOString().split(".")[0] + "Z";

  if (
    Number(session.season_id) === Number(queueItem.season_id) &&
    sessionMatchesQueueEvent(session, queueItem) &&
    session.start_time === queuedStartTime &&
    session.session_id > 0
  ) {
    log(
      `📝 ${queueItem.event_type_name || getSessionEventName(session)} session for ${formatSeasonName(
        queueItem.season_name
      )} at ${queueItem.start_label} found`
    );
    queueItem.session_id = session.session_id;
    queueItem.subsession_id = session.subsession_id ?? null;

    if (!updateQueueReadiness(queueItem, session)) {
      persistQueue();
    }
  }
}

function canAttemptRegistration(queueItem) {
  if (!queueItem) {
    return false;
  }

  if (
    !queueItem.session_id ||
    !queueItem.car_id ||
    !queueItem.car_class_id ||
    queueItem.registration_open !== true
  ) {
    return false;
  }

  return true;
}

export function activateQueueItem(queueIndex, options = {}) {
  const { manual = false, allowQueued = false } = options;
  const queueItem = ensureWatchQueue()[queueIndex];
  const canAutoActivateQueuedItem =
    allowQueued &&
    queueItem?.status === "queued" &&
    !!queueItem.session_id &&
    canQueueItemRegisterNow(queueItem);

  if (!queueItem || (queueItem.status !== "found" && !canAutoActivateQueuedItem)) {
    return;
  }

  if (!manual && !isInsideQueueRegisterWindow(queueItem.start_time)) {
    return;
  }

  if (!canAttemptRegistration(queueItem)) {
    log(`🚫 Queue item for ${queueItem.season_name} is no longer valid`);
    removeQueueItem(queueItem);
    return;
  }

  if (!ws.isReady()) {
    log("🚫 Queue paused because the iRacing websocket is not ready");
    return;
  }

  const registrationState = buildRegistrationStateFromQueueItem(queueItem);
  const currentRegistrationState = getRegistrationState();

  if (currentRegistrationState?.status === "registering") {
    log("🚫 Queue paused because another registration request is in progress");
    return;
  }

  if (
    hasActiveRegistration(currentRegistrationState) &&
    registrationTargetsMatch(currentRegistrationState, registrationState)
  ) {
    removeQueueItem(queueItem);
    return;
  }

  const displacedRegistrationState = canRequeueDisplacedRegistration(
    currentRegistrationState,
    registrationState
  )
    ? { ...currentRegistrationState }
    : null;

  queueItem.status = "registering";
  queueItem.last_attempt_at = new Date().toISOString();
  persistQueue();

  log(
    `📝 Registering for ${formatSeasonName(
      queueItem.season_name
    )} at ${queueItem.start_label}`
  );

  const started = startRegistrationFlow(
    registrationState,
    {
      withdrawError: "🚫 Could not send withdraw request",
      withdrawRetry: "🔁 Retrying withdraw before the queued register",
      registerError: "🚫 Could not send register request",
      registered: `✅ Sent register request for ${queueItem.season_name} ${queueItem.start_label}`,
    },
    {
      onWithdrawFailed: () => {
        queueItem.status = "found";
        persistQueue();
      },
      onRegisterFailed: () => {
        queueItem.status = "found";
        persistQueue();
      },
      onRegistered: () => {
        playQueueRegisteredSound();
        removeQueueItem(queueItem);
        requeueDisplacedRegistration(displacedRegistrationState, registrationState);
      },
    },
    {
      retryWithdrawBeforeRegister: true,
      withdrawRetryDelayMs: queueWithdrawRetryDelayMs,
      registerDelayMs: queueRegisterDelayMs,
    }
  );

  if (!started) {
    return;
  }
}

export function removeQueuedSession(queueItem) {
  removeQueueItem(queueItem);
}

const wsCallback = (data) => {
  ensureWatchQueue().forEach((queueItem) => {
    try {
      data.data.delta.INSERT.forEach((session) => {
        checkSession(session, queueItem);
      });
    } catch {}

    try {
      data.data.delta.REGISTRATION.forEach((session) => {
        checkSession(session, queueItem);
      });
    } catch {}
  });
};

if (!ws.callbacks.includes(wsCallback)) {
  ws.callbacks.push(wsCallback);
}

window.setInterval(() => {
  const queue = cleanupQueue();

  if (queue.length !== ensureWatchQueue().length) {
    setWatchQueue(queue);
  }

  ensureWatchQueue().forEach((queueItem, queueIndex) => {
    if (
      queueItem.status === "queued" &&
      queueItem.session_id &&
      canQueueItemRegisterNow(queueItem)
    ) {
      updateQueueReadiness(queueItem);
    }

    if (queueItem.status === "found" && isInsideQueueRegisterWindow(queueItem.start_time)) {
      activateQueueItem(queueIndex, { manual: false });
    }
  });
}, 1000);

async function init(activate = true) {
  clearInterval(persistInterval);

  if (!activate) {
    return;
  }

  loadQueue();
  loadRegistrationState();
  initSoundSupport();

  persistInterval = window.setInterval(() => {
    restoreNativeSessionActions(findCurrentlyRacingSection());

    const nextRaceSection = findNextRaceSection();

    if (nextRaceSection) {
      const nextRace = findNextRaceProps(nextRaceSection);

      if (nextRace) {
        ensureDirectRegisterButtons(nextRaceSection, nextRace.props);
        ensureTopQueueButtons(nextRaceSection, nextRace.props);
      }
    }

    const availableSessionsSection = findAvailableSessionsSection();

    if (availableSessionsSection) {
      ensureSessionQueueButtons(availableSessionsSection);
    }

    const practiceSessionsSection = findPracticeSessionsSection();

    if (practiceSessionsSection) {
      ensurePracticeRegisterButtons(practiceSessionsSection);
    }

    ensureSessionQueueButtons(document, { skipNextRaceButton: true });

    syncQueueButtons();
  }, 400);
}

features.add(id, true, selector, bodyClass, init);
