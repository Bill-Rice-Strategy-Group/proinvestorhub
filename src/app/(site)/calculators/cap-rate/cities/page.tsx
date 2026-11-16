import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd, breadcrumbJsonLd } from '@/components/json-ld'
import { CapRateCitiesTable } from '@/components/cap-rate-cities-table'
import {
  TRACKED_MARKET_COUNT,
  OPEX_RATIO,
  ACS_SOURCE_FULL,
} from '@/data/cap-rate-cities'

const N = TRACKED_MARKET_COUNT
const OPEX = Math.round(OPEX_RATIO * 100)

export const metadata: Metadata = {
  title: `Cap Rates by City — Estimates for ${N} US Metros (ACS 2024 Data)`,
  description: `Compare estimated cap rates, median home values, median rents, and rent-to-value ratios across ${N} US metros, built from Census ACS 2024 1-year data. Sortable, with the formula shown.`,
  alternates: { canonical: '/calculators/cap-rate/cities' },
  openGraph: {
    title: 'Cap Rates by City — Census-Based Estimates | ProInvestorHub',
    description: `Compare estimated cap rates across ${N} US metros, from Census ACS 2024 data.`,
  },
}

export default function CapRateCitiesPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://proinvestorhub.com'

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: baseUrl },
          { name: 'Calculators', url: `${baseUrl}/calculators` },
          { name: 'Cap Rate', url: `${baseUrl}/calculators/cap-rate` },
          {
            name: 'Cities',
            url: `${baseUrl}/calculators/cap-rate/cities`,
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
        <span className="text-text">Cities</span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mb-10">
        <h1 className="text-3xl font-bold text-text sm:text-4xl">
          Cap Rates by City &mdash; Estimates for {N} Metros
        </h1>
        <p className="mt-3 text-lg text-text-muted leading-7">
          Compare estimated cap rates, home values, rents, and rent-to-value
          ratios across the {N} metro areas we track. Click any market for the
          full calculation.
        </p>
      </div>

      {/* Sortable Table */}
      <CapRateCitiesTable />

      {/* Bottom note */}
      <p className="mt-4 text-xs text-text-light max-w-3xl leading-5">
        Source: {ACS_SOURCE_FULL}. Estimated cap rate = (median gross rent
        &times; 12 &times; (1 &minus; {OPEX}%)) &divide; median home value; the{' '}
        {OPEX}% operating-expense allowance is the &ldquo;50% rule&rdquo; of
        thumb. Figures describe whole metro areas, not city limits, and compare
        median rent across all rental units with median owner-occupied home
        value — a market-level screen, not the cap rate of any specific
        property. Bands are thirds of the {N} tracked metros. Educational only;
        always run your own numbers before investing.
      </p>

      {/* CTA */}
      <div className="mt-12 rounded-xl bg-primary/5 border border-primary/10 p-8 text-center">
        <h2 className="text-xl font-bold text-text">
          Ready to Analyze a Deal?
        </h2>
        <p className="mt-2 text-text-muted">
          Use our free cap rate calculator to run the numbers on any property
          with your actual income and expense figures.
        </p>
        <Link
          href="/calculators/cap-rate"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
        >
          Open Cap Rate Calculator &rarr;
        </Link>
      </div>
    </div>
  )
}
