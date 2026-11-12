import { track } from '@/lib/track'

export function trackLeadCapture(
  source:
    | 'lender-finder'
    | 'calculator-save'
    | 'lead-magnet'
    | 'newsletter'
    | 'exit-intent'
    | 'sticky-cta'
    | `report-${string}`,
  emailDomain: string,
  metadata?: Record<string, unknown>
) {
  track('lead_capture', {
    lead_source: source,
    email_domain: emailDomain,
    ...metadata,
  })
}

export function trackCtaImpression(
  ctaType: string,
  location: string
) {
  track('cta_impression', {
    cta_type: ctaType,
    cta_location: location,
  })
}

export function trackCtaClick(
  ctaType: string,
  location: string,
  destination?: string
) {
  track('cta_click', {
    cta_type: ctaType,
    cta_location: location,
    ...(destination && { cta_destination: destination }),
  })
}

export function trackCtaDismiss(ctaType: string) {
  track('cta_dismiss', {
    cta_type: ctaType,
  })
}

export function trackLenderFinderCapture(
  emailDomain: string,
  scenario: Record<string, unknown>
) {
  track('lender_finder_email_capture', {
    email_domain: emailDomain,
    ...scenario,
  })
}

export function trackLenderFinderSkip(scenario: Record<string, unknown>) {
  track('lender_finder_skip', {
    ...scenario,
  })
}

export function trackCalculatorSave(
  calculatorName: string,
  emailDomain: string,
  results?: Record<string, unknown>
) {
  track('calculator_results_save', {
    calculator_name: calculatorName,
    email_domain: emailDomain,
    ...results,
  })
}
