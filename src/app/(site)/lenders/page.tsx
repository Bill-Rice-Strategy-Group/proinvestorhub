import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from '@/components/json-ld'
import { loanTypes, loanTypeCategories } from '@/data/loan-types'
import {
  lenders, formatRate, formatLtv, formatCredit, formatCoverage, LENDER_VERIFICATION_DATE,
} from '@/data/lenders'
import { usStates } from '@/data/us-states'
import { freshnessStamp } from '@/lib/content-freshness'

export const metadata: Metadata = {
  title: 'Real Estate Investor Lender Directory: Compare Financing Options',
  description:
    'Compare lenders for real estate investors: DSCR, hard money, bridge, fix-and-flip, construction and portfolio loans, with each lender\'s published rates, LTV and state coverage side by side.',
  alternates: { canonical: '/lenders' },
  openGraph: {
    title: 'Real Estate Investor Lender Directory | ProInvestorHub',
    description:
      'Compare lenders for real estate investors side by side, with figures checked against each lender\'s own site.',
  },
}

const directoryFaqs = [
  {
    question: 'What type of loan do I need for a rental property?',
    answer:
      'For a long-term rental property, the most common options are DSCR loans (qualify based on rental income, no W-2 needed) and conventional investment property loans (lowest rates, but require income documentation and are limited to 10 properties). DSCR loans are the most popular choice for investors scaling a portfolio.',
  },
  {
    question: 'What type of loan do I need for a fix-and-flip?',
    answer:
      'Fix-and-flip projects typically use hard money or fix-and-flip loans: short-term, interest-only loans that can fund both the purchase and the renovation and are underwritten mainly on the property. They cost more than long-term rental loans. Each lender page in this directory shows the rates and terms that lender publishes.',
  },
  {
    question: 'Can I get an investment property loan with bad credit?',
    answer:
      'Often, yes. Several lenders in this directory publish low or no credit minimums: Griffin Funding lists a 620 minimum on DSCR loans, Easy Street Capital a 600 minimum on fix-and-flip loans, and Tidal Loans and Velocity Mortgage Capital say some programs have no minimum credit score. A lower score usually means a higher rate and less leverage.',
  },
  {
    question: 'How much down payment do I need for an investment property?',
    answer:
      'It depends on the loan and the lender. The DSCR lenders in this directory that publish leverage list maximums of 75% to 85% LTV, which means 15% to 25% down at best; fix-and-flip lenders often lend a share of the purchase price plus rehab costs, capped at a percentage of after-repair value. Each lender page shows what that lender publishes.',
  },
  {
    question: 'What is the difference between a DSCR loan and a hard money loan?',
    answer:
      'DSCR loans are long-term (often 30-year) financing for rental properties you plan to hold, qualified on the property\'s rental income. Hard money loans are short-term (typically 6–24 months), higher-cost financing for flips and rehabs. Many investors use hard money to acquire and renovate, then refinance into a DSCR loan to hold long-term (the BRRRR strategy).',
  },
]

export default function LenderDirectoryPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://proinvestorhub.com'
  // Honest freshness: the date lender figures were last checked against lenders' own sites.
  const stamp = freshnessStamp('lenders', LENDER_VERIFICATION_DATE)
  const sortedLenders = [...lenders].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: baseUrl },
          { name: 'Lender Directory', url: `${baseUrl}/lenders` },
        ])}
      />
      <JsonLd data={faqJsonLd(directoryFaqs)} />

      {/* Hero */}
      <div className="max-w-3xl mb-12">
        <h1 className="text-3xl font-bold text-text sm:text-4xl">
          Real Estate Investor Lender Directory
        </h1>
        <p className="mt-4 text-lg text-text-muted leading-7">
          Find the right financing for your next deal. Compare lenders for every
          stage of real estate investing — from a first rental to a portfolio —
          using the rates, terms and requirements each lender publishes, checked
          against its own site. We don&apos;t rank lenders or take payment for
          listings.
        </p>
        <p className="mt-2 text-sm text-text-light">
          {lenders.length} lenders &middot; {loanTypes.length} loan types
          {stamp && (
            <>
              {' '}&middot; Figures verified {stamp.date}
            </>
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/financing/matcher"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
          >
            Match My Deal to Financing
          </Link>
          <Link
            href="/lenders/finder"
            className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            Find My Lender Match
          </Link>
          <Link
            href="/lenders/compare"
            className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            Compare Lenders Side by Side
          </Link>
        </div>
      </div>

      {/* Loan Type Categories */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-text mb-2">
          Browse by Loan Type
        </h2>
        <p className="text-text-muted mb-8">
          Each loan type serves a different strategy. Choose the financing that
          matches your deal.
        </p>

        {loanTypeCategories.map((category) => {
          const categoryLoanTypes = loanTypes
            .filter((lt) => lt.category === category.value)
            .sort((a, b) => a.sortOrder - b.sortOrder)
          if (categoryLoanTypes.length === 0) return null

          return (
            <div key={category.value} className="mb-10">
              <h3 className="text-lg font-semibold text-text mb-1">
                {category.label}
              </h3>
              <p className="text-sm text-text-muted mb-4">
                {category.description}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryLoanTypes.map((lt) => (
                  <Link
                    key={lt.slug}
                    href={`/lenders/${lt.slug}`}
                    className="group rounded-xl border border-border bg-white p-6 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <h4 className="text-base font-bold text-text group-hover:text-primary transition-colors">
                      {lt.name}
                    </h4>
                    <p className="mt-2 text-sm text-text-muted leading-6 line-clamp-3">
                      {lt.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-light">
                      <span>LTV: {lt.typicalLtvRange}</span>
                      <span>Term: {lt.typicalTermRange}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-primary group-hover:text-primary-light transition-colors">
                      View Lenders &rarr;
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {/* Quick Comparison Table */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-text mb-2">
          Quick Lender Comparison
        </h2>
        <p className="text-text-muted mb-6">
          Every lender in the directory, A–Z, with the rates, LTV, credit minimum
          and state coverage it publishes. &ldquo;Not published&rdquo; means the
          lender doesn&apos;t state that figure on its site.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-raised">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text">Lender</th>
                <th className="px-4 py-3 text-left font-semibold text-text">Loan Types</th>
                <th className="px-4 py-3 text-left font-semibold text-text">Published Rates</th>
                <th className="px-4 py-3 text-left font-semibold text-text">Max LTV</th>
                <th className="px-4 py-3 text-left font-semibold text-text">Min Credit</th>
                <th className="px-4 py-3 text-left font-semibold text-text">States</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {sortedLenders
                .map((lender) => (
                  <tr key={lender.slug} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/lenders/reviews/${lender.slug}`}
                        className="text-primary hover:text-primary-light transition-colors"
                      >
                        {lender.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {lender.loanTypeSlugs
                        .map((s) => {
                          const lt = loanTypes.find((l) => l.slug === s)
                          return lt?.shortName || s
                        })
                        .slice(0, 3)
                        .join(', ')}
                      {lender.loanTypeSlugs.length > 3 && ` +${lender.loanTypeSlugs.length - 3}`}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{formatRate(lender)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatLtv(lender)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatCredit(lender)}</td>
                    <td className="px-4 py-3 text-text-muted">{formatCoverage(lender)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Browse by State */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-text mb-2">
          Browse Lenders by State
        </h2>
        <p className="text-text-muted mb-6">
          Find lenders serving your state with local market context, landlord
          law overviews, and state-specific comparison tables.
        </p>
        <div className="flex flex-wrap gap-2">
          {usStates.map((state) => (
            <Link
              key={state.slug}
              href={`/lenders/dscr-loans/${state.slug}`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all"
            >
              {state.name}
            </Link>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-16 max-w-3xl">
        <h2 className="text-2xl font-bold text-text mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {directoryFaqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="text-base font-semibold text-text">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm text-text-muted leading-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How We Review / E-E-A-T */}
      <section className="mb-16 max-w-3xl">
        <h2 className="text-2xl font-bold text-text mb-4">
          How We Review Lenders
        </h2>
        <p className="text-text-muted leading-7 mb-4">
          Every lender in this directory has been researched and evaluated by our
          editorial team, led by{' '}
          <Link href="/about" className="text-primary hover:text-primary-light font-medium transition-colors">
            Bill Rice
          </Link>
          , a 30+ year veteran of the mortgage lending industry. We evaluate
          lenders on rate competitiveness, product range, closing speed, credit
          requirements, customer experience, and transparency.
        </p>
        <p className="text-text-muted leading-7">
          We are not a lead generation company. We do not sell your information
          to lenders. Our directory is designed to help you make informed
          financing decisions with transparent, side-by-side comparisons and
          honest editorial reviews. Listings are editorial and outbound links
          go to each lender&apos;s own website; a lender cannot pay to be listed
          or to rank higher. If a lender is ever a paid affiliate partner, that
          listing is marked &quot;Affiliate partner&quot; and the relationship
          never influences our ratings. See our{' '}
          <Link href="/affiliate-disclosure" className="text-primary underline hover:opacity-80">
            affiliate disclosure
          </Link>
          .
        </p>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-xl bg-primary/5 border border-primary/10 p-8 text-center">
        <h2 className="text-xl font-bold text-text">
          Know Your Numbers Before You Borrow
        </h2>
        <p className="mt-2 text-text-muted">
          Use our free calculators to analyze your deal, then find the right
          lender to finance it.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/calculators/mortgage"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
          >
            Mortgage / DSCR Calculator
          </Link>
          <Link
            href="/calculators/fix-flip"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
          >
            Fix &amp; Flip Calculator
          </Link>
          <Link
            href="/calculators/brrrr"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
          >
            BRRRR Calculator
          </Link>
          <Link
            href="/calculators/rental-cashflow"
            className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            Rental Cash Flow
          </Link>
        </div>
      </section>
    </div>
  )
}
