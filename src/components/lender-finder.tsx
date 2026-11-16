'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { LenderData } from '@/data/lenders'
import {
  formatRate, formatLtv, formatCredit, formatLoanRange, formatText, lenderStateStatus,
} from '@/data/lenders'
import { formatMonthYear } from '@/lib/content-freshness'
import { LenderOutboundLink } from '@/components/lender-outbound-link'
import { HoneypotInput } from '@/components/honeypot-input'
import { track } from '@/lib/track'
import { loanTypes } from '@/data/loan-types'
import { usStates } from '@/data/us-states'
import { trackLenderFinderCapture, trackLenderFinderSkip } from '@/lib/tracking'

type Scenario = {
  creditScore: string
  experience: string
  loanType: string
  propertyType: string
  loanAmount: string
  state: string
}

const defaultScenario: Scenario = {
  creditScore: '',
  experience: '',
  loanType: '',
  propertyType: '',
  loanAmount: '',
  state: '',
}

const creditTiers = [
  { label: 'Under 600', value: '580' },
  { label: '600–639', value: '620' },
  { label: '640–679', value: '660' },
  { label: '680–719', value: '700' },
  { label: '720+', value: '740' },
]

const experienceLevels = [
  { label: 'First-time investor (0 deals)', value: 'none' },
  { label: '1–2 completed deals', value: 'beginner' },
  { label: '3–5 completed deals', value: 'intermediate' },
  { label: '5+ completed deals', value: 'experienced' },
]

const loanAmountRanges = [
  { label: 'Under $75K', value: '50000' },
  { label: '$75K–$150K', value: '100000' },
  { label: '$150K–$300K', value: '225000' },
  { label: '$300K–$500K', value: '400000' },
  { label: '$500K–$1M', value: '750000' },
  { label: '$1M–$3M', value: '2000000' },
  { label: '$3M+', value: '4000000' },
]

const propertyTypeOptions = [
  { label: 'Single Family (1-4 units)', value: 'sfr' },
  { label: 'Multifamily (5+ units)', value: 'multifamily' },
  { label: 'Mixed Use', value: 'mixed-use' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Short-Term Rental / Airbnb', value: 'str' },
  { label: 'Condo', value: 'condo' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'New Construction', value: 'new-construction' },
]

/**
 * Criteria-only matching against what each lender publishes. There is no score
 * and no rating: matching lenders are listed alphabetically. A lender is ruled
 * out only by a published figure that conflicts with the scenario; a figure the
 * lender doesn't publish never rules it out, but is flagged so the investor
 * knows to ask.
 */
function matchLender(
  lender: LenderData,
  scenario: Scenario,
): { matches: boolean; reasons: string[]; unknowns: string[] } {
  const reasons: string[] = []
  const unknowns: string[] = []
  let matches = true

  // Lenders that fund other lenders rather than investors are not finder results.
  if (lender.capitalProvider) return { matches: false, reasons, unknowns }

  if (scenario.creditScore) {
    const credit = parseInt(scenario.creditScore)
    if (lender.minCreditScore != null) {
      if (lender.minCreditScore > credit) matches = false
      else reasons.push(`Published credit minimum ${lender.minCreditScore}`)
    } else if (lender.noCreditMinimum) {
      reasons.push('No credit minimum on at least one program')
    } else {
      unknowns.push('credit minimum')
    }
  }

  if (scenario.experience) {
    const experienceOrder = ['none', 'beginner', 'intermediate', 'experienced']
    const userLevel = experienceOrder.indexOf(scenario.experience)
    const lenderLevel = lender.experienceRequired ? experienceOrder.indexOf(lender.experienceRequired) : -1
    if (lender.experienceRequired == null || lender.experienceRequired === 'varies') {
      unknowns.push('experience requirement')
    } else if (lenderLevel > userLevel) {
      matches = false
    } else if (lender.experienceRequired === 'none') {
      reasons.push('No experience required')
    }
  }

  if (scenario.loanType) {
    if (!lender.loanTypeSlugs.includes(scenario.loanType)) matches = false
    else reasons.push('Offers this loan type')
  }

  if (scenario.propertyType) {
    if (!lender.propertyTypes.includes(scenario.propertyType)) matches = false
  }

  if (scenario.loanAmount) {
    const amount = parseInt(scenario.loanAmount)
    const { minLoanAmount: lo, maxLoanAmount: hi } = lender
    if ((lo != null && amount < lo) || (hi != null && amount > hi)) matches = false
    else if (lo == null || hi == null) unknowns.push('full loan-size range')
  }

  if (scenario.state) {
    const status = lenderStateStatus(lender, scenario.state)
    if (status === 'no') matches = false
    else if (status === 'yes') reasons.push(`Lists ${scenario.state} as a lending state`)
    else unknowns.push('state list')
  }

  return { matches, reasons: [...new Set(reasons)], unknowns }
}

export function LenderFinder({ allLenders }: { allLenders: LenderData[] }) {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario)
  const [showResults, setShowResults] = useState(false)
  const [showEmailGate, setShowEmailGate] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  // Compute results whenever scenario changes (but only display when showResults is true)
  const computedResults = useMemo(() => {
    return allLenders
      .map((lender) => ({
        lender,
        ...matchLender(lender, scenario),
      }))
      .filter((r) => r.matches)
      .sort((a, b) => a.lender.name.localeCompare(b.lender.name))
  }, [allLenders, scenario])

  const results = showResults ? computedResults : []

  const hasFilters = Object.values(scenario).some((v) => v !== '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Show email gate instead of results directly
    setShowEmailGate(true)
    setShowResults(false)
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !firstName) return

    setEmailStatus('loading')

    // Only slugs go to the server; it looks the lenders up itself.
    const lenderSlugs = computedResults.map(({ lender }) => lender.slug)

    try {
      const res = await fetch('/api/lender-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          email,
          scenario,
          lenderSlugs,
          website,
        }),
      })

      if (res.ok) {
        trackLenderFinderCapture(email.split('@')[1] || '', scenario)
        track('generate_lead', { lead_type: 'lender_finder', form_location: 'lender_finder' })
        // /api/lender-lead also adds the contact to the newsletter segment
        track('newsletter_signup', { signup_source: 'lender_finder' })
        setShowEmailGate(false)
        setShowResults(true)
      } else {
        setEmailStatus('error')
      }
    } catch {
      setEmailStatus('error')
    }
  }

  function handleSkip() {
    trackLenderFinderSkip(scenario)
    setShowEmailGate(false)
    setShowResults(true)
  }

  function handleReset() {
    setScenario(defaultScenario)
    setShowResults(false)
    setShowEmailGate(false)
    setFirstName('')
    setEmail('')
    setEmailStatus('idle')
  }

  function updateField(field: keyof Scenario, value: string) {
    setScenario((prev) => ({ ...prev, [field]: value }))
    setShowResults(false)
    setShowEmailGate(false)
  }

  return (
    <div>
      {/* Scenario Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-6 shadow-sm mb-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Credit Score */}
          <div>
            <label htmlFor="credit" className="block text-sm font-semibold text-text mb-1.5">
              Credit Score Range
            </label>
            <select
              id="credit"
              value={scenario.creditScore}
              onChange={(e) => updateField('creditScore', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="">Any credit score</option>
              {creditTiers.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Experience */}
          <div>
            <label htmlFor="experience" className="block text-sm font-semibold text-text mb-1.5">
              Investing Experience
            </label>
            <select
              id="experience"
              value={scenario.experience}
              onChange={(e) => updateField('experience', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="">Any experience level</option>
              {experienceLevels.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Loan Type */}
          <div>
            <label htmlFor="loanType" className="block text-sm font-semibold text-text mb-1.5">
              Loan Type Needed
            </label>
            <select
              id="loanType"
              value={scenario.loanType}
              onChange={(e) => updateField('loanType', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="">Any loan type</option>
              {loanTypes.sort((a, b) => a.sortOrder - b.sortOrder).map((lt) => (
                <option key={lt.slug} value={lt.slug}>{lt.name}</option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label htmlFor="propertyType" className="block text-sm font-semibold text-text mb-1.5">
              Property Type
            </label>
            <select
              id="propertyType"
              value={scenario.propertyType}
              onChange={(e) => updateField('propertyType', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="">Any property type</option>
              {propertyTypeOptions.map((pt) => (
                <option key={pt.value} value={pt.value}>{pt.label}</option>
              ))}
            </select>
          </div>

          {/* Loan Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-text mb-1.5">
              Loan Amount
            </label>
            <select
              id="amount"
              value={scenario.loanAmount}
              onChange={(e) => updateField('loanAmount', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="">Any amount</option>
              {loanAmountRanges.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="block text-sm font-semibold text-text mb-1.5">
              Investment State
            </label>
            <select
              id="state"
              value={scenario.state}
              onChange={(e) => updateField('state', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="">Any state</option>
              {usStates.map((s) => (
                <option key={s.abbreviation} value={s.abbreviation}>{s.name}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={!hasFilters}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Find Matching Lenders
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-muted hover:text-text hover:border-text-muted transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {/* Email Gate */}
      {showEmailGate && (
        <div className="rounded-xl border border-primary/20 bg-white p-8 shadow-md mb-8">
          <div className="max-w-md mx-auto text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text">
              We Found {computedResults.length} Matching Lender{computedResults.length !== 1 ? 's' : ''}
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Enter your name and email to see your personalized results. We&apos;ll also send you a summary to reference later.
            </p>

            <form onSubmit={handleEmailSubmit} className="mt-6 space-y-3">
              <HoneypotInput value={website} onChange={setWebsite} />
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                aria-label="First name"
                className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text placeholder:text-text-light focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="w-full rounded-lg border border-border px-4 py-3 text-sm text-text placeholder:text-text-light focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={emailStatus === 'loading'}
                className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-light transition-colors disabled:opacity-60"
              >
                {emailStatus === 'loading' ? 'Loading...' : 'See My Matches'}
              </button>
            </form>

            {emailStatus === 'error' && (
              <p className="mt-2 text-xs text-red-500">
                Something went wrong. Please try again.
              </p>
            )}

            <p className="mt-3 text-xs text-text-light">
              We&apos;ll also subscribe you to our weekly investor newsletter. No spam, unsubscribe anytime.
            </p>

            <button
              type="button"
              onClick={handleSkip}
              className="mt-4 text-xs text-text-light hover:text-text-muted transition-colors underline decoration-text-light/40"
            >
              Skip, just show results
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div>
          <h2 className="text-xl font-bold text-text mb-2">
            {results.length > 0
              ? `${results.length} Lender${results.length !== 1 ? 's' : ''} Match Your Scenario (A–Z)`
              : 'No Exact Matches Found'}
          </h2>

          {results.length === 0 && (
            <div className="rounded-xl border border-border bg-white p-8 text-center mb-8">
              <p className="text-text-muted mb-4">
                No lenders in our directory match all of your criteria. Try
                adjusting your filters — particularly credit score, loan amount,
                or property type.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4 mb-8">
              {results.map(({ lender, reasons, unknowns }) => (
                <div
                  key={lender.slug}
                  className="rounded-xl border border-border bg-white p-6 shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/lenders/reviews/${lender.slug}`}
                          className="text-lg font-bold text-text hover:text-primary transition-colors"
                        >
                          {lender.name}
                        </Link>
                      </div>
                      <p className="mt-1 text-sm text-text-muted line-clamp-2">
                        {lender.description}
                      </p>
                    </div>
                  </div>

                  {/* Key Stats Row */}
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6 text-xs">
                    <div>
                      <span className="text-text-light">Rates</span>
                      <p className="font-semibold text-text tabular-nums">
                        {formatRate(lender)}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light">Max LTV</span>
                      <p className="font-semibold text-text tabular-nums">{formatLtv(lender)}</p>
                    </div>
                    <div>
                      <span className="text-text-light">Min Credit</span>
                      <p className="font-semibold text-text tabular-nums">{formatCredit(lender)}</p>
                    </div>
                    <div>
                      <span className="text-text-light">Close In</span>
                      <p className="font-semibold text-text">{formatText(lender.speedToClose)}</p>
                    </div>
                    <div>
                      <span className="text-text-light">Loan Range</span>
                      <p className="font-semibold text-text tabular-nums">
                        {formatLoanRange(lender)}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-light">Fee</span>
                      <p className="font-semibold text-text">{formatText(lender.originationFee)}</p>
                    </div>
                  </div>

                  {unknowns.length > 0 && (
                    <p className="mt-3 text-xs text-amber-700">
                      Not published by {lender.name}: {unknowns.join(', ')} — confirm before applying.
                    </p>
                  )}
                  {lender.lastReviewed && (
                    <p className="mt-2 text-xs text-text-light">
                      Figures verified {formatMonthYear(lender.lastReviewed)} from {lender.name}&apos;s site.
                    </p>
                  )}

                  {/* Match Reasons */}
                  {reasons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {reasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-medium text-green-700"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/lenders/reviews/${lender.slug}`}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
                    >
                      Full Review
                    </Link>
                    <LenderOutboundLink
                      websiteUrl={lender.website}
                      lenderName={lender.name}
                      lenderSlug={lender.slug}
                      placement="finder-result"
                      loanType={scenario.loanType || undefined}
                      state={scenario.state || undefined}
                      className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                    >
                      Visit Website
                    </LenderOutboundLink>
                    <Link
                      href="/lenders/compare"
                      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      Compare
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
