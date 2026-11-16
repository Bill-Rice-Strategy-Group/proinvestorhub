import type { Metadata } from 'next'
import Link from 'next/link'
import {
  cities,
  TRACKED_MARKET_COUNT,
  OPEX_RATIO,
  ACS_SOURCE_FULL,
  FMR_SOURCE_LABEL,
  fmtRentChange,
} from '@/data/cap-rate-cities'

const N = TRACKED_MARKET_COUNT
const OPEX = Math.round(OPEX_RATIO * 100)
import { getCitiesForStrategy } from '@/data/market-strategies'
import { PrintButton } from '../deal-analysis-checklist/print-button'
import { GatedContent } from '@/components/gated-content'

export const metadata: Metadata = {
  title: `${N}-Metro Cap Rate Report — Census ACS 2024 Data`,
  description: `Free report comparing estimated cap rates, median home values, rents, rent changes, and strategy scores across ${N} US metros, built from Census ACS 2024 and HUD Fair Market Rent data.`,
  alternates: { canonical: '/resources/cap-rate-report' },
  openGraph: {
    title: `${N}-Metro Cap Rate Report | ProInvestorHub`,
    description: `Free market data: estimated cap rates, home values, rents, and strategy scores for ${N} US metros.`,
    url: '/resources/cap-rate-report',
    images: [
      {
        url: `/api/og?title=${N}-Metro+Cap+Rate+Report&subtitle=Census+ACS+2024+Data`,
        width: 1200,
        height: 630,
      },
    ],
  },
}

function fmt(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function CapRateReportPage() {
  const cashFlowCities = getCitiesForStrategy('cash-flow')
  const brrrrCities = getCitiesForStrategy('brrrr')
  const houseHackCities = getCitiesForStrategy('house-hacking')
  const appreciationCities = getCitiesForStrategy('appreciation')

  const avgCapRate =
    cities.reduce((sum, c) => sum + c.capRate, 0) / cities.length
  const avgPrice =
    cities.reduce((sum, c) => sum + c.medianHomeValue, 0) / cities.length
  // Data-derived takeaways (cities is sorted by estimated cap rate, desc)
  const topCap = cities.slice(0, 4)
  const bottomCap = cities.slice(-4).reverse()
  const meetsOnePct = cities.filter((c) => c.rentToPrice >= 0.01).length
  const withRentChange = cities.filter((c) => c.rentChange != null)
  const rentDown = withRentChange.filter((c) => (c.rentChange as number) < 0).length
  const list = (xs: typeof cities) =>
    xs.map((c) => `${c.city} (${c.capRate.toFixed(1)}%)`).join(', ')
  const avgRent =
    cities.reduce((sum, c) => sum + c.medianRent, 0) / cities.length

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 print:px-0 print:py-0">
      {/* Print/Save Controls */}
      <div className="mb-8 flex items-center justify-between print:hidden">
        <nav className="text-sm text-text-muted">
          <Link href="/resources" className="hover:text-primary transition-colors">
            Resources
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text">Cap Rate Report</span>
        </nav>
        <PrintButton />
      </div>

      {/* Report Header */}
      <div className="text-center mb-12 print:mb-8">
        <p className="text-sm font-semibold text-primary uppercase tracking-wide">
          ProInvestorHub Market Research
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text sm:text-4xl print:text-2xl">
          {N}-Metro Cap Rate Report
        </h1>
        <p className="mt-3 text-lg text-text-muted print:text-sm">
          Estimated cap rates, median home values, rents, and investment
          strategy scores for the {N} US metros we track.
        </p>
        <p className="mt-2 text-xs text-text-light">
          Data: {ACS_SOURCE_FULL}; {FMR_SOURCE_LABEL} &bull; proinvestorhub.com
        </p>
      </div>

      {/* National Averages */}
      <section className="mb-12 print:mb-8">
        <h2 className="text-xl font-bold text-text mb-4 print:text-lg">
          Averages Across the {N} Tracked Metros
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-white p-5 text-center print:border-gray-300">
            <p className="text-sm text-text-muted">Avg Est. Cap Rate</p>
            <p className="mt-1 text-2xl font-bold text-primary tabular-nums print:text-xl">
              {avgCapRate.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl border border-border bg-white p-5 text-center print:border-gray-300">
            <p className="text-sm text-text-muted">Avg Median Home Value</p>
            <p className="mt-1 text-2xl font-bold text-text tabular-nums print:text-xl">
              {fmt(avgPrice)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-white p-5 text-center print:border-gray-300">
            <p className="text-sm text-text-muted">Avg Median Rent</p>
            <p className="mt-1 text-2xl font-bold text-text tabular-nums print:text-xl">
              {fmt(avgRent)}/mo
            </p>
          </div>
        </div>
      </section>

      <GatedContent previewHeight="500px">
      {/* Full table */}
      <section className="mb-12 print:mb-8">
        <h2 className="text-xl font-bold text-text mb-4 print:text-lg">
          All {N} Metros — Ranked by Estimated Cap Rate
        </h2>
        <p className="mb-3 text-xs text-text-light">
          Est. cap rate = (median gross rent &times; 12 &times; (1 &minus; {OPEX}%))
          &divide; median home value. Metro-level medians; a market screen, not a
          property-level return.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse print:text-[10px]">
            <thead>
              <tr className="bg-surface text-left text-text-muted uppercase tracking-wide">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Metro</th>
                <th className="px-2 py-2 text-right">Est. Cap Rate</th>
                <th className="px-2 py-2 text-right">Median Value</th>
                <th className="px-2 py-2 text-right">Median Rent</th>
                <th className="px-2 py-2 text-right">Rent/Value</th>
                <th className="px-2 py-2 text-right">Rent Change (1 yr)</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city, i) => (
                <tr
                  key={city.slug}
                  className={`border-t border-border/50 ${
                    i % 2 === 1 ? 'bg-surface/30' : ''
                  }`}
                >
                  <td className="px-2 py-1.5 text-text-light tabular-nums">
                    {i + 1}
                  </td>
                  <td className="px-2 py-1.5 font-medium text-text whitespace-nowrap">
                    {city.city}, {city.state}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums font-semibold text-primary">
                    {city.capRate.toFixed(1)}%
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-text-muted">
                    {fmt(city.medianHomeValue)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-text-muted">
                    {fmt(city.medianRent)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-text-muted">
                    {(city.rentToPrice * 100).toFixed(2)}%
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-text-muted">
                    {fmtRentChange(city.rentChange)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Strategy Rankings Summary */}
      <section className="mb-12 print:mb-8 print:break-before-page">
        <h2 className="text-xl font-bold text-text mb-4 print:text-lg">
          Top 10 Markets by Strategy
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 print:grid-cols-2 print:gap-4">
          {[
            { title: 'Cash Flow', cities: cashFlowCities },
            { title: 'BRRRR', cities: brrrrCities },
            { title: 'House Hacking', cities: houseHackCities },
            { title: 'Appreciation', cities: appreciationCities },
          ].map((strat) => (
            <div
              key={strat.title}
              className="rounded-xl border border-border bg-white p-5 print:border-gray-300 print:p-3"
            >
              <h3 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">
                Best for {strat.title}
              </h3>
              <div className="space-y-1.5">
                {strat.cities.slice(0, 10).map((city, i) => (
                  <div
                    key={city.slug}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-text-muted">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary mr-1.5">
                        {i + 1}
                      </span>
                      {city.city}, {city.state}
                    </span>
                    <span className="tabular-nums font-semibold text-text">
                      {city.score.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Takeaways */}
      <section className="mb-12 print:mb-8">
        <h2 className="text-xl font-bold text-text mb-4 print:text-lg">
          Key Takeaways
        </h2>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 print:border-gray-300 print:bg-gray-50">
          <ul className="space-y-3 text-sm text-text-muted leading-6">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-text">Highest estimated cap rates.</strong>{' '}
                {list(topCap)} — the metros where median rent is highest
                relative to median home value.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-text">Lowest estimated cap rates.</strong>{' '}
                {list(bottomCap)} — home values are high relative to rents, so
                these are appreciation plays more than cash-flow plays.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-text">The 1% rule is rare at the metro level.</strong>{' '}
                {meetsOnePct} of {N} metros have median monthly rent at or above
                1% of median home value. Deals that meet it exist, but they are
                specific properties, not the median.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-text">Rents are not rising everywhere.</strong>{' '}
                HUD&rsquo;s two-bedroom Fair Market Rent fell from FY2025 to
                FY2026 in {rentDown} of the {withRentChange.length} metros we
                could match to an FMR area.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-text">Run real expenses.</strong>{' '}
                These estimates use a flat {OPEX}% expense allowance. Property
                taxes and insurance vary widely by state and county, so check
                the assessor and get quotes for any specific deal.
              </span>
            </li>
          </ul>
        </div>
      </section>

      </GatedContent>

      {/* Footer */}
      <div className="text-center text-xs text-text-light border-t border-border pt-6 print:pt-4">
        <p>
          &copy; 2026 ProInvestorHub.com &bull; Free for personal use &bull;
          Metro-level estimates; results vary by neighborhood and property
          &bull; Educational only, not investment advice
        </p>
        <p className="mt-1 print:hidden">
          <Link
            href="/calculators"
            className="text-primary hover:text-primary-light"
          >
            Run the numbers on a specific deal &rarr;
          </Link>
        </p>
      </div>
    </div>
  )
}
