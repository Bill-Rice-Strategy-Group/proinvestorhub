#!/usr/bin/env node

/**
 * Build per-metro operating-cost inputs (Census ACS, public domain) used to
 * pre-fill the cap rate calculator from the market pages.
 *
 * Same survey and vintage as src/data/rental-yield/metros.json (ACS 1-year),
 * and the same metros (matched on CBSA code), so price, rent, tax and vacancy
 * are apples-to-apples.
 *
 *   B25103_E001  median real estate taxes paid, owner-occupied units ($/yr)
 *   B25004_E002  vacant housing units: for rent
 *   B25004_E003  vacant housing units: rented, not occupied
 *   B25003_E003  occupied housing units: renter occupied
 *
 *   rentalVacancyRate = for rent / (renter occupied + rented not occupied + for rent)
 *   (the Census Bureau's rental vacancy rate definition)
 *
 * Reads the ACS table-based summary files, which need no API key:
 *   https://www2.census.gov/programs-surveys/acs/summary_file/<year>/table-based-SF/data/1YRData/
 *
 * OUTPUT: src/data/rental-yield/metro-costs.json
 *
 *   node scripts/build-metro-costs.mjs
 *   YEAR=2024 BUILD_DATE=2026-11-16 node scripts/build-metro-costs.mjs
 *   ACS_DIR=/path/to/downloads node scripts/build-metro-costs.mjs   # read pre-downloaded .dat files
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const YEAR = process.env.YEAR || '2024'
const BUILD_DATE = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10)
const BASE = `https://www2.census.gov/programs-surveys/acs/summary_file/${YEAR}/table-based-SF/data/1YRData`

async function table(name) {
  const url = `${BASE}/acsdt1y${YEAR}-${name}.dat`
  let text
  if (process.env.ACS_DIR) {
    text = readFileSync(join(process.env.ACS_DIR, `${name}.dat`), 'utf8')
  } else {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${res.status} on ${url}`)
    text = await res.text()
  }
  const [head, ...lines] = text.trim().split('\n')
  const cols = head.split('|')
  const rows = new Map()
  for (const line of lines) {
    const v = line.split('|')
    // Metropolitan/micropolitan statistical areas: GEO_ID 310M?00US<cbsa>
    const m = v[0].match(/^310M\d00US(\d{5})$/)
    if (!m) continue
    rows.set(m[1], Object.fromEntries(cols.map((c, i) => [c, v[i]])))
  }
  return { url, rows }
}

const num = (s) => {
  const n = Number(s)
  // ACS uses negative sentinels (e.g. -666666666) for unavailable estimates.
  return Number.isFinite(n) && n >= 0 ? n : null
}

const metros = JSON.parse(readFileSync(join(root, 'src/data/rental-yield/metros.json'), 'utf8')).metros
const [tax, vacant, tenure] = await Promise.all(['b25103', 'b25004', 'b25003'].map(table))

const out = {}
let missing = 0
for (const m of metros) {
  if (!m.cbsa) continue
  const t = tax.rows.get(m.cbsa)
  const v = vacant.rows.get(m.cbsa)
  const o = tenure.rows.get(m.cbsa)
  const medianRealEstateTaxes = t ? num(t.B25103_E001) : null
  const forRent = v ? num(v.B25004_E002) : null
  const rentedNotOccupied = v ? num(v.B25004_E003) : null
  const renterOccupied = o ? num(o.B25003_E003) : null
  const denom =
    forRent !== null && rentedNotOccupied !== null && renterOccupied !== null
      ? forRent + rentedNotOccupied + renterOccupied
      : null
  const rentalVacancyRate = denom ? Math.round((forRent / denom) * 1000) / 10 : null
  if (medianRealEstateTaxes === null || rentalVacancyRate === null) missing++
  out[m.cbsa] = { name: m.name, medianRealEstateTaxes, rentalVacancyRate }
}

const doc = {
  meta: {
    year: Number(YEAR),
    dataset: `ACS ${YEAR} 1-year`,
    source: `U.S. Census Bureau, American Community Survey ${YEAR} 1-year estimates`,
    tables: {
      medianRealEstateTaxes: 'B25103_001 — median real estate taxes paid, owner-occupied housing units',
      rentalVacancyRate: 'B25004_002 / (B25003_003 + B25004_003 + B25004_002) — rental vacancy rate, %',
    },
    files: [tax.url, vacant.url, tenure.url],
    geography: 'Metropolitan statistical area (CBSA), matched to rental-yield/metros.json',
    generatedAt: BUILD_DATE,
    metroCount: Object.keys(out).length,
    metrosWithGaps: missing,
  },
  metros: out,
}
writeFileSync(join(root, 'src/data/rental-yield/metro-costs.json'), JSON.stringify(doc, null, 2) + '\n')
console.log(`wrote ${doc.meta.metroCount} metros (${missing} with gaps)`)
