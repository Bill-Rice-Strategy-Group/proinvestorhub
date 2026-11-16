import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from '@/components/json-ld'
import { encodeCalculatorState } from '@/lib/calculator-utils'
import { CalculatorCTA } from '@/components/calculator-cta'
import { StrategyScoreBreakdown } from '@/components/strategy-score-breakdown'
import { CityStrategyComparison } from '@/components/city-strategy-comparison'
import { strategies, hasStrategyCityInsight } from '@/data/market-strategies'
import {
  cities,
  computeRentYield,
  fmtYieldPct,
  fmtRentChange,
  ILLUSTRATIVE_OPEX_RATIO,
  TRACKED_MARKET_COUNT,
  ACS_SOURCE_LABEL,
  FMR_SOURCE_LABEL,
  type CityCapRate,
} from '@/data/cap-rate-cities'
import {
  fetchCityForStrategyPage,
  generateCityStrategyFAQs,
  fetchAllStrategyScores,
  stateMetadata,
} from '@/data/city-strategy-helpers'
import { getDataFreshness } from '@/data/market-queries'

export function generateStaticParams() {
  return strategies.flatMap((s) =>
    cities.map((c) => ({ strategy: s.slug, city: c.slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ strategy: string; city: string }>
}): Promise<Metadata> {
  const { strategy: strategySlug, city: citySlug } = await params
  const strategy = strategies.find((s) => s.slug === strategySlug)
  const city = cities.find((c) => c.slug === citySlug)
  if (!strategy || !city) return {}

  const title = `${strategy.shortTitle} Investing in ${city.city}, ${city.state} 2026 | ProInvestorHub`
  const description = `${strategy.shortTitle} analysis for the ${city.metroName} metro: score, Census-based market data (gross rent yield ${fmtYieldPct(city.rentYield)}), and how it compares to the other ${TRACKED_MARKET_COUNT - 1} metros we track. Educational research for real estate investors.`

  return {
    title,
    description,
    alternates: { canonical: `/markets/${strategySlug}/${citySlug}` },
    openGraph: { title, description },
    // Only pages with strategy-specific editorial content are indexed; the rest
    // reuse the city's generic text and the same metro data as the cap-rate page.
    ...(hasStrategyCityInsight(strategySlug, citySlug)
      ? {}
      : { robots: { index: false, follow: true } }),
  }
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
})

export default async function CityStrategyPage({
  params,
}: {
  params: Promise<{ strategy: string; city: string }>
}) {
  const { strategy: strategySlug, city: citySlug } = await params
  const strategy = strategies.find((s) => s.slug === strategySlug)
  if (!strategy) notFound()

  const [data, freshness] = await Promise.all([
    fetchCityForStrategyPage(strategySlug, citySlug),
    getDataFreshness(),
  ])
  if (!data) notFound()

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://proinvestorhub.com'
  const cityName = `${data.city}, ${data.state}`
  const otherStrategies = strategies.filter((s) => s.slug !== strategySlug)
  const allScores = await fetchAllStrategyScores(citySlug)
  const faqs = generateCityStrategyFAQs(strategy, data, data.score, data.rank)
  const lastUpdated = freshness.dataUpdatedAt
    ? new Date(`${freshness.dataUpdatedAt}T00:00:00Z`).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : null
  const stateInfo = stateMetadata[data.state]

  // Strategy-specific key metrics
  const keyMetrics = getKeyMetrics(strategySlug, data)

  // Investment thesis
  const insight = strategy.cityInsights[data.slug]
  const thesis = insight ?? data.investorTakeaway

  // Quick math — identical formula and inputs to /calculators/cap-rate/[city]
  const math = computeRentYield(data.medianRent, data.medianHomeValue)
  const opexPct = Math.round(ILLUSTRATIVE_OPEX_RATIO * 100)

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: baseUrl },
          { name: 'Markets', url: `${baseUrl}/markets` },
          {
            name: strategy.shortTitle,
            url: `${baseUrl}/markets/${strategySlug}`,
          },
          {
            name: `${data.city}, ${data.state}`,
            url: `${baseUrl}/markets/${strategySlug}/${citySlug}`,
          },
        ])}
      />
      <JsonLd data={faqJsonLd(faqs)} />

      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          href="/markets"
          className="hover:text-primary transition-colors"
        >
          Markets
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/markets/${strategySlug}`}
          className="hover:text-primary transition-colors"
        >
          {strategy.shortTitle}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text">{cityName}</span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mb-10">
        <h1 className="text-3xl font-bold text-text sm:text-4xl">
          {strategy.shortTitle} Investing in {cityName}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
            {strategy.scoreLabel}: {data.score.toFixed(1)}/10
          </span>
          <span className="text-sm text-text-muted">
            Ranked #{data.rank} of {TRACKED_MARKET_COUNT} metros
          </span>
        </div>
        <p className="mt-3 text-lg text-text-muted leading-7">
          Data-driven {strategy.shortTitle.toLowerCase()} analysis for{' '}
          {cityName} — score breakdown, key investment metrics, and how it
          compares to other markets.
        </p>
        <p className="mt-2 text-xs text-text-light">
          Figures describe the {data.metroName} metro area. Sources: U.S.
          Census Bureau, {ACS_SOURCE_LABEL} (median gross rent, median home
          value){data.rentChange != null && <>; {FMR_SOURCE_LABEL}</>}.
          {lastUpdated && <> Data file generated {lastUpdated}.</>}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          {/* Score Breakdown */}
          <StrategyScoreBreakdown
            components={data.breakdown}
            totalScore={data.score}
            scoreLabel={strategy.scoreLabel}
          />

          {/* Key Metrics */}
          <section>
            <h2 className="text-2xl font-bold text-text mb-4">
              Key Metrics for {strategy.shortTitle}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {keyMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-border bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-xl font-bold text-text">
                    {metric.value}
                  </p>
                  {metric.note && (
                    <p className="mt-0.5 text-xs text-text-light">
                      {metric.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Investment Thesis */}
          <section>
            <h2 className="text-2xl font-bold text-text mb-4">
              {strategy.shortTitle} Investment Thesis
            </h2>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-text-muted leading-7">{thesis}</p>
            </div>
          </section>

          {/* Comparison Table */}
          <CityStrategyComparison
            currentCity={data}
            nearbyRanked={data.nearbyRanked}
            strategySlug={strategySlug}
            scoreLabel={strategy.scoreLabel}
            currentRank={data.rank}
          />

          {/* Quick Math */}
          <section>
            <h2 className="text-2xl font-bold text-text mb-4">
              Quick Math: Gross Rent Yield
            </h2>
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">
                    Annual Gross Rent ({usd.format(data.medianRent)}/mo &times; 12)
                  </span>
                  <span className="font-medium text-text">
                    {usd.format(math.annualRent)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">&divide; Median Home Value</span>
                  <span className="font-medium text-text">
                    {usd.format(data.medianHomeValue)}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span className="text-text">Gross Rent Yield</span>
                  <span className="text-primary">{fmtYieldPct(math.rentYield)}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>
                    Illustration only: cap rate if {opexPct}% of rent went to
                    operating expenses
                  </span>
                  <span>{fmtYieldPct(math.illustrativeNetYield)}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-text-light leading-5">
                Same method as our{' '}
                <Link href={`/calculators/cap-rate/${citySlug}`} className="underline hover:text-primary">
                  {data.city} rent yield vs cap rate page
                </Link>
                : metro median gross rent and median home value (Census ACS 2024
                1-year), before any expenses. A cap rate is NOI &divide; value,
                so it is lower than gross yield once vacancy, taxes, insurance,
                maintenance and management are paid; the {opexPct}% line uses
                the &ldquo;50% rule&rdquo; of thumb as an illustration, not a
                measured figure. A market-level screen, not the return on any
                specific property; educational only, not investment advice.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-bold text-text mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-white p-6 shadow-sm"
                >
                  <h3 className="font-semibold text-text">{faq.question}</h3>
                  <p className="mt-2 text-sm text-text-muted leading-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
            <h2 className="text-xl font-bold text-text">
              Run Your Own Numbers for {data.city}
            </h2>
            <p className="mt-2 text-text-muted">
              Use our free calculators pre-filled with {cityName} market data,
              or adjust the numbers for your specific deal.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={`/calculators/cap-rate?s=${encodeCalculatorState({
                  purchasePrice: data.medianHomeValue,
                  grossRent: data.medianRent * 12,
                  vacancy: 0,
                  propertyTax: 0,
                  insurance: 0,
                  maintenance: 0,
                  management: 0,
                  // Illustrative 50%-rule expenses as one line — replace with real figures.
                  otherExpenses: Math.round(math.illustrativeOpex),
                })}`}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-primary-dark hover:bg-accent-light transition-colors"
              >
                Cap Rate Calculator ({data.city} Data)
              </Link>
              {strategy.relatedCalculators.map((calc) => (
                <Link
                  key={calc.href}
                  href={calc.href}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
                >
                  {calc.label}
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* All Strategies for This City */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-text uppercase tracking-wide">
              {data.city} by Strategy
            </h3>
            <div className="mt-4 space-y-3">
              {allScores.map(({ strategy: s, score }) => (
                <Link
                  key={s.slug}
                  href={`/markets/${s.slug}/${citySlug}`}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                    s.slug === strategySlug
                      ? 'border-primary/40 bg-primary/5 text-primary'
                      : 'border-border/50 text-text hover:border-primary/40 hover:text-primary hover:shadow-sm'
                  }`}
                >
                  <span>{s.shortTitle}</span>
                  <span className="font-bold">{score.toFixed(1)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Market Data */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-text uppercase tracking-wide">
              Market Data
            </h3>
            <div className="mt-4 space-y-3">
              <Link
                href={`/calculators/cap-rate/${citySlug}`}
                className="block rounded-lg border border-border/50 px-4 py-3 text-sm font-medium text-text hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all"
              >
                {data.city} Rent Yield vs Cap Rate
              </Link>
              <Link
                href={`/markets/${strategySlug}`}
                className="block rounded-lg border border-border/50 px-4 py-3 text-sm font-medium text-text hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all"
              >
                All {strategy.shortTitle} Rankings
              </Link>
              {stateInfo && (
                <Link
                  href={`/markets/states/${stateInfo.slug}`}
                  className="block rounded-lg border border-border/50 px-4 py-3 text-sm font-medium text-text hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all"
                >
                  All {stateInfo.name} Markets
                </Link>
              )}
              <Link
                href="/calculators/cap-rate/cities"
                className="block rounded-lg border border-border/50 px-4 py-3 text-sm font-medium text-text hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all"
              >
                Full {TRACKED_MARKET_COUNT}-Metro Data Table
              </Link>
            </div>
          </div>

          {/* Find Financing */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-text uppercase tracking-wide">
              Find Financing
            </h3>
            <p className="mt-2 text-xs text-text-muted">
              Compare lenders for your {data.city} investment
            </p>
            <div className="mt-4 space-y-3">
              {stateInfo && (
                <Link
                  href={`/lenders/dscr-loans/${stateInfo.slug}`}
                  className="block rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm font-medium text-text hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all"
                >
                  DSCR Lenders in {stateInfo.name}
                </Link>
              )}
              {stateInfo && (
                <Link
                  href={`/lenders/hard-money-loans/${stateInfo.slug}`}
                  className="block rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm font-medium text-text hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all"
                >
                  Hard Money in {stateInfo.name}
                </Link>
              )}
              <Link
                href="/lenders"
                className="block rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm font-medium text-primary hover:border-primary/40 hover:shadow-sm transition-all"
              >
                Full Lender Directory &rarr;
              </Link>
            </div>
          </div>

          {/* Other Strategies */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-text uppercase tracking-wide">
              Other Strategy Rankings
            </h3>
            <div className="mt-4 space-y-3">
              {otherStrategies.map((s) => (
                <Link
                  key={s.slug}
                  href={`/markets/${s.slug}`}
                  className="block rounded-lg border border-border/50 px-4 py-3 text-sm font-medium text-text hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all"
                >
                  Best Cities for {s.shortTitle}
                </Link>
              ))}
            </div>
          </div>

          {/* Related Guides */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-text uppercase tracking-wide">
              Related Guides
            </h3>
            <div className="mt-4 space-y-3">
              {strategy.relatedArticles.map((article) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="block rounded-lg border border-border/50 px-4 py-3 text-sm font-medium text-text hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all"
                >
                  {article.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="sticky top-24">
            <CalculatorCTA context={`${strategySlug}-${citySlug}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Strategy-specific key metrics
// ---------------------------------------------------------------------------

function getKeyMetrics(strategySlug: string, city: CityCapRate) {
  const usdFmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  const rentYield = {
    label: 'Gross Rent Yield',
    value: fmtYieldPct(city.rentYield),
    note: 'Annual rent ÷ value, before expenses',
  }
  const rentToValue = {
    label: 'Rent-to-Value',
    value: `${(city.rentToPrice * 100).toFixed(2)}%`,
    note: city.rentToPrice >= 0.01 ? 'Meets 1% rule' : 'Below 1% rule',
  }
  const homeValue = {
    label: 'Median Home Value',
    value: usdFmt.format(city.medianHomeValue),
    note: 'Owner-occupied, metro',
  }
  const rent = {
    label: 'Median Gross Rent',
    value: `${usdFmt.format(city.medianRent)}/mo`,
    note: 'All rental units, metro',
  }
  const rentChange = {
    label: 'Rent Change (1 yr)',
    value: fmtRentChange(city.rentChange),
    note: city.rentChange != null ? 'HUD 2BR FMR, FY25→FY26' : 'No HUD FMR match',
  }

  switch (strategySlug) {
    case 'cash-flow':
      return [rentYield, rentToValue, rent, rentChange]
    case 'brrrr':
      return [homeValue, rentYield, rentToValue, rentChange]
    case 'house-hacking':
      return [
        { ...homeValue, note: `3.5% down: ${usdFmt.format(Math.round(city.medianHomeValue * 0.035))}` },
        rent,
        rentYield,
        rentChange,
      ]
    case 'appreciation':
      return [rentChange, homeValue, rent, rentYield]
    default:
      return []
  }
}
