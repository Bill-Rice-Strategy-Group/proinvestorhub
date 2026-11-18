/**
 * Send a GA4 event. The site loads gtag.js directly (src/components/analytics.tsx);
 * GTM is no longer used, so GTM-style `dataLayer.push({ event: ... })` objects
 * would never reach GA4. Every client-side event goes through this helper.
 */
export function track(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void }
  w.dataLayer = w.dataLayer || []
  if (typeof w.gtag === 'function') {
    w.gtag('event', name, params)
    return
  }
  // gtag.js only reads Arguments objects from dataLayer, never plain arrays/objects
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;(function (..._a: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments)
  })('event', name, params)
}

/**
 * True when a lead-form POST was really accepted by the server, so the form's
 * success events (`generate_lead`, `newsletter_signup`, …) may fire.
 *
 * The form APIs answer spam they silently drop (honeypot, gibberish name, bad
 * origin) with `{ success: true, accepted: false }` so the bot still sees a
 * success page. Those must not count as leads. Any other 2xx counts.
 */
export async function isCountableLead(res: Response): Promise<boolean> {
  if (!res.ok) return false
  try {
    const body: unknown = await res.clone().json()
    return !(body && typeof body === 'object' && (body as { accepted?: unknown }).accepted === false)
  } catch {
    return true
  }
}
