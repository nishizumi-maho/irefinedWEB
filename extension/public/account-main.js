(function () {
  if (window.__irefinedAccountHistoryLoaded) {
    return;
  }

  window.__irefinedAccountHistoryLoaded = true;

  if (!/\/membersite\/account\/OrderHistory\.do/i.test(location.pathname)) {
    return;
  }

  const purchaseHistorySessionKeyPrefix = "iref_purchase_history_summary::";
  const bridgeTargetOrigin = window.location.origin;
  const epsilon = 0.0001;
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
  const categories = {
    spending: [
      { key: "content", label: "Content" },
      { key: "gifts-sent", label: "Gifts Sent" },
      { key: "hosted", label: "Hosted Sessions" },
      { key: "subscription", label: "Subscription" },
      { key: "other", label: "Other Purchases" },
    ],
    funding: [
      { key: "account-recharge", label: "Account Recharge" },
      { key: "direct-usd-paid", label: "Direct USD Paid" },
      { key: "iracing-dollars-used", label: "iRacing Dollars Used" },
      { key: "iracing-credits-used", label: "iRacing Credits Used" },
      { key: "gift-or-manual-recharge", label: "Gift / Manual Recharge" },
      { key: "participation-credits", label: "Participation Credits" },
      { key: "support-credits", label: "Support Credits" },
      { key: "refunds", label: "Refunds" },
    ],
    gains: [
      { key: "gift-recharge-received", label: "Gift Recharge Received" },
      { key: "auto-credit-applied", label: "Auto Credit Apply Used" },
      { key: "participation-credits", label: "Participation Credits" },
      { key: "support-credits", label: "Support Credits" },
      { key: "refunds", label: "Refunds" },
    ],
  };

  let currentSummary = null;
  let activeFilters = {
    startDateKey: "",
    endDateKey: "",
  };
  const curiositySeed = nextCuriositySeed("order-history");

  function getDashboardSessionId() {
    try {
      return new URL(location.href).searchParams.get("irefSession") || "";
    } catch {
      return "";
    }
  }

  function getPurchaseHistoryStorageKey() {
    const sessionId = getDashboardSessionId();
    return sessionId
      ? `${purchaseHistorySessionKeyPrefix}${sessionId}`
      : "";
  }

  function normalizeText(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function parseCurrency(value) {
    const parsed = Number(String(value || "").replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
  }

  function roundCurrency(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  function formatCurrency(value) {
    return `$${roundCurrency(value).toFixed(2)}`;
  }

  function pluralize(value, singular, plural) {
    return `${value} ${value === 1 ? singular : plural}`;
  }

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

  function nextCuriositySeed(scope) {
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

  function buildReferenceFacts(amount, intro) {
    return priceReferences
      .filter(function (reference) {
        return reference.price > 0 && amount > 0;
      })
      .map(function (reference) {
        const ratio = amount / reference.price;
        return {
          key: `${intro}-${reference.key}`,
          copy: `${intro} covers about ${formatRatio(ratio)} ${ratio >= 1.5 ? reference.plural || `${reference.singular}s` : reference.singular}, ${reference.detail}.`,
        };
      });
  }

  function buildGapFacts(spendAmount, hostedAmount, totalAmount) {
    const facts = [];
    const gap = roundCurrency(Math.abs(spendAmount - hostedAmount));

    if (gap > 0) {
      facts.push.apply(
        facts,
        buildReferenceFacts(
          gap,
          spendAmount >= hostedAmount
            ? "The lead content has over hosted sessions in this range"
            : "Hosted sessions outweigh content in this range by"
        )
      );
    }

    if (totalAmount > 0 && spendAmount > 0) {
      facts.push({
        key: "range-content-share",
        copy: `Content makes up about ${formatPercent(
          (spendAmount / totalAmount) * 100
        )} of the tracked spend in this date range.`,
      });
    }

    if (totalAmount > 0 && hostedAmount > 0) {
      facts.push({
        key: "range-hosted-share",
        copy: `Hosted sessions make up about ${formatPercent(
          (hostedAmount / totalAmount) * 100
        )} of the tracked spend in this date range.`,
      });
    }

    if (spendAmount > 0 && hostedAmount > 0) {
      facts.push({
        key: "range-balance",
        copy: `Content spend in this range is ${formatRatio(
          spendAmount / Math.max(hostedAmount, 1)
        )}x your hosted session spend.`,
      });
      facts.push({
        key: "range-reverse-balance",
        copy: `Hosted session spend in this range is ${formatRatio(
          hostedAmount / Math.max(spendAmount, 1)
        )}x your content spend when viewed from the hosted side.`,
      });
    }

    if (totalAmount > 0) {
      facts.push({
        key: "range-total-track-nights",
        copy: `Total spend in this range would be about ${formatRatio(
          totalAmount / 155
        )} SCCA Track Night entries.`,
      });
      facts.push({
        key: "range-total-hotels",
        copy: `Total spend in this range is roughly ${formatRatio(
          totalAmount / 189
        )} race-weekend hotel nights.`,
      });
    }

    if (spendAmount > 0) {
      facts.push({
        key: "range-content-slicks",
        copy: `Content in this range is about ${formatRatio(
          spendAmount / 3572
        )} full sets of GT3 slicks.`,
      });
    }

    if (hostedAmount > 0) {
      facts.push({
        key: "range-hosted-fuel",
        copy: `Hosted sessions in this range are about ${formatRatio(
          hostedAmount / 110
        )} five-gallon fuel jugs of race gas.`,
      });
      facts.push({
        key: "range-hosted-karting",
        copy: `Hosted sessions in this range cost about ${formatRatio(
          hostedAmount / 85
        )} arrive-and-drive karting sessions.`,
      });
    }

    return facts;
  }

  function extractDateKey(value) {
    const text = normalizeText(value).replace(/\./g, "/");

    if (!text) {
      return "";
    }

    let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }

    match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);

    if (match) {
      const month = match[1].padStart(2, "0");
      const day = match[2].padStart(2, "0");
      const year =
        match[3].length === 2 ? `20${match[3].padStart(2, "0")}` : match[3];
      return `${year}-${month}-${day}`;
    }

    const parsed = new Date(text);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function dateKeyToMs(dateKey, endOfDay) {
    if (!dateKey) {
      return 0;
    }

    const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) {
      return 0;
    }

    const date = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0
    );

    return Number.isFinite(date.getTime()) ? date.getTime() : 0;
  }

  function formatDateKeyLabel(dateKey) {
    if (!dateKey) {
      return "";
    }

    const parsed = dateKeyToMs(dateKey, false);

    if (!parsed) {
      return dateKey;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(parsed));
  }

  function formatSyncTime(value) {
    if (!value) {
      return "Not synced yet";
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return "Not synced yet";
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsed);
  }

  function normalizeFilterRange(startDateKey, endDateKey) {
    const nextStart = startDateKey || "";
    const nextEnd = endDateKey || "";

    if (nextStart && nextEnd && nextStart > nextEnd) {
      return {
        startDateKey: nextEnd,
        endDateKey: nextStart,
      };
    }

    return {
      startDateKey: nextStart,
      endDateKey: nextEnd,
    };
  }

  function matchesDateKey(dateKey, startDateKey, endDateKey) {
    if (!dateKey) {
      return !startDateKey && !endDateKey;
    }

    if (startDateKey && dateKey < startDateKey) {
      return false;
    }

    if (endDateKey && dateKey > endDateKey) {
      return false;
    }

    return true;
  }

  function createCategoryMap(list) {
    return list.reduce(function (map, item) {
      map[item.key] = {
        key: item.key,
        label: item.label,
        amount: 0,
        gross: 0,
        net: 0,
        orders: 0,
        entries: 0,
      };
      return map;
    }, {});
  }

  function bumpCategory(categoryMap, key, amount, options) {
    const category = categoryMap[key];
    const nextAmount = roundCurrency(amount);
    const allowNegative = options && options.allowNegative === true;

    if (!category || (!allowNegative && nextAmount <= 0) || nextAmount === 0) {
      return;
    }

    category.amount = roundCurrency(category.amount + nextAmount);
    category.entries += 1;
  }

  function ensurePanelStyles() {
    if (document.getElementById("iref-order-history-summary-style")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "iref-order-history-summary-style";
    style.textContent = `
      #iref-order-history-summary {
        margin: 12px 0 18px;
        padding: 18px 20px;
        border: 1px solid rgba(77, 114, 198, 0.55);
        border-radius: 6px;
        background: linear-gradient(145deg, rgba(9, 13, 24, 0.98), rgba(12, 18, 32, 0.98));
        color: #f3f6ff;
        box-shadow: 0 16px 34px rgba(0, 0, 0, 0.22);
      }

      .iref-oh-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;
      }

      .iref-oh-eyebrow {
        color: #81e0b4;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .iref-oh-title {
        margin: 4px 0 0;
        font-size: 24px;
        font-weight: 700;
        line-height: 1.2;
      }

      .iref-oh-subtitle {
        margin: 6px 0 0;
        color: #b7c5e6;
        font-size: 13px;
        line-height: 1.45;
      }

      .iref-oh-sync-pill {
        padding: 7px 11px;
        border: 1px solid rgba(92, 119, 176, 0.5);
        border-radius: 999px;
        background: rgba(20, 28, 44, 0.88);
        color: #dce5fa;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
      }

      .iref-oh-filter-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 10px;
        margin-bottom: 10px;
      }

      .iref-oh-filter-field {
        display: grid;
        gap: 4px;
        min-width: 148px;
      }

      .iref-oh-filter-field span {
        color: #9fb0d8;
        font-size: 12px;
        font-weight: 700;
      }

      .iref-oh-filter-field input {
        min-height: 36px;
        padding: 7px 10px;
        border: 1px solid rgba(94, 114, 154, 0.7);
        border-radius: 6px;
        background: rgba(17, 23, 35, 0.96);
        color: #f3f6ff;
        font-size: 13px;
      }

      .iref-oh-btn {
        min-height: 36px;
        padding: 8px 12px;
        border: 1px solid rgba(88, 105, 148, 0.7);
        border-radius: 6px;
        background: rgba(24, 33, 50, 0.96);
        color: #f3f6ff;
        font-size: 12px;
        font-weight: 700;
      }

      .iref-oh-btn:hover {
        background: rgba(31, 43, 67, 0.98);
      }

      .iref-oh-period-copy {
        margin-bottom: 12px;
        color: #ced8ef;
        font-size: 12px;
        line-height: 1.45;
      }

      .iref-oh-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 10px;
        margin-bottom: 12px;
      }

      .iref-oh-metric {
        padding: 12px 14px;
        border: 1px solid rgba(88, 105, 148, 0.58);
        border-radius: 6px;
        background: rgba(19, 26, 40, 0.9);
      }

      .iref-oh-metric.highlight {
        border-color: rgba(103, 185, 146, 0.72);
        background: rgba(19, 40, 34, 0.58);
      }

      .iref-oh-metric.gain {
        border-color: rgba(215, 176, 89, 0.68);
        background: rgba(50, 38, 18, 0.56);
      }

      .iref-oh-metric-label {
        display: block;
        margin-bottom: 4px;
        color: #9fb0d8;
        font-size: 12px;
        font-weight: 700;
      }

      .iref-oh-metric-value {
        color: #ffffff;
        font-size: 26px;
        font-weight: 700;
        line-height: 1.1;
      }

      .iref-oh-metric-note {
        margin-top: 6px;
        color: #c3cee4;
        font-size: 12px;
        line-height: 1.35;
      }

      .iref-oh-columns {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-bottom: 10px;
      }

      .iref-oh-card {
        padding: 12px 14px;
        border: 1px solid rgba(88, 105, 148, 0.58);
        border-radius: 6px;
        background: rgba(17, 23, 35, 0.92);
      }

      .iref-oh-card-title {
        margin-bottom: 10px;
        color: #f3f6ff;
        font-size: 16px;
        font-weight: 700;
      }

      .iref-oh-list {
        display: grid;
        gap: 8px;
      }

      .iref-oh-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .iref-oh-row-copy {
        min-width: 0;
      }

      .iref-oh-row-label {
        color: #e3e9f7;
        font-size: 13px;
        font-weight: 700;
      }

      .iref-oh-row-meta {
        margin-top: 2px;
        color: #9fb0d8;
        font-size: 11px;
      }

      .iref-oh-row-value {
        color: #ffffff;
        font-size: 14px;
        font-weight: 700;
        text-align: right;
        white-space: nowrap;
      }

      .iref-oh-empty {
        color: #a9b6d4;
        font-size: 13px;
        line-height: 1.45;
      }

      .iref-oh-fact {
        display: grid;
        gap: 8px;
      }

      .iref-oh-fact-item {
        color: #f7edd9;
        font-size: 13px;
        line-height: 1.5;
      }

      .iref-oh-note {
        color: #b9c7ea;
        font-size: 12px;
        line-height: 1.5;
      }

      .iref-oh-note div + div {
        margin-top: 4px;
      }

      @media (max-width: 860px) {
        .iref-oh-header,
        .iref-oh-columns {
          flex-direction: column;
        }

        .iref-oh-columns {
          grid-template-columns: 1fr;
        }

        .iref-oh-sync-pill {
          white-space: normal;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function ensureSyncBadge() {
    let badge = document.getElementById("iref-account-sync-badge");

    if (badge) {
      return badge;
    }

    badge = document.createElement("div");
    badge.id = "iref-account-sync-badge";
    badge.style.position = "fixed";
    badge.style.right = "16px";
    badge.style.bottom = "16px";
    badge.style.zIndex = "2147483647";
    badge.style.maxWidth = "320px";
    badge.style.padding = "10px 12px";
    badge.style.borderRadius = "8px";
    badge.style.border = "1px solid rgba(77, 114, 198, 0.65)";
    badge.style.background = "rgba(12, 16, 28, 0.96)";
    badge.style.color = "#f3f6ff";
    badge.style.fontSize = "13px";
    badge.style.lineHeight = "1.45";
    badge.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.3)";
    badge.innerHTML =
      '<div id="iref-account-sync-title" style="font-weight:700;margin-bottom:4px;">iRefined Spend Sync</div>' +
      '<div id="iref-account-sync-copy">Preparing purchase sync...</div>';

    document.body.appendChild(badge);
    return badge;
  }

  function setSyncBadge(message, detail, accentColor) {
    const badge = ensureSyncBadge();
    const title = badge.querySelector("#iref-account-sync-title");
    const copy = badge.querySelector("#iref-account-sync-copy");

    if (title) {
      title.style.color = accentColor || "#f3f6ff";
    }

    if (copy) {
      copy.textContent = detail ? `${message} ${detail}` : message;
    }
  }

  function ensureSummaryPanel() {
    ensurePanelStyles();

    let panel = document.getElementById("iref-order-history-summary");

    if (panel) {
      return panel;
    }

    const anchor =
      document.querySelector("table") ||
      document.querySelector(".marginbottom10") ||
      document.body.firstElementChild;

    if (!anchor || !anchor.parentNode) {
      return null;
    }

    panel = document.createElement("section");
    panel.id = "iref-order-history-summary";
    panel.innerHTML = `
      <div class="iref-oh-header">
        <div>
          <div class="iref-oh-eyebrow">iRefined</div>
          <h2 class="iref-oh-title">Spend Summary</h2>
          <p class="iref-oh-subtitle">
            Filter any date range, isolate hosted sessions, and break down where the money went or came back.
          </p>
        </div>
        <div id="iref-oh-sync-pill" class="iref-oh-sync-pill">Preparing summary...</div>
      </div>
      <div class="iref-oh-filter-row">
        <label class="iref-oh-filter-field">
          <span>From</span>
          <input type="date" id="iref-oh-filter-from" />
        </label>
        <label class="iref-oh-filter-field">
          <span>To</span>
          <input type="date" id="iref-oh-filter-to" />
        </label>
        <button type="button" id="iref-oh-filter-apply" class="iref-oh-btn">Apply</button>
        <button type="button" id="iref-oh-filter-clear" class="iref-oh-btn">All time</button>
      </div>
      <div id="iref-oh-period-copy" class="iref-oh-period-copy"></div>
      <div id="iref-oh-metrics" class="iref-oh-metrics"></div>
      <div class="iref-oh-columns">
        <div class="iref-oh-card">
          <div class="iref-oh-card-title">Spend Categories</div>
          <div id="iref-oh-spend-list" class="iref-oh-list"></div>
        </div>
        <div class="iref-oh-card">
          <div class="iref-oh-card-title">Credits & Gains</div>
          <div id="iref-oh-gain-list" class="iref-oh-list"></div>
        </div>
      </div>
      <div class="iref-oh-columns">
        <div class="iref-oh-card">
          <div class="iref-oh-card-title">Payment Mix</div>
          <div id="iref-oh-payment-list" class="iref-oh-list"></div>
        </div>
        <div class="iref-oh-card">
          <div class="iref-oh-card-title">Rotating Curiosities</div>
          <div id="iref-oh-fact" class="iref-oh-fact"></div>
        </div>
      </div>
      <div id="iref-oh-note" class="iref-oh-note"></div>
    `;

    anchor.parentNode.insertBefore(panel, anchor);
    bindPanelEvents(panel);
    return panel;
  }

  function bindPanelEvents(panel) {
    if (!panel || panel.dataset.bound === "true") {
      return;
    }

    const applyFilters = function () {
      const startInput = panel.querySelector("#iref-oh-filter-from");
      const endInput = panel.querySelector("#iref-oh-filter-to");
      activeFilters = normalizeFilterRange(
        normalizeText(startInput && startInput.value),
        normalizeText(endInput && endInput.value)
      );
      renderSummaryPanel(currentSummary);
    };

    panel
      .querySelector("#iref-oh-filter-apply")
      .addEventListener("click", applyFilters);
    panel
      .querySelector("#iref-oh-filter-clear")
      .addEventListener("click", function () {
        activeFilters = {
          startDateKey: "",
          endDateKey: "",
        };

        const startInput = panel.querySelector("#iref-oh-filter-from");
        const endInput = panel.querySelector("#iref-oh-filter-to");

        if (startInput) {
          startInput.value = "";
        }

        if (endInput) {
          endInput.value = "";
        }

        renderSummaryPanel(currentSummary);
      });

    ["#iref-oh-filter-from", "#iref-oh-filter-to"].forEach(function (selector) {
      const input = panel.querySelector(selector);

      if (!input) {
        return;
      }

      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          applyFilters();
        }
      });
    });

    panel.dataset.bound = "true";
  }

  function collectOrderRows() {
    return Array.from(
      document.querySelectorAll('a[href*="OrderDetail.do?orderid="]')
    )
      .map(function (link) {
        const row = link.closest("tr");

        if (!row) {
          return null;
        }

        const cells = Array.from(row.querySelectorAll("td")).map(function (cell) {
          return normalizeText(cell.textContent);
        });

        if (cells.length < 5) {
          return null;
        }

        return {
          date: cells[0],
          dateKey: extractDateKey(cells[0]),
          orderId: cells[1],
          status: cells[2],
          total: parseCurrency(cells[3]),
          memo: cells[4],
          href: link.href,
        };
      })
      .filter(Boolean);
  }

  function collectAdjustmentRows() {
    return Array.from(document.querySelectorAll("table tbody tr"))
      .map(function (row) {
        if (row.querySelector('a[href*="OrderDetail.do?orderid="]')) {
          return null;
        }

        const cells = Array.from(row.querySelectorAll("td")).map(function (cell) {
          return normalizeText(cell.textContent);
        });

        if (cells.length !== 4) {
          return null;
        }

        return {
          date: cells[0],
          dateKey: extractDateKey(cells[0]),
          memo: cells[1],
          amount: parseCurrency(cells[2]),
          actor: cells[3],
        };
      })
      .filter(Boolean);
  }

  function needsDetail(order) {
    const memo = normalizeText(order.memo).toLowerCase();

    return (
      memo.includes("cart order") ||
      memo.includes("hosted session order") ||
      memo.includes("content exchange") ||
      memo.includes("gift")
    );
  }

  function isSubscriptionOrder(order) {
    return normalizeText(order.memo).toLowerCase().includes("subscription");
  }

  function isAccountRechargeOrder(order) {
    return normalizeText(order.memo).toLowerCase().includes("account recharge");
  }

  function extractOrderBaseLiteral(html) {
    const match = html.match(/var\s+order\s*=\s*(\{[\s\S]*?items:\{\}\s*\});/i);
    return match ? match[1] : null;
  }

  function extractOrderDetailDate(html) {
    const match = html.match(/Date:<\/span>\s*<span>([^<]+)<\/span>/i);

    if (!match) {
      return {
        text: "",
        ms: 0,
      };
    }

    const text = normalizeText(match[1].replace(/&nbsp;/gi, " "));
    const parsed = new Date(text);

    return {
      text: text,
      ms: Number.isFinite(parsed.getTime()) ? parsed.getTime() : 0,
    };
  }

  function extractOrderItems(html) {
    const items = [];
    const itemPattern =
      /order\.items\[(\d+)\]\.push\(\s*(\{[\s\S]*?\})\s*\);/g;
    let match = itemPattern.exec(html);

    while (match) {
      try {
        const item = Function(`return (${match[2]});`)();
        item.group = Number(match[1]);
        items.push(item);
      } catch {}

      match = itemPattern.exec(html);
    }

    return items;
  }

  function parseOrderDetail(html) {
    const baseLiteral = extractOrderBaseLiteral(html);

    if (!baseLiteral) {
      throw new Error("Could not parse order detail.");
    }

    const detailDate = extractOrderDetailDate(html);
    const order = Function(`return (${baseLiteral});`)();
    order.items = extractOrderItems(html);
    order.detail_date = detailDate.text;
    order.detail_date_ms = detailDate.ms;
    return order;
  }

  async function fetchOrderDetail(order) {
    const response = await fetch(order.href, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for order ${order.orderId}`);
    }

    return parseOrderDetail(await response.text());
  }

  function classifyDetailedOrder(order, detail) {
    const memo = normalizeText(order.memo).toLowerCase();
    const items = Array.isArray(detail.items) ? detail.items : [];
    const hasRecipient = items.some(function (item) {
      return Number(item.recipient) > 0;
    });
    const hasHostedItem = items.some(function (item) {
      const text = `${item.name || ""} ${item.description || ""}`.toLowerCase();
      return text.includes("hosted session");
    });

    if (hasRecipient) {
      return "gifts-sent";
    }

    if (memo.includes("hosted session order") || hasHostedItem) {
      return "hosted";
    }

    if (memo.includes("cart order") || memo.includes("content exchange")) {
      return "content";
    }

    return "other";
  }

  function limitConcurrency(items, worker, concurrency) {
    const queue = Array.from(items);
    const results = [];
    const workers = [];

    function runNext() {
      if (!queue.length) {
        return Promise.resolve();
      }

      const item = queue.shift();

      return Promise.resolve(worker(item)).then(function (result) {
        results.push(result);
        return runNext();
      });
    }

    for (let index = 0; index < concurrency; index += 1) {
      workers.push(runNext());
    }

    return Promise.all(workers).then(function () {
      return results;
    });
  }

  function buildCategoryArray(categoryMap, defaults) {
    return defaults.map(function (item) {
      return categoryMap[item.key];
    });
  }

  function createDollarBucket(source, amount, dateMs) {
    return {
      source: source,
      remaining: roundCurrency(amount),
      dateMs: dateMs || 0,
    };
  }

  function allocateDollarUsage(buckets, amount) {
    let remaining = roundCurrency(amount);
    const allocation = {
      selfRechargeApplied: 0,
      giftedRechargeApplied: 0,
      unresolvedDollarUsage: 0,
    };

    while (remaining > epsilon && buckets.length) {
      const bucket = buckets[0];
      const applied = Math.min(bucket.remaining, remaining);

      if (bucket.source === "self-recharge") {
        allocation.selfRechargeApplied += applied;
      }

      if (bucket.source === "gift-recharge") {
        allocation.giftedRechargeApplied += applied;
      }

      bucket.remaining = roundCurrency(bucket.remaining - applied);
      remaining = roundCurrency(remaining - applied);

      if (bucket.remaining <= epsilon) {
        buckets.shift();
      }
    }

    if (remaining > epsilon) {
      allocation.unresolvedDollarUsage = remaining;
    }

    allocation.selfRechargeApplied = roundCurrency(
      allocation.selfRechargeApplied
    );
    allocation.giftedRechargeApplied = roundCurrency(
      allocation.giftedRechargeApplied
    );
    allocation.unresolvedDollarUsage = roundCurrency(
      allocation.unresolvedDollarUsage
    );

    return allocation;
  }

  function createOrderRecord(order, categoryKey, values) {
    return {
      orderId: order.orderId,
      dateKey: order.dateKey || extractDateKey(order.date),
      dateMs: dateKeyToMs(order.dateKey || extractDateKey(order.date), false),
      categoryKey: categoryKey,
      gross: roundCurrency(values.gross),
      directPaid: roundCurrency(values.directPaid || 0),
      irDollarsUsed: roundCurrency(values.irDollarsUsed || 0),
      irCredits: roundCurrency(values.irCredits || 0),
      giftedRechargeApplied: 0,
      selfRechargeApplied: 0,
      unresolvedDollarUsage: 0,
      net: roundCurrency(values.net || 0),
    };
  }

  function createAdjustmentRecord(adjustment, key, label, amount) {
    return {
      key: key,
      label: label,
      amount: roundCurrency(Math.abs(amount)),
      dateKey: adjustment.dateKey || extractDateKey(adjustment.date),
      dateMs: dateKeyToMs(adjustment.dateKey || extractDateKey(adjustment.date), false),
    };
  }

  function buildDateRange(orderRecords, adjustmentRecords) {
    const keys = []
      .concat(
        orderRecords.map(function (record) {
          return record.dateKey;
        }),
        adjustmentRecords.map(function (record) {
          return record.dateKey;
        })
      )
      .filter(Boolean)
      .sort();

    return {
      minDateKey: keys[0] || "",
      maxDateKey: keys[keys.length - 1] || "",
    };
  }

  function buildFilteredView(summary, filters) {
    const normalizedFilters = normalizeFilterRange(
      filters && filters.startDateKey,
      filters && filters.endDateKey
    );
    const orderRecords = Array.isArray(summary && summary.orderRecords)
      ? summary.orderRecords
      : [];
    const adjustmentRecords = Array.isArray(summary && summary.adjustmentRecords)
      ? summary.adjustmentRecords
      : [];
    const filteredOrders = orderRecords.filter(function (record) {
      return matchesDateKey(
        record.dateKey,
        normalizedFilters.startDateKey,
        normalizedFilters.endDateKey
      );
    });
    const filteredAdjustments = adjustmentRecords.filter(function (record) {
      return matchesDateKey(
        record.dateKey,
        normalizedFilters.startDateKey,
        normalizedFilters.endDateKey
      );
    });
    const spendingMap = createCategoryMap(categories.spending);
    const gainsMap = createCategoryMap(categories.gains);
    let grossSpend = 0;
    let netBeforeAutoCredit = 0;
    let directPaid = 0;
    let irDollarsUsed = 0;
    let irCreditsUsed = 0;
    let giftRechargeApplied = 0;
    let selfRechargeApplied = 0;
    let unresolvedDollarUsage = 0;
    let gainedTotal = 0;
    let autoCreditApplied = 0;

    filteredOrders.forEach(function (record) {
      grossSpend = roundCurrency(grossSpend + record.gross);
      netBeforeAutoCredit = roundCurrency(netBeforeAutoCredit + record.net);
      directPaid = roundCurrency(directPaid + record.directPaid);
      irDollarsUsed = roundCurrency(irDollarsUsed + record.irDollarsUsed);
      irCreditsUsed = roundCurrency(irCreditsUsed + record.irCredits);
      giftRechargeApplied = roundCurrency(
        giftRechargeApplied + record.giftedRechargeApplied
      );
      selfRechargeApplied = roundCurrency(
        selfRechargeApplied + record.selfRechargeApplied
      );
      unresolvedDollarUsage = roundCurrency(
        unresolvedDollarUsage + record.unresolvedDollarUsage
      );

      const category = spendingMap[record.categoryKey];

      if (!category) {
        return;
      }

      category.gross = roundCurrency(category.gross + record.gross);
      category.net = roundCurrency(category.net + record.net);
      category.orders += 1;
    });

    filteredAdjustments.forEach(function (record) {
      const category = gainsMap[record.key];

      if (!category) {
        return;
      }

      category.amount = roundCurrency(category.amount + record.amount);
      category.entries += 1;
      gainedTotal = roundCurrency(gainedTotal + record.amount);

      if (record.key === "auto-credit-applied") {
        autoCreditApplied = roundCurrency(autoCreditApplied + record.amount);
      }
    });

    const netOutOfPocket = roundCurrency(
      Math.max(0, netBeforeAutoCredit - autoCreditApplied)
    );

    return {
      filters: normalizedFilters,
      filteredOrders: filteredOrders,
      filteredAdjustments: filteredAdjustments,
      ordersCount: filteredOrders.length,
      adjustmentsCount: filteredAdjustments.length,
      grossSpend: grossSpend,
      contentGross: spendingMap.content.gross,
      contentNet: spendingMap.content.net,
      hostedGross: spendingMap.hosted.gross,
      hostedNet: spendingMap.hosted.net,
      gainedTotal: gainedTotal,
      autoCreditApplied: autoCreditApplied,
      directPaid: directPaid,
      irDollarsUsed: irDollarsUsed,
      irCreditsUsed: irCreditsUsed,
      giftRechargeApplied: giftRechargeApplied,
      selfRechargeApplied: selfRechargeApplied,
      unresolvedDollarUsage: unresolvedDollarUsage,
      netOutOfPocket: netOutOfPocket,
      spendingCategoryTotals: categories.spending.map(function (item) {
        return spendingMap[item.key];
      }),
      gainCategories: categories.gains.map(function (item) {
        return gainsMap[item.key];
      }),
    };
  }

  function buildPeriodLabel(summary, view) {
    const start = view.filters.startDateKey;
    const end = view.filters.endDateKey;

    if (!start && !end) {
      return `Showing all time across ${pluralize(
        view.ordersCount,
        "order",
        "orders"
      )} and ${pluralize(view.adjustmentsCount, "credit row", "credit rows")}.`;
    }

    if (start && end) {
      return `Showing ${formatDateKeyLabel(start)} to ${formatDateKeyLabel(
        end
      )} across ${pluralize(view.ordersCount, "order", "orders")} and ${pluralize(
        view.adjustmentsCount,
        "credit row",
        "credit rows"
      )}.`;
    }

    if (start) {
      return `Showing from ${formatDateKeyLabel(start)} onward across ${pluralize(
        view.ordersCount,
        "order",
        "orders"
      )} and ${pluralize(view.adjustmentsCount, "credit row", "credit rows")}.`;
    }

    return `Showing through ${formatDateKeyLabel(end)} across ${pluralize(
      view.ordersCount,
      "order",
      "orders"
    )} and ${pluralize(view.adjustmentsCount, "credit row", "credit rows")}.`;
  }

  function buildSpendRows(view) {
    return view.spendingCategoryTotals
      .filter(function (item) {
        return item.gross > 0 || item.net > 0;
      })
      .sort(function (left, right) {
        return right.gross - left.gross;
      })
      .map(function (item) {
        const meta = [];

        if (item.net > 0 && item.net !== item.gross) {
          meta.push(`Net ${formatCurrency(item.net)}`);
        }

        if (item.orders > 0) {
          meta.push(pluralize(item.orders, "order", "orders"));
        }

        return {
          label: item.label,
          value: formatCurrency(item.gross),
          meta: meta.join(" • "),
        };
      });
  }

  function buildGainRows(view) {
    return view.gainCategories
      .filter(function (item) {
        return item.amount > 0;
      })
      .sort(function (left, right) {
        return right.amount - left.amount;
      })
      .map(function (item) {
        return {
          label: item.label,
          value: formatCurrency(item.amount),
          meta:
            item.entries > 0
              ? pluralize(item.entries, "entry", "entries")
              : "",
        };
      });
  }

  function buildPaymentRows(view) {
    return [
      {
        label: "Direct USD Paid",
        value: formatCurrency(view.directPaid),
        meta: "Paid directly in the checkout flow.",
      },
      {
        label: "iRacing Dollars Used",
        value: formatCurrency(view.irDollarsUsed),
        meta: "Wallet balance consumed in the selected range.",
      },
      {
        label: "iRacing Credits Used",
        value: formatCurrency(view.irCreditsUsed),
        meta: "Credits that reduced the checkout total.",
      },
      {
        label: "Gift Recharge Applied",
        value: formatCurrency(view.giftRechargeApplied),
        meta: "Gifted or manual recharge balance consumed here.",
      },
      {
        label: "Account Recharge Applied",
        value: formatCurrency(view.selfRechargeApplied),
        meta: "Your own recharged balance consumed here.",
      },
    ].filter(function (item) {
      return parseCurrency(item.value) > 0;
    });
  }

  function buildCuriousFacts(view) {
    const spend = roundCurrency(view.contentGross || 0);
    const hosted = roundCurrency(view.hostedGross || 0);
    const total = roundCurrency(view.grossSpend || 0);
    const pool = []
      .concat(
        buildReferenceFacts(spend, "Content in this range"),
        buildReferenceFacts(hosted, "Hosted sessions in this range"),
        buildReferenceFacts(total, "Total spend in this range")
      )
      .concat(buildGapFacts(spend, hosted, total))
      .filter(function (item, index, list) {
        return (
          list.findIndex(function (candidate) {
            return candidate.key === item.key;
          }) === index
        );
      });

    if (!pool.length) {
      return [
        "Pick a range with content or hosted session orders to get a real-world racing comparison.",
      ];
    }

    const limit = Math.min(4, pool.length);
    const start = Math.abs(Number(curiositySeed) || 0) % pool.length;
    const facts = [];

    for (let index = 0; index < limit; index += 1) {
      facts.push(pool[(start + index) % pool.length].copy);
    }

    return facts;
  }

  function renderMetric(root, label, value, note, className) {
    const item = document.createElement("div");
    item.className = `iref-oh-metric${className ? ` ${className}` : ""}`;

    const title = document.createElement("span");
    title.className = "iref-oh-metric-label";
    title.textContent = label;

    const amount = document.createElement("div");
    amount.className = "iref-oh-metric-value";
    amount.textContent = formatCurrency(value);

    item.appendChild(title);
    item.appendChild(amount);

    if (note) {
      const noteEl = document.createElement("div");
      noteEl.className = "iref-oh-metric-note";
      noteEl.textContent = note;
      item.appendChild(noteEl);
    }

    root.appendChild(item);
  }

  function renderRows(root, rows, emptyLabel) {
    if (!root) {
      return;
    }

    root.innerHTML = "";

    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "iref-oh-empty";
      empty.textContent = emptyLabel;
      root.appendChild(empty);
      return;
    }

    rows.forEach(function (row) {
      const item = document.createElement("div");
      item.className = "iref-oh-row";

      const copy = document.createElement("div");
      copy.className = "iref-oh-row-copy";

      const label = document.createElement("div");
      label.className = "iref-oh-row-label";
      label.textContent = row.label;

      copy.appendChild(label);

      if (row.meta) {
        const meta = document.createElement("div");
        meta.className = "iref-oh-row-meta";
        meta.textContent = row.meta;
        copy.appendChild(meta);
      }

      const value = document.createElement("div");
      value.className = "iref-oh-row-value";
      value.textContent = row.value;

      item.appendChild(copy);
      item.appendChild(value);
      root.appendChild(item);
    });
  }

  function renderSummaryPanel(summary) {
    currentSummary = summary || currentSummary;

    const panel = ensureSummaryPanel();

    if (!panel || !currentSummary) {
      return;
    }

    const view = buildFilteredView(currentSummary, activeFilters);
    const syncPill = panel.querySelector("#iref-oh-sync-pill");
    const startInput = panel.querySelector("#iref-oh-filter-from");
    const endInput = panel.querySelector("#iref-oh-filter-to");
    const periodCopy = panel.querySelector("#iref-oh-period-copy");
    const metricsRoot = panel.querySelector("#iref-oh-metrics");
    const spendRoot = panel.querySelector("#iref-oh-spend-list");
    const gainRoot = panel.querySelector("#iref-oh-gain-list");
    const paymentRoot = panel.querySelector("#iref-oh-payment-list");
    const factRoot = panel.querySelector("#iref-oh-fact");
    const noteRoot = panel.querySelector("#iref-oh-note");

    if (startInput) {
      startInput.min = currentSummary.dateRange?.minDateKey || "";
      startInput.max = currentSummary.dateRange?.maxDateKey || "";
      startInput.value = view.filters.startDateKey || "";
    }

    if (endInput) {
      endInput.min = currentSummary.dateRange?.minDateKey || "";
      endInput.max = currentSummary.dateRange?.maxDateKey || "";
      endInput.value = view.filters.endDateKey || "";
    }

    if (syncPill) {
      syncPill.textContent = `Last sync ${formatSyncTime(currentSummary.syncedAt)}`;
    }

    if (periodCopy) {
      periodCopy.textContent = buildPeriodLabel(currentSummary, view);
    }

    if (metricsRoot) {
      metricsRoot.innerHTML = "";
      renderMetric(
        metricsRoot,
        "Gross Spend",
        view.grossSpend,
        "Before gift credits and auto credits.",
        ""
      );
      renderMetric(
        metricsRoot,
        "Content Gross",
        view.contentGross,
        "Exact content total inside this range.",
        "highlight"
      );
      renderMetric(
        metricsRoot,
        "Hosted Gross",
        view.hostedGross,
        "Hosted sessions isolated as their own category.",
        "highlight"
      );
      renderMetric(
        metricsRoot,
        "Gained / Credited",
        view.gainedTotal,
        "Gift recharge, auto credit, participation and refunds.",
        "gain"
      );
      renderMetric(
        metricsRoot,
        "Net Out-Of-Pocket",
        view.netOutOfPocket,
        "After gift recharge, iRacing credits and auto credits.",
        ""
      );
      renderMetric(
        metricsRoot,
        "Auto Credit Apply",
        view.autoCreditApplied,
        "Tracked separately because it is not tied to a single order.",
        "gain"
      );
    }

    renderRows(
      spendRoot,
      buildSpendRows(view),
      "No spend categories found in this period."
    );
    renderRows(
      gainRoot,
      buildGainRows(view),
      "No gifted or earned credits found in this period."
    );
    renderRows(
      paymentRoot,
      buildPaymentRows(view),
      "No payment mix data found in this period."
    );

    if (factRoot) {
      factRoot.innerHTML = "";
      buildCuriousFacts(view).forEach(function (line) {
        const item = document.createElement("div");
        item.className = "iref-oh-fact-item";
        item.textContent = line;
        factRoot.appendChild(item);
      });
    }

    if (noteRoot) {
      noteRoot.innerHTML = "";

      [
        "Spend category rows show gross first and net where the out-of-pocket amount differs.",
        "Net Out-Of-Pocket subtracts gift recharge applied, iRacing credits used and auto credit apply inside the selected period.",
        currentSummary.failedOrders
          ? `${currentSummary.failedOrders} invoice details could not be parsed and were skipped.`
          : "",
        view.unresolvedDollarUsage
          ? `${formatCurrency(
              view.unresolvedDollarUsage
            )} of iRacing Dollars usage in this period could not be matched back to a recharge source.`
          : "",
      ]
        .filter(Boolean)
        .forEach(function (line) {
          const item = document.createElement("div");
          item.textContent = line;
          noteRoot.appendChild(item);
        });
    }
  }

  function storeSummary(summary) {
    const storageKey = getPurchaseHistoryStorageKey();

    if (!storageKey) {
      return;
    }

    window.postMessage(
      {
        source: "irefined-bridge-request",
        requestId: `iref-history-${Date.now()}`,
        action: "storage-set",
        payload: {
          values: {
            [storageKey]: summary,
          },
        },
      },
      bridgeTargetOrigin
    );
  }

  async function syncHistory() {
    const orders = collectOrderRows();
    const adjustments = collectAdjustmentRows();
    const spendingCategories = createCategoryMap(categories.spending);
    const fundingCategories = createCategoryMap(categories.funding);
    const detailOrders = orders.filter(needsDetail);
    const rechargeOrders = orders.filter(isAccountRechargeOrder);
    const fetchedOrders = new Map();
    const orderRecords = new Map();
    const adjustmentRecords = [];
    let failedOrders = 0;
    let giftRechargeReceived = 0;
    let autoCreditApplied = 0;
    let selfRechargeApplied = 0;
    let giftedRechargeApplied = 0;
    let unresolvedDollarUsage = 0;

    orders.forEach(function (order) {
      if (isAccountRechargeOrder(order)) {
        bumpCategory(fundingCategories, "account-recharge", order.total);
        return;
      }

      if (isSubscriptionOrder(order) && order.total > 0) {
        bumpCategory(spendingCategories, "subscription", order.total);
        bumpCategory(fundingCategories, "direct-usd-paid", order.total);
        orderRecords.set(
          order.orderId,
          createOrderRecord(order, "subscription", {
            gross: order.total,
            directPaid: order.total,
            irDollarsUsed: 0,
            irCredits: 0,
            net: order.total,
          })
        );
        return;
      }

      if (!needsDetail(order) && order.total > 0) {
        bumpCategory(spendingCategories, "other", order.total);
        bumpCategory(fundingCategories, "direct-usd-paid", order.total);
        orderRecords.set(
          order.orderId,
          createOrderRecord(order, "other", {
            gross: order.total,
            directPaid: order.total,
            irDollarsUsed: 0,
            irCredits: 0,
            net: order.total,
          })
        );
      }
    });

    adjustments.forEach(function (adjustment) {
      const memo = normalizeText(adjustment.memo).toLowerCase();

      if (memo === "account recharge" && adjustment.amount > 0) {
        giftRechargeReceived = roundCurrency(
          giftRechargeReceived + adjustment.amount
        );
        bumpCategory(
          fundingCategories,
          "gift-or-manual-recharge",
          adjustment.amount,
          { allowNegative: true }
        );
        adjustmentRecords.push(
          createAdjustmentRecord(
            adjustment,
            "gift-recharge-received",
            "Gift Recharge Received",
            adjustment.amount
          )
        );
        return;
      }

      if (memo.includes("auto credit apply")) {
        autoCreditApplied = roundCurrency(
          autoCreditApplied + Math.abs(adjustment.amount)
        );
        adjustmentRecords.push(
          createAdjustmentRecord(
            adjustment,
            "auto-credit-applied",
            "Auto Credit Apply Used",
            adjustment.amount
          )
        );
        return;
      }

      if (memo.includes("participation credits")) {
        bumpCategory(
          fundingCategories,
          "participation-credits",
          adjustment.amount,
          { allowNegative: true }
        );
        adjustmentRecords.push(
          createAdjustmentRecord(
            adjustment,
            "participation-credits",
            "Participation Credits",
            adjustment.amount
          )
        );
        return;
      }

      if (memo.includes("refund")) {
        bumpCategory(fundingCategories, "refunds", adjustment.amount, {
          allowNegative: true,
        });
        adjustmentRecords.push(
          createAdjustmentRecord(adjustment, "refunds", "Refunds", adjustment.amount)
        );
        return;
      }

      if (memo.includes("credits") || memo.includes("exchange")) {
        bumpCategory(fundingCategories, "support-credits", adjustment.amount, {
          allowNegative: true,
        });
        adjustmentRecords.push(
          createAdjustmentRecord(
            adjustment,
            "support-credits",
            "Support Credits",
            adjustment.amount
          )
        );
      }
    });

    setSyncBadge(
      "Syncing purchase history...",
      `${detailOrders.length + rechargeOrders.length} invoice details pending.`,
      "#9ec1ff"
    );

    await limitConcurrency(
      orders.filter(function (order) {
        return needsDetail(order) || isAccountRechargeOrder(order);
      }),
      async function (order) {
        try {
          const detail = await fetchOrderDetail(order);
          fetchedOrders.set(order.orderId, detail);

          if (!isAccountRechargeOrder(order)) {
            const categoryKey = classifyDetailedOrder(order, detail);
            const orderValue = Math.abs(parseCurrency(detail.pretaxtotal));
            const directPaid = Math.abs(parseCurrency(detail.total));
            const irDollars = Math.abs(parseCurrency(detail.debits));
            const irCredits = Math.abs(parseCurrency(detail.credits));

            bumpCategory(spendingCategories, categoryKey, orderValue);
            bumpCategory(fundingCategories, "direct-usd-paid", directPaid);
            bumpCategory(fundingCategories, "iracing-dollars-used", irDollars);
            bumpCategory(fundingCategories, "iracing-credits-used", irCredits);

            const record = createOrderRecord(order, categoryKey, {
              gross: orderValue,
              directPaid: directPaid,
              irDollarsUsed: irDollars,
              irCredits: irCredits,
              net: 0,
            });

            if (!record.dateKey) {
              record.dateKey = extractDateKey(detail.detail_date);
              record.dateMs = dateKeyToMs(record.dateKey, false);
            }

            orderRecords.set(order.orderId, record);
          }
        } catch {
          failedOrders += 1;
        }
      },
      4
    );

    const dollarEvents = [];

    adjustments.forEach(function (adjustment, index) {
      const memo = normalizeText(adjustment.memo).toLowerCase();

      if (memo === "account recharge" && adjustment.amount > 0) {
        dollarEvents.push({
          type: "gift-recharge",
          amount: adjustment.amount,
          dateMs: dateKeyToMs(adjustment.dateKey, false),
          priority: 0,
          sortKey: index,
        });
      }
    });

    rechargeOrders.forEach(function (order) {
      const detail = fetchedOrders.get(order.orderId);

      dollarEvents.push({
        type: "self-recharge",
        amount: order.total,
        dateMs: detail?.detail_date_ms || dateKeyToMs(order.dateKey, false),
        priority: 0,
        sortKey: Number(order.orderId) || 0,
      });
    });

    detailOrders.forEach(function (order) {
      const detail = fetchedOrders.get(order.orderId);

      if (!detail) {
        return;
      }

      const irDollars = Math.abs(parseCurrency(detail.debits));

      if (irDollars <= 0) {
        return;
      }

      dollarEvents.push({
        type: "dollars-used",
        amount: irDollars,
        orderId: order.orderId,
        dateMs: detail.detail_date_ms || dateKeyToMs(order.dateKey, false),
        priority: 1,
        sortKey: Number(order.orderId) || 0,
      });
    });

    dollarEvents.sort(function (left, right) {
      if (left.dateMs !== right.dateMs) {
        return left.dateMs - right.dateMs;
      }

      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      return left.sortKey - right.sortKey;
    });

    const dollarBuckets = [];

    dollarEvents.forEach(function (event) {
      if (event.type === "gift-recharge") {
        dollarBuckets.push(
          createDollarBucket("gift-recharge", event.amount, event.dateMs)
        );
        return;
      }

      if (event.type === "self-recharge") {
        dollarBuckets.push(
          createDollarBucket("self-recharge", event.amount, event.dateMs)
        );
        return;
      }

      const allocation = allocateDollarUsage(dollarBuckets, event.amount);
      selfRechargeApplied = roundCurrency(
        selfRechargeApplied + allocation.selfRechargeApplied
      );
      giftedRechargeApplied = roundCurrency(
        giftedRechargeApplied + allocation.giftedRechargeApplied
      );
      unresolvedDollarUsage = roundCurrency(
        unresolvedDollarUsage + allocation.unresolvedDollarUsage
      );

      const record = orderRecords.get(event.orderId);

      if (record) {
        record.selfRechargeApplied = roundCurrency(
          record.selfRechargeApplied + allocation.selfRechargeApplied
        );
        record.giftedRechargeApplied = roundCurrency(
          record.giftedRechargeApplied + allocation.giftedRechargeApplied
        );
        record.unresolvedDollarUsage = roundCurrency(
          record.unresolvedDollarUsage + allocation.unresolvedDollarUsage
        );
      }
    });

    const spendingCategoryTotalsMap = {};

    categories.spending.forEach(function (item) {
      spendingCategoryTotalsMap[item.key] = {
        key: item.key,
        label: item.label,
        gross: 0,
        net: 0,
      };
    });

    orderRecords.forEach(function (record) {
      const totals = spendingCategoryTotalsMap[record.categoryKey];

      if (!totals) {
        return;
      }

      record.net = roundCurrency(
        Math.max(0, record.gross - record.giftedRechargeApplied - record.irCredits)
      );
      totals.gross = roundCurrency(totals.gross + record.gross);
      totals.net = roundCurrency(totals.net + record.net);
    });

    const spendingArray = buildCategoryArray(
      spendingCategories,
      categories.spending
    );
    const fundingArray = buildCategoryArray(fundingCategories, categories.funding);
    const spendingCategoryTotals = categories.spending.map(function (item) {
      return spendingCategoryTotalsMap[item.key];
    });
    const spentTotal = spendingArray.reduce(function (sum, item) {
      return sum + item.amount;
    }, 0);
    const earnedAppliedTotal = roundCurrency(
      giftedRechargeApplied + autoCreditApplied
    );
    const netSpent = roundCurrency(spentTotal - earnedAppliedTotal);
    const sortedOrderRecords = Array.from(orderRecords.values()).sort(function (
      left,
      right
    ) {
      if (left.dateKey !== right.dateKey) {
        return left.dateKey.localeCompare(right.dateKey);
      }

      return String(left.orderId).localeCompare(String(right.orderId));
    }).map(function (record) {
      return {
        dateKey: record.dateKey,
        dateMs: record.dateMs,
        categoryKey: record.categoryKey,
        gross: record.gross,
        directPaid: record.directPaid,
        irDollarsUsed: record.irDollarsUsed,
        irCredits: record.irCredits,
        giftedRechargeApplied: record.giftedRechargeApplied,
        selfRechargeApplied: record.selfRechargeApplied,
        unresolvedDollarUsage: record.unresolvedDollarUsage,
        net: record.net,
      };
    });
    const sortedAdjustmentRecords = adjustmentRecords.sort(function (left, right) {
      if (left.dateKey !== right.dateKey) {
        return left.dateKey.localeCompare(right.dateKey);
      }

      return left.key.localeCompare(right.key);
    });
    const dateRange = buildDateRange(sortedOrderRecords, sortedAdjustmentRecords);

    const summary = {
      version: 2,
      syncedAt: new Date().toISOString(),
      analyzedOrders: orders.length,
      adjustmentRowsAnalyzed: adjustments.length,
      detailOrdersAnalyzed: detailOrders.length,
      failedOrders: failedOrders,
      dateRange: dateRange,
      spendingCategories: spendingArray,
      spendingCategoryTotals: spendingCategoryTotals,
      fundingCategories: fundingArray,
      orderRecords: sortedOrderRecords,
      adjustmentRecords: sortedAdjustmentRecords,
      earnedCredits: {
        giftRechargeReceived: roundCurrency(giftRechargeReceived),
        giftRechargeApplied: roundCurrency(giftedRechargeApplied),
        autoCreditApplied: roundCurrency(autoCreditApplied),
        earnedAppliedTotal: earnedAppliedTotal,
        selfRechargeApplied: roundCurrency(selfRechargeApplied),
        unresolvedDollarUsage: roundCurrency(unresolvedDollarUsage),
      },
      totals: {
        spent: roundCurrency(spentTotal),
        netSpent: netSpent,
      },
    };

    storeSummary(summary);
    renderSummaryPanel(summary);

    setSyncBadge(
      "Purchase history synced.",
      `Gross ${spentTotal.toFixed(2)} USD, net ${netSpent.toFixed(
        2
      )} USD after gifted and auto-applied credits.`,
      failedOrders ? "#f7c65f" : "#7ef29a"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncHistory, { once: true });
  } else {
    syncHistory();
  }
})();
