import {
  formatMembershipSyncTime,
  getStoredMembershipSummary,
  isMembershipSummaryFresh,
  syncMembershipSummary,
} from "./membership-analytics.js";
import { findCarManual } from "./car-manuals.js";

export const INTELLIGENCE_DASHBOARD_PATH = "/web/racing/home/dashboard";

const profileBasePath = "/web/racing/profile";
const ownedCarsUrl =
  "https://members-ng.iracing.com/web/racing/licensed-content/cars?view=grid";
const ownedTracksUrl =
  "https://members-ng.iracing.com/web/racing/licensed-content/tracks?view=grid";
const ownedCarsPrefix = "owned-cars-page-content-content-list-card-";
const ownedTracksPrefix = "owned-tracks-page-content-content-list-card-";
const snapshotFreshMs = 1000 * 60 * 5;
const scheduleSampleSize = 6;

const usdFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

let cachedSnapshot = null;
let cachedSnapshotAt = 0;
let pendingSnapshotPromise = null;

function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function parseCurrency(value) {
  if (typeof value === "number") {
    return roundCurrency(value);
  }

  if (typeof value !== "string") {
    return 0;
  }

  const parsed = Number(String(value).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(parsed) ? roundCurrency(parsed) : 0;
}

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

function formatUsd(value) {
  return usdFormatter.format(roundCurrency(value));
}

function formatShortDateTime(value) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatShortDate(value) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function formatRelativeFromNow(value) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  const diffMs = date.getTime() - Date.now();
  const totalMinutes = Math.round(diffMs / (1000 * 60));
  const absMinutes = Math.abs(totalMinutes);

  if (absMinutes < 60) {
    return totalMinutes >= 0
      ? `in ${absMinutes} min`
      : `${absMinutes} min ago`;
  }

  const totalHours = Math.round(absMinutes / 60);

  if (totalHours < 48) {
    return totalMinutes >= 0
      ? `in ${totalHours} hr`
      : `${totalHours} hr ago`;
  }

  const totalDays = Math.round(totalHours / 24);
  return totalMinutes >= 0
    ? `in ${totalDays} days`
    : `${totalDays} days ago`;
}

function daysBetween(start, end) {
  const startDate = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  ).getTime();
  const endDate = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  ).getTime();

  return Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
}

function parseDate(value) {
  if (!value && value !== 0) {
    return null;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function pickTruthy(value, fallback = "") {
  return value === 0 || value ? value : fallback;
}

async function fetchJson(url) {
  const requestUrl =
    typeof url === "string" && /^https?:\/\//i.test(url)
      ? url
      : `${location.origin}${url}`;
  const isExternal = !requestUrl.startsWith(location.origin);
  const response = await fetch(requestUrl, {
    credentials: isExternal ? "omit" : "include",
    headers: {
      accept: "application/json, text/plain, */*",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${requestUrl}`);
  }

  return response.json();
}

async function fetchBffData(path) {
  const data = await fetchJson(path);

  if (data?.link) {
    return fetchJson(data.link);
  }

  if (data?.data_url) {
    return fetchJson(data.data_url);
  }

  return data;
}

function createHiddenIframe(url) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "1400px";
  iframe.style.height = "1000px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  iframe.src = url;
  document.body.appendChild(iframe);
  return iframe;
}

function findPageDataInReact(doc, cardIdPrefix) {
  const target = doc.querySelector(`[id^="${cardIdPrefix}"]`);

  if (!target) {
    return null;
  }

  const reactInternal = Object.keys(target).find((key) =>
    key.startsWith("__reactFiber")
  );

  if (!reactInternal) {
    return null;
  }

  let fiber = target[reactInternal];
  let depth = 0;

  while (fiber && depth <= 50) {
    const props = fiber.memoizedProps;

    if (props && Array.isArray(props.pageData)) {
      return props.pageData;
    }

    fiber = fiber.return;
    depth += 1;
  }

  return null;
}

async function collectCatalogPageData({ url, cardIdPrefix }) {
  const iframe = createHiddenIframe(url);
  const startedAt = Date.now();

  try {
    return await new Promise((resolve, reject) => {
      const cleanup = () => {
        try {
          iframe.remove();
        } catch {}
      };

      const poll = () => {
        try {
          const doc = iframe.contentDocument;

          if (!doc || !doc.body) {
            if (Date.now() - startedAt > 20000) {
              cleanup();
              reject(new Error(`Timed out loading ${url}`));
              return;
            }

            window.setTimeout(poll, 300);
            return;
          }

          const pageData = findPageDataInReact(doc, cardIdPrefix);
          const emptyState = /no results|no content/i.test(doc.body.innerText || "");

          if (!pageData && !emptyState && Date.now() - startedAt <= 22000) {
            window.setTimeout(poll, 300);
            return;
          }

          cleanup();
          resolve(Array.isArray(pageData) ? pageData : []);
        } catch (error) {
          if (Date.now() - startedAt > 22000) {
            cleanup();
            reject(error);
            return;
          }

          window.setTimeout(poll, 300);
        }
      };

      iframe.addEventListener(
        "load",
        () => {
          window.setTimeout(poll, 800);
        },
        { once: true }
      );

      window.setTimeout(poll, 1200);
    });
  } finally {
    try {
      iframe.remove();
    } catch {}
  }
}

function dedupeByPackage(items, makeResult) {
  const map = new Map();

  items.forEach((item) => {
    const packageId = Number(item?.package_id);

    if (!packageId || map.has(packageId)) {
      return;
    }

    const result = makeResult(item, packageId);

    if (result) {
      map.set(packageId, result);
    }
  });

  return [...map.values()];
}

function chooseTrackRepresentative(left, right) {
  const leftScore =
    (left?.config_name ? 1 : 3) +
    (String(left?.config_name || "").toLowerCase().includes("full course") ? 4 : 0) +
    (String(left?.config_name || "").length ? -String(left.config_name).length / 100 : 0);
  const rightScore =
    (right?.config_name ? 1 : 3) +
    (String(right?.config_name || "").toLowerCase().includes("full course") ? 4 : 0) +
    (String(right?.config_name || "").length ? -String(right.config_name).length / 100 : 0);

  return rightScore > leftScore ? right : left;
}

function buildTrackPackages(tracks) {
  const packages = new Map();

  tracks.forEach((track) => {
    const packageId = Number(track?.package_id);

    if (!packageId) {
      return;
    }

    const current = packages.get(packageId);
    const price = Math.max(
      parseCurrency(track?.price),
      parseCurrency(track?.price_display)
    );
    const nextTrack = {
      packageId,
      track_id: Number(track?.track_id) || 0,
      track_name: pickTruthy(track?.track_name),
      config_name: pickTruthy(track?.config_name),
      display_name: [track?.track_name, track?.config_name].filter(Boolean).join(" - "),
      price,
      free_with_subscription: track?.free_with_subscription === true,
      has_svg_map: track?.has_svg_map === true,
      night_lighting: track?.night_lighting === true,
      location: pickTruthy(track?.location),
      category: pickTruthy(track?.category),
      site_url: pickTruthy(track?.site_url),
    };

    if (!current) {
      packages.set(packageId, nextTrack);
      return;
    }

    packages.set(packageId, chooseTrackRepresentative(current, nextTrack));
  });

  return [...packages.values()];
}

function buildCarPackages(cars) {
  return dedupeByPackage(cars, (car, packageId) => {
    const price = Math.max(
      parseCurrency(car?.price),
      parseCurrency(car?.price_display)
    );

    return {
      packageId,
      car_id: Number(car?.car_id) || 0,
      car_name: pickTruthy(car?.car_name),
      car_make: pickTruthy(car?.car_make),
      car_model: pickTruthy(car?.car_model),
      display_name: pickTruthy(car?.car_name),
      price,
      free_with_subscription: car?.free_with_subscription === true,
      ai_enabled: car?.ai_enabled === true,
      rain_enabled: car?.rain_enabled === true,
      hp: Number(car?.hp) || 0,
      categories: Array.isArray(car?.categories) ? car.categories : [],
      forum_url: pickTruthy(car?.forum_url),
      site_url: pickTruthy(car?.site_url),
    };
  });
}

function buildOwnedPackageSet(items) {
  const owned = new Set();

  items.forEach((item) => {
    const packageId = Number(item?.package_id);

    if (packageId) {
      owned.add(packageId);
    }
  });

  return owned;
}

function findTrackPackageByTrackId(trackPackages, trackId) {
  return trackPackages.find((track) => Number(track.track_id) === Number(trackId)) || null;
}

function createAnniversaryDate(baseDate, year) {
  const month = baseDate.getMonth();
  const maxDay = new Date(year, month + 1, 0).getDate();
  const day = Math.min(baseDate.getDate(), maxDay);
  return new Date(year, month, day);
}

function buildCatalogLookupEntries({ carPackages, trackPackages, manualLookup, ownedPackages }) {
  const cars = carPackages.map((car) => ({
    type: "car",
    key: `car-${car.packageId}`,
    title: car.display_name,
    subtitle: [
      car.car_make,
      car.ai_enabled ? "AI" : "",
      car.rain_enabled ? "Rain" : "",
    ]
      .filter(Boolean)
      .join(" • "),
    packageId: car.packageId,
    owned: ownedPackages.has(car.packageId) || car.free_with_subscription,
    free: car.free_with_subscription,
    price: car.price,
    siteUrl: car.site_url,
    forumUrl: car.forum_url,
    manual: manualLookup.get(car.car_id) || findCarManual(car),
    searchText: normalizeText(
      `${car.display_name} ${car.car_make} ${car.car_model} ${car.categories.join(" ")}`
    ),
  }));

  const tracks = trackPackages.map((track) => ({
    type: "track",
    key: `track-${track.packageId}`,
    title: track.display_name,
    subtitle: [
      track.location,
      track.night_lighting ? "Night" : "",
      track.has_svg_map ? "Map" : "",
    ]
      .filter(Boolean)
      .join(" • "),
    packageId: track.packageId,
    owned: ownedPackages.has(track.packageId) || track.free_with_subscription,
    free: track.free_with_subscription,
    price: track.price,
    siteUrl: track.site_url,
    forumUrl: "",
    manual: null,
    searchText: normalizeText(
      `${track.display_name} ${track.track_name} ${track.config_name} ${track.location}`
    ),
  }));

  return [...cars, ...tracks].sort((left, right) =>
    left.title.localeCompare(right.title)
  );
}

function buildOfficialSeriesSummary(seasons, trackPackages) {
  const activeOfficialSeasons = Array.isArray(seasons?.seasons)
    ? seasons.seasons.filter((season) => season?.active && season?.official !== false)
    : [];

  const officialSeries = activeOfficialSeasons
    .map((season) => {
      const currentWeekTrack = season?.current_week_sched?.track || {};
      const currentWeekTrackPackage = findTrackPackageByTrackId(
        trackPackages,
        currentWeekTrack.track_id
      );
      const ownCar = season?.elig?.own_car !== false;
      const ownTrack = season?.elig?.own_track !== false;
      const missingParts = [
        !ownCar ? "car" : "",
        !ownTrack ? "track" : "",
      ].filter(Boolean);

      return {
        seasonId: season?.season_id,
        seriesId: season?.series_id,
        title: season?.season_name || "Unnamed series",
        trackName: [
          currentWeekTrack?.track_name,
          currentWeekTrack?.config_name,
        ]
          .filter(Boolean)
          .join(" - "),
        trackPrice: currentWeekTrackPackage?.price || 0,
        ownCar,
        ownTrack,
        ready: ownCar && ownTrack,
        missingParts,
        missingCount: missingParts.length,
        licenseGroup: season?.license_group,
        regUserCount: Number(season?.reg_user_count) || 0,
        fixedSetup: season?.fixed_setup === true,
        currentWeekNum: season?.current_week_sched?.race_week_num,
      };
    })
    .sort((left, right) => right.regUserCount - left.regUserCount);

  return {
    all: officialSeries,
    readyNow: officialSeries.filter((season) => season.ready).slice(0, 8),
    nearReady: officialSeries
      .filter((season) => season.missingCount === 1)
      .slice(0, 8),
    blocked: officialSeries
      .filter((season) => season.missingCount > 0)
      .slice(0, 8),
  };
}

function pickCurrentScheduleRow(season, schedules = []) {
  if (!Array.isArray(schedules) || !schedules.length) {
    return null;
  }

  const currentWeekNum = Number(
    season?.currentWeekNum || season?.current_week_sched?.race_week_num
  );

  if (currentWeekNum) {
    const byWeek = schedules.find(
      (item) => Number(item?.race_week_num) === currentWeekNum
    );

    if (byWeek) {
      return byWeek;
    }
  }

  const now = Date.now();
  const byDate = schedules.find((item) => {
    const start = parseDate(item?.start_date)?.getTime() || 0;
    const end = parseDate(item?.week_end_time)?.getTime() || 0;
    return start && end && start <= now && end >= now;
  });

  if (byDate) {
    return byDate;
  }

  return [...schedules]
    .sort((left, right) => {
      const leftTime = parseDate(left?.start_date)?.getTime() || 0;
      const rightTime = parseDate(right?.start_date)?.getTime() || 0;
      return rightTime - leftTime;
    })
    .at(0);
}

function formatScheduleLength(length, laps, descriptors, fallbackLabel) {
  const numericLength = Number(length) || 0;
  const numericLaps = Number(laps) || 0;
  const descriptorText = Array.isArray(descriptors)
    ? descriptors.join(", ")
    : "";

  if (numericLaps > 0 && numericLength > 0) {
    return `${numericLaps} laps / ${numericLength} min`;
  }

  if (numericLaps > 0) {
    return `${numericLaps} laps`;
  }

  if (numericLength > 0) {
    return `${numericLength} min`;
  }

  return descriptorText || fallbackLabel || "--";
}

async function buildSeriesRadar(officialSeries) {
  const sample = officialSeries
    .slice(0, scheduleSampleSize)
    .map((season) => season.seasonId)
    .filter(Boolean);

  const results = await Promise.allSettled(
    sample.map((seasonId) =>
      fetchBffData(`/bff/pub/proxy/data/series/season_schedule?season_id=${seasonId}`)
    )
  );

  return results
    .map((result, index) => {
      if (result.status !== "fulfilled") {
        return null;
      }

      const season = officialSeries[index];
      const row = pickCurrentScheduleRow(season, result.value?.schedules || []);

      if (!season || !row) {
        return null;
      }

      return {
        seasonId: season.seasonId,
        title: season.title,
        trackName: [row?.track?.track_name, row?.track?.config_name]
          .filter(Boolean)
          .join(" - "),
        practice: formatScheduleLength(
          row?.practice_length,
          0,
          "",
          "Open practice"
        ),
        qualify: row?.qual_attached
          ? formatScheduleLength(
              row?.qualify_length,
              row?.qualify_laps,
              row?.qual_time_descriptors,
              "Attached"
            )
          : "Separate / none",
        race: formatScheduleLength(
          row?.race_time_limit,
          row?.race_lap_limit,
          row?.race_time_descriptors,
          "Race"
        ),
        fixedSetup: season.fixedSetup,
        ready: season.ready,
      };
    })
    .filter(Boolean);
}

function summarizeSessionGroup(source, sessions) {
  const list = Array.isArray(sessions) ? sessions : [];
  const sorted = [...list].sort((left, right) => {
    const leftTime = parseDate(left?.launch_at)?.getTime() || 0;
    const rightTime = parseDate(right?.launch_at)?.getTime() || 0;
    return leftTime - rightTime;
  });

  const opportunities = sorted
    .filter((session) => session?.can_watch || session?.can_spot || session?.can_broadcast)
    .map((session) => ({
      source,
      sessionId: session?.session_id,
      subsessionId: session?.subsession_id,
      title: session?.session_name || `${source} session`,
      launchAt: session?.launch_at,
      openRegExpires: session?.open_reg_expires,
      canWatch: session?.can_watch === true,
      canSpot: session?.can_spot === true,
      canBroadcast: session?.can_broadcast === true,
      numDrivers: Number(session?.num_drivers) || 0,
      spectatorSlots: Number(session?.available_spectator_slots) || 0,
      sessionLength: formatScheduleLength(
        session?.race_length || session?.time_limit,
        session?.race_laps,
        "",
        ""
      ),
      watchUrl:
        source === "Hosted"
          ? "/web/racing/spectate/hosted"
          : "/web/racing/spectate/leagues",
    }));

  return {
    source,
    total: sorted.length,
    watchable: opportunities.filter((item) => item.canWatch).length,
    spottable: opportunities.filter((item) => item.canSpot).length,
    broadcastable: opportunities.filter((item) => item.canBroadcast).length,
    opportunities: opportunities.slice(0, 10),
  };
}

function summarizeAuthSessions(data) {
  const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
  const items = sessions
    .map((session) => {
      const lastActivity = parseDate(session?.last_activity);
      const expiration = parseDate(session?.session_expiration);

      return {
        sessionId: session?.session_id,
        clientName:
          session?.client_name || session?.client_developer_name || "Unknown client",
        currentSession: session?.current_session === true,
        scopeDescriptions: Array.isArray(session?.scope_descriptions)
          ? session.scope_descriptions
          : [],
        lastActivity: session?.last_activity,
        lastActivityLabel: lastActivity ? formatRelativeFromNow(lastActivity) : "",
        expiration: session?.session_expiration,
        expirationLabel: expiration ? formatRelativeFromNow(expiration) : "",
        expiringSoon:
          expiration && expiration.getTime() - Date.now() <= 1000 * 60 * 60 * 24,
      };
    })
    .sort((left, right) => {
      if (left.currentSession && !right.currentSession) {
        return -1;
      }

      if (!left.currentSession && right.currentSession) {
        return 1;
      }

      return (
        (parseDate(right.lastActivity)?.getTime() || 0) -
        (parseDate(left.lastActivity)?.getTime() || 0)
      );
    });

  return {
    total: items.length,
    currentClient: items.find((item) => item.currentSession)?.clientName || "",
    otherSessions: items.filter((item) => !item.currentSession),
    expiringSoon: items.filter((item) => item.expiringSoon),
    items,
  };
}

function summarizeParticipationCredits(credits) {
  const rows = Array.isArray(credits) ? credits : [];

  return rows
    .map((item) => {
      const weeksDone = Number(item?.weeks) || 0;
      const minWeeks = Number(item?.min_weeks) || 0;
      const remainingWeeks = Math.max(0, minWeeks - weeksDone);

      return {
        seriesId: item?.series_id,
        seasonId: item?.season_id,
        seriesName: item?.series_name || "Unnamed series",
        weeksDone,
        minWeeks,
        remainingWeeks,
        earnedCredits: roundCurrency(item?.earned_credits),
        totalCredits: roundCurrency(item?.total_credits),
      };
    })
    .sort((left, right) => {
      if (left.remainingWeeks !== right.remainingWeeks) {
        return left.remainingWeeks - right.remainingWeeks;
      }

      return right.earnedCredits - left.earnedCredits;
    });
}

function summarizeAwards(awards, profile) {
  const rows = Array.isArray(awards) ? awards : [];
  const unseen = rows.filter((award) => award?.viewed === false);
  const recent = [...rows]
    .sort((left, right) => {
      const leftTime = parseDate(left?.award_date)?.getTime() || 0;
      const rightTime = parseDate(right?.award_date)?.getTime() || 0;
      return rightTime - leftTime;
    })
    .slice(0, 6)
    .map((award) => ({
      awardId: award?.award_id,
      title: award?.name || award?.achievement || "Award",
      date: award?.award_date,
      groupName: award?.group_name || "",
      hasPdf: award?.has_pdf === true,
      viewed: award?.viewed === true,
    }));

  const profileAwards = Array.isArray(profile?.recent_awards)
    ? profile.recent_awards.slice(0, 4).map((award) => ({
        awardId: award?.award_id,
        title: award?.name || award?.achievement || "Award",
        date: award?.award_date,
        groupName: award?.group_name || "",
        hasPdf: award?.has_pdf === true,
        viewed: award?.viewed === true,
      }))
    : [];

  return {
    total: rows.length,
    unseen: unseen.length,
    recent: recent.length ? recent : profileAwards,
  };
}

function buildMembershipProgress(summary, memberInfo, profile) {
  const today = new Date();
  const memberSince = parseDate(
    summary?.memberSinceDateKey ||
      memberInfo?.member_since ||
      profile?.member_info?.member_since
  );
  const nextBilling = parseDate(summary?.nextBillingDateKey);
  const lastLogin = parseDate(
    memberInfo?.last_login || profile?.member_info?.last_login
  );

  let anniversary = {
    message: "Member anniversary unavailable",
    detail: "Member since date was not exposed.",
    daysRemaining: null,
    isToday: false,
  };

  if (memberSince) {
    const thisYear = createAnniversaryDate(memberSince, today.getFullYear());
    const nextAnniversary =
      daysBetween(today, thisYear) >= 0
        ? thisYear
        : createAnniversaryDate(memberSince, today.getFullYear() + 1);
    const remainingDays = daysBetween(today, nextAnniversary);
    const completedYears = Math.max(
      0,
      nextAnniversary.getFullYear() -
        memberSince.getFullYear() -
        (remainingDays === 0 ? 0 : 1)
    );

    anniversary =
      remainingDays === 0
        ? {
            message: "Happy member anniversary",
            detail: `${completedYears + 1} years with iRacing today.`,
            daysRemaining: 0,
            isToday: true,
          }
        : {
            message: `${remainingDays} days to your member anniversary`,
            detail: `${completedYears + 1} years lands on ${formatShortDate(
              nextAnniversary
            )}.`,
            daysRemaining: remainingDays,
            isToday: false,
          };
  }

  return {
    currentPlan: summary?.currentPlan || "",
    currentPrice: summary?.currentPrice || "",
    autoRenewal: summary?.autoRenewal || "",
    membershipStatus: summary?.membershipStatus || "",
    nextBillingDate: nextBilling ? formatShortDate(nextBilling) : "",
    nextBillingDays:
      nextBilling instanceof Date ? daysBetween(today, nextBilling) : null,
    lastLogin: lastLogin ? formatShortDateTime(lastLogin) : "",
    lastLoginRelative: lastLogin ? formatRelativeFromNow(lastLogin) : "",
    memberSince: memberSince ? formatShortDate(memberSince) : "",
    syncedAt: formatMembershipSyncTime(summary?.syncedAt),
    anniversary,
  };
}

function summarizeLicenses(profile) {
  const licenses = Array.isArray(profile?.member_info?.licenses)
    ? profile.member_info.licenses
    : [];

  return licenses
    .map((license) => ({
      category: license?.category_name || license?.category || "Category",
      licenseLevel: license?.license_level || "",
      safetyRating: Number(license?.safety_rating) || 0,
      irating: Number(license?.irating) || 0,
      cpi: Number(license?.cpi) || 0,
      color: license?.color || "",
    }))
    .sort((left, right) => right.irating - left.irating);
}

function summarizeRecentEvents(profile) {
  const events = Array.isArray(profile?.recent_events) ? profile.recent_events : [];

  return events.slice(0, 6).map((event) => ({
    title: event?.event_name || "Recent event",
    sessionType: event?.simsession_type || event?.event_type || "",
    startTime: event?.start_time,
    result:
      Number(event?.finish_position) > 0
        ? `P${event.finish_position}`
        : Number(event?.starting_position) > 0
        ? `Started P${event.starting_position}`
        : "",
    carName: event?.car_name || "",
    trackName: [event?.track?.track_name, event?.track?.config_name]
      .filter(Boolean)
      .join(" - "),
  }));
}

function buildAlerts({
  sessionGroups,
  authSummary,
  officialSeries,
  participationCredits,
  awards,
  membership,
}) {
  const alerts = [];
  const watchableNow = sessionGroups.reduce(
    (sum, item) => sum + Number(item.watchable || 0),
    0
  );
  const spottableNow = sessionGroups.reduce(
    (sum, item) => sum + Number(item.spottable || 0),
    0
  );

  if (watchableNow > 0) {
    alerts.push({
      level: "info",
      title: `${watchableNow} spectate opportunity${watchableNow === 1 ? "" : "ies"} live now`,
      detail:
        spottableNow > 0
          ? `${spottableNow} of them also allow spotting right now.`
          : "Hosted and league sessions are open for watching.",
      actionLabel: "Open spectate",
      href: "/web/racing/spectate/hosted",
    });
  }

  if (officialSeries.nearReady.length > 0) {
    const topSeries = officialSeries.nearReady[0];
    alerts.push({
      level: "warn",
      title: `${officialSeries.nearReady.length} official series are one item away`,
      detail: `${topSeries.title} is blocked only by a ${topSeries.missingParts[0]}.`,
      actionLabel: "Open shop",
      href:
        topSeries.missingParts[0] === "track"
          ? "/web/shop/tracks"
          : "/web/shop/cars",
    });
  }

  const creditsClose = participationCredits.filter(
    (credit) => credit.remainingWeeks > 0 && credit.remainingWeeks <= 2
  );

  if (creditsClose.length > 0) {
    alerts.push({
      level: "success",
      title: `${creditsClose.length} participation credit target${creditsClose.length === 1 ? "" : "s"} within reach`,
      detail: `${creditsClose[0].seriesName} needs ${creditsClose[0].remainingWeeks} more week${
        creditsClose[0].remainingWeeks === 1 ? "" : "s"
      }.`,
      actionLabel: "Open dashboard",
      href: INTELLIGENCE_DASHBOARD_PATH,
    });
  }

  if (awards.unseen > 0) {
    alerts.push({
      level: "success",
      title: `${awards.unseen} new award${awards.unseen === 1 ? "" : "s"} not viewed yet`,
      detail: "Recent awards are ready to review in your progress snapshot.",
      actionLabel: "Open profile",
      href: `${profileBasePath}`,
    });
  }

  if (authSummary.otherSessions.length > 0) {
    alerts.push({
      level: "warn",
      title: `${authSummary.otherSessions.length} other authenticated session${authSummary.otherSessions.length === 1 ? "" : "s"} detected`,
      detail: "Useful if you want to review where the account is still logged in.",
      actionLabel: "Review sessions",
      href: INTELLIGENCE_DASHBOARD_PATH,
    });
  }

  if (authSummary.expiringSoon.length > 0) {
    alerts.push({
      level: "warn",
      title: `${authSummary.expiringSoon.length} auth session${authSummary.expiringSoon.length === 1 ? "" : "s"} expiring soon`,
      detail: `${authSummary.expiringSoon[0].clientName} expires ${authSummary.expiringSoon[0].expirationLabel}.`,
      actionLabel: "Review sessions",
      href: INTELLIGENCE_DASHBOARD_PATH,
    });
  }

  if (typeof membership.nextBillingDays === "number" && membership.nextBillingDays <= 7) {
    alerts.push({
      level: "warn",
      title:
        membership.nextBillingDays <= 0
          ? "Subscription renewal is due now"
          : `Subscription renews in ${membership.nextBillingDays} days`,
      detail: membership.currentPlan
        ? `${membership.currentPlan} is the current plan on file.`
        : "Review account info if you need to adjust the renewal.",
      actionLabel: "Account info",
      href: "/web/settings/account/info",
    });
  }

  if (
    membership.anniversary &&
    membership.anniversary.isToday === false &&
    typeof membership.anniversary.daysRemaining === "number" &&
    membership.anniversary.daysRemaining <= 14
  ) {
    alerts.push({
      level: "info",
      title: membership.anniversary.message,
      detail: membership.anniversary.detail,
      actionLabel: "Member profile",
      href: `${profileBasePath}`,
    });
  }

  if (membership.anniversary?.isToday) {
    alerts.unshift({
      level: "success",
      title: "Happy member anniversary",
      detail: membership.anniversary.detail,
      actionLabel: "Celebrate",
      href: INTELLIGENCE_DASHBOARD_PATH,
    });
  }

  return alerts.slice(0, 8);
}

function buildSnapshotMeta(errors) {
  const now = new Date();
  const errorMessages = errors
    .filter((item) => item && item.error)
    .map((item) => `${item.label}: ${item.error.message || item.error}`);

  return {
    generatedAt: now.toISOString(),
    generatedLabel: formatShortDateTime(now),
    partial: errorMessages.length > 0,
    errors: errorMessages,
  };
}

export function isIntelligenceSnapshotFresh() {
  return (
    !!cachedSnapshot &&
    cachedSnapshotAt > 0 &&
    Date.now() - cachedSnapshotAt <= snapshotFreshMs
  );
}

export async function getIntelligenceSnapshot(force = false) {
  if (!force && isIntelligenceSnapshotFresh()) {
    return cachedSnapshot;
  }

  if (!force && pendingSnapshotPromise) {
    return pendingSnapshotPromise;
  }

  pendingSnapshotPromise = (async () => {
    const [profileResult, participationResult, awardsResult, membershipStoredResult] =
      await Promise.allSettled([
        fetchBffData("/bff/pub/proxy/data/member/profile"),
        fetchBffData("/bff/pub/proxy/data/member/participation_credits"),
        fetchBffData("/bff/pub/proxy/data/member/awards"),
        getStoredMembershipSummary(),
      ]);

    let membershipSummary =
      membershipStoredResult.status === "fulfilled"
        ? membershipStoredResult.value?.membershipSummary || null
        : null;

    if (
      !membershipSummary ||
      !isMembershipSummaryFresh(membershipSummary, 1000 * 60 * 60 * 6)
    ) {
      try {
        membershipSummary = await syncMembershipSummary({ persist: false });
      } catch {}
    }

    const profile = profileResult.status === "fulfilled" ? profileResult.value : {};
    const participationCredits =
      participationResult.status === "fulfilled" ? participationResult.value : [];
    const awards = awardsResult.status === "fulfilled" ? awardsResult.value : [];
    const creditsSummary = summarizeParticipationCredits(participationCredits);
    const awardsSummary = summarizeAwards(awards, profile);
    const membership = buildMembershipProgress(
      membershipSummary,
      profile?.member_info || {},
      profile
    );

    const snapshot = {
      meta: buildSnapshotMeta([
        {
          label: "Profile",
          error: profileResult.status === "rejected" ? profileResult.reason : null,
        },
        {
          label: "Awards",
          error: awardsResult.status === "rejected" ? awardsResult.reason : null,
        },
        {
          label: "Participation credits",
          error:
            participationResult.status === "rejected" ? participationResult.reason : null,
        },
      ]),
      progress: {
        membership,
        activity: {
          recent30DaysCount: Number(profile?.activity?.recent_30days_count) || 0,
          previous30DaysCount: Number(profile?.activity?.prev_30days_count) || 0,
          consecutiveWeeks: Number(profile?.activity?.consecutive_weeks) || 0,
          bestConsecutiveWeeks: Number(profile?.activity?.most_consecutive_weeks) || 0,
          followers: Number(profile?.follow_counts?.followers) || 0,
          follows: Number(profile?.follow_counts?.follows) || 0,
        },
        licenses: summarizeLicenses(profile),
        participationCredits: creditsSummary,
        awards: awardsSummary,
        recentEvents: summarizeRecentEvents(profile),
      },
    };

    cachedSnapshot = snapshot;
    cachedSnapshotAt = Date.now();
    return snapshot;
  })();

  try {
    return await pendingSnapshotPromise;
  } finally {
    pendingSnapshotPromise = null;
  }
}

export async function searchDrivers(term) {
  const query = String(term || "").trim();

  if (query.length < 2) {
    return [];
  }

  const rows = await fetchBffData(
    `/bff/pub/proxy/data/lookup/drivers?search_term=${encodeURIComponent(query)}`
  );
  const results = Array.isArray(rows) ? rows : [];

  return results.slice(0, 12).map((driver) => ({
    custId: driver?.cust_id,
    displayName: driver?.display_name || "Unknown driver",
    helmet: driver?.helmet || "",
    profileDisabled: driver?.profile_disabled === true,
    profileUrl: `${profileBasePath}?cust_id=${driver?.cust_id}&tab=licenses`,
  }));
}

export function filterCatalogEntries(entries, term, limit = 10) {
  const query = normalizeText(term);

  if (!query) {
    return entries.slice(0, limit);
  }

  return entries
    .filter((entry) => entry.searchText.includes(query))
    .slice(0, limit);
}

export function openPath(path) {
  const url = path.startsWith("http") ? path : `${location.origin}${path}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export {
  formatRelativeFromNow,
  formatShortDate,
  formatShortDateTime,
  formatUsd,
};
