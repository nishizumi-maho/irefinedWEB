const CACHE_KEY = "iref_release_info";
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export const CURRENT_VERSION = __IREF_VERSION__;
export const CURRENT_DISPLAY_VERSION = __IREF_DISPLAY_VERSION__;
export const REPO_URL = __IREF_REPO_URL__;
export const REPO_SLUG = __IREF_REPO_SLUG__;
export const RELEASES_URL = __IREF_RELEASES_URL__;
export const RELEASES_API_URL = __IREF_RELEASES_API_URL__;

function normalizeVersion(value = "") {
  const numeric = String(value).match(/\d+(?:\.\d+)*/)?.[0];
  if (!numeric) {
    return [];
  }

  return numeric.split(".").map((part) => parseInt(part, 10) || 0);
}

function compareVersions(a, b) {
  const left = normalizeVersion(a);
  const right = normalizeVersion(b);
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = left[index] || 0;
    const rightValue = right[index] || 0;

    if (leftValue > rightValue) {
      return 1;
    }

    if (leftValue < rightValue) {
      return -1;
    }
  }

  return 0;
}

function getFallbackInfo(overrides = {}) {
  return {
    available: false,
    checkedAt: 0,
    currentVersion: CURRENT_VERSION,
    currentDisplayVersion: CURRENT_DISPLAY_VERSION,
    latestTag: CURRENT_DISPLAY_VERSION,
    latestVersion: CURRENT_VERSION,
    releaseUrl: RELEASES_URL,
    releaseName: CURRENT_DISPLAY_VERSION,
    ...overrides,
  };
}

function readCachedInfo() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY));

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      ...getFallbackInfo(),
      ...parsed,
    };
  } catch {
    return null;
  }
}

function writeCachedInfo(info) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(info));
  return info;
}

function publishUpdateInfo(info) {
  window.dispatchEvent(
    new CustomEvent("iref-update-info", {
      detail: info,
    })
  );

  return info;
}

function parseReleaseInfo(payload) {
  const latestTag = payload?.tag_name || payload?.name || CURRENT_DISPLAY_VERSION;
  const latestVersion = normalizeVersion(latestTag).length ? latestTag : CURRENT_VERSION;
  const available = compareVersions(latestTag, CURRENT_VERSION) > 0;

  return {
    ...getFallbackInfo(),
    available,
    checkedAt: Date.now(),
    latestTag,
    latestVersion,
    releaseName: payload?.name || latestTag,
    releaseUrl: payload?.html_url || RELEASES_URL,
    publishedAt: payload?.published_at || null,
  };
}

export function getCachedUpdateInfo() {
  return readCachedInfo() || getFallbackInfo();
}

export async function checkForUpdates({ force = false } = {}) {
  const cached = readCachedInfo();

  if (!force && cached && Date.now() - (cached.checkedAt || 0) < CACHE_MAX_AGE_MS) {
    return publishUpdateInfo(cached);
  }

  try {
    const response = await fetch(RELEASES_API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub release check failed (${response.status})`);
    }

    const payload = await response.json();
    const info = writeCachedInfo(parseReleaseInfo(payload));

    if (info.available) {
      console.info("[iRefined] Update available:", info.latestTag);
    }

    return publishUpdateInfo(info);
  } catch (error) {
    console.warn("[iRefined] Failed to check for updates", error);
    return publishUpdateInfo(
      cached ||
        getFallbackInfo({
          checkedAt: Date.now(),
          error: true,
        })
    );
  }
}

export function openLatestRelease() {
  window.open(RELEASES_URL, "_blank", "noopener,noreferrer");
}
