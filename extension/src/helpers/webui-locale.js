import { findMemoizedProps } from "./react-resolver.js";

const WEBUI_LABELS = {
  "en-US": {
    nextRacePrefix: "Next Race @",
    raceDuration: "Race Duration",
    drivers: "Drivers",
    lastRace: "Last Race",
    upNext: "Up Next",
    availableSessionsDescription: "Register for ongoing or upcoming sessions.",
  },
  "es-ES": {
    nextRacePrefix: "Carrera siguiente @",
    raceDuration: "Duración de la carrera",
    drivers: "Pilotos",
    lastRace: "Última carrera",
    upNext: "Siguiente",
    availableSessionsDescription: "Regístrate para una sesión próxima o en curso.",
  },
  "de-DE": {
    nextRacePrefix: "Nächstes Rennen @",
    raceDuration: "Renndauer",
    drivers: "Fahrer",
    lastRace: "Letztes Rennen",
    upNext: "Up Next",
    availableSessionsDescription:
      "Registrieren für laufende oder bevorstehende Sitzungen.",
  },
  "fr-FR": {
    nextRacePrefix: "Prochaine course @",
    raceDuration: "Durée de la course",
    drivers: "Pilotes",
    lastRace: "Dernière course",
    upNext: "À venir",
    availableSessionsDescription:
      "Inscrivez-vous à des sessions en cours ou à venir.",
  },
  "it-IT": {
    nextRacePrefix: "Prossima gara @",
    raceDuration: "Durata gara",
    drivers: "Piloti",
    lastRace: "Ultima gara",
    upNext: "Prossimamente",
    availableSessionsDescription:
      "Iscriviti alle sessioni in corso o a quelle in arrivo.",
  },
  "pt-PT": {
    nextRacePrefix: "Próxima corrida @",
    raceDuration: "Duração da corrida",
    drivers: "Pilotos",
    lastRace: "Última corrida",
    upNext: "A seguir",
    availableSessionsDescription:
      "Regista-te em sessões em curso ou vindouras.",
  },
  "pt-BR": {
    nextRacePrefix: "Próxima corrida @",
    raceDuration: "Duração da corrida",
    drivers: "Pilotos",
    lastRace: "Última corrida",
    upNext: "A seguir",
    availableSessionsDescription:
      "Inscreva-se para sessões em andamento ou nas próximas sessões.",
  },
};

function normalizeText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function toIsoOrText(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value || "") : parsed.toISOString();
}

function getLocaleOrder(locale = getWebUiLocale()) {
  const normalizedLocale = normalizeWebUiLocale(locale);
  const [language] = normalizedLocale.split("-");
  const ordered = [normalizedLocale];

  if (language === "pt") {
    ["pt-BR", "pt-PT"].forEach((variant) => {
      if (!ordered.includes(variant)) {
        ordered.push(variant);
      }
    });
  } else {
    Object.keys(WEBUI_LABELS)
      .filter(
        (entryLocale) =>
          entryLocale !== normalizedLocale &&
          entryLocale.startsWith(`${language}-`)
      )
      .forEach((entryLocale) => {
        if (!ordered.includes(entryLocale)) {
          ordered.push(entryLocale);
        }
      });
  }

  if (!ordered.includes("en-US")) {
    ordered.push("en-US");
  }

  return ordered;
}

function getSessionActionKey(props = {}) {
  const session = props.session || {};

  return [
    props.contentId ?? session.season_id ?? "",
    session.event_type ?? session.event_type_name ?? "",
    session.session_id ?? "",
    session.private_session_id ?? "",
    session.subsession_id ?? "",
    toIsoOrText(session.start_time),
  ].join("|");
}

export function normalizeWebUiLocale(locale = "") {
  const normalized = String(locale || "").replace(/_/g, "-").trim();

  if (!normalized) {
    return "en-US";
  }

  const [rawLanguage = "", rawRegion = ""] = normalized.split("-");
  const language = rawLanguage.toLowerCase();
  const region = rawRegion.toUpperCase();
  const exactLocale = Object.keys(WEBUI_LABELS).find(
    (entryLocale) =>
      entryLocale.toLowerCase() ===
      `${language}${region ? `-${region}` : ""}`.toLowerCase()
  );

  if (exactLocale) {
    return exactLocale;
  }

  if (language === "pt") {
    return region === "PT" ? "pt-PT" : "pt-BR";
  }

  return (
    Object.keys(WEBUI_LABELS).find((entryLocale) =>
      entryLocale.startsWith(`${language}-`)
    ) || "en-US"
  );
}

export function getWebUiLocale() {
  let storedLocale = "";

  try {
    storedLocale =
      localStorage.getItem("lang") ||
      window.localStorage?.lang ||
      "";
  } catch {}

  return normalizeWebUiLocale(
    storedLocale ||
      document.documentElement.lang ||
      navigator.language ||
      "en-US"
  );
}

export function getWebUiLabels(key, locale = getWebUiLocale()) {
  return [
    ...new Set(
      getLocaleOrder(locale)
        .flatMap((entryLocale) => {
          const value = WEBUI_LABELS[entryLocale]?.[key];

          if (Array.isArray(value)) {
            return value;
          }

          return value ? [value] : [];
        })
        .map(normalizeText)
        .filter(Boolean)
    ),
  ];
}

export function startsWithWebUiLabel(text = "", key, locale = getWebUiLocale()) {
  const normalizedText = normalizeText(text);

  return getWebUiLabels(key, locale).some((label) =>
    normalizedText.startsWith(label)
  );
}

export function includesWebUiLabel(text = "", key, locale = getWebUiLocale()) {
  const normalizedText = normalizeText(text);

  return getWebUiLabels(key, locale).some((label) =>
    normalizedText.includes(label)
  );
}

export function isVisible(el) {
  return !!el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

export function isWebUiSessionProps(candidate = {}) {
  return (
    !!candidate?.session &&
    (
      (candidate.contentId !== null && candidate.contentId !== undefined) ||
      (candidate.session?.season_id !== null &&
        candidate.session?.season_id !== undefined)
    )
  );
}

export function getSessionActionEntries(root = document, options = {}) {
  const {
    visibleOnly = true,
    skipButtons = [],
    skipSelectors = [],
  } = options;
  const skipSet = new Set(skipButtons.filter(Boolean));
  const seen = new Set();

  return [...root.querySelectorAll("button, a")]
    .filter((button) => !skipSet.has(button))
    .filter((button) =>
      skipSelectors.every((selector) => !button.closest(selector))
    )
    .filter((button) => !visibleOnly || isVisible(button))
    .map((button) => ({
      button,
      props: findMemoizedProps(button, isWebUiSessionProps),
    }))
    .filter(({ props }) => {
      if (!props?.session) {
        return false;
      }

      const key = getSessionActionKey(props);

      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

export function getFirstSessionActionEntry(root = document, options = {}) {
  return getSessionActionEntries(root, options)[0] || null;
}
