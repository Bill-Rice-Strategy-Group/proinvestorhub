#!/usr/bin/env node

/**
 * Build the year-over-year trend layer for the Investor Financing Report
 * (src/data/hmda-investor/trends.json) by diffing the current-year dataset
 * against the preserved prior-year baseline:
 *
 *   current:  src/data/hmda-investor/national.json, states.json
 *   prior:    src/data/hmda-investor/national-<PRIOR_YEAR>.json, states-<PRIOR_YEAR>.json
 *
 * Both are produced by scripts/build-hmda-investor.mjs (Data Browser) — the
 * prior year with OUT_SUFFIX=-<PRIOR_YEAR> — or, for an early-release year, by
 * scripts/build-hmda-investor-mlar.mjs. Run this after either.
 *
 * Rate-premium movers leave out any state whose interest rate was reported on
 * fewer than RATE_COVERAGE_MIN of its investor loans in either year (the same
 * floor src/data/hmda-investor/index.ts uses for rankings).
 *
 * USAGE:
 *   node scripts/build-hmda-investor-trends.mjs
 *   PRIOR_YEAR=2024 BUILD_DATE=2026-11-16 node scripts/build-hmda-investor-trends.mjs
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PRIOR_YEAR = process.env.PRIOR_YEAR ? Number(process.env.PRIOR_YEAR) : 2024
const BUILD_DATE = process.env.BUILD_DATE || null
const RATE_COVERAGE_MIN = 0.75

const DIR = path.join(path.resolve(process.cwd()), 'src', 'data', 'hmda-investor')
const read = async (f) => JSON.parse(await readFile(path.join(DIR, f), 'utf8'))

const TREND_METRICS = [
  'ratePremiumBps', 'denialRate', 'investorShare', 'businessPurposeShare',
  'investorMedianRate', 'ownerMedianRate', 'investorMedianLtv', 'cashOutShare',
  'investorOriginations', 'investorVolume',
]
// Metrics computed from reported interest rates (subject to the coverage floor).
const RATE_METRICS = new Set(['ratePremiumBps', 'investorMedianRate', 'ownerMedianRate'])

function delta(current, prior) {
  if (current == null || prior == null) return { current, prior, abs: null, pct: null }
  const abs = current - prior
  const pct = prior !== 0 ? abs / Math.abs(prior) : null
  return { current, prior, abs, pct }
}

const covered = (s) => s.rateCoverage != null && s.rateCoverage >= RATE_COVERAGE_MIN

async function main() {
  const currentNational = await read('national.json')
  const currentStates = (await read('states.json')).states
  const priorNational = await read(`national-${PRIOR_YEAR}.json`)
  const priorStates = (await read(`states-${PRIOR_YEAR}.json`)).states
  const priorByAbbr = new Map(priorStates.map((s) => [s.abbr, s]))
  const YEAR = currentNational.meta.year

  const national = {}
  for (const m of TREND_METRICS) national[m] = delta(currentNational[m], priorNational[m])

  const stateRows = []
  for (const cur of currentStates) {
    const prev = priorByAbbr.get(cur.abbr)
    if (!prev) continue
    const row = { abbr: cur.abbr, name: cur.name, slug: cur.slug, rateCovered: covered(cur) && covered(prev) }
    for (const m of TREND_METRICS) row[m] = delta(cur[m], prev[m])
    stateRows.push(row)
  }

  const byAbs = (metric, dir) =>
    stateRows
      .filter((r) => r[metric].abs != null && (dir === 'up' ? r[metric].abs > 0 : r[metric].abs < 0))
      .filter((r) => !RATE_METRICS.has(metric) || r.rateCovered)
      .sort((a, b) => (dir === 'up' ? b[metric].abs - a[metric].abs : a[metric].abs - b[metric].abs))
      .slice(0, 5)
      .map((r) => ({
        abbr: r.abbr, name: r.name, slug: r.slug,
        prior: r[metric].prior, current: r[metric].current, abs: r[metric].abs,
      }))

  const movers = {
    premiumUp: byAbs('ratePremiumBps', 'up'),
    premiumDown: byAbs('ratePremiumBps', 'down'),
    denialUp: byAbs('denialRate', 'up'),
    denialDown: byAbs('denialRate', 'down'),
    shareUp: byAbs('investorShare', 'up'),
    bizUp: byAbs('businessPurposeShare', 'up'),
  }

  const currentSource = currentNational.meta.source
  const priorSource = priorNational.meta.source ?? null
  const sameSource = currentSource === priorSource
  const note =
    (sameSource
      ? `Year-over-year compares ${PRIOR_YEAR} and ${YEAR}, both from the ${currentSource}, ` +
        'covering the same universe and computed identically.'
      : `Year-over-year compares ${PRIOR_YEAR} (${priorSource}) with ${YEAR} (${currentSource}), ` +
        'covering the same universe and computed identically.') +
    ` Rate-premium movers leave out states where fewer than ${Math.round(RATE_COVERAGE_MIN * 100)}% ` +
    'of investor loans reported an interest rate in either year.'

  const out = {
    meta: {
      currentYear: YEAR,
      priorYear: PRIOR_YEAR,
      currentSource,
      priorSource,
      note,
      generatedAt: BUILD_DATE,
    },
    national,
    states: stateRows,
    movers,
  }
  await writeFile(path.join(DIR, 'trends.json'), JSON.stringify(out, null, 2))
  const d = national
  console.log(
    `YoY ${PRIOR_YEAR}->${YEAR}: premium ${d.ratePremiumBps.abs >= 0 ? '+' : ''}${d.ratePremiumBps.abs}bps  ` +
      `orig ${(d.investorOriginations.pct * 100).toFixed(1)}%  volume ${(d.investorVolume.pct * 100).toFixed(1)}%`
  )
  console.log('Wrote src/data/hmda-investor/trends.json')
}

main().catch((e) => {
  console.error('FAILED:', e.message)
  process.exit(1)
})
