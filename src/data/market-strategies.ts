import {
  cities,
  TRACKED_MARKET_COUNT,
  fmtRentChange,
  type CityCapRate,
} from './cap-rate-cities'
import { getMarketCities } from './market-queries'

// ---------------------------------------------------------------------------
// Score factors — the only inputs any strategy score uses. Each one is a
// sourced figure (ACS / HUD) or a formula over them; see cap-rate-cities.ts.
// ---------------------------------------------------------------------------

export type FactorKey = 'rentYield' | 'affordability' | 'rentChange' | 'homeValue'

export type ScoreFactor = {
  key: FactorKey
  label: string
  /** Raw value for a city; null = not available (factor skipped, weights re-based). */
  raw: (city: CityCapRate) => number | null
  format: (city: CityCapRate) => string
  /** true: a higher raw value scores higher. false: lower raw value scores higher. */
  higherIsBetter: boolean
}

const usd0 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const scoreFactors: Record<FactorKey, ScoreFactor> = {
  rentYield: {
    key: 'rentYield',
    label: 'Gross Rent Yield',
    raw: (c) => c.rentYield,
    format: (c) => `${c.rentYield.toFixed(1)}%`,
    higherIsBetter: true,
  },
  affordability: {
    key: 'affordability',
    label: 'Affordable Entry (Median Home Value)',
    raw: (c) => c.medianHomeValue,
    format: (c) => usd0.format(c.medianHomeValue),
    higherIsBetter: false,
  },
  rentChange: {
    key: 'rentChange',
    label: 'Rent Change (HUD 2BR FMR, 1 yr)',
    raw: (c) => c.rentChange,
    format: (c) => fmtRentChange(c.rentChange),
    higherIsBetter: true,
  },
  homeValue: {
    key: 'homeValue',
    label: 'Home Value Level (Demand Signal)',
    raw: (c) => c.medianHomeValue,
    format: (c) => usd0.format(c.medianHomeValue),
    higherIsBetter: true,
  },
}

/** Min/max of each factor across the tracked markets (scores are relative to them). */
function factorRange(f: ScoreFactor): { min: number; max: number } {
  const vals = cities.map(f.raw).filter((v): v is number => v != null)
  return { min: Math.min(...vals), max: Math.max(...vals) }
}
const ranges = Object.fromEntries(
  (Object.keys(scoreFactors) as FactorKey[]).map((k) => [k, factorRange(scoreFactors[k])])
) as Record<FactorKey, { min: number; max: number }>

/** 0–10 position of a city on one factor, relative to the tracked markets. Null if unavailable. */
export function factorScore(key: FactorKey, city: CityCapRate): number | null {
  const f = scoreFactors[key]
  const v = f.raw(city)
  if (v == null) return null
  const { min, max } = ranges[key]
  if (max === min) return 5
  const pos = ((v - min) / (max - min)) * 10
  return f.higherIsBetter ? pos : 10 - pos
}

export type StrategyWeight = { factor: FactorKey; weightPct: number }

/** Weighted average of factor scores; weights of unavailable factors are dropped and the rest re-based. */
export function scoreCity(weights: StrategyWeight[], city: CityCapRate): number {
  let sum = 0
  let wsum = 0
  for (const w of weights) {
    const s = factorScore(w.factor, city)
    if (s == null) continue
    sum += s * w.weightPct
    wsum += w.weightPct
  }
  if (wsum === 0) return 0
  return Math.round((sum / wsum) * 10) / 10
}

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------

export type Strategy = {
  slug: string
  title: string
  shortTitle: string
  description: string
  metaTitle: string
  metaDescription: string
  weights: StrategyWeight[]
  scoreFn: (city: CityCapRate) => number
  scoreLabel: string
  scoreExplainer: string
  heroIntro: string
  methodology: string
  relatedCalculators: { href: string; label: string }[]
  relatedArticles: { href: string; label: string }[]
  /**
   * City-specific editorial insights keyed by city slug. A market page has
   * strategy-specific content only when its city has an entry here — see
   * hasStrategyCityInsight(). No unsourced figures in these strings.
   */
  cityInsights: Record<string, string>
}

const N = TRACKED_MARKET_COUNT

const METHOD_COMMON = `Each factor is scaled 0–10 relative to the lowest and highest of the ${N} tracked metros, then weighted. Inputs: median gross rent and median home value from the U.S. Census Bureau's American Community Survey (ACS 2024 1-year estimates, metro level); gross rent yield is annual median rent divided by median home value, before any expenses; rent change is HUD's two-bedroom Fair Market Rent, FY2026 vs FY2025. If a factor is unavailable for a metro, its weight is spread across the others. The score is a relative screen built from metro-wide medians — not a forecast, an appraisal, or investment advice.`

function makeStrategy(
  s: Omit<Strategy, 'scoreFn' | 'scoreExplainer' | 'methodology'> & { methodologyIntro: string }
): Strategy {
  const explainer =
    'Weighted composite: ' +
    s.weights
      .map((w) => `${scoreFactors[w.factor].label.toLowerCase()} (${w.weightPct}%)`)
      .join(', ') +
    `. Scale 0–10, relative to the ${N} tracked metros.`
  const { methodologyIntro, ...rest } = s
  return {
    ...rest,
    scoreFn: (city) => scoreCity(s.weights, city),
    scoreExplainer: explainer,
    methodology: `${methodologyIntro} ${METHOD_COMMON}`,
  }
}

/**
 * Appends a sourced data sentence (ACS 2024 / HUD FMR, from cap-rate-cities.ts)
 * to each editorial insight, so every insight carries at least one citable fact
 * and no employer or project claims that can go stale.
 */
function withDataNote(insights: Record<string, string>): Record<string, string> {
  const usd = (n: number) => usd0.format(n)
  return Object.fromEntries(
    Object.entries(insights).map(([slug, text]) => {
      const c = cities.find((x) => x.slug === slug)
      if (!c) return [slug, text]
      const rent =
        c.rentChange != null
          ? ` HUD’s two-bedroom Fair Market Rent there changed ${fmtRentChange(c.rentChange)} from FY2025 to FY2026.`
          : ''
      return [
        slug,
        `${text} Census ACS 2024 data put the ${c.metroName} metro’s median home value at ${usd(c.medianHomeValue)} and median gross rent at ${usd(c.medianRent)} a month.${rent}`,
      ]
    }),
  )
}

export const strategies: Strategy[] = [
  makeStrategy({
    slug: 'cash-flow',
    title: 'Best Cities for Cash Flow Investing in 2026',
    shortTitle: 'Cash Flow',
    description:
      'Markets ranked by cash flow potential — gross rent yield from Census rent and home-value data, plus recent rent change.',
    metaTitle: `Best Cities for Cash Flow Investing: ${N} Markets Ranked (2026)`,
    metaDescription: `${N} U.S. metros ranked for cash flow real estate investing, using Census ACS 2024 rent and home-value data and HUD Fair Market Rent changes. See the method and the numbers behind every rank.`,
    weights: [
      { factor: 'rentYield', weightPct: 80 },
      { factor: 'rentChange', weightPct: 20 },
    ],
    scoreLabel: 'Cash Flow Score',
    heroIntro:
      'Cash flow investing means buying property whose rent covers the mortgage, expenses, and reserves with money left over. The markets most likely to support that are the ones where typical rents are high relative to typical home values. This ranking screens metros on exactly that — gross rent yield built from Census rent and home-value medians — plus the most recent change in HUD Fair Market Rents.',
    methodologyIntro:
      'Cash Flow Score: gross rent yield (80%) — a year of median rent as a share of the median home value, before expenses; rent change (20%) — the latest year-over-year change in HUD’s two-bedroom Fair Market Rent.',
    relatedCalculators: [
      { href: '/calculators/rental-cashflow', label: 'Rental Cash Flow Calculator' },
      { href: '/calculators/cash-on-cash', label: 'Cash-on-Cash Return Calculator' },
      { href: '/calculators/cap-rate', label: 'Cap Rate Calculator' },
    ],
    relatedArticles: [
      { href: '/blog/best-cash-flow-markets-2026', label: 'Best Markets for Cash Flow Investing in 2026' },
      { href: '/blog/rental-property-investing-complete-guide', label: 'Rental Property Investing: Complete Guide' },
      { href: '/blog/how-to-buy-first-rental-property', label: 'How to Buy Your First Rental Property' },
    ],
    cityInsights: withDataNote({
      'detroit-mi':
        'Detroit’s cash-flow case rests on low entry prices relative to rents in parts of the metro, but results depend heavily on neighborhood selection: underwrite vacancy and rehab risk block by block, and favor areas with active renovation.',
      'cleveland-oh':
        'Cleveland’s cash-flow case is a large healthcare and education employment base against modest home prices. Property taxes are the main drag — pull the actual tax bill for each deal rather than estimating it.',
      'memphis-tn':
        'Memphis has a large stock of single-family rentals and an established turnkey industry, which makes it accessible for out-of-state investors — vet the turnkey provider and property manager as carefully as the property itself.',
      'indianapolis-in':
        'Indianapolis is a common first market for out-of-state investors: a diversified economy, Indiana landlord-tenant law that is generally considered landlord-friendly, and a large stock of modestly priced single-family homes.',
      'birmingham-al':
        'Birmingham’s cash-flow advantage is partly on the expense side: Alabama property taxes are generally low, so more of the rent reaches the bottom line than in high-tax states. Check insurance costs, which can offset part of that.',
      'kansas-city-mo':
        'Kansas City spans two states, so the same metro gives investors a choice of Missouri or Kansas tax and landlord-tenant rules — compare both before you pick a side of the state line.',
      'little-rock-ar':
        'Little Rock gets less attention from out-of-state investors than larger Southern metros, which can mean less competition for deals. Underwrite conservatively on rent growth and confirm local property-management capacity.',
      'oklahoma-city-ok':
        'Oklahoma City pairs cash-flow-friendly pricing with an economy that is less dependent on energy than it once was. Underwrite insurance carefully — severe-weather risk affects premiums across the metro.',
    }),
  }),
  makeStrategy({
    slug: 'brrrr',
    title: 'Best Cities for the BRRRR Strategy in 2026',
    shortTitle: 'BRRRR',
    description:
      'Markets ranked by BRRRR viability — affordable entry prices, gross rent yield, and recent rent change.',
    metaTitle: `Best Cities for BRRRR Investing: ${N} Markets Ranked (2026)`,
    metaDescription: `${N} U.S. metros ranked for the BRRRR strategy using Census ACS 2024 home values and rents and HUD Fair Market Rent changes. See where Buy, Rehab, Rent, Refinance, Repeat has the most room to work.`,
    weights: [
      { factor: 'rentYield', weightPct: 40 },
      { factor: 'affordability', weightPct: 40 },
      { factor: 'rentChange', weightPct: 20 },
    ],
    scoreLabel: 'BRRRR Score',
    heroIntro:
      'The BRRRR strategy — Buy, Rehab, Rent, Refinance, Repeat — recycles the same capital into one property after another. It works best where purchase prices are low enough to buy and rehab without tying up much cash, and where rents are high enough relative to value that the refinanced property still cash flows. This ranking screens metros on both, plus the latest rent change.',
    methodologyIntro:
      'BRRRR Score: gross rent yield (40%) — higher means the refinanced property is more likely to cash flow; affordable entry (40%) — a lower median home value means lower acquisition and rehab capital; rent change (20%) — the latest change in HUD’s two-bedroom Fair Market Rent.',
    relatedCalculators: [
      { href: '/calculators/brrrr', label: 'BRRRR Calculator' },
      { href: '/calculators/rental-cashflow', label: 'Rental Cash Flow Calculator' },
      { href: '/calculators/cash-on-cash', label: 'Cash-on-Cash Return Calculator' },
    ],
    relatedArticles: [
      { href: '/blog/brrrr-method-complete-guide', label: 'The BRRRR Method: Complete Guide' },
      { href: '/blog/brrrr-rehab-cost-estimation', label: 'BRRRR Rehab Costs: How to Estimate' },
      { href: '/blog/hard-money-loans-explained', label: 'Hard Money Loans Explained' },
    ],
    cityInsights: withDataNote({
      'indianapolis-in':
        'Indianapolis is a popular BRRRR market because older housing stock needing renovation is widely available, and renovated comparable sales in established neighborhoods give refinance appraisals something to stand on.',
      'detroit-mi':
        'Detroit offers very low entry prices for BRRRR in parts of the metro, but be cautious — refinance appraisals can be difficult where there are too few comparable renovated sales. Focus on areas with active renovation so your after-repair value holds up.',
      'memphis-tn':
        'Memphis has a deep pool of older properties and contractor networks familiar with investor renovations, which can make rehab costs more predictable — get multiple bids and check references either way.',
      'birmingham-al':
        'Birmingham BRRRR deals benefit from Alabama’s generally low property taxes, which help post-refinance cash flow compared with similar deals in higher-tax states. Make sure renovated comparable sales support your after-repair value before you buy.',
      'cleveland-oh':
        'Cleveland has the low entry prices BRRRR needs, but property taxes reduce post-refinance cash flow. Confirm that renovated comparable sales exist on your street before counting on the refinance.',
      'oklahoma-city-ok':
        'Oklahoma City combines affordable entry prices with a growing metro. As with any BRRRR market, the refinance depends on renovated comparable sales near the property — check them before you buy.',
      'huntsville-al':
        'Huntsville is the growth outlier among BRRRR markets: an aerospace and defense economy and generally low Alabama property taxes. Entry prices are higher than in Midwest BRRRR markets, so less of the return comes from buying cheap.',
      'columbus-oh':
        'Columbus BRRRR deals draw on a large university and state-government employment base that supports rental demand after renovation. Ohio property taxes reduce post-refinance cash flow, so model them per property.',
    }),
  }),
  makeStrategy({
    slug: 'house-hacking',
    title: 'Best Cities for House Hacking in 2026',
    shortTitle: 'House Hacking',
    description:
      'Markets ranked by house hacking viability — affordable entry, rent relative to value, and recent rent change.',
    metaTitle: `Best Cities for House Hacking: ${N} Markets Ranked (2026)`,
    metaDescription: `${N} U.S. metros ranked for house hacking using Census ACS 2024 home values and rents and HUD Fair Market Rent changes. Find markets where tenant rent goes furthest against the mortgage.`,
    weights: [
      { factor: 'affordability', weightPct: 50 },
      { factor: 'rentYield', weightPct: 30 },
      { factor: 'rentChange', weightPct: 20 },
    ],
    scoreLabel: 'House Hack Score',
    heroIntro:
      'House hacking is a common first move in real estate investing: buy a 2–4 unit property with an owner-occupied loan (FHA allows 3.5% down), live in one unit, and rent the others to offset your mortgage. It works best where purchase prices are within reach and rents are high relative to home values. This ranking screens metros on both, plus the latest rent change.',
    methodologyIntro:
      'House Hack Score: affordable entry (50%) — a lower median home value makes the owner-occupied loan easier to qualify for and the payment smaller; gross rent yield (30%) — how far rent goes against the price; rent change (20%) — the latest change in HUD’s two-bedroom Fair Market Rent.',
    relatedCalculators: [
      { href: '/calculators/mortgage', label: 'Mortgage/DSCR Calculator' },
      { href: '/calculators/rental-cashflow', label: 'Rental Cash Flow Calculator' },
      { href: '/calculators/cash-on-cash', label: 'Cash-on-Cash Return Calculator' },
    ],
    relatedArticles: [
      { href: '/blog/house-hacking-101-live-for-free', label: 'House Hacking 101: Live for Free' },
      { href: '/blog/how-to-buy-first-rental-property', label: 'How to Buy Your First Rental Property' },
      { href: '/blog/how-to-screen-tenants', label: 'How to Screen Tenants: Complete Checklist' },
    ],
    cityInsights: withDataNote({
      'indianapolis-in':
        'Indianapolis has small multifamily properties in established neighborhoods — and as the on-site landlord, you should pick a building you would actually want to live in, not just one that pencils.',
      'kansas-city-mo':
        'Kansas City has 2–4 unit properties in livable, central neighborhoods, and moderate prices help the math on an owner-occupied loan. Compare Missouri and Kansas rules if you are open to either side of the state line.',
      'louisville-ky':
        'Louisville’s older urban neighborhoods include duplexes and small multifamily buildings suited to house hacking, and walkable areas help attract tenants for the other unit.',
      'columbus-oh':
        'Columbus house hacking benefits from a large university population and a broad employment base. Units near campus turn over every year; neighborhoods farther out tend to attract longer-term tenants.',
      'huntsville-al':
        'Huntsville is the growth pick for house hacking: an aerospace and defense economy and generally low Alabama property taxes. Entry prices are higher than in Midwest markets, so the owner-occupied loan does more of the work.',
      'oklahoma-city-ok':
        'Oklahoma City offers affordable small multifamily properties, which keeps the owner-occupied loan payment manageable. Check insurance costs early — they can change the math.',
      'des-moines-ia':
        'Des Moines has an insurance and financial-services employment base and less competition from large investors than bigger metros, which helps a first-time house hacker find a 2–4 unit property.',
      'richmond-va':
        'Richmond combines East Coast livability with older small multifamily stock in its central neighborhoods, where students and young professionals keep rental demand steady.',
    }),
  }),
  makeStrategy({
    slug: 'appreciation',
    title: 'Best Cities for Real Estate Appreciation in 2026',
    shortTitle: 'Appreciation',
    description:
      'Markets screened for appreciation-oriented investing — recent rent change and home-value level.',
    metaTitle: `Best Cities for Real Estate Appreciation: ${N} Metros Ranked (2026)`,
    metaDescription: `${N} U.S. metros screened for appreciation-oriented investing using HUD Fair Market Rent changes and Census ACS 2024 home values. A transparent screen, not a price forecast.`,
    weights: [
      { factor: 'rentChange', weightPct: 60 },
      { factor: 'homeValue', weightPct: 40 },
    ],
    scoreLabel: 'Appreciation Score',
    heroIntro:
      'Appreciation investing is the long game — buying where demand is pushing values up, accepting thinner cash flow today for equity growth later. Nobody can forecast home prices from a spreadsheet, so this ranking is a simple screen on two sourced signals: how fast rents are moving (HUD Fair Market Rents) and how much buyers already pay for housing in the metro (Census median home value).',
    methodologyIntro:
      'Appreciation Score: rent change (60%) — the latest year-over-year change in HUD’s two-bedroom Fair Market Rent, a sign of current demand; home value level (40%) — a higher median home value shows buyers already pay a premium to live there. HUD’s FMR methodology can move a metro’s figure sharply in one year, so read this score as a screen, not a prediction.',
    relatedCalculators: [
      { href: '/calculators/cash-on-cash', label: 'Cash-on-Cash Return Calculator' },
      { href: '/calculators/cap-rate', label: 'Cap Rate Calculator' },
      { href: '/calculators/mortgage', label: 'Mortgage/DSCR Calculator' },
    ],
    relatedArticles: [
      { href: '/blog/building-real-estate-portfolio', label: 'Building a Portfolio: From 1 to 10 Properties' },
      { href: '/blog/real-estate-investing-beginners-guide-2026', label: 'Real Estate Investing: Beginner\'s Guide 2026' },
      { href: '/blog/real-estate-tax-strategies-guide', label: 'Tax Strategies for Real Estate Investors' },
    ],
    cityInsights: withDataNote({
      'raleigh-nc':
        'Raleigh’s appreciation thesis rests on the Research Triangle’s technology, life-sciences and university employment base. Appreciation is never guaranteed — underwrite the deal so it survives flat prices.',
      'austin-tx':
        'Austin has a large technology employment base, while a wave of new apartment supply has weighed on rents. Buying for appreciation here means underwriting for flat or falling rents in the near term.',
      'charlotte-nc':
        'Charlotte is a major banking center with a growing financial-services and technology employment base. Underwrite the deal on today’s rent rather than on the appreciation you hope for.',
      'phoenix-az':
        'Phoenix has drawn large semiconductor and manufacturing investment, and the metro spans a wide range of entry prices. Buying for appreciation means underwriting for flat prices in the near term.',
      'nashville-tn':
        'Nashville is now usually treated as an appreciation market rather than a cash-flow one. Tennessee has no state income tax on wages, which supports in-migration — but entry prices leave less room for error.',
      'boise-id':
        'Boise is a smaller metro where in-migration has driven demand. With prices high relative to rents, an appreciation play here depends on holding through flat years.',
      'huntsville-al':
        'Huntsville combines a federal aerospace and defense employment base with generally low Alabama property taxes — a market where investors look for both cash flow and appreciation.',
      'jacksonville-fl':
        'Jacksonville draws on Florida in-migration with more affordable entry than Miami, Tampa or Orlando, and a port and financial-services sector add diversity. Florida has no state income tax; insurance costs are the line to watch.',
    }),
  }),
]

/** True when a strategy has city-specific editorial content for this city. */
export function hasStrategyCityInsight(strategySlug: string, citySlug: string): boolean {
  const strategy = strategies.find((s) => s.slug === strategySlug)
  if (!strategy) return false
  return Object.prototype.hasOwnProperty.call(strategy.cityInsights, citySlug)
}

export type CityWithScore = CityCapRate & {
  score: number
}

/** Returns all cities scored and sorted for a given strategy. */
export function getCitiesForStrategy(strategySlug: string): CityWithScore[] {
  const strategy = strategies.find((s) => s.slug === strategySlug)
  if (!strategy) return []

  return cities
    .map((city) => ({
      ...city,
      score: strategy.scoreFn(city),
    }))
    .sort((a, b) => b.score - a.score)
}

/** Async variant kept for existing callers; reads the same repo dataset. */
export async function fetchCitiesForStrategy(strategySlug: string): Promise<CityWithScore[]> {
  const strategy = strategies.find((s) => s.slug === strategySlug)
  if (!strategy) return []

  const marketCities = await getMarketCities()

  return marketCities
    .map((city) => ({
      ...city,
      score: strategy.scoreFn(city),
    }))
    .sort((a, b) => b.score - a.score)
}
