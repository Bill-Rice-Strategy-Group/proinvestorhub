import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  JsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  articleJsonLd,
} from '@/components/json-ld'
import { CalculatorRelatedTools } from '@/components/calculator-related-tools'
import { BrandBarChart } from '@/components/reports/brand-bar-chart'
import {
  states,
  national,
  getStateBySlug,
  getStateTrendBySlug,
  getPriorStateBySlug,
  reportMeta,
  priorYear,
  rankedBy,
  rankInfo,
  fmtRankInfo,
  hasRateCoverage,
  RATE_COVERAGE_MIN,
  fmtBps,
  fmtPct,
  fmtRate,
  fmtCount,
  fmtUSD,
  fmtSignedBps,
  fmtSignedPts,
  fmtPctChange,
  trendDir,
} from '@/data/hmda-investor'
import { DeltaTag } from '@/components/reports/trend-delta'
import { indefiniteArticle, withArticle } from '@/lib/article'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://proinvestorhub.com'
const PUBLISHED = '2026-06-14'

export function generateStaticParams() {
  return states.map((s) => ({ state: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>
}): Promise<Metadata> {
  const { state } = await params
  const s = getStateBySlug(state)
  if (!s) return {}
  const title = `Investor Financing in ${s.name} (${reportMeta.year}): Rates, Denials & DSCR Lending`
  const description = `How real estate investors finance deals in ${s.name}: ${withArticle(fmtBps(s.ratePremiumBps))} rate premium, ${withArticle(fmtPct(s.denialRate))} denial rate, and ${fmtPct(s.businessPurposeShare, 0)} DSCR/business-purpose share — from ${reportMeta.year} HMDA data.`
  return {
    title,
    description,
    alternates: { canonical: `/reports/investor-financing/${s.slug}` },
    openGraph: { title, description },
  }
}

function vs(label: string, stateVal: string, natVal: string) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <p className="text-sm font-medium text-text">{label}</p>
      <p className="mt-1 text-3xl font-bold text-primary">{stateVal}</p>
      <p className="mt-0.5 text-xs text-text-muted">U.S.: {natVal}</p>
    </div>
  )
}

function YoYItem({
  label,
  from,
  to,
  delta,
  dir,
}: {
  label: string
  from: string
  to: string
  delta: string
  dir: 'up' | 'down' | 'flat'
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-light">{label}</p>
      <p className="mt-0.5 text-sm text-text">
        {from} <span className="text-text-light">&rarr;</span>{' '}
        <span className="font-semibold">{to}</span>
      </p>
      <DeltaTag dir={dir}>{delta}</DeltaTag>
    </div>
  )
}

export default async function StateReportPage({
  params,
}: {
  params: Promise<{ state: string }>
}) {
  const { state } = await params
  const s = getStateBySlug(state)
  if (!s) notFound()

  const trend = getStateTrendBySlug(s.slug)
  const url = `${baseUrl}/reports/investor-financing/${s.slug}`
  const premiumRank = rankInfo(s.slug, 'ratePremiumBps')
  const denialRank = rankInfo(s.slug, 'denialRate')
  const dscrRank = rankInfo(s.slug, 'businessPurposeShare')
  const rateOk = hasRateCoverage(s)
  const prior = getPriorStateBySlug(s.slug)
  const priorRateOk = prior ? hasRateCoverage(prior) : false
  const coveragePct = fmtPct(s.rateCoverage, 0)
  // Sentence fragment placing the premium among states, or why it is not ranked.
  const premiumPlacement = premiumRank
    ? `ranks ${fmtRankInfo(premiumRank)} (1 = highest premium)`
    : `is not ranked: an interest rate was reported on only ${coveragePct} of investor loans here, below our ${fmtPct(RATE_COVERAGE_MIN, 0)} floor`
  // Same, for the body paragraph: the caveat box directly below already gives
  // the coverage figure, so don't repeat it there.
  const premiumPlacementShort = premiumRank
    ? premiumPlacement
    : `is not ranked against other states (see the caveat below)`
  const premiumRanked = rankedBy('ratePremiumBps')
  // Anchor the comparison bar to the national high, unless this IS the high state —
  // then anchor to the national low so the bar isn't a duplicate of itself.
  const isTop = premiumRanked[0].slug === s.slug
  const anchor = isTop ? premiumRanked[premiumRanked.length - 1] : premiumRanked[0]
  const premiumChart = [
    { label: s.name, value: s.ratePremiumBps ?? 0, display: String(s.ratePremiumBps ?? 0) },
    { label: 'U.S.', value: national.ratePremiumBps ?? 0, display: String(national.ratePremiumBps ?? 0) },
    {
      label: `${isTop ? 'Lowest' : 'Highest'} (${anchor.name})`,
      value: anchor.ratePremiumBps ?? 0,
      display: String(anchor.ratePremiumBps ?? 0),
    },
  ]

  const faqs = [
    {
      question: `How much more do investors pay for a mortgage in ${s.name}?`,
      answer: `In ${reportMeta.year}, the median investment-property loan in ${s.name} carried a rate of ${fmtRate(s.investorMedianRate)} versus ${fmtRate(s.ownerMedianRate)} for an owner-occupant — a premium of ${fmtBps(s.ratePremiumBps)}. That premium ${premiumPlacement}.`,
    },
    {
      question: `What share of investor loan applications are denied in ${s.name}?`,
      answer: `${fmtPct(s.denialRate)} of investment-property applications were denied in ${s.name} in ${reportMeta.year}${denialRank ? ` — ${fmtRankInfo(denialRank, '-highest')}` : ''}. The most common denial reasons were ${s.topDenialReasons.map((d) => d.reason.toLowerCase()).slice(0, 3).join(', ')}.`,
    },
    {
      question: `How common are DSCR and business-purpose investor loans in ${s.name}?`,
      answer: `${fmtPct(s.businessPurposeShare, 0)} of investor loans in ${s.name} were flagged as primarily business or commercial purpose — the bucket that includes DSCR and LLC-held loans${dscrRank ? ` (${fmtRankInfo(dscrRank, '-highest')})` : ''}. The median combined loan-to-value was ${s.investorMedianLtv?.toFixed(0)}%.`,
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', url: baseUrl },
          { name: 'Reports', url: `${baseUrl}/reports` },
          { name: 'Investor Financing Report', url: `${baseUrl}/reports/investor-financing` },
          { name: s.name, url },
        ])}
      />
      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd
        data={articleJsonLd({
          title: `Investor Financing in ${s.name} (${reportMeta.year})`,
          description: `How real estate investors finance deals in ${s.name}, from ${reportMeta.year} HMDA data.`,
          url,
          publishedAt: PUBLISHED,
          authorName: 'Bill Rice',
        })}
      />

      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-text-muted">
        <Link href="/reports/investor-financing" className="transition-colors hover:text-primary">
          Investor Financing Report
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text">{s.name}</span>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          {reportMeta.year} · {s.name}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text sm:text-4xl">
          How investors finance real estate in {s.name}
        </h1>
        <p className="mt-4 text-lg leading-7 text-text-muted">
          In {reportMeta.year}, {fmtCount(s.investorOriginations)} investment-property
          loans worth {fmtUSD(s.investorVolume)} were originated on single-family
          1-4 unit homes in {s.name}. Here&apos;s how those terms compared to the rest
          of the country.
        </p>
      </header>

      {/* State vs national stat grid */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {vs('Investor rate premium', fmtBps(s.ratePremiumBps), fmtBps(national.ratePremiumBps))}
        {vs('Denial rate', fmtPct(s.denialRate), fmtPct(national.denialRate))}
        {vs('DSCR / business-purpose', fmtPct(s.businessPurposeShare, 0), fmtPct(national.businessPurposeShare, 0))}
        {vs('Median LTV', `${s.investorMedianLtv?.toFixed(0)}%`, `${national.investorMedianLtv?.toFixed(0)}%`)}
      </section>

      {/* Year-over-year for this state */}
      {trend && (
        <section className="mt-6 rounded-2xl border border-border bg-surface px-5 py-4">
          <p className="text-sm font-semibold text-text">
            Since {priorYear} in {s.name}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-10 gap-y-3">
            <YoYItem
              label={priorRateOk && rateOk ? 'Rate premium' : 'Rate premium (partial rate data)'}
              from={fmtBps(trend.ratePremiumBps.prior)}
              to={fmtBps(trend.ratePremiumBps.current)}
              delta={fmtSignedBps(trend.ratePremiumBps.abs)}
              dir={trendDir(trend.ratePremiumBps.abs)}
            />
            <YoYItem
              label="Investor loans"
              from={fmtCount(trend.investorOriginations.prior ?? 0)}
              to={fmtCount(trend.investorOriginations.current ?? 0)}
              delta={fmtPctChange(trend.investorOriginations.pct)}
              dir={trendDir(trend.investorOriginations.abs)}
            />
            <YoYItem
              label="Denial rate"
              from={fmtPct(trend.denialRate.prior)}
              to={fmtPct(trend.denialRate.current)}
              delta={fmtSignedPts(trend.denialRate.abs)}
              dir={trendDir(trend.denialRate.abs)}
            />
            <YoYItem
              label="DSCR / business-purpose"
              from={fmtPct(trend.businessPurposeShare.prior, 0)}
              to={fmtPct(trend.businessPurposeShare.current, 0)}
              delta={fmtSignedPts(trend.businessPurposeShare.abs)}
              dir={trendDir(trend.businessPurposeShare.abs)}
            />
          </div>
        </section>
      )}

      {/* Narrative */}
      <article className="mt-12 max-w-3xl space-y-4 leading-7 text-text-muted">
        <h2 className="text-2xl font-bold text-text">What the numbers say</h2>
        <p>
          Investors in {s.name} borrowed at a median rate of{' '}
          <strong className="text-text">{fmtRate(s.investorMedianRate)}</strong>, versus{' '}
          {fmtRate(s.ownerMedianRate)} for owner-occupants —{' '}
          {indefiniteArticle(fmtBps(s.ratePremiumBps))}{' '}
          <strong className="text-text">{fmtBps(s.ratePremiumBps)}</strong> premium that{' '}
          {premiumPlacementShort}.
        </p>
        <p className={rateOk ? undefined : 'rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-text'}>
          {rateOk
            ? `An interest rate was reported on ${coveragePct} of ${s.name}'s investor originations; the medians above use those loans.`
            : `Caveat: an interest rate was reported on only ${coveragePct} of ${s.name}'s investor originations (rows marked exempt or not applicable carry none), so the investor median rate and the premium rest on a partial sample. Treat them as indicative, not comparable with other states.`}
        </p>
        <p>
          Their applications were denied{' '}
          <strong className="text-text">{fmtPct(s.denialRate)}</strong> of the time. The leading
          reasons for denial were{' '}
          {s.topDenialReasons.length > 0
            ? s.topDenialReasons.map((d) => d.reason.toLowerCase()).join(', ')
            : 'not reported'}
          .
        </p>
        <p>
          {fmtPct(s.businessPurposeShare, 0)} of investor loans were business- or
          commercial-purpose — the category that includes DSCR and LLC-held loans —
          and {fmtPct(s.cashOutShare, 0)} were cash-out refinances. The median combined
          loan-to-value across purchase and refinance loans was{' '}
          {s.investorMedianLtv?.toFixed(0)}%.
        </p>
      </article>

      {/* Chart: state vs nation */}
      <section className="mt-12 max-w-2xl">
        <BrandBarChart
          title={`Investor rate premium: ${s.name} vs the nation`}
          subtitle="Extra basis points investors pay over owner-occupants"
          unit=" bps"
          highlightTop={1}
          data={premiumChart}
        />
      </section>

      {/* FAQ */}
      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold text-text">Frequently asked questions</h2>
        <div className="mt-4 space-y-6">
          {faqs.map((f) => (
            <div key={f.question}>
              <h3 className="font-semibold text-text">{f.question}</h3>
              <p className="mt-1.5 leading-7 text-text-muted">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cross-links */}
      <div className="mt-14">
        <CalculatorRelatedTools
          heading="Run the numbers for a deal here"
          tools={[
            { label: 'DSCR Loan Qualifier', href: '/calculators/dscr' },
            { label: 'Mortgage / DSCR Payment', href: '/calculators/mortgage' },
            { label: 'All 50 states + DC ranked', href: '/reports/investor-financing' },
            { label: 'How we built this', href: '/reports/investor-financing/methodology', muted: true },
          ]}
        />
      </div>

      <p className="mt-10 text-xs text-text-muted">
        Source: {reportMeta.source}, {reportMeta.year}. Single-family 1-4 unit,
        site-built loans: home purchases, refinances, and cash-out refinances,
        originated or denied. Financed loans only — all-cash purchases are not in HMDA.
      </p>
    </div>
  )
}
