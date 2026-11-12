import Script from 'next/script'

// The GA4 measurement ID that GTM-5J446HT5's Google tag used, which collected
// all of this property's history — keep it so data stays continuous.
// GTM is no longer loaded: its container only held that base tag, so none of
// the site's dataLayer events ever reached GA4. gtag.js is loaded directly
// instead, and events go through `track()` in src/lib/track.ts.
const GA4_MEASUREMENT_ID = 'G-W64237445E'

// NEXT_PUBLIC_GA_MEASUREMENT_ID is read only to flag a mismatch in the build
// log; it never overrides the constant above (a different ID would split the
// property's history).
const ENV_GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
if (ENV_GA_MEASUREMENT_ID && ENV_GA_MEASUREMENT_ID !== GA4_MEASUREMENT_ID) {
  console.warn(
    `[analytics] NEXT_PUBLIC_GA_MEASUREMENT_ID (${ENV_GA_MEASUREMENT_ID}) differs from ${GA4_MEASUREMENT_ID}; using ${GA4_MEASUREMENT_ID}.`
  )
}

// Only fire analytics on the canonical production host, so Vercel preview/deploy
// URLs (*.vercel.app), localhost, and bots crawling non-prod builds don't pollute
// the GA4 property — this was the main source of inflated "Direct" sessions.
const PROD_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://proinvestorhub.com').hostname
  } catch {
    return 'proinvestorhub.com'
  }
})()

// Server-side guard: never render analytics on non-production Vercel deploys
// (preview/branch). The client-side PROD_HOST check below additionally blocks
// the production deploy when reached via its *.vercel.app alias.
const IS_NON_PROD_DEPLOY =
  !!process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production'

export function GoogleAnalytics() {
  if (IS_NON_PROD_DEPLOY) return null

  return (
    <>
      {/* The gtag stub and config are a plain inline script in <head>, so they
          run during HTML parse, before hydration. Events that components fire
          on mount (e.g. ai_referral) therefore queue behind the config command
          instead of ahead of it. gtag.js loads afterInteractive and drains the
          queue. */}
      <script
        id="ga4-init"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
if(location.hostname==='${PROD_HOST}'){gtag('config','${GA4_MEASUREMENT_ID}');}`,
        }}
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
    </>
  )
}
