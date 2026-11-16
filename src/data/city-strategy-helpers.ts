import {
  cities,
  TRACKED_MARKET_COUNT,
  OPEX_RATIO,
  fmtRentChange,
  type CityCapRate,
} from './cap-rate-cities'
import {
  strategies,
  scoreFactors,
  factorScore,
  type Strategy,
  type CityWithScore,
} from './market-strategies'
import { getMarketCities } from './market-queries'

// ---------------------------------------------------------------------------
// State metadata
// ---------------------------------------------------------------------------

export type StateInfo = {
  name: string
  slug: string
  abbreviation: string
}

/** Maps every 2-letter state code present in the city data to full name + slug. */
export const stateMetadata: Record<string, StateInfo> = {
  AL: { name: 'Alabama', slug: 'alabama', abbreviation: 'AL' },
  AR: { name: 'Arkansas', slug: 'arkansas', abbreviation: 'AR' },
  AZ: { name: 'Arizona', slug: 'arizona', abbreviation: 'AZ' },
  CA: { name: 'California', slug: 'california', abbreviation: 'CA' },
  CO: { name: 'Colorado', slug: 'colorado', abbreviation: 'CO' },
  FL: { name: 'Florida', slug: 'florida', abbreviation: 'FL' },
  GA: { name: 'Georgia', slug: 'georgia', abbreviation: 'GA' },
  IA: { name: 'Iowa', slug: 'iowa', abbreviation: 'IA' },
  ID: { name: 'Idaho', slug: 'idaho', abbreviation: 'ID' },
  IL: { name: 'Illinois', slug: 'illinois', abbreviation: 'IL' },
  IN: { name: 'Indiana', slug: 'indiana', abbreviation: 'IN' },
  KY: { name: 'Kentucky', slug: 'kentucky', abbreviation: 'KY' },
  MD: { name: 'Maryland', slug: 'maryland', abbreviation: 'MD' },
  MI: { name: 'Michigan', slug: 'michigan', abbreviation: 'MI' },
  MN: { name: 'Minnesota', slug: 'minnesota', abbreviation: 'MN' },
  MO: { name: 'Missouri', slug: 'missouri', abbreviation: 'MO' },
  NC: { name: 'North Carolina', slug: 'north-carolina', abbreviation: 'NC' },
  NV: { name: 'Nevada', slug: 'nevada', abbreviation: 'NV' },
  NY: { name: 'New York', slug: 'new-york', abbreviation: 'NY' },
  OH: { name: 'Ohio', slug: 'ohio', abbreviation: 'OH' },
  OK: { name: 'Oklahoma', slug: 'oklahoma', abbreviation: 'OK' },
  OR: { name: 'Oregon', slug: 'oregon', abbreviation: 'OR' },
  PA: { name: 'Pennsylvania', slug: 'pennsylvania', abbreviation: 'PA' },
  SC: { name: 'South Carolina', slug: 'south-carolina', abbreviation: 'SC' },
  TN: { name: 'Tennessee', slug: 'tennessee', abbreviation: 'TN' },
  TX: { name: 'Texas', slug: 'texas', abbreviation: 'TX' },
  UT: { name: 'Utah', slug: 'utah', abbreviation: 'UT' },
  VA: { name: 'Virginia', slug: 'virginia', abbreviation: 'VA' },
  WA: { name: 'Washington', slug: 'washington', abbreviation: 'WA' },
  WI: { name: 'Wisconsin', slug: 'wisconsin', abbreviation: 'WI' },
}

// ---------------------------------------------------------------------------
// State helpers
// ---------------------------------------------------------------------------

/** Groups cities by their state abbreviation. */
export function getStatesFromCities(): Map<string, CityCapRate[]> {
  const map = new Map<string, CityCapRate[]>()
  for (const city of cities) {
    const list = map.get(city.state) ?? []
    list.push(city)
    map.set(city.state, list)
  }
  return map
}

/** Returns an array of unique states with their cities, sorted by city count descending. */
export function getStatesList(): Array<StateInfo & { cities: CityCapRate[] }> {
  const stateMap = getStatesFromCities()
  return Array.from(stateMap.entries())
    .map(([abbr, stateCities]) => ({
      ...(stateMetadata[abbr] ?? {
        name: abbr,
        slug: abbr.toLowerCase(),
        abbreviation: abbr,
      }),
      cities: stateCities,
    }))
    .sort((a, b) => b.cities.length - a.cities.length)
}

/**
 * Simple (unweighted) averages of the tracked metros in a state. Every input is
 * a sourced metro figure or the stated cap-rate formula; see cap-rate-cities.ts.
 */
export function getStateAverages(stateCities: CityCapRate[]) {
  const n = stateCities.length
  if (n === 0) {
    return {
      avgCapRate: 0,
      avgMedianHomeValue: 0,
      avgMedianRent: 0,
      avgRentToPrice: 0,
      avgRentChange: null as number | null,
    }
  }
  const sum = (fn: (c: CityCapRate) => number) =>
    stateCities.reduce((acc, c) => acc + fn(c), 0)
  const withRentChange = stateCities.filter((c) => c.rentChange != null)
  return {
    avgCapRate: Math.round((sum((c) => c.capRate) / n) * 10) / 10,
    avgMedianHomeValue: Math.round(sum((c) => c.medianHomeValue) / n),
    avgMedianRent: Math.round(sum((c) => c.medianRent) / n),
    avgRentToPrice: Math.round((sum((c) => c.rentToPrice) / n) * 10000) / 10000,
    avgRentChange:
      withRentChange.length > 0
        ? Math.round(
            (withRentChange.reduce((a, c) => a + (c.rentChange as number), 0) /
              withRentChange.length) *
              10
          ) / 10
        : null,
  }
}

// ---------------------------------------------------------------------------
// Score breakdown
// ---------------------------------------------------------------------------

export type ScoreComponent = {
  label: string
  weight: string
  weightPct: number
  rawValue: number | null
  rawFormatted: string
  /** 0–10, or null when the input is unavailable for this metro. */
  normalizedScore: number | null
}

/** Decompose a strategy score into its weighted components (same factors as scoreFn). */
export function getScoreBreakdown(
  strategy: Strategy,
  city: CityCapRate
): ScoreComponent[] {
  return strategy.weights.map((w) => {
    const f = scoreFactors[w.factor]
    const norm = factorScore(w.factor, city)
    return {
      label: f.label,
      weight: `${w.weightPct}%`,
      weightPct: w.weightPct,
      rawValue: f.raw(city),
      rawFormatted: f.raw(city) == null ? 'Not available' : f.format(city),
      normalizedScore: norm == null ? null : Math.round(norm * 10) / 10,
    }
  })
}

// ---------------------------------------------------------------------------
// City-for-strategy helpers
// ---------------------------------------------------------------------------

export type CityStrategyData = CityWithScore & {
  rank: number
  breakdown: ScoreComponent[]
  nearbyRanked: CityWithScore[]
}

/**
 * Returns a single city with its strategy score, rank, breakdown, and
 * comparison cities (3 above + 3 below in the ranking).
 */
export function getCityForStrategyPage(
  strategySlug: string,
  citySlug: string
): CityStrategyData | null {
  const strategy = strategies.find((s) => s.slug === strategySlug)
  if (!strategy) return null

  const allScored = cities
    .map((c) => ({ ...c, score: strategy.scoreFn(c) }))
    .sort((a, b) => b.score - a.score)

  const idx = allScored.findIndex((c) => c.slug === citySlug)
  if (idx === -1) return null

  const city = allScored[idx]
  const start = Math.max(0, idx - 3)
  const end = Math.min(allScored.length, idx + 4)
  const nearbyRanked = allScored.slice(start, end).filter((c) => c.slug !== citySlug)

  return {
    ...city,
    rank: idx + 1,
    breakdown: getScoreBreakdown(strategy, city),
    nearbyRanked,
  }
}

/** Returns the best strategy for a city (highest score). */
export function getBestStrategyForCity(
  city: CityCapRate
): { strategy: Strategy; score: number } {
  let best = { strategy: strategies[0], score: strategies[0].scoreFn(city) }
  for (let i = 1; i < strategies.length; i++) {
    const score = strategies[i].scoreFn(city)
    if (score > best.score) {
      best = { strategy: strategies[i], score }
    }
  }
  return best
}

/** Returns all 4 strategy scores for a city. */
export function getAllStrategyScores(
  city: CityCapRate
): Array<{ strategy: Strategy; score: number }> {
  return strategies.map((s) => ({ strategy: s, score: s.scoreFn(city) }))
}

// ---------------------------------------------------------------------------
// FAQ generation — every figure here is a sourced metro value or the page's
// stated formula.
// ---------------------------------------------------------------------------

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function generateCityStrategyFAQs(
  strategy: Strategy,
  city: CityCapRate,
  score: number,
  rank: number
): Array<{ question: string; answer: string }> {
  const cityName = `${city.city}, ${city.state}`
  const N = TRACKED_MARKET_COUNT
  const opexPct = Math.round(OPEX_RATIO * 100)
  const faqs: Array<{ question: string; answer: string }> = [
    {
      question: `What is the ${strategy.scoreLabel.toLowerCase()} for ${cityName}?`,
      answer: `${cityName} scores ${score.toFixed(1)} out of 10 on our ${strategy.scoreLabel.toLowerCase()}, ranking #${rank} of the ${N} metros we track. ${strategy.scoreExplainer}`,
    },
    {
      question: `What is the estimated cap rate in ${city.city}?`,
      answer: `Our estimate for the ${city.metroName} metro is ${city.capRate.toFixed(1)}%: the median gross rent of ${usd.format(city.medianRent)}/month (${usd.format(city.medianRent * 12)}/year), less a ${opexPct}% operating-expense allowance, divided by the median home value of ${usd.format(city.medianHomeValue)}. Rent and value are Census ACS 2024 1-year metro estimates. It is a market-level screen, not the cap rate of any specific property.`,
    },
    {
      question: `What is the rent-to-price ratio in ${city.city}?`,
      answer: `Median monthly rent is ${(city.rentToPrice * 100).toFixed(2)}% of the median home value in the ${city.metroName} metro (${usd.format(city.medianRent)} ÷ ${usd.format(city.medianHomeValue)}). ${city.rentToPrice >= 0.01 ? 'That meets the 1% rule of thumb at the metro level.' : 'That is below the 1% rule of thumb at the metro level — individual properties, especially small multifamily, can still pencil out.'}`,
    },
    {
      question: `How does ${city.city} compare to other ${strategy.shortTitle.toLowerCase()} markets?`,
      answer: `Among the ${N} metros we track, ${cityName} ranks #${rank} for ${strategy.shortTitle.toLowerCase()} investing. ${rank <= Math.ceil(N / 10) ? 'That puts it in the top tenth for this strategy.' : rank <= Math.ceil(N / 3) ? 'That puts it in the top third for this strategy.' : rank <= Math.ceil((2 * N) / 3) ? 'That puts it in the middle third for this strategy.' : 'That puts it in the bottom third for this strategy; it may rank better for a different approach.'}`,
    },
  ]

  switch (strategy.slug) {
    case 'cash-flow':
      faqs.push({
        question: `Has rent been rising in ${city.city}?`,
        answer:
          city.rentChange != null
            ? `HUD’s two-bedroom Fair Market Rent for the ${city.fmrAreaName} FMR area went from ${usd.format(city.fmrPrev2br ?? 0)} in FY2025 to ${usd.format(city.fmr2br ?? 0)} in FY2026 (${fmtRentChange(city.rentChange)}). FMRs are HUD’s 40th-percentile rent benchmark, so they move with the market but are not a measure of any one property’s rent.`
            : `We do not have a HUD Fair Market Rent series matched to the ${city.metroName} metro, so we do not show a rent-change figure for ${city.city}.`,
      })
      break
    case 'brrrr':
      faqs.push({
        question: `What does a median-priced home cost in ${city.city}?`,
        answer: `The median owner-occupied home value in the ${city.metroName} metro is ${usd.format(city.medianHomeValue)} (Census ACS 2024 1-year). BRRRR investors usually buy below that — distressed properties that need work — so use the median as a reference point for after-repair value, not as a purchase price.`,
      })
      break
    case 'house-hacking':
      faqs.push({
        question: `How much is 3.5% down on a median-priced home in ${city.city}?`,
        answer: `At the metro median home value of ${usd.format(city.medianHomeValue)}, a 3.5% FHA down payment would be ${usd.format(Math.round(city.medianHomeValue * 0.035))}. Small multifamily properties usually cost more than the median home, and FHA loan limits vary by county and unit count, so check the limit for the property you are considering.`,
      })
      break
    case 'appreciation':
      faqs.push({
        question: `What signals does the appreciation score use for ${city.city}?`,
        answer: `Two: the latest change in HUD’s two-bedroom Fair Market Rent (${city.rentChange != null ? `${fmtRentChange(city.rentChange)} for the ${city.fmrAreaName} FMR area` : 'not available for this metro'}) and the median home value (${usd.format(city.medianHomeValue)}, Census ACS 2024 1-year). We do not forecast prices; the score is a screen for where demand currently looks strongest.`,
      })
      break
  }

  return faqs
}

// ---------------------------------------------------------------------------
// Async variants (same repo dataset) — kept for existing callers
// ---------------------------------------------------------------------------

/**
 * Async version of getCityForStrategyPage that reads the repo dataset.
 */
export async function fetchCityForStrategyPage(
  strategySlug: string,
  citySlug: string
): Promise<CityStrategyData | null> {
  const strategy = strategies.find((s) => s.slug === strategySlug)
  if (!strategy) return null

  const liveCities = await getMarketCities()

  const allScored = liveCities
    .map((c) => ({ ...c, score: strategy.scoreFn(c) }))
    .sort((a, b) => b.score - a.score)

  const idx = allScored.findIndex((c) => c.slug === citySlug)
  if (idx === -1) return null

  const city = allScored[idx]
  const start = Math.max(0, idx - 3)
  const end = Math.min(allScored.length, idx + 4)
  const nearbyRanked = allScored
    .slice(start, end)
    .filter((c) => c.slug !== citySlug)

  return {
    ...city,
    rank: idx + 1,
    breakdown: getScoreBreakdown(strategy, city),
    nearbyRanked,
  }
}

/**
 * Async version of getStatesList that reads the repo dataset.
 */
export async function fetchStatesList(): Promise<
  Array<StateInfo & { cities: CityCapRate[] }>
> {
  const liveCities = await getMarketCities()
  const map = new Map<string, CityCapRate[]>()
  for (const city of liveCities) {
    const list = map.get(city.state) ?? []
    list.push(city)
    map.set(city.state, list)
  }
  return Array.from(map.entries())
    .map(([abbr, stateCities]) => ({
      ...(stateMetadata[abbr] ?? {
        name: abbr,
        slug: abbr.toLowerCase(),
        abbreviation: abbr,
      }),
      cities: stateCities,
    }))
    .sort((a, b) => b.cities.length - a.cities.length)
}

/**
 * Async version of getAllStrategyScores that reads the repo dataset.
 */
export async function fetchAllStrategyScores(
  citySlug: string
): Promise<Array<{ strategy: Strategy; score: number }>> {
  const liveCities = await getMarketCities()
  const city = liveCities.find((c) => c.slug === citySlug)
  if (!city) return []
  return strategies.map((s) => ({ strategy: s, score: s.scoreFn(city) }))
}

export function generateStateFAQs(
  stateName: string,
  stateCities: CityCapRate[]
): Array<{ question: string; answer: string }> {
  const avgs = getStateAverages(stateCities)
  const best = stateCities.reduce(
    (top, c) => (c.capRate > top.capRate ? c : top),
    stateCities[0]
  )

  return [
    {
      question: `How many real estate investment markets do you track in ${stateName}?`,
      answer: `We track ${stateCities.length} ${stateCities.length === 1 ? 'metro' : 'metros'} in ${stateName}: ${stateCities.map((c) => c.city).join(', ')}. Figures are metro-level Census ACS 2024 1-year estimates of median rent and home value, plus HUD Fair Market Rent changes.`,
    },
    {
      question: `What is the average estimated cap rate in ${stateName}?`,
      answer: `The simple average of our estimated cap rates across the tracked ${stateName} metros is ${avgs.avgCapRate.toFixed(1)}% (each estimate = median rent × 12, less a ${Math.round(OPEX_RATIO * 100)}% expense allowance, ÷ median home value). ${best.city} is highest at ${best.capRate.toFixed(1)}%. The average median home value is ${usd.format(avgs.avgMedianHomeValue)}.`,
    },
    {
      question: `Which metro in ${stateName} has the highest estimated cap rate?`,
      answer: `${best.city}, ${best.state} (the ${best.metroName} metro) has the highest estimated cap rate among our tracked ${stateName} metros at ${best.capRate.toFixed(1)}%, with a median home value of ${usd.format(best.medianHomeValue)} and median gross rent of ${usd.format(best.medianRent)}/month.`,
    },
  ]
}
