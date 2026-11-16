/**
 * City market metrics — ONE sourced dataset for the cap-rate city pages
 * (/calculators/cap-rate/[city]), the strategy market pages
 * (/markets/[strategy]/[city]), the hubs, and the state roll-ups.
 *
 * Every number traces to a committed file:
 *   - Median gross rent, median home value: Census ACS 2024 1-year estimates,
 *     metropolitan statistical area (src/data/rental-yield/metros.json,
 *     tables B25064 and B25077).
 *   - Rent change: HUD Fair Market Rents, two-bedroom, FY2026 vs FY2025, FMR area
 *     (src/data/fmr-rent/metros.json).
 * Everything else is computed from those by the formulas below, which the pages
 * also print. No vacancy, property-tax, population or income figures are shown:
 * no dataset in this repo carries them for these metros.
 *
 * Which source row each city uses lives in `city-market-sources.ts`.
 */
import { metros as acsMetros, yieldMeta } from './rental-yield'
import { metros as fmrMetros, fmrMeta } from './fmr-rent'
import { cityMarketSources } from './city-market-sources'

/**
 * Operating-expense allowance used for the cap-rate ESTIMATE: 50% of gross rent
 * (the "50% rule" of thumb), standing in for vacancy, property tax, insurance,
 * maintenance, management and capital reserves together. Real expenses vary
 * widely by property and state; the pages say so.
 */
export const OPEX_RATIO = 0.5

export type CityCapRate = {
  city: string
  state: string
  slug: string
  /** ACS metro (CBSA) name the figures describe — not the city proper. */
  metroName: string
  cbsa: string | null
  /** ACS B25077 median value, owner-occupied homes (metro). */
  medianHomeValue: number
  /** ACS B25064 median gross rent (contract rent + tenant-paid utilities), all renter-occupied units (metro). */
  medianRent: number
  /** medianRent / medianHomeValue (monthly rent-to-value). */
  rentToPrice: number
  /** (medianRent x 12) / medianHomeValue. */
  grossYield: number
  /** medianRent x 12 x (1 - OPEX_RATIO). */
  estimatedNoi: number
  /** Estimated cap rate in percent: estimatedNoi / medianHomeValue x 100. */
  capRate: number
  /** HUD two-bedroom FMR change FY2026 vs FY2025, in percent; null when no FMR row is mapped. */
  rentChange: number | null
  fmr2br: number | null
  fmrPrev2br: number | null
  fmrAreaName: string | null
  investorTakeaway: string
}

export const ACS_SOURCE_LABEL = `${yieldMeta.dataset} estimates, metro-level` // "ACS 2024 1-year estimates, metro-level"
export const ACS_SOURCE_FULL = `${yieldMeta.source} (tables B25064 median gross rent and B25077 median home value), metropolitan statistical areas`
export const FMR_SOURCE_LABEL = `HUD Fair Market Rents, two-bedroom, FY${fmrMeta.curYear} vs FY${fmrMeta.prevYear}`
export const DATA_VINTAGE_YEAR = yieldMeta.year
/** When the ACS file was generated (ISO date) — used as the pages' "data updated" stamp. */
export const DATA_GENERATED_AT = yieldMeta.generatedAt

export function computeCapRate(monthlyRent: number, homeValue: number): {
  annualRent: number
  opex: number
  noi: number
  capRate: number
} {
  const annualRent = monthlyRent * 12
  const opex = annualRent * OPEX_RATIO
  const noi = annualRent - opex
  return { annualRent, opex, noi, capRate: (noi / homeValue) * 100 }
}

function build(): CityCapRate[] {
  const out: CityCapRate[] = []
  for (const src of cityMarketSources) {
    const acs = acsMetros.find((m) => m.slug === src.acsSlug)
    // No sourced rent + value -> no figures for this city. Drop it rather than estimate.
    if (!acs || acs.medianGrossRent == null || acs.medianHomeValue == null) continue
    const fmr = src.fmrCode ? fmrMetros.find((m) => m.code === src.fmrCode) : undefined
    const { noi, capRate } = computeCapRate(acs.medianGrossRent, acs.medianHomeValue)
    out.push({
      city: src.city,
      state: src.state,
      slug: src.slug,
      metroName: acs.name,
      cbsa: acs.cbsa ?? null,
      medianHomeValue: acs.medianHomeValue,
      medianRent: acs.medianGrossRent,
      rentToPrice: acs.medianGrossRent / acs.medianHomeValue,
      grossYield: (acs.medianGrossRent * 12) / acs.medianHomeValue,
      estimatedNoi: noi,
      capRate,
      rentChange: fmr && fmr.yoyPct != null ? fmr.yoyPct * 100 : null,
      fmr2br: fmr?.fmr2br ?? null,
      fmrPrev2br: fmr?.fmrPrev2br ?? null,
      fmrAreaName: fmr?.name ?? null,
      investorTakeaway: src.investorTakeaway,
    })
  }
  return out.sort((a, b) => b.capRate - a.capRate)
}

/** The tracked markets, sorted by estimated cap rate, highest first. */
export const cities: CityCapRate[] = build()

/** Number of tracked markets — use this, never a hard-coded count. */
export const TRACKED_MARKET_COUNT = cities.length

export function getCityBySlug(slug: string): CityCapRate | undefined {
  return cities.find((c) => c.slug === slug)
}

/** 1-based rank by estimated cap rate among the tracked markets. */
export function capRateRank(slug: string): number {
  return cities.findIndex((c) => c.slug === slug) + 1
}

/** One decimal, as shown everywhere (title, cards, Quick Math, tables). */
export function fmtCapRate(rate: number): string {
  return `${rate.toFixed(1)}%`
}

export function fmtRentChange(v: number | null): string {
  if (v == null) return 'n/a'
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}%`
}

/**
 * Relative band: where a market's estimated cap rate sits among the tracked
 * markets (thirds by rank). Relative on purpose — the estimate compares
 * metro-wide medians, so its absolute level is not comparable to a quoted
 * property-level cap rate.
 */
export type CapRateBand = 'upper' | 'middle' | 'lower'
export function capRateBand(slug: string): CapRateBand {
  const rank = capRateRank(slug)
  const n = cities.length
  if (rank <= Math.ceil(n / 3)) return 'upper'
  if (rank <= Math.ceil((2 * n) / 3)) return 'middle'
  return 'lower'
}

/**
 * Returns a map of city slug to related/nearby city slugs for the "Compare Other Markets" section.
 * Grouped by geography and similar investment profile.
 */
export function getRelatedCities(slug: string): string[] {
  const regionMap: Record<string, string[]> = {
    // Ohio cluster
    'cleveland-oh': ['akron-oh', 'columbus-oh', 'cincinnati-oh', 'detroit-mi', 'pittsburgh-pa'],
    'columbus-oh': ['cleveland-oh', 'cincinnati-oh', 'indianapolis-in', 'pittsburgh-pa', 'dayton-oh'],
    'cincinnati-oh': ['columbus-oh', 'dayton-oh', 'louisville-ky', 'indianapolis-in', 'cleveland-oh'],
    'dayton-oh': ['cincinnati-oh', 'columbus-oh', 'akron-oh', 'indianapolis-in', 'toledo-oh'],
    'akron-oh': ['cleveland-oh', 'columbus-oh', 'pittsburgh-pa', 'dayton-oh', 'toledo-oh'],
    'toledo-oh': ['detroit-mi', 'cleveland-oh', 'dayton-oh', 'akron-oh', 'columbus-oh'],
    // Michigan
    'detroit-mi': ['cleveland-oh', 'toledo-oh', 'chicago-il', 'indianapolis-in', 'milwaukee-wi'],
    // Tennessee
    'memphis-tn': ['birmingham-al', 'little-rock-ar', 'nashville-tn', 'jackson-ms', 'knoxville-tn'],
    'nashville-tn': ['knoxville-tn', 'memphis-tn', 'louisville-ky', 'atlanta-ga', 'charlotte-nc'],
    'knoxville-tn': ['nashville-tn', 'charlotte-nc', 'atlanta-ga', 'charleston-sc', 'richmond-va'],
    // Indiana
    'indianapolis-in': ['columbus-oh', 'cincinnati-oh', 'louisville-ky', 'chicago-il', 'st-louis-mo'],
    // Alabama
    'birmingham-al': ['memphis-tn', 'huntsville-al', 'atlanta-ga', 'little-rock-ar', 'jacksonville-fl'],
    'huntsville-al': ['birmingham-al', 'nashville-tn', 'atlanta-ga', 'chattanooga-tn', 'knoxville-tn'],
    // Missouri
    'kansas-city-mo': ['st-louis-mo', 'des-moines-ia', 'oklahoma-city-ok', 'tulsa-ok', 'indianapolis-in'],
    'st-louis-mo': ['kansas-city-mo', 'indianapolis-in', 'memphis-tn', 'louisville-ky', 'chicago-il'],
    // Kentucky
    'louisville-ky': ['cincinnati-oh', 'indianapolis-in', 'nashville-tn', 'st-louis-mo', 'knoxville-tn'],
    // Pennsylvania
    'pittsburgh-pa': ['cleveland-oh', 'columbus-oh', 'philadelphia-pa', 'baltimore-md', 'akron-oh'],
    'philadelphia-pa': ['baltimore-md', 'pittsburgh-pa', 'richmond-va', 'chicago-il', 'charlotte-nc'],
    // Oklahoma
    'oklahoma-city-ok': ['tulsa-ok', 'kansas-city-mo', 'dallas-tx', 'little-rock-ar', 'san-antonio-tx'],
    'tulsa-ok': ['oklahoma-city-ok', 'kansas-city-mo', 'little-rock-ar', 'dallas-tx', 'memphis-tn'],
    // Arkansas
    'little-rock-ar': ['memphis-tn', 'tulsa-ok', 'oklahoma-city-ok', 'birmingham-al', 'dallas-tx'],
    // Texas
    'san-antonio-tx': ['houston-tx', 'austin-tx', 'dallas-tx', 'oklahoma-city-ok', 'phoenix-az'],
    'houston-tx': ['dallas-tx', 'san-antonio-tx', 'austin-tx', 'jacksonville-fl', 'atlanta-ga'],
    'dallas-tx': ['houston-tx', 'san-antonio-tx', 'austin-tx', 'oklahoma-city-ok', 'atlanta-ga'],
    'austin-tx': ['san-antonio-tx', 'dallas-tx', 'houston-tx', 'denver-co', 'nashville-tn'],
    // Florida
    'jacksonville-fl': ['tampa-fl', 'orlando-fl', 'savannah-ga', 'atlanta-ga', 'charlotte-nc'],
    'tampa-fl': ['orlando-fl', 'jacksonville-fl', 'savannah-ga', 'charlotte-nc', 'atlanta-ga'],
    'orlando-fl': ['tampa-fl', 'jacksonville-fl', 'savannah-ga', 'atlanta-ga', 'charlotte-nc'],
    // Georgia
    'atlanta-ga': ['charlotte-nc', 'nashville-tn', 'jacksonville-fl', 'birmingham-al', 'savannah-ga'],
    'savannah-ga': ['charleston-sc', 'jacksonville-fl', 'atlanta-ga', 'charlotte-nc', 'richmond-va'],
    // North Carolina
    'charlotte-nc': ['raleigh-nc', 'atlanta-ga', 'nashville-tn', 'charleston-sc', 'richmond-va'],
    'raleigh-nc': ['charlotte-nc', 'richmond-va', 'charleston-sc', 'nashville-tn', 'atlanta-ga'],
    // South Carolina
    'charleston-sc': ['savannah-ga', 'charlotte-nc', 'raleigh-nc', 'richmond-va', 'jacksonville-fl'],
    // Virginia
    'richmond-va': ['charlotte-nc', 'raleigh-nc', 'baltimore-md', 'philadelphia-pa', 'charleston-sc'],
    // Maryland
    'baltimore-md': ['philadelphia-pa', 'richmond-va', 'pittsburgh-pa', 'washington-dc', 'cleveland-oh'],
    // Illinois
    'chicago-il': ['milwaukee-wi', 'indianapolis-in', 'detroit-mi', 'st-louis-mo', 'minneapolis-mn'],
    // Wisconsin
    'milwaukee-wi': ['chicago-il', 'minneapolis-mn', 'detroit-mi', 'des-moines-ia', 'indianapolis-in'],
    // Minnesota
    'minneapolis-mn': ['milwaukee-wi', 'des-moines-ia', 'chicago-il', 'kansas-city-mo', 'denver-co'],
    // Iowa
    'des-moines-ia': ['minneapolis-mn', 'kansas-city-mo', 'milwaukee-wi', 'chicago-il', 'oklahoma-city-ok'],
    // Arizona
    'phoenix-az': ['las-vegas-nv', 'denver-co', 'salt-lake-city-ut', 'san-antonio-tx', 'austin-tx'],
    // Nevada
    'las-vegas-nv': ['phoenix-az', 'salt-lake-city-ut', 'denver-co', 'boise-id', 'sacramento-ca'],
    // Colorado
    'denver-co': ['salt-lake-city-ut', 'phoenix-az', 'boise-id', 'austin-tx', 'minneapolis-mn'],
    // Utah
    'salt-lake-city-ut': ['boise-id', 'denver-co', 'phoenix-az', 'las-vegas-nv', 'portland-or'],
    // Idaho
    'boise-id': ['salt-lake-city-ut', 'portland-or', 'denver-co', 'las-vegas-nv', 'sacramento-ca'],
    // California
    'sacramento-ca': ['san-francisco-ca', 'los-angeles-ca', 'san-diego-ca', 'portland-or', 'boise-id'],
    'san-diego-ca': ['los-angeles-ca', 'phoenix-az', 'sacramento-ca', 'las-vegas-nv', 'san-francisco-ca'],
    'los-angeles-ca': ['san-diego-ca', 'san-francisco-ca', 'sacramento-ca', 'phoenix-az', 'las-vegas-nv'],
    'san-francisco-ca': ['sacramento-ca', 'los-angeles-ca', 'san-diego-ca', 'portland-or', 'seattle-wa'],
    // Oregon
    'portland-or': ['seattle-wa', 'boise-id', 'sacramento-ca', 'san-francisco-ca', 'salt-lake-city-ut'],
    // Washington
    'seattle-wa': ['portland-or', 'san-francisco-ca', 'boise-id', 'sacramento-ca', 'denver-co'],
  }

  return regionMap[slug] || cities.filter((c) => c.slug !== slug).slice(0, 5).map((c) => c.slug)
}
