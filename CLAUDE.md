# proinvestorhub — notes for Claude sessions

ProInvestorHub (proinvestorhub.com): a BRSG-owned financing hub for real-estate investors —
lender directory and comparisons, calculators, market data reports and a newsletter. Next.js
(App Router) on Vercel, content in Sanity, email through Resend. Work items live in `BACKLOG.md`.

## Analytics

GA4 (`G-W64237445E`) is loaded directly by `src/components/analytics.tsx` — no GTM. Every
client event goes through `track()` in `src/lib/track.ts`. Lead forms fire `generate_lead`
(plus `newsletter_signup` when the contact joins the list) only after the API confirms the
submission, gated by `isCountableLead()` so silently dropped spam is never counted. Outbound
clicks: `lender_cta_click`, `bp_referral_click`, `tool_referral_click`. These names are what the
BRSG portfolio report counts; do not rename them.

## SEO data: DataForSEO only. Never Ahrefs.
BRSG has no Ahrefs account and never has. Third-party SEO data for BRSG sites (rankings, keyword volumes, backlinks, competitors, top pages) comes from **DataForSEO**: its API in code (`DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD`), or the DataForSEO MCP in Claude sessions.
- Do not call Ahrefs, add an Ahrefs key, or suggest Ahrefs as a fix, fallback or purchase.
- DataForSEO's domain `rank` is its own 0–1000 scale. Never call it "DR" or "Domain Rating".
- First-party data (Search Console, GA4) outranks any third-party estimate. Label DataForSEO numbers as estimates.

## Before pushing

```bash
npx tsc --noEmit
npm run lint
npm run build
```
