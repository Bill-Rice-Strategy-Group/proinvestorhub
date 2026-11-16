import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from '@/components/json-ld'
import { lenderComparisons, getComparisonBySlug, getComparisonData, getComparisonsForLender } from '@/data/lender-comparisons'
import { loanTypes } from '@/data/loan-types'
import {
  formatRate, formatLtv, formatCredit, formatLoanRange, formatText, formatYesNo,
  formatExperience, formatCoverage,
} from '@/data/lenders'
import { LenderVerification } from '@/components/lender-verification'
import { LenderOutboundLink } from '@/components/lender-outbound-link'
import { normalizeTitle } from '@/lib/page-title'
import { freshnessStamp } from '@/lib/content-freshness'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return lenderComparisons.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const comparison = getComparisonBySlug(slug)
  if (!comparison) return {}
  return {
    title: normalizeTitle(comparison.metaTitle),
    description: comparison.metaDescription,
    alternates: { canonical: `/lenders/compare/${slug}` },
    openGraph: { title: comparison.metaTitle, description: comparison.metaDescription },
  }
}

const propertyTypeLabels: Record<string, string> = {
  sfr: 'SFR (1-4)', multifamily: 'Multifamily (5+)', 'mixed-use': 'Mixed Use',
  commercial: 'Commercial', str: 'STR / Airbnb', condo: 'Condo', townhouse: 'Townhouse',
  mobile: 'Mobile', land: 'Land', 'new-construction': 'New Construction',
}

type ComparisonRow = {
  label: string
  getA: string
  getB: string
}

export default async function LenderVsLenderPage({ params }: Props) {
  const { slug } = await params
  const comparison = getComparisonBySlug(slug)
  if (!comparison) notFound()

  const data = getComparisonData(comparison)
  if (!data) notFound()

  const { lenderA: a, lenderB: b } = data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://proinvestorhub.com'

  const sharedLoanTypeNames = comparison.sharedLoanTypes
    .map((s) => loanTypes.find((lt) => lt.slug === s)?.shortName)
    .filter(Boolean)

  // Honest freshness stamp: the older of the two lenders' verification dates.
  const stamp = freshnessStamp('lenderComparisons', comparison.lastReviewed)

  // Side-by-side facts only — no winner, no score. "Not published" means the
  // lender does not state the figure on its own site.
  const rows: ComparisonRow[] = [
    { label: 'Published rates', getA: formatRate(a), getB: formatRate(b) },
    { label: 'Max LTV', getA: formatLtv(a), getB: formatLtv(b) },
    { label: 'Min credit score', getA: formatCredit(a), getB: formatCredit(b) },
    { label: 'Loan range', getA: formatLoanRange(a), getB: formatLoanRange(b) },
    { label: 'Origination / fees', getA: formatText(a.originationFee), getB: formatText(b.originationFee) },
    { label: 'Speed to close', getA: formatText(a.speedToClose), getB: formatText(b.speedToClose) },
    { label: 'Experience required', getA: formatExperience(a.experienceRequired), getB: formatExperience(b.experienceRequired) },
    { label: 'LLC borrowing', getA: formatYesNo(a.allowsLlc), getB: formatYesNo(b.allowsLlc) },
    { label: 'Interest-only', getA: formatYesNo(a.interestOnlyAvailable, 'Available'), getB: formatYesNo(b.interestOnlyAvailable, 'Available') },
    { label: 'Prepayment penalty', getA: formatText(a.prepaymentPenalty), getB: formatText(b.prepaymentPenalty) },
    { label: 'Foreign nationals', getA: formatYesNo(a.foreignNational), getB: formatYesNo(b.foreignNational) },
    { label: 'State coverage', getA: formatCoverage(a), getB: formatCoverage(b) },
    {
      label: 'Property types',
      getA: a.propertyTypes.map((pt) => propertyTypeLabels[pt] || pt).join(', '),
      getB: b.propertyTypes.map((pt) => propertyTypeLabels[pt] || pt).join(', '),
    },
    {
      label: 'Loan products',
      getA: a.loanTypeSlugs.map((s) => loanTypes.find((lt) => lt.slug === s)?.shortName || s).join(', '),
      getB: b.loanTypeSlugs.map((s) => loanTypes.find((lt) => lt.slug === s)?.shortName || s).join(', '),
    },
  ]

  // Related comparisons
  const relatedA = getComparisonsForLender(a.slug).filter((c) => c.slug !== slug).slice(0, 3)
  const relatedB = getComparisonsForLender(b.slug).filter((c) => c.slug !== slug).slice(0, 3)
  const related = [...new Map([...relatedA, ...relatedB].map((c) => [c.slug, c])).values()].slice(0, 4)

  // FAQs — restate only verified, published figures.
  const faqs = [
    {
      question: `How do ${a.name} and ${b.name} compare?`,
      answer: comparison.angle,
    },
    {
      question: `What loan types do ${a.name} and ${b.name} both offer?`,
      answer: sharedLoanTypeNames.length
        ? `Both lenders list ${sharedLoanTypeNames.join(', ')} on their sites.`
        : `They do not list the same loan types.`,
    },
    {
      question: `What rates do ${a.name} and ${b.name} publish?`,
      answer: `${a.name}: ${formatRate(a).toLowerCase() === 'not published' ? 'no published rates' : formatRate(a)}. ${b.name}: ${formatRate(b).toLowerCase() === 'not published' ? 'no published rates' : formatRate(b)}. Published rates are the lenders' own starting figures; your rate depends on credit, leverage, property and loan product, so get a written quote from each.`,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: baseUrl },
          { name: 'Lender Directory', url: `${baseUrl}/lenders` },
          { name: 'Compare Lenders', url: `${baseUrl}/lenders/compare` },
          { name: `${a.name} vs ${b.name}`, url: `${baseUrl}/lenders/compare/${slug}` },
        ])}
      />
      <JsonLd data={faqJsonLd(faqs)} />

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/lenders" className="hover:text-primary transition-colors">Lender Directory</Link>
        <span className="mx-2">/</span>
        <Link href="/lenders/compare" className="hover:text-primary transition-colors">Compare</Link>
        <span className="mx-2">/</span>
        <span className="text-text">{a.name} vs {b.name}</span>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mb-10">
        <h1 className="text-3xl font-bold text-text sm:text-4xl">
          {a.name} vs {b.name}
        </h1>
        <p className="mt-4 text-lg text-text-muted leading-7">
          {comparison.angle}
        </p>
        <p className="mt-2 text-sm text-text-light">
          Shared products: {sharedLoanTypeNames.join(', ')}
          {stamp && (
            <>
              {' '}&middot; Figures verified {stamp.date} from each lender&apos;s site
            </>
          )}
        </p>
      </div>

      {/* Full Comparison Table */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-text mb-4">Full Comparison</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-raised">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text w-48">Feature</th>
                <th className="px-4 py-3 text-left font-semibold text-text">
                  <Link href={`/lenders/reviews/${a.slug}`} className="text-primary hover:text-primary-light transition-colors">
                    {a.name}
                  </Link>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text">
                  <Link href={`/lenders/reviews/${b.slug}`} className="text-primary hover:text-primary-light transition-colors">
                    {b.name}
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {rows.map((row) => (
                <tr key={row.label} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-medium text-text-muted">{row.label}</td>
                  <td className="px-4 py-3 text-text">{row.getA}</td>
                  <td className="px-4 py-3 text-text">{row.getB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <LenderVerification lender={a} />
          <LenderVerification lender={b} />
        </div>
      </section>

      {/* Pros & Cons Side by Side */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-text mb-4">Pros &amp; Cons</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[a, b].map((lender) => (
            <div key={lender.slug} className="rounded-xl border border-border bg-white p-6">
              <h3 className="text-lg font-bold text-text mb-4">{lender.name}</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Pros</p>
                  <ul className="space-y-1.5">
                    {lender.pros.map((pro) => (
                      <li key={pro} className="flex items-start gap-2 text-sm text-green-900">
                        <span className="text-green-600 mt-0.5">+</span>{pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Cons</p>
                  <ul className="space-y-1.5">
                    {lender.cons.map((con) => (
                      <li key={con} className="flex items-start gap-2 text-sm text-red-900">
                        <span className="text-red-600 mt-0.5">&ndash;</span>{con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTAs */}
      <section className="mb-10 grid gap-4 sm:grid-cols-2">
        {[a, b].map((lender) => (
          <div key={lender.slug} className="rounded-xl border border-border bg-white p-6 text-center">
            <p className="text-lg font-bold text-text mb-2">{lender.name}</p>
            <p className="text-xs text-text-muted mb-4">
              {lender.coverage ?? 'State coverage not published'}
            </p>
            <div className="flex flex-col gap-2">
              <LenderOutboundLink
                websiteUrl={lender.website}
                lenderName={lender.name}
                lenderSlug={lender.slug}
                placement="comparison-table"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
              >
                Visit {lender.name}
              </LenderOutboundLink>
              <Link
                href={`/lenders/reviews/${lender.slug}`}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text hover:border-primary/40 hover:text-primary transition-colors"
              >
                Read Full Review
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* FAQs */}
      <section className="max-w-3xl mb-10">
        <h2 className="text-2xl font-bold text-text mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="text-base font-semibold text-text">{faq.question}</h3>
              <p className="mt-2 text-sm text-text-muted leading-6">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Comparisons */}
      {related.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">Related Comparisons</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((c) => (
              <Link
                key={c.slug}
                href={`/lenders/compare/${c.slug}`}
                className="rounded-lg border border-border bg-white px-5 py-4 text-sm font-medium text-text hover:border-primary/40 hover:text-primary hover:shadow-sm transition-all"
              >
                {c.title.replace(': ', '\n').split('\n')[0]}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="rounded-xl bg-primary/5 border border-primary/10 p-8 text-center">
        <h2 className="text-xl font-bold text-text">Not Sure? Try Our Lender Finder</h2>
        <p className="mt-2 text-text-muted">
          Enter your credit score, experience, and strategy to see which lenders match your scenario.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/lenders/finder" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors">
            Find My Lender Match
          </Link>
          <Link href="/lenders/compare" className="rounded-lg border border-primary px-6 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
            Compare Other Lenders
          </Link>
        </div>
      </section>
    </div>
  )
}
