import { cloneJsonSafe } from "./json-safe.js";

function average(values = [], fallback = null) {
  const valid = values.filter((value) => typeof value === "number" && !Number.isNaN(value));

  if (valid.length < 1) {
    return fallback;
  }

  return valid.reduce((total, value) => total + value, 0) / valid.length;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fahrenheitToCelsius(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.round(((value - 32) * 5) / 9 * 10) / 10;
}

function parseMultiplier(label, fallback = 1) {
  if (typeof label !== "string") {
    return fallback;
  }

  const match = label.match(/(\d+(?:\.\d+)?)x/i);
  return match ? parseFloat(match[1]) : fallback;
}

function mapSkies(conditions = "", fallback = 1) {
  const value = String(conditions).toLowerCase();

  if (value.includes("clear") || value.includes("sunny")) {
    return 0;
  }

  if (value.includes("partly")) {
    return 1;
  }

  if (value.includes("mostly cloudy")) {
    return 2;
  }

  if (value.includes("overcast")) {
    return 3;
  }

  if (value.includes("fog") || value.includes("mist")) {
    return 3;
  }

  return fallback;
}

function deriveTimeOfDay(source = "", fallback = 4) {
  const value = String(source).toLowerCase();

  if (value.includes("night")) {
    return 3;
  }

  if (value.includes("evening")) {
    return 2;
  }

  if (value.includes("afternoon")) {
    return 2;
  }

  if (value.includes("morning")) {
    return 0;
  }

  return fallback;
}

function mergeSessionTime(previousIso, sessionTime, timeOfDayLabel) {
  if (typeof sessionTime !== "string") {
    return previousIso;
  }

  const match = sessionTime.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return previousIso;
  }

  const base = previousIso ? new Date(previousIso) : new Date();

  if (Number.isNaN(base.getTime())) {
    return previousIso;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const label = String(timeOfDayLabel || "").toLowerCase();

  if ((label.includes("afternoon") || label.includes("evening")) && hours < 12) {
    hours += 12;
  }

  if (label.includes("night") && hours > 6 && hours < 12) {
    hours += 12;
  }

  base.setHours(hours, minutes, 0, 0);

  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  const hour = String(base.getHours()).padStart(2, "0");
  const minute = String(base.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:00`;
}

export function isOfficialWeatherExport(payload) {
  return (
    payload?.exportType === "irefined-official-weather" ||
    (payload?.weather &&
      payload.weather.sessionTime !== undefined &&
      payload.weather.temperatureHighF !== undefined)
  );
}

export function normalizeImportedWeatherPayload(payload, previousWeather = {}) {
  const safePreviousWeather = cloneJsonSafe(previousWeather, {}) || {};

  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (isOfficialWeatherExport(payload)) {
    const source = payload.weather || {};
    const humidityAverage = Math.round(
      average([source.humidityMin, source.humidityMax], safePreviousWeather.rel_humidity ?? 55)
    );
    const averageTempF = Math.round(
      average(
        [source.temperatureHighF, source.temperatureLowF],
        safePreviousWeather.temp_value ?? 78
      )
    );
    const averageWind = Math.round(
      average([source.windMinMph, source.windMaxMph], safePreviousWeather.wind_value ?? 2)
    );
    const precipitationChance = clamp(
      Math.round(source.precipitationChancePercent ?? 0),
      0,
      100
    );
    const skies = mapSkies(source.conditions, safePreviousWeather.skies ?? 1);
    const simulatedStartTime = mergeSessionTime(
      safePreviousWeather.simulated_start_time,
      source.sessionTime,
      source.timeOfDay
    );

    return {
      ...safePreviousWeather,
      allow_fog:
        /fog|mist/i.test(String(source.conditions || "")) ||
        safePreviousWeather.allow_fog === true,
      forecast_options: {
        ...(cloneJsonSafe(safePreviousWeather.forecast_options, {}) || {}),
        forecast_type: 0,
        precipitation: precipitationChance > 0 ? 1 : 0,
        skies,
        temperature: averageTempF,
        wind_speed: averageWind,
      },
      precip_option: precipitationChance > 0 ? 1 : 0,
      rel_humidity: humidityAverage,
      simulated_start_time:
        simulatedStartTime || safePreviousWeather.simulated_start_time || null,
      simulated_time_multiplier: parseMultiplier(
        source.skyMultiplier,
        safePreviousWeather.simulated_time_multiplier ?? 1
      ),
      skies,
      temp_units: safePreviousWeather.temp_units ?? 0,
      temp_value: averageTempF,
      time_of_day: deriveTimeOfDay(
        source.timeOfDay,
        safePreviousWeather.time_of_day ?? 4
      ),
      track_water: precipitationChance > 0 ? safePreviousWeather.track_water ?? 0 : 0,
      version: safePreviousWeather.version ?? 1,
      weather_summary: {
        ...(cloneJsonSafe(safePreviousWeather.weather_summary, {}) || {}),
        max_precip_rate: precipitationChance > 0 ? 1 : 0,
        max_precip_rate_desc: precipitationChance > 0 ? "Possible" : "None",
        precip_chance: precipitationChance,
        skies_high: skies,
        skies_low: skies,
        temp_high:
          fahrenheitToCelsius(source.temperatureHighF) ??
          fahrenheitToCelsius(averageTempF),
        temp_low:
          fahrenheitToCelsius(source.temperatureLowF) ??
          fahrenheitToCelsius(averageTempF),
        temp_units:
          safePreviousWeather.weather_summary?.temp_units ?? 1,
        wind_dir:
          safePreviousWeather.weather_summary?.wind_dir ??
          safePreviousWeather.wind_dir ??
          0,
        wind_high: source.windMaxMph ?? averageWind,
        wind_low: source.windMinMph ?? averageWind,
        wind_units:
          safePreviousWeather.weather_summary?.wind_units ??
          safePreviousWeather.wind_units ??
          0,
      },
      weather_url: null,
      wind_dir: safePreviousWeather.wind_dir ?? 0,
      wind_units: safePreviousWeather.wind_units ?? 0,
      wind_value: averageWind,
    };
  }

  if (payload.session?.weather) {
    return cloneJsonSafe(payload.session.weather, {});
  }

  if (payload.weather) {
    return cloneJsonSafe(payload.weather, {});
  }

  if (payload.type !== undefined && payload.temp_value !== undefined) {
    return cloneJsonSafe(payload, {});
  }

  return null;
}
