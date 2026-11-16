/**
 * US states data for programmatic lender directory pages.
 * Maps state abbreviations, names, slugs, and regional context.
 */

export type USState = {
  name: string
  slug: string
  abbreviation: string
  region: 'northeast' | 'southeast' | 'midwest' | 'southwest' | 'west'
}

export const usStates: USState[] = [
  { name: 'Alabama', slug: 'alabama', abbreviation: 'AL', region: 'southeast' },
  { name: 'Alaska', slug: 'alaska', abbreviation: 'AK', region: 'west' },
  { name: 'Arizona', slug: 'arizona', abbreviation: 'AZ', region: 'southwest' },
  { name: 'Arkansas', slug: 'arkansas', abbreviation: 'AR', region: 'southeast' },
  { name: 'California', slug: 'california', abbreviation: 'CA', region: 'west' },
  { name: 'Colorado', slug: 'colorado', abbreviation: 'CO', region: 'west' },
  { name: 'Connecticut', slug: 'connecticut', abbreviation: 'CT', region: 'northeast' },
  { name: 'Delaware', slug: 'delaware', abbreviation: 'DE', region: 'northeast' },
  { name: 'Florida', slug: 'florida', abbreviation: 'FL', region: 'southeast' },
  { name: 'Georgia', slug: 'georgia', abbreviation: 'GA', region: 'southeast' },
  { name: 'Hawaii', slug: 'hawaii', abbreviation: 'HI', region: 'west' },
  { name: 'Idaho', slug: 'idaho', abbreviation: 'ID', region: 'west' },
  { name: 'Illinois', slug: 'illinois', abbreviation: 'IL', region: 'midwest' },
  { name: 'Indiana', slug: 'indiana', abbreviation: 'IN', region: 'midwest' },
  { name: 'Iowa', slug: 'iowa', abbreviation: 'IA', region: 'midwest' },
  { name: 'Kansas', slug: 'kansas', abbreviation: 'KS', region: 'midwest' },
  { name: 'Kentucky', slug: 'kentucky', abbreviation: 'KY', region: 'southeast' },
  { name: 'Louisiana', slug: 'louisiana', abbreviation: 'LA', region: 'southeast' },
  { name: 'Maine', slug: 'maine', abbreviation: 'ME', region: 'northeast' },
  { name: 'Maryland', slug: 'maryland', abbreviation: 'MD', region: 'northeast' },
  { name: 'Massachusetts', slug: 'massachusetts', abbreviation: 'MA', region: 'northeast' },
  { name: 'Michigan', slug: 'michigan', abbreviation: 'MI', region: 'midwest' },
  { name: 'Minnesota', slug: 'minnesota', abbreviation: 'MN', region: 'midwest' },
  { name: 'Mississippi', slug: 'mississippi', abbreviation: 'MS', region: 'southeast' },
  { name: 'Missouri', slug: 'missouri', abbreviation: 'MO', region: 'midwest' },
  { name: 'Montana', slug: 'montana', abbreviation: 'MT', region: 'west' },
  { name: 'Nebraska', slug: 'nebraska', abbreviation: 'NE', region: 'midwest' },
  { name: 'Nevada', slug: 'nevada', abbreviation: 'NV', region: 'west' },
  { name: 'New Hampshire', slug: 'new-hampshire', abbreviation: 'NH', region: 'northeast' },
  { name: 'New Jersey', slug: 'new-jersey', abbreviation: 'NJ', region: 'northeast' },
  { name: 'New Mexico', slug: 'new-mexico', abbreviation: 'NM', region: 'southwest' },
  { name: 'New York', slug: 'new-york', abbreviation: 'NY', region: 'northeast' },
  { name: 'North Carolina', slug: 'north-carolina', abbreviation: 'NC', region: 'southeast' },
  { name: 'North Dakota', slug: 'north-dakota', abbreviation: 'ND', region: 'midwest' },
  { name: 'Ohio', slug: 'ohio', abbreviation: 'OH', region: 'midwest' },
  { name: 'Oklahoma', slug: 'oklahoma', abbreviation: 'OK', region: 'southwest' },
  { name: 'Oregon', slug: 'oregon', abbreviation: 'OR', region: 'west' },
  { name: 'Pennsylvania', slug: 'pennsylvania', abbreviation: 'PA', region: 'northeast' },
  { name: 'Rhode Island', slug: 'rhode-island', abbreviation: 'RI', region: 'northeast' },
  { name: 'South Carolina', slug: 'south-carolina', abbreviation: 'SC', region: 'southeast' },
  { name: 'South Dakota', slug: 'south-dakota', abbreviation: 'SD', region: 'midwest' },
  { name: 'Tennessee', slug: 'tennessee', abbreviation: 'TN', region: 'southeast' },
  { name: 'Texas', slug: 'texas', abbreviation: 'TX', region: 'southwest' },
  { name: 'Utah', slug: 'utah', abbreviation: 'UT', region: 'west' },
  { name: 'Vermont', slug: 'vermont', abbreviation: 'VT', region: 'northeast' },
  { name: 'Virginia', slug: 'virginia', abbreviation: 'VA', region: 'southeast' },
  { name: 'Washington', slug: 'washington', abbreviation: 'WA', region: 'west' },
  { name: 'West Virginia', slug: 'west-virginia', abbreviation: 'WV', region: 'southeast' },
  { name: 'Wisconsin', slug: 'wisconsin', abbreviation: 'WI', region: 'midwest' },
  { name: 'Wyoming', slug: 'wyoming', abbreviation: 'WY', region: 'west' },
]

export function getStateBySlug(slug: string): USState | undefined {
  return usStates.find((s) => s.slug === slug)
}

export function getStateByAbbreviation(abbr: string): USState | undefined {
  return usStates.find((s) => s.abbreviation === abbr.toUpperCase())
}

/** State-specific investing context for richer programmatic pages */
export const stateInvestingContext: Record<string, {
  highlights: string
  landlordFriendly: 'friendly' | 'moderate' | 'strict'
  noStateTax: boolean
  keyMarkets: string[]
}> = {
  alabama: {
    highlights: 'Landlord-friendly laws. Birmingham, Huntsville, Mobile, and Montgomery are the main investor markets.',
    landlordFriendly: 'friendly',
    noStateTax: false,
    keyMarkets: ['Birmingham', 'Huntsville', 'Mobile', 'Montgomery'],
  },
  arizona: {
    highlights: 'Phoenix, Tucson, Mesa, and Scottsdale are the main investor markets.',
    landlordFriendly: 'friendly',
    noStateTax: false,
    keyMarkets: ['Phoenix', 'Tucson', 'Mesa', 'Scottsdale'],
  },
  california: {
    highlights: 'Cash flow is hard to make work at California prices, and several major cities have rent control. Out-of-state investors often use California equity to buy in other markets.',
    landlordFriendly: 'strict',
    noStateTax: false,
    keyMarkets: ['Los Angeles', 'San Diego', 'Sacramento', 'Riverside', 'San Francisco'],
  },
  colorado: {
    highlights: 'Denver is a high-priced metro; Colorado Springs, Aurora, and Fort Collins are the other main investor markets.',
    landlordFriendly: 'moderate',
    noStateTax: false,
    keyMarkets: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins'],
  },
  florida: {
    highlights: 'No state income tax. Jacksonville, Tampa, and Orlando offer different investment profiles, and the state has an active short-term-rental market.',
    landlordFriendly: 'friendly',
    noStateTax: true,
    keyMarkets: ['Jacksonville', 'Tampa', 'Orlando', 'Miami', 'Fort Lauderdale'],
  },
  georgia: {
    highlights: 'Landlord-friendly laws. Atlanta is the main investment market; Savannah, Augusta, and Columbus are smaller ones.',
    landlordFriendly: 'friendly',
    noStateTax: false,
    keyMarkets: ['Atlanta', 'Savannah', 'Augusta', 'Columbus'],
  },
  idaho: {
    highlights: 'Landlord-friendly laws. Boise, Meridian, Nampa, and Idaho Falls are the main investor markets.',
    landlordFriendly: 'friendly',
    noStateTax: false,
    keyMarkets: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls'],
  },
  illinois: {
    highlights: 'Property taxes are a major cost, especially in the Chicago area — watch reassessments carefully. Downstate markets like Springfield and Peoria have lower entry prices.',
    landlordFriendly: 'moderate',
    noStateTax: false,
    keyMarkets: ['Chicago', 'Aurora', 'Naperville', 'Springfield'],
  },
  indiana: {
    highlights: 'Landlord-friendly laws. Indianapolis, Fort Wayne, Evansville, and South Bend are the main investor markets.',
    landlordFriendly: 'friendly',
    noStateTax: false,
    keyMarkets: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend'],
  },
  michigan: {
    highlights: 'Detroit has low entry prices but requires careful neighborhood selection. Grand Rapids, Ann Arbor, and Lansing are the other main markets.',
    landlordFriendly: 'moderate',
    noStateTax: false,
    keyMarkets: ['Detroit', 'Grand Rapids', 'Ann Arbor', 'Lansing'],
  },
  minnesota: {
    highlights: 'Minneapolis-St. Paul is the main investor market, with Rochester and Duluth smaller ones.',
    landlordFriendly: 'moderate',
    noStateTax: false,
    keyMarkets: ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth'],
  },
  missouri: {
    highlights: 'Landlord-friendly laws. Kansas City (which spans the Missouri-Kansas line) and St. Louis are the main investor markets.',
    landlordFriendly: 'friendly',
    noStateTax: false,
    keyMarkets: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia'],
  },
  nevada: {
    highlights: 'No state income tax. Las Vegas has an active short-term-rental market; Reno is the state\'s second metro.',
    landlordFriendly: 'friendly',
    noStateTax: true,
    keyMarkets: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas'],
  },
  'new-jersey': {
    highlights: 'Property taxes are high and cash flow is hard to make work, but rental demand is supported by proximity to New York City and Philadelphia.',
    landlordFriendly: 'strict',
    noStateTax: false,
    keyMarkets: ['Newark', 'Jersey City', 'Paterson', 'Trenton'],
  },
  'new-york': {
    highlights: 'New York City is one of the most regulated rental markets in the country — rent stabilization laws require careful due diligence. Upstate markets (Rochester, Buffalo, Syracuse) have lower entry prices.',
    landlordFriendly: 'strict',
    noStateTax: false,
    keyMarkets: ['New York City', 'Buffalo', 'Rochester', 'Syracuse'],
  },
  'north-carolina': {
    highlights: 'Landlord-friendly laws. Charlotte and the Raleigh-Durham Research Triangle are the main investor markets, with Greensboro and Wilmington smaller ones.',
    landlordFriendly: 'friendly',
    noStateTax: false,
    keyMarkets: ['Charlotte', 'Raleigh', 'Durham', 'Greensboro', 'Wilmington'],
  },
  ohio: {
    highlights: 'Cleveland, Columbus, and Cincinnati have relatively affordable entry prices. Property taxes are a meaningful drag on returns.',
    landlordFriendly: 'moderate',
    noStateTax: false,
    keyMarkets: ['Columbus', 'Cleveland', 'Cincinnati', 'Dayton'],
  },
  oklahoma: {
    highlights: 'Landlord-friendly laws. Oklahoma City and Tulsa are the main investor markets.',
    landlordFriendly: 'friendly',
    noStateTax: false,
    keyMarkets: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow'],
  },
  pennsylvania: {
    highlights: 'Philadelphia and Pittsburgh are the main investor markets. Property taxes vary widely by county.',
    landlordFriendly: 'moderate',
    noStateTax: false,
    keyMarkets: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Reading'],
  },
  'south-carolina': {
    highlights: 'Landlord-friendly laws. Charleston and Greenville are the main investor markets, and Charleston has an active short-term-rental market.',
    landlordFriendly: 'friendly',
    noStateTax: false,
    keyMarkets: ['Charleston', 'Greenville', 'Columbia', 'Myrtle Beach'],
  },
  tennessee: {
    highlights: 'No state income tax on wages. Nashville is a higher-priced market; Memphis is known for turnkey rentals; Knoxville and Chattanooga are the other main markets.',
    landlordFriendly: 'friendly',
    noStateTax: true,
    keyMarkets: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga'],
  },
  texas: {
    highlights: 'No state income tax, but high property taxes offset part of that advantage. Houston, Dallas, San Antonio, and Austin each offer different investment profiles.',
    landlordFriendly: 'friendly',
    noStateTax: true,
    keyMarkets: ['Houston', 'Dallas', 'San Antonio', 'Austin', 'Fort Worth'],
  },
  utah: {
    highlights: 'Salt Lake City, Provo, Ogden, and St. George are the main investor markets; entry prices are high.',
    landlordFriendly: 'friendly',
    noStateTax: false,
    keyMarkets: ['Salt Lake City', 'Provo', 'Ogden', 'St. George'],
  },
  virginia: {
    highlights: 'Northern Virginia (DC suburbs) is anchored by government employment. Richmond and Hampton Roads, with military-anchored demand, are the other main markets.',
    landlordFriendly: 'moderate',
    noStateTax: false,
    keyMarkets: ['Virginia Beach', 'Richmond', 'Arlington', 'Norfolk'],
  },
  washington: {
    highlights: 'No state income tax. Seattle is a high-priced market; Tacoma and Spokane have lower entry prices. Washington has strict landlord-tenant laws — know the rules.',
    landlordFriendly: 'strict',
    noStateTax: true,
    keyMarkets: ['Seattle', 'Tacoma', 'Spokane', 'Bellevue'],
  },
  wisconsin: {
    highlights: 'Milwaukee has affordable entry prices; Madison is a college-town market. Green Bay and Racine are smaller markets.',
    landlordFriendly: 'moderate',
    noStateTax: false,
    keyMarkets: ['Milwaukee', 'Madison', 'Green Bay', 'Racine'],
  },
}

/**
 * Get lenders that serve a specific state.
 * Nationwide lenders always match. Regional lenders match if the state is in their statesServed list.
 */
export function getLendersForState(
  allLenders: Array<{ nationwide: boolean; statesServed?: string[] }>,
  stateAbbr: string
): number[] {
  return allLenders.reduce<number[]>((indices, lender, i) => {
    if (lender.nationwide || (lender.statesServed && lender.statesServed.includes(stateAbbr))) {
      indices.push(i)
    }
    return indices
  }, [])
}

/**
 * Whether a state has state-specific investing context. State × loan-type
 * lender pages for states without it differ from each other only by the state
 * name (the lender list is the same nationwide set), so they are kept for
 * visitors but marked noindex and left out of the sitemap. Adding a state to
 * stateInvestingContext makes its pages indexable again automatically.
 */
export function hasStateInvestingContext(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(stateInvestingContext, slug)
}
