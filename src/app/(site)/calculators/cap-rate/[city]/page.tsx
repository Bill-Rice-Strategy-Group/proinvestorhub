import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd, breadcrumbJsonLd } from '@/components/json-ld'
import { CalculatorCTA } from '@/components/calculator-cta'
import {
  cities,
  getRelatedCities,
  rentYieldRank,
  rentYieldBand,
  computeRentYield,
  fmtYieldPct,
  fmtRentChange,
  ILLUSTRATIVE_OPEX_RATIO,
  TRACKED_MARKET_COUNT,
  ACS_SOURCE_LABEL,
  FMR_SOURCE_LABEL,
  DATA_GENERATED_AT,
  type YieldBand,
} from '@/data/cap-rate-cities'
import { strategies } from '@/data/market-strategies'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const BAND_INFO: Record<
  YieldBand,
  { label: string; color: string; bgColor: string; description: string }
> = {
  upper: {
    label: 'Upper third by gross rent yield',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description:
      'Typical rent is high relative to typical home value here compared with the other tracked metros — the profile of a cash-flow-oriented market. A higher yield can also reflect higher vacancy, higher operating costs, older housing stock, or weaker price growth, so check the neighborhood-level picture.',
  },
  middle: {
    label: 'Middle third by gross rent yield',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    description:
      'Rent relative to home value sits in the middle of the tracked metros. Returns here tend to depend on buying well and on the specific submarket.',
  },
  lower: {
    label: 'Lower third by gross rent yield',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    description:
      'Home values are high relative to rents compared with the other tracked metros. Investors here are usually relying more on appreciation than on cash flow.',
  },
}

function formatDataDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export function generateStaticParams() {
  return cities.map((city) => ({ city: city.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city: slug } = await params
  const city = cities.find((c) => c.slug === slug)
  if (!city) return {}

  const yieldPct = fmtYieldPct(city.rentYield)
  const title = `${city.city}, ${city.state} Rent Yield: ${yieldPct} (Gross) — Cap Rate vs Rent Yield`
  const description = `Gross rent yield for the ${city.metroName} metro is ${yieldPct}: median rent × 12 ÷ median home value (Census ACS 2024). See how that relates to cap rate, the source, and a free cap rate calculator for ${city.city} deals.`

  return {
    title,
    description,
    alternates: { canonical: `/calculators/cap-rate/${slug}` },
    openGraph: {
      title,
      description,
    },
  }
}

export default async function CityCapRatePage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city: slug } = await params
  const city = cities.find((c) => c.slug === slug)
  if (!city) notFound()

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://proinvestorhub.com'

  const rating = BAND_INFO[rentYieldBand(city.slug)]
  const math = computeRentYield(city.medianRent, city.medianHomeValue)
  const opexPct = Math.round(ILLUSTRATIVE_OPEX_RATIO * 100)
  const dataDate = formatDataDate(DATA_GENERATED_AT)
  const relatedSlugs = getRelatedCities(city.slug)
  const relatedCities = relatedSlugs
    .map((s) => cities.find((c) => c.slug === s))
    .filter(Boolean) as typeof cities

  const rank = rentYieldRank(slug)

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: baseUrl },
          { name: 'Calculators', url: `${baseUrl}/calculators` },
          { name: 'Cap Rate', url: `${baseUrl}/calculators/cap-rate` },
          {
            name: `${city.city}, ${city.state}`,
            url: `${baseUrl}/calculators/cap-rate/${city.slug}`,
          },
        ])}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-8">
        <Link
          href="/calculators"
          className="hover:text-primary transition-colors"
        >
          Calculators
        </Link>
        <span className="mx-2">/</span>
        <Link
          href="/calculators/cap-rate"
          className="hover:text-primary transition-colors"
        >
          Cap Rate
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text">
          {city.city}, {city.state}
        </span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mb-10">
        <h1 className="text-3xl font-bold text-text sm:text-4xl">
          {city.city}, {city.state} Rent Yield vs Cap Rate
        </h1>
        <p className="mt-3 text-lg text-text-muted leading-7">
          Estimated from Census rent and home-value data for the{' '}
          {city.metroName} metro area
        </p>
        <p className="mt-1 text-xs text-text-light">
          Source: U.S. Census Bureau, {ACS_SOURCE_LABEL} (median gross rent,
          median home value){city.rentChange != null && <>; {FMR_SOURCE_LABEL}</>}.
          {dataDate && <> Data file generated {dataDate}.</>}
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">Gross Rent Yield</p>
          <p className="mt-1 text-3xl font-bold text-primary tabular-nums">
            {fmtYieldPct(city.rentYield)}
          </p>
          <p className="mt-1 text-xs text-text-light">
            #{rank} of {cities.length} tracked metros &bull; see Quick Math
          </p>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">Median Home Value</p>
          <p className="mt-1 text-3xl font-bold text-text tabular-nums">
            {formatCurrency(city.medianHomeValue)}
          </p>
          <p className="mt-1 text-xs text-text-light">Owner-occupied homes, metro</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">Median Gross Rent</p>
          <p className="mt-1 text-3xl font-bold text-text tabular-nums">
            {formatCurrency(city.medianRent)}
          </p>
          <p className="mt-1 text-xs text-text-light">
            Per month, incl. tenant-paid utilities &bull;{' '}
            {formatCurrency(city.medianRent * 12)}/yr
          </p>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm text-text-muted">Rent-to-Value Ratio</p>
          <p className="mt-1 text-3xl font-bold text-text tabular-nums">
            {(city.rentToPrice * 100).toFixed(2)}%
          </p>
          <p className="mt-1 text-xs text-text-light">
            Monthly rent &divide; home value &bull;{' '}
            {city.rentToPrice >= 0.01 ? 'Meets 1% rule' : 'Below 1% rule'}
          </p>
        </div>
      </div>

      {/* Yield band */}
      <div className={`rounded-xl border p-6 mb-10 ${rating.bgColor}`}>
        <div className="flex items-start gap-4">
          <div>
            <p className="text-sm font-semibold text-text">
              Where {city.city} Sits
            </p>
            <p className={`mt-1 text-2xl font-bold ${rating.color}`}>
              {rating.label}
            </p>
            <p className="mt-2 text-sm text-text-muted leading-6">
              {rating.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          {/* Market Snapshot */}
          <section>
            <h2 className="text-2xl font-bold text-text">Market Snapshot</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <tbody className="text-text-muted">
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-6 font-medium text-text">
                      Geography
                    </td>
                    <td className="py-3">
                      {city.metroName} metropolitan statistical area
                      {city.cbsa && <> (CBSA {city.cbsa})</>}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-medium text-text">
                      Rent Change (1 yr)
                    </td>
                    <td className="py-3 tabular-nums">
                      {city.rentChange != null ? (
                        <>
                          <span
                            className={
                              city.rentChange > 0
                                ? 'text-emerald-600'
                                : city.rentChange < 0
                                  ? 'text-red-600'
                                  : ''
                            }
                          >
                            {fmtRentChange(city.rentChange)}
                          </span>
                          <span className="ml-2 text-text-light">
                            HUD 2BR Fair Market Rent, {city.fmrAreaName}:{' '}
                            {formatCurrency(city.fmrPrev2br ?? 0)} (FY2025) &rarr;{' '}
                            {formatCurrency(city.fmr2br ?? 0)} (FY2026)
                          </span>
                        </>
                      ) : (
                        <span className="text-text-light">
                          Not available — no HUD Fair Market Rent area is
                          matched to this metro in our data.
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-text-light leading-5">
              We do not show vacancy, property-tax, population or income
              figures for this market: our dataset does not include a sourced
              figure for them. Check the county assessor for the tax rate on a
              specific property.
            </p>
          </section>

          {/* Investor Takeaway */}
          <section>
            <h2 className="text-2xl font-bold text-text">
              Investor Takeaway
            </h2>
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-text-muted leading-7">
                {city.investorTakeaway}
              </p>
            </div>
          </section>

          {/* Quick Math */}
          <section>
            <h2 className="text-2xl font-bold text-text">Quick Math</h2>
            <p className="mt-2 text-sm text-text-muted leading-6">
              Gross rent yield for a home at the metro median value renting at
              the metro median rent, before any expenses or financing:
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-border/50 pb-3">
                <span className="text-text-muted">
                  Annual Gross Rent ({formatCurrency(city.medianRent)} &times; 12)
                </span>
                <span className="tabular-nums font-medium text-text">
                  {formatCurrency(math.annualRent)}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-3">
                <span className="text-text-muted">&divide; Median Home Value</span>
                <span className="tabular-nums font-medium text-text">
                  {formatCurrency(city.medianHomeValue)}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-semibold text-text">Gross Rent Yield</span>
                <span className="tabular-nums font-semibold text-primary">
                  {fmtYieldPct(math.rentYield)}
                </span>
              </div>
            </div>

            <h3 className="mt-8 text-lg font-semibold text-text">
              From rent yield to cap rate (illustration)
            </h3>
            <p className="mt-2 text-sm text-text-muted leading-6">
              A cap rate is net operating income (NOI) &divide; value, so it is
              always lower than gross yield once vacancy, property tax,
              insurance, maintenance, management and reserves are paid. Using
              the {opexPct}% rule of thumb purely as an illustration — not a
              measured figure for {city.city}:
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-border/50 pb-3">
                <span className="text-text-muted">
                  Illustrative expenses ({opexPct}% of {formatCurrency(math.annualRent)})
                </span>
                <span className="tabular-nums text-red-500">
                  ({formatCurrency(math.illustrativeOpex)})
                </span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-3">
                <span className="text-text-muted">Illustrative NOI</span>
                <span className="tabular-nums text-text">
                  {formatCurrency(math.illustrativeNoi)}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-text-muted">
                  Illustrative cap rate (NOI &divide; {formatCurrency(city.medianHomeValue)})
                </span>
                <span className="tabular-nums text-text">
                  {fmtYieldPct(math.illustrativeNetYield)}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-text-light leading-5">
              Formula: gross rent yield = median gross rent &times; 12 &divide;
              median home value. Rent is the median across all renter-occupied
              units (mostly apartments) and value is the median owner-occupied
              home, both for the whole {city.metroName} metro, not the city
              proper — so this is a market-level comparison, not the yield or
              cap rate any specific property will earn. Real expenses vary
              widely by property and state. Educational only; not investment
              advice. Run your own numbers with the calculator below.
            </p>
          </section>

          {/* CTA to calculator */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
            <h2 className="text-xl font-bold text-text">
              Analyze a Specific Deal in {city.city}
            </h2>
            <p className="mt-2 text-text-muted">
              Use our free cap rate calculator to run the numbers on any
              property with your actual income and expense figures.
            </p>
            <Link
              href="/calculators/cap-rate"
              className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
            >
              Open Cap Rate Calculator
            </Link>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Compare Other Markets */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-text uppercase tracking-wide">
              Compare Other Markets
            </h3>
            <p className="mt-1 text-xs text-text-light">Gross rent yield, same method</p>
            <div className="mt-4 space-y-3">
              {relatedCities.map((related) => (
                <Link
                  key={related.slug}
                  href={`/calculators/cap-rate/${related.slug}`}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <div>
                    <p className="text-sm font-medium text-text group-hover:text-primary transition-colors">
                      {related.city}, {related.state}
                    </p>
                    <p className="text-xs text-text-light">
                      {formatCurrency(related.medianHomeValue)} median value
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-text">
                    {fmtYieldPct(related.rentYield)}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/calculators/cap-rate/cities"
              className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:text-primary-light transition-colors"
            >
              View All {TRACKED_MARKET_COUNT} Markets &rarr;
            </Link>
          </div>

          {/* Strategy Rankings */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-text uppercase tracking-wide">
              Strategy Rankings
            </h3>
            <div className="mt-4 space-y-3">
              {strategies.map((s) => {
                const score = s.scoreFn(city)
                return (
                  <Link
                    key={s.slug}
                    href={`/markets/${s.slug}/${city.slug}`}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 text-sm font-medium text-text hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all"
                  >
                    <span>{s.shortTitle}</span>
                    <span className="font-bold text-primary">{score.toFixed(1)}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Newsletter */}
          <div className="sticky top-24">
            <CalculatorCTA context={`cap-rate-city-${city.slug}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
