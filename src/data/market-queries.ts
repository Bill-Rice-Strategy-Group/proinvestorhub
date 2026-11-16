/**
 * Market city data access.
 *
 * The numbers come from the committed, sourced dataset in `cap-rate-cities.ts`
 * (Census ACS 2024 1-year + HUD FMR), NOT from Sanity. The `marketCity` docs in
 * Sanity had drifted from the repo with no committed updater (e.g. Akron's
 * population differed between two pages), so they are no longer read for
 * metrics. Sanity remains the source for editorial blocks such as neighborhoods
 * (see the cap-rate city page).
 *
 * The async signatures are kept so callers do not change.
 */

import {
  cities,
  type CityCapRate,
  ACS_SOURCE_LABEL,
  FMR_SOURCE_LABEL,
  DATA_GENERATED_AT,
} from './cap-rate-cities'

export type MarketCity = CityCapRate

export type DataFreshness = {
  dataUpdatedAt: string | null
  dataSources: string[]
}

export async function getMarketCities(): Promise<MarketCity[]> {
  return cities
}

export async function getDataFreshness(): Promise<DataFreshness> {
  return {
    dataUpdatedAt: DATA_GENERATED_AT,
    dataSources: [ACS_SOURCE_LABEL, FMR_SOURCE_LABEL],
  }
}
