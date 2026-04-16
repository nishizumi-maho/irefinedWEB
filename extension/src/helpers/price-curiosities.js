const priceReferences = [
  {
    key: "track-night",
    singular: "SCCA Track Night entry",
    plural: "SCCA Track Night entries",
    price: 155,
    detail: "using a weekday club-level lapping-night estimate",
  },
  {
    key: "club-race-entry",
    singular: "regional club-race entry",
    plural: "regional club-race entries",
    price: 495,
    detail: "using a modest single-weekend amateur racing budget",
  },
  {
    key: "test-day",
    singular: "club test day",
    plural: "club test days",
    price: 480,
    detail: "using a realistic private lapping-day estimate",
  },
  {
    key: "karting-session",
    singular: "arrive-and-drive karting session",
    plural: "arrive-and-drive karting sessions",
    price: 85,
    detail: "using a straightforward club karting estimate",
  },
  {
    key: "paddock-pass",
    singular: "weekend paddock pass",
    plural: "weekend paddock passes",
    price: 65,
    detail: "using a modest club-racing weekend access price",
  },
  {
    key: "transponder-rental",
    singular: "weekend transponder rental",
    plural: "weekend transponder rentals",
    price: 95,
    detail: "using a common amateur racing rental cost",
  },
  {
    key: "transponder-subscription",
    singular: "season transponder subscription",
    plural: "season transponder subscriptions",
    price: 129,
    detail: "using a typical timing-subscription estimate",
  },
  {
    key: "fuel-jug",
    singular: "5-gallon fuel jug of race gas",
    plural: "5-gallon fuel jugs of race gas",
    price: 110,
    detail: "using a rounded current race-fuel estimate",
  },
  {
    key: "fuel-drum",
    singular: "55-gallon drum of race fuel",
    plural: "55-gallon drums of race fuel",
    price: 780,
    detail: "using a rounded motorsport fuel estimate",
  },
  {
    key: "tow-fuel-day",
    singular: "tow-vehicle fuel day",
    plural: "tow-vehicle fuel days",
    price: 210,
    detail: "using a realistic single-event travel-fuel estimate",
  },
  {
    key: "hotel-night",
    singular: "trackside hotel night",
    plural: "trackside hotel nights",
    price: 189,
    detail: "using a race-weekend hotel estimate",
  },
  {
    key: "garage-rental",
    singular: "weekend garage rental",
    plural: "weekend garage rentals",
    price: 600,
    detail: "using a small regional paddock-garage estimate",
  },
  {
    key: "lift-rental-month",
    singular: "month of workshop lift rental",
    plural: "months of workshop lift rental",
    price: 300,
    detail: "for occasional shared-garage access",
  },
  {
    key: "trailer-storage-month",
    singular: "month of enclosed-trailer storage",
    plural: "months of enclosed-trailer storage",
    price: 225,
    detail: "using a basic motorsport storage estimate",
  },
  {
    key: "alignment-corner-balance",
    singular: "race alignment and corner-balance session",
    plural: "race alignment and corner-balance sessions",
    price: 350,
    detail: "using a typical performance-shop estimate",
  },
  {
    key: "dyno-hour",
    singular: "dyno tuning hour",
    plural: "dyno tuning hours",
    price: 250,
    detail: "using a one-hour chassis-dyno estimate",
  },
  {
    key: "brake-pads",
    singular: "set of race brake pads",
    plural: "sets of race brake pads",
    price: 420,
    detail: "using a front-axle motorsport pad estimate",
  },
  {
    key: "gt3-rotor",
    singular: "GT3 brake rotor",
    plural: "GT3 brake rotors",
    price: 1180,
    detail: "using a rough single-rotor race-team estimate",
  },
  {
    key: "slick-tire",
    singular: "GT3 slick tire",
    plural: "GT3 slick tires",
    price: 893,
    detail: "using a current pro-level single-tire estimate",
  },
  {
    key: "slick-tire-set",
    singular: "set of GT3 slick tires",
    plural: "sets of GT3 slick tires",
    price: 3572,
    detail: "using four current pro-level slicks",
  },
  {
    key: "rain-tire-set",
    singular: "set of GT3 wet tires",
    plural: "sets of GT3 wet tires",
    price: 2370,
    detail: "using a full wet-weather race-tire estimate",
  },
  {
    key: "radio-kit",
    singular: "basic race radio kit",
    plural: "basic race radio kits",
    price: 525,
    detail: "for a starter crew-communication setup",
  },
  {
    key: "fire-system",
    singular: "plumbed-in fire system",
    plural: "plumbed-in fire systems",
    price: 399,
    detail: "using a simple entry-level safety-system estimate",
  },
  {
    key: "window-net-kit",
    singular: "window-net kit",
    plural: "window-net kits",
    price: 129,
    detail: "using a basic club-racing safety add-on estimate",
  },
  {
    key: "hans-device",
    singular: "head-and-neck restraint",
    plural: "head-and-neck restraints",
    price: 699,
    detail: "using a mainstream entry-level restraint estimate",
  },
  {
    key: "fia-gloves",
    singular: "pair of FIA gloves",
    plural: "pairs of FIA gloves",
    price: 169,
    detail: "using a current entry-level gloves estimate",
  },
  {
    key: "fia-shoes",
    singular: "pair of FIA race shoes",
    plural: "pairs of FIA race shoes",
    price: 249,
    detail: "using a practical entry-level shoe estimate",
  },
  {
    key: "race-suit",
    singular: "entry-level FIA race suit",
    plural: "entry-level FIA race suits",
    price: 629,
    detail: "using a straightforward first-suit estimate",
  },
  {
    key: "race-seat",
    singular: "FIA bucket seat",
    plural: "FIA bucket seats",
    price: 749,
    detail: "using a basic fixed-back motorsport seat estimate",
  },
  {
    key: "harness",
    singular: "six-point harness",
    plural: "six-point harnesses",
    price: 469,
    detail: "using an entry-level FIA harness estimate",
  },
  {
    key: "helmet",
    singular: "pro-level carbon helmet",
    plural: "pro-level carbon helmets",
    price: 3999.95,
    detail: "using a premium top-tier helmet estimate",
  },
  {
    key: "telemetry-month",
    singular: "month of telemetry coaching",
    plural: "months of telemetry coaching",
    price: 99,
    detail: "using a typical sim-racing data and coaching package",
  },
  {
    key: "driver-coach-halfday",
    singular: "half-day with a driver coach",
    plural: "half-days with a driver coach",
    price: 750,
    detail: "using an advanced coaching-day estimate",
  },
  {
    key: "data-logger",
    singular: "club-racing data logger",
    plural: "club-racing data loggers",
    price: 999,
    detail: "using a compact logger-and-display estimate",
  },
  {
    key: "sim-cockpit",
    singular: "aluminum sim cockpit",
    plural: "aluminum sim cockpits",
    price: 649,
    detail: "using a solid 8020-style cockpit estimate",
  },
  {
    key: "formula-wheel",
    singular: "formula-style sim wheel",
    plural: "formula-style sim wheels",
    price: 439.99,
    detail: "using a direct-drive ready wheel estimate",
  },
  {
    key: "loadcell-pedals",
    singular: "set of load-cell pedals",
    plural: "sets of load-cell pedals",
    price: 549,
    detail: "using a mid-range sim pedal estimate",
  },
  {
    key: "wheelbase",
    singular: "direct-drive wheelbase",
    plural: "direct-drive wheelbases",
    price: 999,
    detail: "using a mainstream mid-power wheelbase estimate",
  },
  {
    key: "triple-monitors",
    singular: "triple-monitor upgrade",
    plural: "triple-monitor upgrades",
    price: 840,
    detail: "using a simple three-screen sim setup estimate",
  },
  {
    key: "vr-headset",
    singular: "VR headset",
    plural: "VR headsets",
    price: 499,
    detail: "using a current mainstream PC-VR estimate",
  },
  {
    key: "button-box",
    singular: "sim button box",
    plural: "sim button boxes",
    price: 199,
    detail: "using a practical mid-range accessory estimate",
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

function formatPercent(value) {
  const numeric = Number(value) || 0;
  return `${numeric.toFixed(1).replace(/\.0$/, "")}%`;
}

function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function getReferenceLabel(reference, ratio) {
  if (ratio >= 1.5) {
    return reference.plural || `${reference.singular}s`;
  }

  return reference.singular;
}

function buildReferenceFacts(amount, intro) {
  return priceReferences
    .filter((reference) => reference.price > 0 && amount > 0)
    .map((reference) => ({
      key: `${intro}-${reference.key}`,
      copy: `${intro} covers about ${formatRatio(amount / reference.price)} ${getReferenceLabel(
        reference,
        amount / reference.price
      )}, ${reference.detail}.`,
    }));
}

function buildGapFacts(spendAmount, pendingAmount, totalAmount) {
  const facts = [];
  const gap = roundCurrency(Math.abs(spendAmount - pendingAmount));

  if (gap > 0) {
    facts.push(
      ...buildReferenceFacts(
        gap,
        spendAmount >= pendingAmount
          ? "The lead your owned catalog value has over the missing catalog"
          : "The missing catalog still outweighs your owned catalog value by"
      )
    );
  }

  if (totalAmount > 0 && spendAmount > 0) {
    facts.push({
      key: "completion-progress",
      copy: `At current catalog prices, your owned content represents about ${formatPercent(
        (spendAmount / totalAmount) * 100
      )} of the full car-and-track catalog value you are tracking here.`,
    });
  }

  if (totalAmount > 0 && pendingAmount > 0) {
    facts.push({
      key: "remaining-progress",
      copy: `At current catalog prices, the missing side still makes up about ${formatPercent(
        (pendingAmount / totalAmount) * 100
      )} of the catalog value you are comparing against.`,
    });
  }

  if (spendAmount > 0 && pendingAmount > 0) {
    facts.push({
      key: "balance-ratio",
      copy: `Your owned content value is ${formatRatio(
        spendAmount / Math.max(pendingAmount, 1)
      )}x the value still missing from the current catalog.`,
    });
    facts.push({
      key: "closing-gap",
      copy: `At the current catalog prices, finishing the missing content would add about ${formatRatio(
        pendingAmount / Math.max(spendAmount, 1)
      )}x on top of what the owned content is worth today.`,
    });
  }

  if (totalAmount > 0) {
    facts.push({
      key: "catalog-track-nights",
      copy: `Owned plus missing content together would be about ${formatRatio(
        totalAmount / 155
      )} SCCA Track Night entries at a weekday lapping-night budget.`,
    });
    facts.push({
      key: "catalog-hotel-nights",
      copy: `Owned plus missing content together is roughly ${formatRatio(
        totalAmount / 189
      )} trackside hotel nights at a race-weekend rate.`,
    });
  }

  if (spendAmount > 0) {
    facts.push({
      key: "spend-vs-helmet",
      copy: `Your current spend estimate is about ${formatRatio(
        spendAmount / 3999.95
      )} pro-level carbon helmets worth of content.`,
    });
    facts.push({
      key: "spend-vs-coaching",
      copy: `Your current spend estimate would cover about ${formatRatio(
        spendAmount / 99
      )} months of telemetry coaching.`,
    });
    facts.push({
      key: "spend-vs-slicks",
      copy: `Your current spend estimate is about ${formatRatio(
        spendAmount / 3572
      )} full sets of GT3 slicks.`,
    });
  }

  if (pendingAmount > 0) {
    facts.push({
      key: "pending-vs-fuel",
      copy: `The current gap to buy everything is about ${formatRatio(
        pendingAmount / 780
      )} drums of race fuel.`,
    });
    facts.push({
      key: "pending-vs-weekends",
      copy: `The current gap to the full catalog is roughly ${formatRatio(
        pendingAmount / 495
      )} regional club-race entries.`,
    });
  }

  if (spendAmount > 0 && totalAmount > spendAmount) {
    facts.push({
      key: "upgrade-gap",
      copy: `The current gap to a full catalog is about ${formatRatio(
        (totalAmount - spendAmount) / 649
      )} aluminum sim cockpits.`,
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
      buildReferenceFacts(total, "Owned plus remaining content together")
    )
    .concat(buildGapFacts(spend, pending, total))
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
