const priceReferences = [
  {
    key: "gtd-tire",
    label: "Michelin GTD race tire",
    price: 893,
    detail: "based on IMSA 2025 GTD tire pricing",
  },
  {
    key: "track-night",
    label: "SCCA Track Night entry",
    price: 155,
    detail: "using the MotorSport Ranch member rate",
  },
  {
    key: "fanatec-wheel",
    label: "Fanatec Formula V2.5 X wheel",
    price: 439.99,
    detail: "for a current direct-drive style formula wheel",
  },
  {
    key: "simlab-cockpit",
    label: "Sim-Lab GT1 Pro cockpit",
    price: 649,
    detail: "for a solid aluminum cockpit",
  },
  {
    key: "omp-suit",
    label: "OMP First-S race suit",
    price: 629,
    detail: "for an entry-level FIA suit",
  },
  {
    key: "omp-seat",
    label: "OMP First-R race seat",
    price: 749,
    detail: "for an entry-level FIA seat",
  },
  {
    key: "bell-helmet",
    label: "Bell HP7 helmet",
    price: 3999.95,
    detail: "for a pro-level carbon helmet",
  },
  {
    key: "gt3-brake-rotor",
    label: "GT3 brake rotor",
    price: 1180,
    detail: "for a rough single-rotor race team estimate",
  },
  {
    key: "gt4-test-day",
    label: "club-level test day",
    price: 480,
    detail: "using a realistic private lapping-day budget",
  },
  {
    key: "alignment-corner-balance",
    label: "race alignment and corner-balance session",
    price: 350,
    detail: "for a typical performance shop estimate",
  },
  {
    key: "radio-kit",
    label: "basic race radio kit",
    price: 525,
    detail: "for a starter crew communication setup",
  },
  {
    key: "fuel-drum",
    label: "55-gallon drum of race fuel",
    price: 780,
    detail: "using a rounded current motorsport fuel estimate",
  },
  {
    key: "data-subscription",
    label: "month of pro telemetry coaching",
    price: 99,
    detail: "for a typical sim coaching and data package",
  },
  {
    key: "pit-pass",
    label: "weekend paddock pass",
    price: 65,
    detail: "for a modest club-racing weekend access price",
  },
  {
    key: "set-brake-pads",
    label: "set of race brake pads",
    price: 420,
    detail: "for a front-axle motorsport pad estimate",
  },
  {
    key: "transponder-rental",
    label: "weekend transponder rental",
    price: 95,
    detail: "for a common club-racing rental cost",
  },
  {
    key: "two-post-rental",
    label: "month of workshop lift rental",
    price: 300,
    detail: "for occasional shared garage use",
  },
  {
    key: "pro-driver-coach-day",
    label: "half-day with a driver coach",
    price: 750,
    detail: "for an advanced coaching day estimate",
  },
];

function formatRatio(value) {
  const numeric = Number(value) || 0;

  if (numeric >= 10) {
    return Math.round(numeric).toString();
  }

  if (numeric >= 1) {
    return numeric.toFixed(1).replace(/\.0$/, "");
  }

  return numeric.toFixed(2).replace(/0$/, "").replace(/\.$/, "");
}

function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function buildReferenceFacts(amount, intro) {
  return priceReferences
    .filter((reference) => reference.price > 0 && amount > 0)
    .map((reference) => ({
      key: `${intro}-${reference.key}`,
      copy: `${intro} covers about ${formatRatio(amount / reference.price)} ${reference.label}${amount >= reference.price ? "s" : ""}, ${reference.detail}.`,
    }));
}

function buildCrossFacts(spendAmount, pendingAmount, totalAmount) {
  const facts = [];

  if (spendAmount > 0 && pendingAmount > 0) {
    facts.push({
      key: "balance-ratio",
      copy: `Your owned content value is ${formatRatio(
        spendAmount / Math.max(pendingAmount, 1)
      )}x the value still missing from the current catalog.`,
    });
  }

  if (totalAmount > 0) {
    facts.push({
      key: "full-catalog-track-nights",
      copy: `Owned plus missing content together would be about ${formatRatio(
        totalAmount / 155
      )} SCCA Track Night entries at MotorSport Ranch.`,
    });
  }

  if (spendAmount > 0) {
    facts.push({
      key: "spend-vs-helmet",
      copy: `Your current spend estimate is about ${formatRatio(
        spendAmount / 3999.95
      )} Bell HP7 helmets worth of content.`,
    });
  }

  if (pendingAmount > 0) {
    facts.push({
      key: "pending-vs-fuel",
      copy: `The current gap to buy everything is about ${formatRatio(
        pendingAmount / 780
      )} drums of race fuel.`,
    });
  }

  if (spendAmount > 0 && totalAmount > spendAmount) {
    facts.push({
      key: "upgrade-gap",
      copy: `The current gap to a full catalog is about ${formatRatio(
        (totalAmount - spendAmount) / 649
      )} Sim-Lab GT1 Pro cockpits.`,
    });
  }

  if (spendAmount > 0 && pendingAmount > 0) {
    facts.push({
      key: "closing-gap",
      copy: `At the current catalog prices, finishing the missing content would add about ${formatRatio(
        pendingAmount / Math.max(spendAmount, 1)
      )}x on top of what the owned content is worth today.`,
    });
  }

  if (spendAmount > 0) {
    facts.push({
      key: "spend-vs-coaching",
      copy: `Your current spend estimate would cover about ${formatRatio(
        spendAmount / 99
      )} months of telemetry coaching.`,
    });
  }

  return facts;
}

export function nextCuriositySeed(scope = "default") {
  const storageKey = `iref_curiosity_seed_${scope}`;

  try {
    const current = Number(localStorage.getItem(storageKey) || 0);
    const next = current + 1;
    localStorage.setItem(storageKey, String(next));
    return next;
  } catch {
    return Date.now();
  }
}

export function buildPriceCuriosities({
  spendAmount = 0,
  pendingAmount = 0,
  totalAmount = 0,
  seed = 0,
  limit = 1,
}) {
  const spend = roundCurrency(spendAmount);
  const pending = roundCurrency(pendingAmount);
  const total = roundCurrency(totalAmount || spend + pending);
  const pool = []
    .concat(
      buildReferenceFacts(spend, "Your current spend estimate"),
      buildReferenceFacts(pending, "What is still left to buy"),
      buildReferenceFacts(total, "Owned plus remaining content together"),
      buildCrossFacts(spend, pending, total)
    )
    .filter((item, index, array) => {
      return array.findIndex((candidate) => candidate.key === item.key) === index;
    });

  if (!pool.length) {
    return [];
  }

  const count = Math.min(Math.max(limit, 1), pool.length);
  const start = Math.abs(Number(seed) || 0) % pool.length;
  const results = [];

  for (let index = 0; index < count; index += 1) {
    results.push(pool[(start + index) % pool.length].copy);
  }

  return results;
}
