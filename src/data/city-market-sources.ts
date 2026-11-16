/**
 * The 50 tracked investing markets, keyed to the source rows they draw from.
 *
 * Nothing in this file is a statistic. Every number shown on the city pages is
 * read from a committed dataset and computed in `cap-rate-cities.ts`:
 *
 *   - `acsSlug`  -> src/data/rental-yield/metros.json (Census ACS 2024 1-year,
 *                   metropolitan statistical area). Built by
 *                   scripts/build-rental-yield.mjs.
 *   - `fmrCode`  -> src/data/fmr-rent/metros.json (HUD Fair Market Rents
 *                   FY2026 vs FY2025, two-bedroom, FMR area). Built by
 *                   scripts/build-fmr.mjs. `null` when the metro has no row
 *                   in that file — the rent-change figure is then omitted,
 *                   never estimated.
 *
 * Where HUD splits a metro into several FMR areas, the area containing the
 * principal city is used and its name is shown on the page.
 *
 * `investorTakeaway` is editorial context (employers, neighborhoods, landlord
 * law). It must not carry figures or rankings that no dataset here supports.
 */
export type CityMarketSource = {
  city: string
  state: string
  slug: string
  acsSlug: string
  fmrCode: string | null
  investorTakeaway: string
}

export const cityMarketSources: CityMarketSource[] = [
  {
    city: 'Detroit',
    state: 'MI',
    slug: 'detroit-mi',
    acsSlug: 'detroit-warren-dearborn-mi',
    fmrCode: 'METRO19820M19820',
    investorTakeaway:
      'Detroit is a market where conditions change block by block. Investors tend to focus on renovated properties in stabilizing areas such as Corktown and Midtown and to underwrite vacancy and property taxes carefully.',
  },
  {
    city: 'Cleveland',
    state: 'OH',
    slug: 'cleveland-oh',
    acsSlug: 'cleveland-oh',
    fmrCode: null,
    investorTakeaway:
      'Cleveland is a long-standing cash-flow market anchored by healthcare and higher education. Tremont and Ohio City draw investor interest; Ohio property taxes are a material expense to check property by property.',
  },
  {
    city: 'Memphis',
    state: 'TN',
    slug: 'memphis-tn',
    acsSlug: 'memphis-tn-ms-ar',
    fmrCode: 'METRO32820M32820',
    investorTakeaway:
      'Memphis is a well-established turnkey rental market with a deep property-management industry. The logistics economy (FedEx is headquartered here) supports blue-collar rental demand.',
  },
  {
    city: 'Toledo',
    state: 'OH',
    slug: 'toledo-oh',
    acsSlug: 'toledo-oh',
    fmrCode: 'METRO45780M45780',
    investorTakeaway:
      'Toledo offers low entry prices relative to rents. It tends to suit investors comfortable with hands-on management and careful tenant screening.',
  },
  {
    city: 'Dayton',
    state: 'OH',
    slug: 'dayton-oh',
    acsSlug: 'dayton-kettering-beavercreek-oh',
    fmrCode: 'METRO19430M19430',
    investorTakeaway:
      'Dayton benefits from Wright-Patterson Air Force Base and a revitalizing downtown. Low acquisition costs make it accessible to investors building a portfolio with limited capital.',
  },
  {
    city: 'Akron',
    state: 'OH',
    slug: 'akron-oh',
    acsSlug: 'akron-oh',
    fmrCode: 'METRO10420M10420',
    investorTakeaway:
      'Akron is a smaller, affordable market next to Cleveland. The University of Akron provides a tenant pool for properties near campus.',
  },
  {
    city: 'Birmingham',
    state: 'AL',
    slug: 'birmingham-al',
    acsSlug: 'birmingham-al',
    fmrCode: 'METRO13820M13820',
    investorTakeaway:
      'Alabama property taxes are generally low, which helps net income. The UAB medical district anchors employment and tenant demand in surrounding neighborhoods.',
  },
  {
    city: 'Little Rock',
    state: 'AR',
    slug: 'little-rock-ar',
    acsSlug: 'little-rock-north-little-rock-conway-ar',
    fmrCode: 'METRO30780M30780',
    investorTakeaway:
      'Little Rock gets less investor attention than larger Sun Belt metros. State-government and healthcare employment provide a steady base of renters.',
  },
  {
    city: 'Indianapolis',
    state: 'IN',
    slug: 'indianapolis-in',
    acsSlug: 'indianapolis-carmel-greenwood-in',
    fmrCode: 'METRO26900M26900',
    investorTakeaway:
      'Indianapolis has a diversified economy and Indiana landlord-tenant law is generally considered landlord-friendly, which is why it is a common pick for out-of-state investors.',
  },
  {
    city: 'Tulsa',
    state: 'OK',
    slug: 'tulsa-ok',
    acsSlug: 'tulsa-ok',
    fmrCode: 'METRO46140M46140',
    investorTakeaway:
      'Tulsa pairs moderate prices with a low cost of living that supports renter demand.',
  },
  {
    city: 'Oklahoma City',
    state: 'OK',
    slug: 'oklahoma-city-ok',
    acsSlug: 'oklahoma-city-ok',
    fmrCode: 'METRO36420M36420',
    investorTakeaway:
      'Oklahoma City has diversified from energy into aerospace (Tinker Air Force Base) and healthcare, which reduces the boom-bust swings that historically hit Oklahoma markets.',
  },
  {
    city: 'Kansas City',
    state: 'MO',
    slug: 'kansas-city-mo',
    acsSlug: 'kansas-city-mo-ks',
    fmrCode: 'METRO28140M28140',
    investorTakeaway:
      'Kansas City straddles Missouri and Kansas, so investors can choose between two states’ tax and landlord-tenant rules. Neighborhoods such as the Crossroads and Midtown have seen active redevelopment.',
  },
  {
    city: 'St. Louis',
    state: 'MO',
    slug: 'st-louis-mo',
    acsSlug: 'st-louis-mo-il',
    fmrCode: 'METRO41180M41180',
    investorTakeaway:
      'St. Louis varies sharply from neighborhood to neighborhood. Investors often focus on the south city corridor and areas near universities and hospitals.',
  },
  {
    city: 'Louisville',
    state: 'KY',
    slug: 'louisville-ky',
    acsSlug: 'louisville-jefferson-county-ky-in',
    fmrCode: 'METRO31140M31140',
    investorTakeaway:
      'Louisville has a diversified economy (healthcare, UPS Worldport logistics, bourbon tourism). Walkable neighborhoods such as the Highlands and Germantown have older housing stock popular with small investors.',
  },
  {
    city: 'Pittsburgh',
    state: 'PA',
    slug: 'pittsburgh-pa',
    acsSlug: 'pittsburgh-pa',
    fmrCode: 'METRO38300M38300',
    investorTakeaway:
      'Pittsburgh’s eds-and-meds economy (universities and health systems) supports steady rental demand. Pennsylvania property and local taxes vary widely by municipality, so check them per property.',
  },
  {
    city: 'Huntsville',
    state: 'AL',
    slug: 'huntsville-al',
    acsSlug: 'huntsville-al',
    fmrCode: 'METRO26620M26620',
    investorTakeaway:
      'Huntsville’s economy is built on aerospace and defense (NASA Marshall Space Flight Center, Redstone Arsenal and their contractors). Alabama property taxes are generally low.',
  },
  {
    city: 'Cincinnati',
    state: 'OH',
    slug: 'cincinnati-oh',
    acsSlug: 'cincinnati-oh-ky-in',
    fmrCode: 'METRO17140M17140',
    investorTakeaway:
      'Cincinnati has an improving urban core around Over-the-Rhine, and the three-state metro gives a broad tenant pool across several employment sectors.',
  },
  {
    city: 'Columbus',
    state: 'OH',
    slug: 'columbus-oh',
    acsSlug: 'columbus-oh',
    fmrCode: 'METRO18140M18140',
    investorTakeaway:
      'Columbus combines state-government employment, Ohio State University, and a broad private-sector employment base.',
  },
  {
    city: 'Milwaukee',
    state: 'WI',
    slug: 'milwaukee-wi',
    acsSlug: 'milwaukee-waukesha-wi',
    fmrCode: 'METRO33340M33340',
    investorTakeaway:
      'Milwaukee offers affordable entry near the Chicago region. Wisconsin property taxes are a significant expense; the east side and Bay View are common investor targets.',
  },
  {
    city: 'Des Moines',
    state: 'IA',
    slug: 'des-moines-ia',
    acsSlug: 'des-moines-west-des-moines-ia',
    fmrCode: 'METRO19780M19780',
    investorTakeaway:
      'Des Moines is an insurance and financial-services hub. It is a smaller market with less institutional-buyer competition than larger metros.',
  },
  {
    city: 'San Antonio',
    state: 'TX',
    slug: 'san-antonio-tx',
    acsSlug: 'san-antonio-new-braunfels-tx',
    fmrCode: 'METRO41700M41700',
    investorTakeaway:
      'San Antonio has a large military presence (Joint Base San Antonio) and a major healthcare sector. Texas has no state income tax, but property taxes are a significant expense.',
  },
  {
    city: 'Baltimore',
    state: 'MD',
    slug: 'baltimore-md',
    acsSlug: 'baltimore-columbia-towson-md',
    fmrCode: 'METRO12580M12580',
    investorTakeaway:
      'Baltimore city and its suburbs are very different markets, and conditions vary block by block in the city. Canton, Federal Hill, and Hampden are long-standing investor favorites.',
  },
  {
    city: 'Jacksonville',
    state: 'FL',
    slug: 'jacksonville-fl',
    acsSlug: 'jacksonville-fl',
    fmrCode: 'METRO27260M27260',
    investorTakeaway:
      'Jacksonville’s port, logistics, and military employment provide a broad base. Florida has no state income tax; property insurance is the expense to underwrite most carefully.',
  },
  {
    city: 'Houston',
    state: 'TX',
    slug: 'houston-tx',
    acsSlug: 'houston-pasadena-the-woodlands-tx',
    fmrCode: 'METRO26420M26420',
    investorTakeaway:
      'Houston is a very large, varied metro anchored by energy, healthcare (Texas Medical Center), and the port. Check flood-zone exposure and Texas property taxes on every deal.',
  },
  {
    city: 'Richmond',
    state: 'VA',
    slug: 'richmond-va',
    acsSlug: 'richmond-va',
    fmrCode: 'METRO40060M40060',
    investorTakeaway:
      'Richmond combines state-government employment, VCU, and a growing professional workforce. The Fan District and Church Hill have established rental demand.',
  },
  {
    city: 'Minneapolis',
    state: 'MN',
    slug: 'minneapolis-mn',
    acsSlug: 'minneapolis-st-paul-bloomington-mn-wi',
    fmrCode: 'METRO33460M33460',
    investorTakeaway:
      'Minneapolis–St. Paul has a deep corporate and healthcare employment base. St. Paul has a rent stabilization ordinance, so check local rules before buying on either side of the river.',
  },
  {
    city: 'Chicago',
    state: 'IL',
    slug: 'chicago-il',
    acsSlug: 'chicago-naperville-elgin-il-in',
    fmrCode: 'METRO16980M16980',
    investorTakeaway:
      'Chicago offers big-city rental demand, but Cook County property taxes are a significant drag on returns. Neighborhood selection drives results more than the metro average.',
  },
  {
    city: 'Atlanta',
    state: 'GA',
    slug: 'atlanta-ga',
    acsSlug: 'atlanta-sandy-springs-roswell-ga',
    fmrCode: 'METRO12060M12060',
    investorTakeaway:
      'Atlanta is a large Southeast metro with many corporate headquarters and a major airport hub. Institutional single-family landlords are active here, which affects competition for entry-level homes.',
  },
  {
    city: 'Savannah',
    state: 'GA',
    slug: 'savannah-ga',
    acsSlug: 'savannah-ga',
    fmrCode: 'METRO42340M42340',
    investorTakeaway:
      'Savannah’s economy rests on its port, tourism, and the military (Fort Stewart and Hunter Army Airfield). Short-term rentals in the historic district are regulated, so check city rules first.',
  },
  {
    city: 'Knoxville',
    state: 'TN',
    slug: 'knoxville-tn',
    acsSlug: 'knoxville-tn',
    fmrCode: 'METRO28940M28940',
    investorTakeaway:
      'Knoxville is anchored by the University of Tennessee and Oak Ridge National Laboratory. Tennessee has no state income tax on wages.',
  },
  {
    city: 'Dallas',
    state: 'TX',
    slug: 'dallas-tx',
    acsSlug: 'dallas-fort-worth-arlington-tx',
    fmrCode: 'METRO19100M19100',
    investorTakeaway:
      'Dallas–Fort Worth is a large, fast-growing metro. Texas has no state income tax, but property taxes are a significant expense, and suburbs can price very differently from the core.',
  },
  {
    city: 'Charlotte',
    state: 'NC',
    slug: 'charlotte-nc',
    acsSlug: 'charlotte-concord-gastonia-nc-sc',
    fmrCode: 'METRO16740M16740',
    investorTakeaway:
      'Charlotte is a banking center (Bank of America headquarters, a large Wells Fargo presence). Higher home values relative to rent make it more of a growth market than a cash-flow market.',
  },
  {
    city: 'Philadelphia',
    state: 'PA',
    slug: 'philadelphia-pa',
    acsSlug: 'philadelphia-camden-wilmington-pa-nj-de-md',
    fmrCode: 'METRO37980M37980',
    investorTakeaway:
      'Philadelphia’s university and hospital corridor (Penn, Drexel, Temple) supports renter demand. The metro spans four states, so taxes and landlord rules depend on which side of the line you buy.',
  },
  {
    city: 'Tampa',
    state: 'FL',
    slug: 'tampa-fl',
    acsSlug: 'tampa-st-petersburg-clearwater-fl',
    fmrCode: 'METRO45300M45300',
    investorTakeaway:
      'Tampa Bay is a major Sun Belt migration destination. Florida has no state income tax; property insurance and flood exposure are the biggest underwriting risks.',
  },
  {
    city: 'Salt Lake City',
    state: 'UT',
    slug: 'salt-lake-city-ut',
    acsSlug: 'salt-lake-city-murray-ut',
    fmrCode: 'METRO41620M41620',
    investorTakeaway:
      'Salt Lake City has a young workforce and a growing tech corridor (“Silicon Slopes”). High home values relative to rent make it a long-term growth market more than a cash-flow market.',
  },
  {
    city: 'Orlando',
    state: 'FL',
    slug: 'orlando-fl',
    acsSlug: 'orlando-kissimmee-sanford-fl',
    fmrCode: 'METRO36740M36740',
    investorTakeaway:
      'Orlando’s tourism economy supports both long-term and short-term rental demand. Insurance costs and HOA fees need careful underwriting.',
  },
  {
    city: 'Nashville',
    state: 'TN',
    slug: 'nashville-tn',
    acsSlug: 'nashville-davidson-murfreesboro-franklin-tn',
    fmrCode: 'METRO34980M34980',
    investorTakeaway:
      'Nashville has drawn strong in-migration and has no state income tax on wages. Home values are high relative to rents, so it plays more as a growth market.',
  },
  {
    city: 'Raleigh',
    state: 'NC',
    slug: 'raleigh-nc',
    acsSlug: 'raleigh-cary-nc',
    fmrCode: 'METRO39580M39580',
    investorTakeaway:
      'Raleigh is part of the Research Triangle, with tech, life-sciences, and university employment. It is generally treated as a growth-first market.',
  },
  {
    city: 'Charleston',
    state: 'SC',
    slug: 'charleston-sc',
    acsSlug: 'charleston-north-charleston-sc',
    fmrCode: 'METRO16700M16700',
    investorTakeaway:
      'Charleston combines tourism, the port, military, and manufacturing employment. Short-term rentals downtown are tightly regulated; long-term rentals in North Charleston are the more common investor play. South Carolina taxes non-owner-occupied property at a higher assessment ratio than primary residences.',
  },
  {
    city: 'Phoenix',
    state: 'AZ',
    slug: 'phoenix-az',
    acsSlug: 'phoenix-mesa-chandler-az',
    fmrCode: 'METRO38060M38060',
    investorTakeaway:
      'Phoenix has drawn large semiconductor and manufacturing investment. Home values are high relative to rents, so it plays more as a growth market than a cash-flow one.',
  },
  {
    city: 'Las Vegas',
    state: 'NV',
    slug: 'las-vegas-nv',
    acsSlug: 'las-vegas-henderson-north-las-vegas-nv',
    fmrCode: 'METRO29820M29820',
    investorTakeaway:
      'Nevada has no state income tax. The economy is diversifying beyond gaming into sports and logistics, but tourism sensitivity remains a risk in downturns.',
  },
  {
    city: 'Sacramento',
    state: 'CA',
    slug: 'sacramento-ca',
    acsSlug: 'sacramento-roseville-folsom-ca',
    fmrCode: 'METRO40900M40900',
    investorTakeaway:
      'Sacramento benefits from state-government employment and Bay Area spillover. California’s statewide rent cap (AB 1482) and tenant protections apply to many rentals.',
  },
  {
    city: 'Boise',
    state: 'ID',
    slug: 'boise-id',
    acsSlug: 'boise-city-id',
    fmrCode: 'METRO14260M14260',
    investorTakeaway:
      'Boise is a smaller metro where in-migration has driven demand. Home values are high relative to rents, so it is primarily an appreciation play.',
  },
  {
    city: 'Denver',
    state: 'CO',
    slug: 'denver-co',
    acsSlug: 'denver-aurora-centennial-co',
    fmrCode: 'METRO19740M19740',
    investorTakeaway:
      'Denver has a high-income tenant base. A wave of new apartment supply has slowed rent increases, and home values are high relative to rents.',
  },
  {
    city: 'Austin',
    state: 'TX',
    slug: 'austin-tx',
    acsSlug: 'austin-round-rock-san-marcos-tx',
    fmrCode: 'METRO12420M12420',
    investorTakeaway:
      'Austin has a large technology employment base, but a wave of new apartment supply has put pressure on rents. Texas property taxes are a significant expense.',
  },
  {
    city: 'Portland',
    state: 'OR',
    slug: 'portland-or',
    acsSlug: 'portland-vancouver-hillsboro-or-wa',
    fmrCode: 'METRO38900M38900',
    investorTakeaway:
      'Oregon has statewide rent stabilization and Portland adds its own tenant protections, so regulatory risk is a real factor for small investors. The metro also spans Vancouver, Washington, which has different rules.',
  },
  {
    city: 'Seattle',
    state: 'WA',
    slug: 'seattle-wa',
    acsSlug: 'seattle-tacoma-bellevue-wa',
    fmrCode: 'METRO42660MM7600',
    investorTakeaway:
      'Seattle has a high-income tech workforce and no state income tax, but high entry prices and tenant-friendly local laws limit cash flow.',
  },
  {
    city: 'San Diego',
    state: 'CA',
    slug: 'san-diego-ca',
    acsSlug: 'san-diego-chula-vista-carlsbad-ca',
    fmrCode: 'METRO41740M41740',
    investorTakeaway:
      'San Diego is anchored by the military, biotech, and tourism. High prices mean most investors need substantial capital, and California’s statewide rent cap applies to many rentals.',
  },
  {
    city: 'Los Angeles',
    state: 'CA',
    slug: 'los-angeles-ca',
    acsSlug: 'los-angeles-long-beach-anaheim-ca',
    fmrCode: 'METRO31080MM4480',
    investorTakeaway:
      'Los Angeles is an appreciation-driven market. Many units fall under local rent stabilization, and high entry costs make cash flow difficult.',
  },
  {
    city: 'San Francisco',
    state: 'CA',
    slug: 'san-francisco-ca',
    acsSlug: 'san-francisco-oakland-fremont-ca',
    fmrCode: 'METRO41860MM7360',
    investorTakeaway:
      'San Francisco is a premium, supply-constrained market with local rent control. Home values are very high relative to rents, so it is an appreciation and wealth-preservation play rather than a cash-flow market.',
  },
]
