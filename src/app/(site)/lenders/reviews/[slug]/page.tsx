import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from '@/components/json-ld'
import {
  lenders, getLenderBySlug, type LenderData,
  formatRate, formatLtv, formatCredit, formatLoanRange, formatText, formatYesNo,
  formatExperience, formatCoverage, NOT_PUBLISHED,
} from '@/data/lenders'
import { LenderVerification } from '@/components/lender-verification'
import { formatMonthYear } from '@/lib/content-freshness'
import { loanTypes } from '@/data/loan-types'
import { getComparisonsForLender } from '@/data/lender-comparisons'
import { LenderOutboundLink } from '@/components/lender-outbound-link'
import { normalizeTitle } from '@/lib/page-title'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return lenders.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lender = getLenderBySlug(slug)
  if (!lender) return {}

  return {
    title: normalizeTitle(lender.metaTitle),
    description: lender.metaDescription,
    alternates: { canonical: `/lenders/reviews/${slug}` },
    openGraph: {
      title: lender.metaTitle,
      description: lender.metaDescription,
    },
  }
}

const propertyTypeLabels: Record<string, string> = {
  sfr: 'Single Family (1-4 units)',
  multifamily: 'Multifamily (5+ units)',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  str: 'Short-Term Rental / Airbnb',
  condo: 'Condo',
  townhouse: 'Townhouse',
  mobile: 'Mobile / Manufactured',
  land: 'Land',
  'new-construction': 'New Construction',
}

function humanizeLoanType(slug: string): string {
  const map: Record<string, string> = {
    'dscr-loans': 'DSCR loans',
    'bank-statement-loans': 'bank statement loans',
    'fix-and-flip-loans': 'fix-and-flip loans',
    'fix-and-rent-loans': 'fix-and-rent loans',
    'bridge-loans': 'bridge loans',
    'hard-money-loans': 'hard money loans',
    'construction-loans': 'construction loans',
    'portfolio-loans': 'portfolio loans',
    'asset-based-loans': 'asset-based loans',
    heloc: 'HELOCs',
  }
  return map[slug] || slug.replace(/-/g, ' ')
}

// Builds a truthful, data-derived FAQ for any lender review. Questions are
// shaped to match the high-intent branded queries these pages already rank
// for (legitimacy, pros/cons, bank statement, credit score, rates, LLC, speed).
// Every answer is sourced from the lender's own data fields — nothing invented.
function buildLenderFaqs(lender: LenderData): { question: string; answer: string }[] {
  const loanList = lender.loanTypeSlugs.map(humanizeLoanType)
  const loanStr =
    loanList.length > 1
      ? `${loanList.slice(0, -1).join(', ')} and ${loanList[loanList.length - 1]}`
      : loanList[0] || 'investment property loans'

  const verified = lender.lastReviewed
    ? ` Figures checked against ${lender.name}'s own site in ${formatMonthYear(lender.lastReviewed)}.`
    : ''

  const facts: string[] = []
  if (lender.founded) facts.push(`founded in ${lender.founded}`)
  if (lender.headquarters) facts.push(`headquartered in ${lender.headquarters}`)
  const faqs: { question: string; answer: string }[] = [
    {
      question: `Is ${lender.name} a legitimate lender?`,
      answer: `${lender.name}${facts.length ? ` (${facts.join(', ')})` : ''} ${lender.capitalProvider ? 'funds' : 'offers'} ${loanStr}${lender.coverage ? `; state coverage per its site: ${lender.coverage}` : ''}. To verify it for yourself, confirm ${lender.name}'s current NMLS registration and state licensing, check its Better Business Bureau (BBB) profile and reviews, and compare written quotes before you apply.`,
    },
  ]

  if (lender.pros.length && lender.cons.length) {
    faqs.push({
      question: `What are the pros and cons of ${lender.name}?`,
      answer: `Pros: ${lender.pros.slice(0, 3).join('; ')}. Cons: ${lender.cons.slice(0, 3).join('; ')}.`,
    })
  }

  if (lender.loanTypeSlugs.includes('bank-statement-loans')) {
    faqs.push({
      question: `Does ${lender.name} offer bank statement loans?`,
      answer: `Yes. ${lender.name} lists bank statement loan programs, which qualify self-employed borrowers on bank deposits instead of tax returns or W-2s.`,
    })
  }

  // Credit, rates and speed: restate only what the lender publishes.
  if (lender.minCreditScore != null || lender.noCreditMinimum) {
    faqs.push({
      question: `What credit score do you need for ${lender.name}?`,
      answer: (lender.minCreditScore != null
        ? `The lowest minimum credit score ${lender.name} publishes is ${lender.minCreditScore}.`
        : `${lender.name} publishes that at least one of its programs has no credit-score minimum.`)
        + (lender.termsNote ? ` By program: ${lender.termsNote}` : '') + verified,
    })
  }

  const rate = formatRate(lender)
  if (rate !== NOT_PUBLISHED || lender.originationFee) {
    const bits: string[] = []
    if (rate !== NOT_PUBLISHED) bits.push(`published rates: ${rate}`)
    if (lender.originationFee) bits.push(`fees: ${lender.originationFee}`)
    const range = formatLoanRange(lender)
    if (range !== NOT_PUBLISHED) bits.push(`loan sizes: ${range}`)
    if (lender.maxLtv != null) bits.push(`leverage up to ${lender.maxLtv}% LTV`)
    faqs.push({
      question: `What rates and fees does ${lender.name} charge?`,
      answer: `From ${lender.name}'s site — ${bits.join('; ')}. These are the lender's headline figures, not a quote; request a written quote for your scenario.${verified}`,
    })
  }

  if (lender.allowsLlc) {
    faqs.push({
      question: `Can you close with ${lender.name} in an LLC?`,
      answer: `Yes. ${lender.name} lends to LLCs and other business entities, which many investors use for liability protection and cleaner portfolio organization.`,
    })
  }

  if (lender.speedToClose) {
    faqs.push({
      question: `How fast can ${lender.name} close a loan?`,
      answer: `${lender.name} publishes: ${lender.speedToClose}. Actual timing depends on the loan program, the property, and how quickly you provide documentation.`,
    })
  }

  return faqs
}

export default async function LenderProfilePage({ params }: Props) {
  const { slug } = await params
  const lender = getLenderBySlug(slug)
  if (!lender) notFound()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://proinvestorhub.com'

  const lenderLoanTypes = lender.loanTypeSlugs
    .map((s) => loanTypes.find((lt) => lt.slug === s))
    .filter(Boolean)

  const faqs = buildLenderFaqs(lender)

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: baseUrl },
          { name: 'Lender Directory', url: `${baseUrl}/lenders` },
          { name: lender.name, url: `${baseUrl}/lenders/reviews/${slug}` },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FinancialService',
          name: lender.name,
          url: lender.website,
          description: lender.description,
          foundingDate: lender.founded ? lender.founded.toString() : undefined,
          address: lender.headquarters
            ? { '@type': 'PostalAddress', addressLocality: lender.headquarters }
            : undefined,
        }}
      />
      <JsonLd data={faqJsonLd(faqs)} />

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/lenders" className="hover:text-primary transition-colors">
          Lender Directory
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text">{lender.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-text sm:text-4xl">
              {lender.name} Review
            </h1>
            <p className="mt-1 text-sm text-text-light">
              {[
                lender.founded ? `Founded ${lender.founded}` : null,
                lender.headquarters,
                lender.coverage,
                lender.lastReviewed ? `Verified ${formatMonthYear(lender.lastReviewed)} from ${lender.name}'s site` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>
        <p className="mt-4 text-lg text-text-muted leading-7">
          {lender.description}
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Editor's Take */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-text mb-4">
              Editor&apos;s Take
            </h2>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-text leading-7">{lender.editorSummary}</p>
              <p className="mt-4 text-xs text-text-light">
                — Bill Rice, 30+ year mortgage lending veteran
              </p>
            </div>
          </section>

          {/* Full Review — long-form editorial, only when authored */}
          {lender.editorReview && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-text mb-4">
                {lender.name} Review: The Full Breakdown
              </h2>
              <div className="space-y-4">
                {lender.editorReview
                  .split(/\n\s*\n/)
                  .map((para) => para.trim())
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i} className="text-text-muted leading-7">
                      {para}
                    </p>
                  ))}
              </div>
            </section>
          )}

          {/* Pros & Cons */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-text mb-4">Pros &amp; Cons</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-green-200 bg-green-50/50 p-5">
                <h3 className="text-sm font-semibold text-green-800 mb-3">Pros</h3>
                <ul className="space-y-2">
                  {lender.pros.map((pro) => (
                    <li key={pro} className="flex items-start gap-2 text-sm text-green-900">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
                <h3 className="text-sm font-semibold text-red-800 mb-3">Cons</h3>
                <ul className="space-y-2">
                  {lender.cons.map((con) => (
                    <li key={con} className="flex items-start gap-2 text-sm text-red-900">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Loan Products */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-text mb-4">
              Loan Products Offered
            </h2>
            <div className="flex flex-wrap gap-2">
              {lenderLoanTypes.map((lt) =>
                lt ? (
                  <Link
                    key={lt.slug}
                    href={`/lenders/${lt.slug}`}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:border-primary/40 hover:text-primary transition-all"
                  >
                    {lt.name}
                  </Link>
                ) : null
              )}
            </div>
          </section>

          {/* Property Types */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-text mb-4">
              Eligible Property Types
            </h2>
            <div className="flex flex-wrap gap-2">
              {lender.propertyTypes.map((pt) => (
                <span
                  key={pt}
                  className="rounded-full bg-surface-raised px-3 py-1 text-xs font-medium text-text-muted"
                >
                  {propertyTypeLabels[pt] || pt}
                </span>
              ))}
            </div>
          </section>

          {/* Best For */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-text mb-4">Best For</h2>
            <div className="flex flex-wrap gap-2">
              {lender.bestForTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/8 px-3 py-1 text-sm font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* Compare With Other Lenders */}
          {(() => {
            const comparisons = getComparisonsForLender(lender.slug)
            if (comparisons.length === 0) return null
            return (
              <section className="mb-10">
                <h2 className="text-xl font-bold text-text mb-4">
                  Compare {lender.name}
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {comparisons.map((c) => {
                    const otherName = c.lenderA === lender.slug
                      ? lenders.find((l) => l.slug === c.lenderB)?.name || c.lenderB
                      : lenders.find((l) => l.slug === c.lenderA)?.name || c.lenderA
                    return (
                      <Link
                        key={c.slug}
                        href={`/lenders/compare/${c.slug}`}
                        className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-text hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all"
                      >
                        {lender.name} vs {otherName}
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })()}

          {/* FAQ — targets high-intent branded queries; mirrors faqJsonLd */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-text mb-4">
              {lender.name} Review: Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="font-semibold text-text">{faq.question}</h3>
                  <p className="mt-2 text-sm text-text-muted leading-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Key Terms Card */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-text mb-4">Key Terms</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Published Rates</dt>
                  <dd className="font-semibold text-text text-right max-w-[160px]">{formatRate(lender)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Max LTV</dt>
                  <dd className="font-semibold text-text text-right max-w-[160px]">{formatLtv(lender)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Min Credit Score</dt>
                  <dd className="font-semibold text-text text-right max-w-[160px]">{formatCredit(lender)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Loan Range</dt>
                  <dd className="font-semibold text-text text-right max-w-[160px]">{formatLoanRange(lender)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Origination / Fees</dt>
                  <dd className="font-semibold text-text text-right max-w-[160px]">{formatText(lender.originationFee)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Speed to Close</dt>
                  <dd className="font-semibold text-text text-right max-w-[160px]">{formatText(lender.speedToClose)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Experience Required</dt>
                  <dd className="font-semibold text-text text-right max-w-[160px]">{formatExperience(lender.experienceRequired)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">LLC Borrowing</dt>
                  <dd className="font-semibold text-text text-right max-w-[160px]">{formatYesNo(lender.allowsLlc)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Interest-Only</dt>
                  <dd className="font-semibold text-text text-right max-w-[160px]">{formatYesNo(lender.interestOnlyAvailable, 'Available', 'Not available')}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Prepayment Penalty</dt>
                  <dd className="font-semibold text-text text-right max-w-[160px]">{formatText(lender.prepaymentPenalty)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Foreign Nationals</dt>
                  <dd className="font-semibold text-text text-right max-w-[160px]">{formatYesNo(lender.foreignNational)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">State Coverage</dt>
                  <dd className="font-semibold text-text text-right max-w-[160px]">{formatCoverage(lender)}</dd>
                </div>
              </dl>
              <LenderVerification lender={lender} className="mt-4 border-t border-border pt-4" />
            </div>

            {/* CTA */}
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-6 text-center">
              <p className="text-sm font-semibold text-text mb-2">
                Ready to get a quote?
              </p>
              <p className="text-xs text-text-muted mb-4">
                Visit {lender.name} to apply or get pre-qualified.
              </p>
              <LenderOutboundLink
                websiteUrl={lender.website}
                lenderName={lender.name}
                lenderSlug={lender.slug}
                placement="profile-cta"
                className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
              >
                Visit {lender.name}
              </LenderOutboundLink>
              <p className="mt-3 text-xs text-text-light">
                External link &middot; ProInvestorHub does not receive your information
              </p>
            </div>

            {/* Calculator Link */}
            <div className="rounded-xl border border-border bg-white p-6">
              <h3 className="text-sm font-semibold text-text mb-2">
                Run the Numbers
              </h3>
              <p className="text-xs text-text-muted mb-3">
                See if your deal works with these terms.
              </p>
              <div className="space-y-2">
                <Link
                  href="/calculators/mortgage"
                  className="block text-sm text-primary hover:text-primary-light font-medium transition-colors"
                >
                  Mortgage / DSCR Calculator &rarr;
                </Link>
                <Link
                  href="/calculators/fix-flip"
                  className="block text-sm text-primary hover:text-primary-light font-medium transition-colors"
                >
                  Fix &amp; Flip Calculator &rarr;
                </Link>
                <Link
                  href="/calculators/brrrr"
                  className="block text-sm text-primary hover:text-primary-light font-medium transition-colors"
                >
                  BRRRR Calculator &rarr;
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Disclaimer */}
      <section className="mt-12 rounded-xl border border-border bg-surface-raised p-6">
        <p className="text-xs text-text-light leading-5">
          <strong className="text-text-muted">Disclaimer:</strong> The rates, terms
          and requirements above are {lender.name}&apos;s own published figures
          {lender.lastReviewed ? <>, checked against its site in {formatMonthYear(lender.lastReviewed)}</> : null}.
          They are headline figures, not a quote: your terms depend on your credit
          profile, the property and market conditions, and lenders change them
          without notice. Confirm current terms with the lender before making a
          financing decision. ProInvestorHub reviews are for educational purposes;
          we do not make loans or arrange financing.
        </p>
      </section>
    </div>
  )
}
