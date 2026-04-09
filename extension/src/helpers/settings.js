export const DEFAULT_SETTINGS = {
  "share-test-session": true,
  "share-hosted-session": true,
  "auto-register": true,
  "queue-car-prompt": false,
  "queue-register-sound": true,
  "queue-register-sound-volume": 65,
  "better-join-button": true,
  "no-toasts": false,
  "auto-close-toasts": false,
  "toast-timeout-s": 5,
  "no-sidebars": false,
  "collapse-menu": false,
  logger: false,
};

export function getSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem("iref_settings"));
    return {
      ...DEFAULT_SETTINGS,
      ...(raw && typeof raw === "object" ? raw : {}),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings = {}) {
  const nextSettings = {
    ...DEFAULT_SETTINGS,
    ...(settings && typeof settings === "object" ? settings : {}),
  };

  localStorage.setItem("iref_settings", JSON.stringify(nextSettings));
  return nextSettings;
}
