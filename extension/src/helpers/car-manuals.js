export const MANUALS_PAGE_URL = "https://www.iracing.com/resources/user-manuals/";

const MANUAL_INDEX = [
  { title: "NASCAR NextGen Cars", pdf: "https://s100.iracing.com/wp-content/uploads/2024/03/NASCAR-NextGen-Cars-Manual-V2.pdf" },
  { title: "ARCA Series Cars", pdf: "https://s100.iracing.com/wp-content/uploads/2025/03/ARCA_25_Manual_V1.pdf" },
  { title: "SRX", pdf: "https://s100.iracing.com/wp-content/uploads/2024/03/SRX_Manual_V3.pdf" },
  { title: "Legends Ford Coupe", pdf: "https://s100.iracing.com/wp-content/uploads/2025/03/Legends-Ford-Coupe_Manual_V1.pdf" },
  { title: "NASCAR Xfinity Series Cars", pdf: "https://s100.iracing.com/wp-content/uploads/2026/03/UM-NASCAR-Oreilly_Manual_V1.pdf" },
  { title: "Late Model Stock", pdf: "https://s100.iracing.com/wp-content/uploads/2024/09/Late-Model-Stock-Manual_V6.pdf" },
  { title: "Street Stocks", pdf: "https://s100.iracing.com/wp-content/uploads/2024/05/StreetStocks_Manual_V2.pdf" },
  { title: "NASCAR Craftsman Trucks", pdf: "https://s100.iracing.com/wp-content/uploads/2024/05/NASCAR-Trucks-Manual-V6.pdf" },
  { title: "Nascar Gen 4", pdf: "https://s100.iracing.com/wp-content/uploads/2025/06/NASCAR-Gen4-Cup-Cars.pdf" },
  { title: "Mini Stock", pdf: "https://s100.iracing.com/wp-content/uploads/2024/09/Mini_Stock_Manual-V1.pdf" },
  { title: "Acura NSX EVO22 GT3", pdf: "https://s100.iracing.com/wp-content/uploads/2024/12/Acura-GT3_Manual_V2.pdf" },
  { title: "Audi R8 LMS EVO II GT3", pdf: "https://s100.iracing.com/wp-content/uploads/2024/07/Audi-R8-LMS-EVO-II-GT3_Manual.pdf" },
  { title: "BMW M4 G82 GT4", pdf: "https://s100.iracing.com/wp-content/uploads/2024/12/BMW-M4-G82-GT4-Manual-V2.pdf" },
  { title: "BMW M8 GTE", pdf: "https://s100.iracing.com/wp-content/uploads/2024/09/BMW-M8-GTE_Manual_V2.pdf" },
  { title: "Ferrari 296 Challenge", pdf: "https://s100.iracing.com/wp-content/uploads/2025/06/Ferrari-296-Challenge.pdf" },
  { title: "Hyundai Veloster N TCR", pdf: "https://s100.iracing.com/wp-content/uploads/2025/03/Hyundai-Veloster-N-TC-Manual-V4.pdf" },
  { title: "Mazda MX-5 Cup", pdf: "https://s100.iracing.com/wp-content/uploads/2025/02/Global-Mazda-MX5_Manual_V2.pdf" },
  { title: "Mercedes-AMG GT3 2020", pdf: "https://s100.iracing.com/wp-content/uploads/2024/07/Mercedes-AMG-GT3-2020-Manual_V9.pdf" },
  { title: "Porsche 911 GT3 Cup (992.2)", pdf: "https://s100.iracing.com/wp-content/uploads/2026/01/Porsche-Cup-992.2-V1.pdf" },
  { title: "Toyota GR86", pdf: "https://s100.iracing.com/wp-content/uploads/2024/09/Toyota_GR86_Manual_V2.pdf" },
  { title: "Aston Martin GT3 EVO", pdf: "https://s100.iracing.com/wp-content/uploads/2026/01/Aston-Martin-GT3-Evo-V1.pdf" },
  { title: "Audi RS 3 LMS TCR", pdf: "https://s100.iracing.com/wp-content/uploads/2025/03/Audi_RS3_LMS_TCR_V2.pdf" },
  { title: "BMW M2 CSR", pdf: "https://s100.iracing.com/wp-content/uploads/2024/12/BMW-M2-CSR-Manual_V2.pdf" },
  { title: "Chevrolet Corvette Z06 GT3.R", pdf: "https://s100.iracing.com/wp-content/uploads/2024/06/Chevrolet-Corvette-Z06-GT3_manual_V2.pdf" },
  { title: "Ford Mustang GT3", pdf: "https://s100.iracing.com/wp-content/uploads/2024/06/Mustang-GT3_Manual_V2.pdf" },
  { title: "Hyundai Elantra N TCR", pdf: "https://s100.iracing.com/wp-content/uploads/2025/03/Hyundai-Elantra-N-TCR_V3.pdf" },
  { title: "McLaren 720s GT3", pdf: "https://s100.iracing.com/wp-content/uploads/2024/09/Mclaren-720S-GT3_V2.pdf" },
  { title: "Mercedes-AMG GT4", pdf: "https://s100.iracing.com/wp-content/uploads/2024/07/Mercedes-AMG-GT4-Manual-V2.pdf" },
  { title: "Porsche 718 Cayman GT4", pdf: "https://s100.iracing.com/wp-content/uploads/2024/07/Porsche-718-Cayman-GT4-Manual-V5.pdf" },
  { title: "Gen 3 Australian Supercars", pdf: "https://s100.iracing.com/wp-content/uploads/2025/06/Gen-3-Supercars-Manual_V5.pdf" },
  { title: "Aston Martin Vantage GT4", pdf: "https://s100.iracing.com/wp-content/uploads/2025/03/Aston-Vantage-GT4-Manual_V4.pdf" },
  { title: "BMW M4 GT3", pdf: "https://s100.iracing.com/wp-content/uploads/2024/07/BMW-M4-GT3-Manual_V3.pdf" },
  { title: "BMW M4 F82 GT4 - 2018", pdf: "https://s100.iracing.com/wp-content/uploads/2024/07/BMW-M4-GT4-V2.pdf" },
  { title: "Ferrari 296 GT3", pdf: "https://s100.iracing.com/wp-content/uploads/2024/06/Ferrari-296-GT3-V4.pdf" },
  { title: "Honda Civic Type R TCR", pdf: "https://s100.iracing.com/wp-content/uploads/2025/03/Honda-Civic-Type-R_TCR.pdf" },
  { title: "Lamborghini Huracan GT3 EVO", pdf: "https://s100.iracing.com/wp-content/uploads/2024/07/UM-Lamborghini-Huracan-GT3-Evo-V3.pdf" },
  { title: "McLaren 570S GT4", pdf: "https://s100.iracing.com/wp-content/uploads/2024/07/McLaren-570S-GT4-Manual-V2.pdf" },
  { title: "Porsche 911 GT3 R (992)", pdf: "https://s100.iracing.com/wp-content/uploads/2024/09/Porsche-911-GT3-R-992_V2.pdf" },
  { title: "Porsche Mission R", pdf: "https://s100.iracing.com/wp-content/uploads/2023/09/Porsche-Mission-R-real-Manual-V5-1.pdf" },
  { title: "Acura ARX-06 GTP", pdf: "https://s100.iracing.com/wp-content/uploads/2025/01/Acura-ARX-06-GTP-V2.pdf" },
  { title: "BMW M Hybrid V8", pdf: "https://s100.iracing.com/wp-content/uploads/2025/01/BMW-M-Hybrid-V8-V2.pdf" },
  { title: "Porsche 963 GTP", pdf: "https://s100.iracing.com/wp-content/uploads/2025/03/Porsche-963-GTP-V2.pdf" },
  { title: "Dallara P217 LMP2", pdf: "https://s100.iracing.com/wp-content/uploads/2025/03/UM-Dallara-P217-LMP2-V2.pdf" },
  { title: "Cadillac V-Series.R GTP", pdf: "https://s100.iracing.com/wp-content/uploads/2025/01/Cadillac-V-Series.R-GTP-V2.pdf" },
  { title: "Ligier JS P320", pdf: "https://s100.iracing.com/wp-content/uploads/2025/03/Ligier-JS-P320-V2.pdf" },
  { title: "Dallara iR-01", pdf: "https://s100.iracing.com/wp-content/uploads/2023/10/UM-Dallara-iR01-Manual.pdf" },
  { title: "Super Formula SF23", pdf: "https://s100.iracing.com/wp-content/uploads/2024/04/Super-Formula-SF23_V4.pdf" },
  { title: "Formula Vee", pdf: "https://s100.iracing.com/wp-content/uploads/2023/10/Formula-Vee-Manual.pdf" },
  { title: "Dallara IR18", pdf: "https://s100.iracing.com/wp-content/uploads/2026/01/Dallara-IR18-V3.pdf" },
  { title: "Super Formula Lights", pdf: "https://s100.iracing.com/wp-content/uploads/2024/03/Super-Formula-Lights_Manual_V1.pdf" },
  { title: "FIA F4", pdf: "https://s100.iracing.com/wp-content/uploads/2024/04/FIA-F4-Manual-V3.pdf" },
  { title: "Mercedes-AMG F1 W12 E Performance", pdf: "https://s100.iracing.com/wp-content/uploads/2023/10/UM-Mercedes-AMG-F1-W12-E-Performance-V2.pdf" },
  { title: "Northeast Dirt Modifieds (358 and 467)", pdf: "https://s100.iracing.com/wp-content/uploads/2023/10/UM-Big-Block-Modified-V2.pdf" },
  { title: "Dirt Micro Sprint", pdf: "https://s100.iracing.com/wp-content/uploads/2024/03/Dirt_Micro-Sprint_Manual.pdf" },
  { title: "Dirt Mini Stock", pdf: "https://s100.iracing.com/wp-content/uploads/2024/09/Dirt_Mini_Stock_Manual.pdf" },
  { title: "FIA Cross Car", pdf: "https://s100.iracing.com/wp-content/uploads/2026/01/FIA-Cross-Car-V1.pdf" },
  { title: "NASCAR Cup Series Cars (Gen 6)", pdf: "https://s100.iracing.com/wp-content/uploads/2023/10/UM-NASCAR-Cup-Series.pdf" },
  { title: "Ferrari 488 GT3 EVO 2020", pdf: "https://s100.iracing.com/wp-content/uploads/2023/10/Ferrari-488-GT3-EVO-2020.pdf" },
  { title: "Mercedes-AMG GT3", pdf: "https://s100.iracing.com/wp-content/uploads/2023/10/UM-Mercedes-AMG-GT3-Manual-V2.pdf" },
  { title: "Audi R8 LMS GT3", pdf: "https://s100.iracing.com/wp-content/uploads/2023/10/UM-Audi-R8-LMS-GT3-Manual.pdf" },
  { title: "Ford GT GT3", pdf: "https://s100.iracing.com/wp-content/uploads/2024/01/UM-Ford-GT-GT3-V2.pdf" },
  { title: "Porsche 911 GT3 R", pdf: "https://s100.iracing.com/wp-content/uploads/2023/10/UM-Porsche-911-GT3-R.pdf" },
  { title: "Ferrari 488 GT3", pdf: "https://s100.iracing.com/wp-content/uploads/2023/10/UM-Ferrari-488-GT3-Manual-V2.pdf" },
  { title: "McLaren MP4-12C GT3", pdf: "https://s100.iracing.com/wp-content/uploads/2024/01/UM-McLaren-MP4-12C-GT3-V3.pdf" },
  { title: "Porsche 911 GT3 Cup (992.1)", pdf: "https://s100.iracing.com/wp-content/uploads/2024/07/Porsche-911-GT3-Cup-992_Manual.pdf" },
  { title: "Shock Tuning Guide", pdf: "https://s100.iracing.com/wp-content/uploads/2021/08/Shock-Tuning-User-Guide.pdf" },
];

const STOPWORDS = new Set([
  "legacy",
  "manual",
  "guide",
  "cars",
  "car",
  "series",
  "gen",
  "evo",
  "cup",
  "manuals",
]);

const GENERIC_TOKENS = new Set([
  "gt3",
  "gt4",
  "gte",
  "gtp",
  "tcr",
  "lmp2",
  "road",
  "stock",
  "formula",
  "supercars",
  "nascar",
  "oval",
  "dirt",
  "prototype",
]);

const ALIAS_REPLACEMENTS = [
  [/cs racing/g, "csr"],
  [/gt3 r/g, "gt3r"],
  [/nsx evo22/g, "nsx evo 22"],
  [/mclaren/g, "mcLaren"],
  [/mx ?5/g, "mx5"],
  [/ir-?01/g, "ir01"],
];

function normalizeText(value) {
  let text = String(value || "").toLowerCase();

  if (typeof text.normalize === "function") {
    text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  ALIAS_REPLACEMENTS.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });

  return text
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/&#8211;/g, " ")
    .replace(/&amp;/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(
      (token) => token && !STOPWORDS.has(token) && token.length > 1
    );
}

function buildSpecificTokenSet(tokens) {
  return new Set(tokens.filter((token) => !GENERIC_TOKENS.has(token)));
}

function scoreManual(car, manual) {
  const carTitle = `${car?.car_make || ""} ${car?.car_model || ""} ${car?.car_name || ""}`;
  const carTokens = tokenize(carTitle);
  const manualTokens = tokenize(manual.title);

  if (!carTokens.length || !manualTokens.length) {
    return 0;
  }

  const manualTokenSet = new Set(manualTokens);
  const specificCarTokens = buildSpecificTokenSet(carTokens);
  const specificManualTokens = buildSpecificTokenSet(manualTokens);

  let overlap = 0;
  let specificOverlap = 0;

  carTokens.forEach((token) => {
    if (!manualTokenSet.has(token)) {
      return;
    }

    overlap += GENERIC_TOKENS.has(token) ? 1 : token.length >= 4 ? 3 : 2;

    if (specificManualTokens.has(token) || specificCarTokens.has(token)) {
      specificOverlap += 1;
    }
  });

  const carNorm = normalizeText(carTitle);
  const manualNorm = normalizeText(manual.title);
  let score = overlap;

  if (carNorm && manualNorm && (carNorm.includes(manualNorm) || manualNorm.includes(carNorm))) {
    score += 8;
  }

  if (specificOverlap > 0) {
    score += specificOverlap * 4;
  }

  if (
    (car?.car_make || "") &&
    manualNorm.includes(normalizeText(car.car_make || ""))
  ) {
    score += 2;
  }

  return score;
}

export function findCarManual(car) {
  if (!car || !car.car_name) {
    return null;
  }

  let bestMatch = null;
  let bestScore = 0;

  MANUAL_INDEX.forEach((manual) => {
    const score = scoreManual(car, manual);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = manual;
    }
  });

  return bestScore >= 7
    ? {
        title: bestMatch.title,
        pdf: bestMatch.pdf,
        score: bestScore,
      }
    : null;
}

export function buildCarManualLookup(cars = []) {
  const lookup = new Map();

  cars.forEach((car) => {
    const manual = findCarManual(car);

    if (manual) {
      lookup.set(car.car_id, manual);
    }
  });

  return lookup;
}

export function getManualIndex() {
  return MANUAL_INDEX.slice();
}
