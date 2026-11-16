import costs from './rental-yield/metro-costs.json'

/**
 * Per-metro operating-cost inputs from Census ACS (same vintage and metros as
 * rental-yield/metros.json). Built by scripts/build-metro-costs.mjs.
 * Fields are null when ACS publishes no estimate for that metro — callers must
 * leave the input blank rather than substitute a guess.
 */
export type MetroCosts = {
  /** Median annual real estate taxes paid by owner-occupied units (ACS B25103), $ */
  medianRealEstateTaxes: number | null
  /** Rental vacancy rate (ACS B25004 / B25003), percent */
  rentalVacancyRate: number | null
}

export const metroCostsMeta = costs.meta

const byCbsa = costs.metros as Record<string, MetroCosts & { name: string }>

export function getMetroCosts(cbsa: string | null | undefined): MetroCosts | null {
  if (!cbsa) return null
  return byCbsa[cbsa] ?? null
}
