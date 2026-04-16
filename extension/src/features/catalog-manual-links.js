import features from "../feature-manager.js";
import { findCarManual } from "../helpers/car-manuals.js";
import "./catalog-manual-links.css";

const id = "catalog-manual-links";
const selector = "body";
const bodyClass = `iref-${id}`;
const cardSelector =
  '[id^="store-cars-page-content-content-list-card-"], [id^="owned-cars-page-content-content-list-card-"]';

let booted = false;
let tickHandle = 0;
let carCatalogPromise = null;
let cachedCars = [];

function normalizeText(value) {
  let text = String(value || "").toLowerCase();

  if (typeof text.normalize === "function") {
    text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  return text
    .replace(/&amp;/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getCarCatalog() {
  if (cachedCars.length) {
    return cachedCars;
  }

  if (carCatalogPromise) {
    return carCatalogPromise;
  }

  carCatalogPromise = fetch("/bff/pub/proxy/data/car/get", {
    credentials: "include",
    headers: {
      accept: "application/json, text/plain, */*",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Car catalog failed (${response.status})`);
      }

      return response.json();
    })
    .then((rows) => {
      cachedCars = Array.isArray(rows) ? rows : [];
      return cachedCars;
    })
    .finally(() => {
      carCatalogPromise = null;
    });

  return carCatalogPromise;
}

function scoreCarMatch(text, car) {
  const haystack = normalizeText(text);
  const parts = [
    car?.car_name,
    car?.car_make,
    car?.car_model,
    ...(Array.isArray(car?.categories) ? car.categories : []),
  ]
    .map((item) => normalizeText(item))
    .filter(Boolean);

  let score = 0;

  parts.forEach((part) => {
    if (!part) {
      return;
    }

    if (haystack.includes(part)) {
      score += part.length >= 8 ? 6 : 3;
    }

    part.split(" ").forEach((token) => {
      if (token.length >= 3 && haystack.includes(token)) {
        score += 1;
      }
    });
  });

  return score;
}

function findBestCarMatch(card, cars) {
  const text = card.innerText || "";
  let bestMatch = null;
  let bestScore = 0;

  cars.forEach((car) => {
    const score = scoreCarMatch(text, car);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = car;
    }
  });

  return bestScore >= 5 ? bestMatch : null;
}

function buildManualButton(manual) {
  const link = document.createElement("a");
  link.className = "iref-car-manual-link";
  link.href = manual.pdf;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Manual";
  link.title = manual.title;
  link.dataset.irefManualLink = "true";
  return link;
}

function injectManualLinks(cars) {
  document.querySelectorAll(cardSelector).forEach((card) => {
    if (card.querySelector("[data-iref-manual-link='true']")) {
      return;
    }

    const car = findBestCarMatch(card, cars);
    const manual = car ? findCarManual(car) : null;

    if (!manual) {
      return;
    }

    const button = buildManualButton(manual);
    const actionContainer =
      Array.from(card.querySelectorAll("button, a")).at(-1)?.parentElement || card;

    if (actionContainer) {
      actionContainer.appendChild(button);
    }
  });
}

async function scan() {
  if (!document.querySelector(cardSelector)) {
    return;
  }

  try {
    const cars = await getCarCatalog();
    injectManualLinks(cars);
  } catch {}
}

function init(activate = true) {
  if (!activate) {
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
  void scan();
  tickHandle = window.setInterval(() => {
    void scan();
  }, 1200);
}

features.add(id, true, selector, bodyClass, init);
