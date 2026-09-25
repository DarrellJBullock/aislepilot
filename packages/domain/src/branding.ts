// Real store logos, hotlinked from each banner's own official domain via
// Google's public favicon service (never downloaded or committed into this
// repo) — the standard nominative-fair-use pattern for showing a real-world
// business's own mark to identify it, same as Yelp/Google Maps do. Demo
// (fictional) stores never get a real logo — see getBannerLogoUrl callers.
// (logo.clearbit.com, an earlier hotlink source, no longer resolves — its
// free public logo API was shut down after the 2023 HubSpot acquisition.)
// Keyed by the actual `banner` code Kroger's live API returns (confirmed by
// querying real locations per state — it uses short internal codes like
// "HART" and "FRED", not the chain's storefront name), plus the friendly
// full name as a second key since other data sources (or future API
// changes) may use that instead.
const BANNER_DOMAIN: Record<string, string> = {
  KROGER: "kroger.com",
  RALPHS: "ralphs.com",
  FRED: "fredmeyer.com",
  "FRED MEYER": "fredmeyer.com",
  KINGSOOPERS: "kingsoopers.com",
  "KING SOOPERS": "kingsoopers.com",
  CITYMARKET: "citymarket.com",
  "CITY MARKET": "citymarket.com",
  SMITHS: "smithsfoodanddrug.com",
  "SMITH'S": "smithsfoodanddrug.com",
  QFC: "qfc.com",
  FRYS: "frysfood.com",
  "FRY'S": "frysfood.com",
  DILLONS: "dillons.com",
  BAKERS: "bakersplus.com",
  "BAKER'S": "bakersplus.com",
  GERBES: "gerbes.com",
  "PICK N SAVE": "picknsave.com",
  "PICK 'N SAVE": "picknsave.com",
  "METRO MARKET": "metromarket.net",
  MARIANOS: "marianos.com",
  "MARIANO'S": "marianos.com",
  HART: "harristeeter.com",
  "HARRIS TEETER": "harristeeter.com",
  FOOD4LESS: "food4less.com",
  "FOOD 4 LESS": "food4less.com",
  FOODSCO: "foodsco.net",
  "FOODS CO": "foodsco.net",
  JAYC: "jaycfoods.com",
  "JAY C": "jaycfoods.com",
  PAYLESS: "pay-less.com",
  "PAY LESS": "pay-less.com",
  RULER: "rulerfoods.com",
  "RULER FOODS": "rulerfoods.com",
};

function normalizeBanner(banner: string): string {
  return banner.trim().toUpperCase().replace(/\s+/g, " ");
}

/** undefined when the banner isn't a recognized real Kroger-family chain. */
export function getBannerLogoUrl(banner?: string): string | undefined {
  if (!banner) return undefined;
  const domain = BANNER_DOMAIN[normalizeBanner(banner)];
  if (!domain) return undefined;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

export interface KrogerFamilyBanner {
  /** The `banner` code Kroger's live API returns for this chain's stores. */
  code: string;
  name: string;
  /** Where its stores are, as confirmed by live store searches. */
  region: string;
}

/** Every Kroger-family storefront brand, for showing users what "counts". */
export const KROGER_FAMILY_BANNERS: KrogerFamilyBanner[] = [
  { code: "KROGER", name: "Kroger", region: "Midwest & South" },
  { code: "HART", name: "Harris Teeter", region: "DC, MD, VA, Carolinas & Southeast" },
  { code: "RALPHS", name: "Ralphs", region: "Southern California" },
  { code: "FOOD4LESS", name: "Food 4 Less", region: "California & Chicago area" },
  { code: "FOODSCO", name: "Foods Co", region: "Northern & Central California" },
  { code: "FRED", name: "Fred Meyer", region: "Pacific Northwest" },
  { code: "QFC", name: "QFC", region: "Washington & Oregon" },
  { code: "KINGSOOPERS", name: "King Soopers", region: "Colorado" },
  { code: "CITYMARKET", name: "City Market", region: "Western Colorado & Rockies" },
  { code: "SMITHS", name: "Smith's", region: "Utah, Nevada & the Mountain West" },
  { code: "FRYS", name: "Fry's", region: "Arizona" },
  { code: "DILLONS", name: "Dillons", region: "Kansas" },
  { code: "BAKERS", name: "Baker's", region: "Nebraska" },
  { code: "GERBES", name: "Gerbes", region: "Missouri" },
  { code: "PICK N SAVE", name: "Pick 'n Save", region: "Wisconsin" },
  { code: "METRO MARKET", name: "Metro Market", region: "Milwaukee area" },
  { code: "MARIANOS", name: "Mariano's", region: "Chicago area" },
  { code: "JAYC", name: "Jay C", region: "Indiana" },
  { code: "PAYLESS", name: "Pay Less", region: "Central Indiana" },
  { code: "RULER", name: "Ruler Foods", region: "Indiana, Ohio & Kentucky" },
];
