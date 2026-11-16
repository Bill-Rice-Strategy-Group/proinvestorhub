import {
  cities,
  TRACKED_MARKET_COUNT,
  OPEX_RATIO,
  fmtRentChange,
  type CityCapRate,
} from './cap-rate-cities'
import { getMarketCities } from './market-queries'

// ---------------------------------------------------------------------------
// Score factors — the only inputs any strategy score uses. Each one is a
// sourced figure (ACS / HUD) or a formula over them; see cap-rate-cities.ts.
// ---------------------------------------------------------------------------

export type FactorKey = 'capRate' | 'affordability' | 'rentChange' | 'homeValue'

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
  capRate: {
    key: 'capRate',
    label: 'Est. Cap Rate',
    raw: (c) => c.capRate,
    format: (c) => `${c.capRate.toFixed(1)}%`,
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
   * City-specific editorial insights keyed by city slug. No unsourced figures
   * in these strings.
   */
  cityInsights: Record<string, string>
}

const N = TRACKED_MARKET_COUNT

const METHOD_COMMON = `Each factor is scaled 0–10 relative to the lowest and highest of the ${N} tracked metros, then weighted. Inputs: median gross rent and median home value from the U.S. Census Bureau's American Community Survey (ACS 2024 1-year estimates, metro level); the estimated cap rate is annual median rent less a ${Math.round(OPEX_RATIO * 100)}% operating-expense allowance, divided by median home value; rent change is HUD's two-bedroom Fair Market Rent, FY2026 vs FY2025. If a factor is unavailable for a metro, its weight is spread across the others. The score is a relative screen built from metro-wide medians — not a forecast, an appraisal, or investment advice.`

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

export const strategies: Strategy[] = [
  makeStrategy({
    slug: 'cash-flow',
    title: 'Best Cities for Cash Flow Investing in 2026',
    shortTitle: 'Cash Flow',
    description:
      'Markets ranked by cash flow potential — estimated cap rate from Census rent and home-value data, plus recent rent change.',
    metaTitle: `Best Cities for Cash Flow Investing: ${N} Markets Ranked (2026)`,
    metaDescription: `${N} U.S. metros ranked for cash flow real estate investing, using Census ACS 2024 rent and home-value data and HUD Fair Market Rent changes. See the method and the numbers behind every rank.`,
    weights: [
      { factor: 'capRate', weightPct: 80 },
      { factor: 'rentChange', weightPct: 20 },
    ],
    scoreLabel: 'Cash Flow Score',
    heroIntro:
      'Cash flow investing means buying property whose rent covers the mortgage, expenses, and reserves with money left over. The markets most likely to support that are the ones where typical rents are high relative to typical home values. This ranking screens metros on exactly that — an estimated cap rate built from Census rent and home-value medians — plus the most recent change in HUD Fair Market Rents.',
    methodologyIntro:
      'Cash Flow Score: estimated cap rate (80%) — how much of a median home’s value the median rent could return after an operating-expense allowance; rent change (20%) — the latest year-over-year change in HUD’s two-bedroom Fair Market Rent.',
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
    cityInsights: {
      'detroit-mi': 'Detroit’s cash-flow case rests on low entry prices relative to rents in parts of the city, but results depend heavily on neighborhood selection. Focus on stabilizing areas with active renovation and avoid blocks with high vacancy; Corktown, Midtown, and Grandmont-Rosedale are areas local investors commonly cite.',
      'cleveland-oh': 'Cleveland delivers cash flow on the back of a healthcare and education economy (Cleveland Clinic, University Hospitals, Case Western). Tremont and Ohio City have drawn institutional investor activity. Property taxes are the main drag — factor them carefully on each deal.',
      'memphis-tn': 'Memphis is one of the best-known turnkey rental markets in the US. Multiple turnkey providers operate here, which makes it accessible for out-of-state investors — vet the provider as carefully as the property. The FedEx logistics hub supports blue-collar employment and rental demand.',
      'indianapolis-in': 'Indianapolis is a common first market for out-of-state investors: a diversified economy, Indiana landlord-tenant law that is generally considered landlord-friendly, and a large stock of modestly priced single-family homes.',
      'birmingham-al': 'Birmingham’s cash-flow advantage is on the expense side: Alabama property taxes are generally low, so more of the rent reaches the bottom line than in high-tax states. The UAB medical center anchors a large healthcare employment cluster.',
      'kansas-city-mo': 'Kansas City spans two states, giving investors a choice of Missouri or Kansas tax and landlord-tenant rules. The Crossroads and Midtown neighborhoods are redeveloping, offering both cash flow and appreciation upside.',
      'little-rock-ar': 'Little Rock is overlooked by most investors, which is part of why the numbers can still work. Lower competition and stable state-government and healthcare employment make it a quiet but steady cash-flow market.',
      'oklahoma-city-ok': 'Oklahoma City pairs cash-flow-friendly pricing with an economy that has diversified from energy into aerospace (Tinker Air Force Base) and healthcare, reducing the boom-bust cyclicality that historically affected Oklahoma markets.',
    },
  }),
  makeStrategy({
    slug: 'brrrr',
    title: 'Best Cities for the BRRRR Strategy in 2026',
    shortTitle: 'BRRRR',
    description:
      'Markets ranked by BRRRR viability — affordable entry prices, estimated cap rate, and recent rent change.',
    metaTitle: `Best Cities for BRRRR Investing: ${N} Markets Ranked (2026)`,
    metaDescription: `${N} U.S. metros ranked for the BRRRR strategy using Census ACS 2024 home values and rents and HUD Fair Market Rent changes. See where Buy, Rehab, Rent, Refinance, Repeat has the most room to work.`,
    weights: [
      { factor: 'capRate', weightPct: 40 },
      { factor: 'affordability', weightPct: 40 },
      { factor: 'rentChange', weightPct: 20 },
    ],
    scoreLabel: 'BRRRR Score',
    heroIntro:
      'The BRRRR strategy — Buy, Rehab, Rent, Refinance, Repeat — recycles the same capital into one property after another. It works best where purchase prices are low enough to buy and rehab without tying up much cash, and where rents are high enough relative to value that the refinanced property still cash flows. This ranking screens metros on both, plus the latest rent change.',
    methodologyIntro:
      'BRRRR Score: estimated cap rate (40%) — higher means the refinanced property is more likely to cash flow; affordable entry (40%) — a lower median home value means lower acquisition and rehab capital; rent change (20%) — the latest change in HUD’s two-bedroom Fair Market Rent.',
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
    cityInsights: {
      'indianapolis-in': 'Indianapolis is a popular BRRRR market because distressed properties are widely available in neighborhoods like Fountain Square and Irvington, and renovated comparable sales give refinance appraisals something to stand on.',
      'detroit-mi': 'Detroit offers very low entry prices for BRRRR in parts of the city, but be cautious — refinance appraisals can be difficult where there are too few comparable renovated sales. Focus on areas with active renovation so your after-repair value holds up.',
      'memphis-tn': 'Memphis has a deep pool of distressed properties and contractor networks familiar with investor renovations. The turnkey industry means you can find rehab crews who specialize in investor-grade work, keeping costs more predictable.',
      'birmingham-al': 'Birmingham BRRRR deals benefit from Alabama’s generally low property taxes, which help post-refinance cash flow compared with similar deals in higher-tax states. Southside and Avondale have seen renovation activity that supports after-repair values.',
      'cleveland-oh': 'Cleveland has strong BRRRR fundamentals, but property taxes reduce post-refinance cash flow. West-side neighborhoods have well-established renovation comps and hard money lenders who are comfortable lending there.',
      'oklahoma-city-ok': 'Oklahoma City combines affordable prices with a metro that keeps expanding outward from downtown. The south side and Capitol Hill neighborhoods have BRRRR potential as renovation activity spreads.',
      'huntsville-al': 'Huntsville is the growth outlier among BRRRR markets: an aerospace and defense economy (NASA Marshall, Redstone Arsenal) and generally low Alabama property taxes. Entry prices are higher than in Midwest BRRRR markets, so the refinance math depends more on appreciation.',
      'columbus-oh': 'Columbus BRRRR deals benefit from a growing economy that includes Intel’s planned chip plant in nearby Licking County. Linden and Hilltop have distressed inventory, and university and government employment support rental demand after renovation.',
    },
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
      { factor: 'capRate', weightPct: 30 },
      { factor: 'rentChange', weightPct: 20 },
    ],
    scoreLabel: 'House Hack Score',
    heroIntro:
      'House hacking is a common first move in real estate investing: buy a 2–4 unit property with an owner-occupied loan (FHA allows 3.5% down), live in one unit, and rent the others to offset your mortgage. It works best where purchase prices are within reach and rents are high relative to home values. This ranking screens metros on both, plus the latest rent change.',
    methodologyIntro:
      'House Hack Score: affordable entry (50%) — a lower median home value makes the owner-occupied loan easier to qualify for and the payment smaller; estimated cap rate (30%) — how far rent goes against the price; rent change (20%) — the latest change in HUD’s two-bedroom Fair Market Rent.',
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
    cityInsights: {
      'indianapolis-in': 'Indianapolis has small multifamily properties in livable neighborhoods such as Fountain Square, Irvington, and Broad Ripple — places you would actually want to live, which matters when you are the on-site landlord.',
      'kansas-city-mo': 'Kansas City duplexes in Westport, Midtown, and the Crossroads sit in livable neighborhoods where you would actually want to live — a crucial factor in house hacking. Moderate prices help the math on 2–4 unit properties.',
      'louisville-ky': 'Louisville’s shotgun-style duplexes in the Highlands and Germantown are classic house-hack properties. The walkable neighborhoods attract tenants for the other unit.',
      'columbus-oh': 'Columbus house hacking benefits from the Ohio State University population and a growing economy. Properties near campus are the obvious play, but the Short North and Clintonville also have strong rental demand with longer-term tenants.',
      'huntsville-al': 'Huntsville is the growth pick for house hacking: an aerospace and defense economy (NASA Marshall, Redstone Arsenal) and generally low Alabama property taxes. Entry prices are higher than in Midwest markets.',
      'oklahoma-city-ok': 'Oklahoma City offers affordable small multifamily properties. The Plaza District and Paseo Arts District are livable neighborhoods with good rental demand.',
      'des-moines-ia': 'Des Moines is a sleeper house hacking market: an insurance and financial-services economy provides stable tenant employment, and there is less competition from large investors than in bigger metros.',
      'richmond-va': 'Richmond combines East Coast livability with small multifamily stock in the Fan District and Church Hill, where VCU students and young professionals keep rental demand steady.',
    },
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
    cityInsights: {
      'raleigh-nc': 'Raleigh’s appreciation thesis rests on the Research Triangle job engine — tech, life sciences, and three major research universities — adding high-paying jobs. Apple, Google, and Epic Games have all announced expansions in the region.',
      'austin-tx': 'Austin prices corrected from their 2022 peak, which some investors see as a re-entry point. The employer base — Tesla, Apple, Samsung, Oracle — remains strong, while a large wave of new apartment supply is still being absorbed.',
      'charlotte-nc': 'Charlotte is a banking center (Bank of America headquarters, a large Wells Fargo presence) with a growing fintech sector. Urban redevelopment along the Rail Trail is reshaping NoDa and South End.',
      'phoenix-az': 'Phoenix semiconductor investment (TSMC, Intel) is building a tech corridor in the north and east Valley. The west Valley typically offers lower entry points for investors positioning for the long term.',
      'nashville-tn': 'Nashville has shifted from a cash-flow market to an appreciation play. No state income tax on wages and corporate expansions (Oracle, Amazon, AllianceBernstein) continue to drive demand; East Nashville and the Gulch have led price growth.',
      'boise-id': 'Boise saw rapid appreciation from 2020 to 2022 and prices have since leveled off. In-migration continues, but at a slower pace, and limited new supply supports the long-term thesis.',
      'huntsville-al': 'Huntsville is the dark-horse appreciation market. NASA, defense contractors, and the FBI all have major operations here, bringing high-income employment, and Alabama property taxes are generally low — a cash-flow-plus-appreciation hybrid.',
      'jacksonville-fl': 'Jacksonville benefits from Florida in-migration with more affordable entry than Miami, Tampa, or Orlando. The port and the financial-services sector add economic diversity beyond tourism. Florida has no state income tax.',
    },
  }),
]

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
