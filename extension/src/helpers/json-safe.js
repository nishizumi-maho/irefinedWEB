function isDomLikeValue(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (typeof Node !== "undefined" && value instanceof Node) {
    return true;
  }

  if (typeof Window !== "undefined" && value instanceof Window) {
    return true;
  }

  if (typeof Event !== "undefined" && value instanceof Event) {
    return true;
  }

  return false;
}

export function toJsonSafe(value, seen = new WeakSet()) {
  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const valueType = typeof value;

  if (
    valueType === "string" ||
    valueType === "number" ||
    valueType === "boolean"
  ) {
    return value;
  }

  if (valueType === "bigint") {
    return String(value);
  }

  if (
    valueType === "undefined" ||
    valueType === "function" ||
    valueType === "symbol"
  ) {
    return undefined;
  }

  if (valueType !== "object" || isDomLikeValue(value)) {
    return undefined;
  }

  if (seen.has(value)) {
    return undefined;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    const result = value
      .map((item) => toJsonSafe(item, seen))
      .filter((item) => item !== undefined);

    seen.delete(value);
    return result;
  }

  const result = {};

  Object.keys(value).forEach((key) => {
    const sanitizedValue = toJsonSafe(value[key], seen);

    if (sanitizedValue !== undefined) {
      result[key] = sanitizedValue;
    }
  });

  seen.delete(value);
  return result;
}

export function cloneJsonSafe(value, fallback = null) {
  const sanitizedValue = toJsonSafe(value);

  return sanitizedValue === undefined ? fallback : sanitizedValue;
}
