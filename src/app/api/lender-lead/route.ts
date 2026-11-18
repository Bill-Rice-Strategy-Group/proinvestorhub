import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { LenderMatchEmail } from '@/emails/lender-match'
import { isGoodOrigin, isHoneypotFilled, isGibberishName, SPAM_DROPPED } from '@/lib/anti-spam'
import {
  getLenderBySlug, formatRate, formatLtv, formatCredit, formatCoverage,
} from '@/data/lenders'
import { formatMonthYear } from '@/lib/content-freshness'
import { loanTypes } from '@/data/loan-types'
import { usStates } from '@/data/us-states'
import type { LenderMatch, Scenario } from '@/emails/lender-match'

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/
const NAME_RE = /^[\p{L}\p{M}' .-]{1,40}$/u
const CREDIT_VALUES = new Set(['580', '620', '660', '700', '740'])
const MAX_LENDERS = 25

/**
 * Lender details are looked up here from the verified directory data. The
 * browser sends only lender slugs; anything else it sends about a lender is
 * ignored, so the email can't be made to carry injected names, links or terms.
 */
function lookUpLenders(raw: unknown): LenderMatch[] {
  if (!Array.isArray(raw)) return []
  const slugs = [...new Set(raw.filter((s): s is string => typeof s === 'string' && /^[a-z0-9-]{1,60}$/.test(s)))]
  return slugs
    .slice(0, MAX_LENDERS)
    .map((slug) => getLenderBySlug(slug))
    .filter((l) => l !== undefined && !l.capitalProvider)
    .map((l) => ({
      name: l!.name,
      slug: l!.slug,
      rates: formatRate(l!),
      maxLtv: formatLtv(l!),
      minCredit: formatCredit(l!),
      coverage: formatCoverage(l!),
      verified: formatMonthYear(l!.lastReviewed),
    }))
}

/** Keep only known scenario fields with whitelisted values. */
function cleanScenario(raw: unknown): Scenario {
  if (!raw || typeof raw !== 'object') return {}
  const r = raw as Record<string, unknown>
  const out: Scenario = {}
  if (typeof r.creditScore === 'string' && CREDIT_VALUES.has(r.creditScore)) out.creditScore = r.creditScore
  if (typeof r.loanType === 'string') {
    const lt = loanTypes.find((x) => x.slug === r.loanType)
    if (lt) out.loanType = lt.name
  }
  if (typeof r.state === 'string') {
    const st = usStates.find((x) => x.abbreviation === r.state)
    if (st) out.state = st.name
  }
  return out
}

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function POST(request: Request) {
  try {
    if (!isGoodOrigin(request)) {
      return NextResponse.json(SPAM_DROPPED)
    }

    const body: unknown = await request.json().catch(() => null)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (isHoneypotFilled(body as Record<string, unknown>)) {
      return NextResponse.json(SPAM_DROPPED)
    }

    const fields = body as Record<string, unknown>
    const firstName = typeof fields.firstName === 'string' ? fields.firstName.trim() : ''
    const email = typeof fields.email === 'string' ? fields.email.trim() : ''

    if (isGibberishName(firstName)) {
      return NextResponse.json(SPAM_DROPPED)
    }

    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!firstName || !NAME_RE.test(firstName)) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      )
    }

    const scenario = cleanScenario(fields.scenario)
    const matches = lookUpLenders(fields.lenderSlugs)

    const resend = getResend()
    if (!resend) {
      console.log('[Lender Lead] Resend not configured; skipping send', scenario)
      return NextResponse.json({ success: true })
    }

    const segmentIds = process.env.RESEND_SEGMENT_ID
      ? [{ id: process.env.RESEND_SEGMENT_ID }]
      : undefined

    const results = await Promise.allSettled([
      resend.contacts.create({
        email,
        firstName,
        unsubscribed: false,
        ...(segmentIds && { segments: segmentIds }),
      }),

      resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL ||
          'ProInvestorHub <noreply@proinvestorhub.com>',
        to: email,
        subject: `${firstName}, Your Lender Matches Are Ready`,
        react: LenderMatchEmail({
          firstName,
          topMatches: matches,
          scenario,
        }),
      }),
    ])

    const contactResult = results[0]
    const emailResult = results[1]

    if (contactResult.status === 'rejected') {
      console.error('[Lender Lead] Contact create failed:', contactResult.reason)
    }
    if (emailResult.status === 'rejected') {
      console.error('[Lender Lead] Email send failed:', emailResult.reason)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Lender Lead] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
