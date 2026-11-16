/**
 * Lender-vs-lender comparison pairings for programmatic SEO pages.
 * Each pairing generates a /lenders/compare/[slug] page.
 *
 * Only the pairing is hand-written. Everything a page says about the two lenders
 * — title, description, the summary paragraph, shared products — is derived from
 * the verified figures in lenders.ts, so a comparison can never drift from the
 * lender data or declare a "winner". There is no scoring rule: compares show the
 * two lenders' published facts side by side.
 */

import { lenders, formatRate, type LenderData } from './lenders'
import { loanTypes } from './loan-types'

export type LenderComparison = {
  slug: string
  lenderA: string // slug
  lenderB: string // slug
  title: string
  metaTitle: string
  metaDescription: string
  /** Neutral, data-derived summary of the two lenders. */
  angle: string
  sharedLoanTypes: string[] // loan type slugs they both offer
  /** Older of the two lenders' lastReviewed dates (ISO), when both are verified. */
  lastReviewed?: string
}

/** [page slug, lender A slug, lender B slug]. URLs are kept stable. */
const PAIRS: Array<[string, string, string]> = [
  ['kiavi-vs-lima-one', 'kiavi', 'lima-one-capital'],
  ['kiavi-vs-rcn-capital', 'kiavi', 'rcn-capital'],
  ['lima-one-vs-rcn-capital', 'lima-one-capital', 'rcn-capital'],
  ['kiavi-vs-visio-lending', 'kiavi', 'visio-lending'],
  ['visio-lending-vs-griffin-funding', 'visio-lending', 'griffin-funding'],
  ['angel-oak-vs-griffin-funding', 'angel-oak', 'griffin-funding'],
  ['defy-mortgage-vs-griffin-funding', 'defy-mortgage', 'griffin-funding'],
  ['kiavi-vs-new-silver', 'kiavi', 'new-silver'],
  ['new-silver-vs-groundfloor', 'new-silver', 'groundfloor'],
  ['lima-one-vs-civic-financial', 'lima-one-capital', 'civic-financial'],
  ['corevest-vs-lima-one', 'corevest', 'lima-one-capital'],
  ['corevest-vs-velocity-mortgage', 'corevest', 'velocity-mortgage'],
  ['kiavi-vs-tidal-loans', 'kiavi', 'tidal-loans'],
  ['easy-street-vs-kiavi', 'easy-street-capital', 'kiavi'],
  ['defy-mortgage-vs-visio-lending', 'defy-mortgage', 'visio-lending'],
  ['rcn-capital-vs-groundfloor', 'rcn-capital', 'groundfloor'],
  ['park-place-vs-groundfloor', 'park-place-finance', 'groundfloor'],
  ['kiavi-vs-corevest', 'kiavi', 'corevest'],
  ['lima-one-vs-roc-capital', 'lima-one-capital', 'roc-capital'],
  ['roc-capital-vs-rcn-capital', 'roc-capital', 'rcn-capital'],
  ['kiavi-vs-civic-financial', 'kiavi', 'civic-financial'],
  ['kiavi-vs-griffin-funding', 'kiavi', 'griffin-funding'],
  ['lima-one-vs-new-silver', 'lima-one-capital', 'new-silver'],
  ['new-silver-vs-rcn-capital', 'new-silver', 'rcn-capital'],
  ['visio-lending-vs-lendency', 'visio-lending', 'lendency'],
  ['angel-oak-vs-visio-lending', 'angel-oak', 'visio-lending'],
  ['kiavi-vs-upright', 'kiavi', 'arrived'],
  ['groundfloor-vs-upright', 'groundfloor', 'arrived'],
  ['civic-financial-vs-roc-capital', 'civic-financial', 'roc-capital'],
  ['kiavi-vs-roc-capital', 'kiavi', 'roc-capital'],
  ['lima-one-vs-visio-lending', 'lima-one-capital', 'visio-lending'],
  ['rcn-capital-vs-civic-financial', 'rcn-capital', 'civic-financial'],
]

const bySlug = (slug: string) => lenders.find((l) => l.slug === slug)

function factLine(l: LenderData): string {
  const parts: string[] = []
  const rate = formatRate(l)
  parts.push(rate === 'Not published' ? 'no published rates' : `rates ${rate.replace('From', 'from')}`)
  if (l.minCreditScore != null) parts.push(`a ${l.minCreditScore} minimum credit score on at least one program`)
  else if (l.noCreditMinimum) parts.push('no credit-score minimum on at least one program')
  else parts.push('no published credit minimum')
  parts.push(l.coverage ? `coverage: ${l.coverage}` : 'no published state list')
  return `${l.name} publishes ${parts.join('; ')}.`
}

function buildAngle(a: LenderData, b: LenderData, shared: string[]): string {
  const names = shared
    .map((s) => loanTypes.find((lt) => lt.slug === s)?.shortName)
    .filter(Boolean) as string[]
  const out: string[] = []
  if (names.length) out.push(`Both lenders list ${names.join(', ')}.`)
  out.push(factLine(a), factLine(b))
  const sl = [a.slug, b.slug]
  if (sl.includes('civic-financial') && sl.includes('roc-capital')) {
    out.push('Civic and Roc Capital are sibling brands under Roc360, so a quote from each is not an independent comparison.')
  }
  for (const l of [a, b]) {
    if (l.capitalProvider) out.push(`${l.name} funds loans made by private lenders and originators rather than lending to investors directly.`)
  }
  out.push('Terms depend on your credit, property and deal — get a written quote from each.')
  return out.join(' ')
}

function build([slug, aSlug, bSlug]: [string, string, string]): LenderComparison {
  const a = bySlug(aSlug)
  const b = bySlug(bSlug)
  if (!a || !b) throw new Error(`lender-comparisons: unknown lender in ${slug}`)
  const shared = a.loanTypeSlugs.filter((s) => b.loanTypeSlugs.includes(s))
  const dates = [a.lastReviewed, b.lastReviewed]
  const lastReviewed = dates.every(Boolean) ? (dates as string[]).sort()[0] : undefined
  return {
    slug,
    lenderA: aSlug,
    lenderB: bSlug,
    title: `${a.name} vs ${b.name}: Loan Terms Side by Side`,
    metaTitle: `${a.name} vs ${b.name} 2026: Rates, LTV & Terms Compared | ProInvestorHub`,
    metaDescription: `${a.name} vs ${b.name}: published rates, LTV, credit minimums, loan sizes and state coverage side by side, checked against each lender's own site.`,
    angle: buildAngle(a, b, shared),
    sharedLoanTypes: shared,
    lastReviewed,
  }
}

export const lenderComparisons: LenderComparison[] = PAIRS.map(build)

export function getComparisonBySlug(slug: string): LenderComparison | undefined {
  return lenderComparisons.find((c) => c.slug === slug)
}

export function getComparisonData(comparison: LenderComparison): {
  comparison: LenderComparison
  lenderA: LenderData
  lenderB: LenderData
} | null {
  const lenderA = bySlug(comparison.lenderA)
  const lenderB = bySlug(comparison.lenderB)
  if (!lenderA || !lenderB) return null
  return { comparison, lenderA, lenderB }
}

export function getComparisonsForLender(lenderSlug: string): LenderComparison[] {
  return lenderComparisons.filter(
    (c) => c.lenderA === lenderSlug || c.lenderB === lenderSlug
  )
}
