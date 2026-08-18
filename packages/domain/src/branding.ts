// Real store logos, hotlinked from each banner's own official domain via
// Google's public favicon service (never downloaded or committed into this
// repo) — the standard nominative-fair-use pattern for showing a real-world
// business's own mark to identify it, same as Yelp/Google Maps do. Demo
// (fictional) stores never get a real logo — see getBannerLogoUrl callers.
// (logo.clearbit.com, an earlier hotlink source, no longer resolves — its
// free public logo API was shut down after the 2023 HubSpot acquisition.)
const BANNER_DOMAIN: Record<string, string> = {
  KROGER: "kroger.com",
  RALPHS: "ralphs.com",
  "FRED MEYER": "fredmeyer.com",
  "KING SOOPERS": "kingsoopers.com",
  "CITY MARKET": "citymarket.com",
  "SMITH'S": "smithsfoodanddrug.com",
  QFC: "qfc.com",
  "FRY'S": "frysfood.com",
  DILLONS: "dillons.com",
  "BAKER'S": "bakersplus.com",
  GERBES: "gerbes.com",
  "PICK 'N SAVE": "picknsave.com",
  "PICK N SAVE": "picknsave.com",
  "METRO MARKET": "metromarket.net",
  "MARIANO'S": "marianos.com",
  "HARRIS TEETER": "harristeeter.com",
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
