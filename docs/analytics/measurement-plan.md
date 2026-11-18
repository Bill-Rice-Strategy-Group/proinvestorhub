# ProInvestorHub — Measurement Plan (GA4 + GTM)

> **Superseded 2026-11-12 (PR #69).** GTM no longer loads; gtag.js is loaded directly
> (`src/components/analytics.tsx`) and every event goes through `track()` in
> `src/lib/track.ts`. The site sends `generate_lead` and `newsletter_signup` itself on
> form success, so the GTM container import below is obsolete. The only remaining step is
> GA4 Admin: mark `generate_lead` and `newsletter_signup` as Key events. Kept for history.

> Closes the P0-1 backlog item: GA4 attribution + key-event cleanup.
> Status as of 2026-06-29: **client-side dataLayer events already fire** (see inventory).
> The remaining work is GTM container config + GA4 Admin — done in the UIs below,
> not in app code.

/ IDs (public) /
- **GA4 Measurement ID:** `G-W64237445E`
- **GTM Container:** `GTM-5J446HT5`
- GA4 is loaded **through GTM** (`src/components/analytics.tsx` returns the direct
  `GoogleAnalytics` tag as `null` whenever `GTM_ID` is set). So every GA4 event must
  be created as a tag **inside the GTM container** — pushing to `dataLayer` alone
  does not reach GA4.

---

## Why this matters (the problem we're fixing)

The 2026-06-19 audit and the 2026-06-29 automation bundle both show the same thing:
- GA4 sessions are ~91% **"Direct"** and the WoW spike is **not** corroborated by GSC
  (impressions flat) → bot/referrer-loss, not real growth.
- Only **3 key events** fired in 28 days → the conversion funnel is invisible.
- 163 sessions/week but **0 organic GSC clicks** → all traffic is non-organic and the
  source is unidentified (and therefore fragile).

Until measurement is trustworthy, traffic and conversion numbers are not decision-grade,
and every other backlog item (LCP fix, cap-rate push) is unmeasurable.

---

## dataLayer event inventory (already firing in app code)

| dataLayer event | Pushed by | Intent |
|---|---|---|
| `newsletter_signup` | `newsletter-signup.tsx` | Lead |
| `lead_capture` | `tracking.ts` → sticky-cta, lead-magnet, gated-content, exit-intent | Lead |
| `lender_finder_email_capture` | `lender-finder.tsx` | Lead |
| `calculator_results_save` | `save-results-cta.tsx` | Lead |
| `bp_referral_click` | `partner-cta.tsx` | Outbound partner click |
| `lender_cta_click` | lender review/compare | Outbound partner click |
| `tool_referral_click` | `tool-recommendations.tsx` | Outbound partner click |
| `cta_click` / `cta_impression` / `cta_dismiss` | `tracking.ts` | Engagement |
| `calculator_interaction` | calculators | Engagement |
| `markets_interaction` (`action: download_pdf`) | `download-pdf.tsx` | Report download (engagement) |
| `lender_finder_skip` | `lender-finder.tsx` | Engagement |

No app-code change is required — the events are live in production.

---

## GA4 mapping (what GTM creates)

| GA4 event | = Key Event? | Fires on dataLayer events (regex) |
|---|---|---|
| **`generate_lead`** | **Yes** | `^(newsletter_signup\|lead_capture\|lender_finder_email_capture\|calculator_results_save)$` |
| **`partner_outbound_click`** | **Yes** | `^(bp_referral_click\|lender_cta_click\|tool_referral_click)$` |
| `cta_click`, `calculator_interaction`, `markets_interaction` | No (engagement) | leave as standard events |

Both Key-Event tags ship in `gtm-container-proinvestorhub.json` (import-ready).

---

## Step 1 — Import the GTM container (≈5 min)

1. GTM → **Admin → Import Container**.
2. Choose `docs/analytics/gtm-container-proinvestorhub.json`.
3. Workspace: **New** (e.g. "Measurement P0-1"). Import option: **Merge → Rename conflicting tags/triggers/variables**. (Merge never deletes existing tags.)
4. Confirm. You'll see two new GA4 event tags (`GA4 - generate_lead`, `GA4 - partner_outbound_click`), two custom-event triggers, the `CONST - GA4 Measurement ID` variable, and supporting Data Layer variables.
5. **Preview** with GTM Tag Assistant on proinvestorhub.com: submit a newsletter signup → confirm `generate_lead` fires; click a BiggerPockets/lender CTA → confirm `partner_outbound_click` fires.
6. **Submit / Publish** the workspace.

> The import does **not** add or change the GA4 configuration tag — GA4 is already
> collecting, so we only add event tags. If Preview shows the GA4 config tag missing,
> tell me and I'll add a Google-tag config block.

## Step 2 — Mark the two as Key Events in GA4 (≈2 min)

GA4 → **Admin → Key events → New key event** → type the name exactly:
- `generate_lead`
- `partner_outbound_click`

(Type the name directly — don't wait for the auto-populated event list; it lags ~24h.)

## Step 3 — GA4 Admin data hygiene (≈5 min) — fixes the 91% "Direct"

1. **Admin → Data Streams → [web stream] → Configure tag settings → Show more →
   Define internal traffic / List unwanted referrals** — add payment/auth and any
   known referrers that shouldn't start new sessions.
2. **Admin → Data Settings → Data Filters** — confirm the **bot-traffic exclusion**
   is active (GA4 excludes known bots by default; verify it's not been disabled).
3. Confirm the GTM GA4 page_view keeps `page_referrer` on every load (DebugView):
   the `afterInteractive` load (shipped 2026-06-13) means the referrer-bearing
   pageview now fires even on bounce.

## Step 4 — Identify the non-organic traffic source (≈5 min) — needs your GA4 access

My MCP can't read the BRSG GA4 property (403, Kaleidico-scoped). In GA4:
- **Reports → Acquisition → Traffic acquisition**, last 28 days, primary dimension
  **Session source / medium**. The 163 sessions/week with 0 organic clicks resolve
  to a real source here. If it's a single referrer/campaign, document it (fragile —
  protect it); if it's `(direct) / (none)` bots, Steps 1–3 should shrink it.

---

## Fleet note

This mirrors the canonical BRSG measurement plan (see memory
`tools/feedback_gtm_container_export_schema`). The only PIH-specific change vs. the
fleet template is adding `bp_referral_click` to the `partner_outbound_click` regex
(PIH uses the BiggerPockets partner CTA). Reuse on another site by importing the JSON
and changing only the `CONST - GA4 Measurement ID` value.
