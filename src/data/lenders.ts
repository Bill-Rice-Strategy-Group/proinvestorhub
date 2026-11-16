/**
 * Lender data for the financing directory.
 *
 * VERIFICATION RULE: every loan-term figure below (rates, LTV, credit minimum,
 * loan amounts, fees, closing speed, prepayment, state coverage) was checked
 * against the lender's OWN website on the `lastReviewed` date, and the page it
 * came from is listed in `sources`. A figure the lender does not publish is
 * `null` and renders as "Not published" — we never estimate one. When you
 * re-verify a lender, update the figures, `sources` and `lastReviewed` together.
 *
 * Figures a lender publishes are usually "as low as" / "up to" headline terms
 * for one product; `termsNote` records which product each figure comes from.
 * Nothing here is a quote — terms depend on the borrower, property and market.
 */

export type SourceRef = { label: string; url: string }

export type LenderData = {
  name: string
  slug: string
  website: string
  /** Year founded, only when the lender's own site states it. */
  founded: number | null
  headquarters: string | null
  description: string
  loanTypeSlugs: string[]
  /** Lowest starting rate the lender publishes (any listed product). */
  minRate: number | null
  /** Top of a published rate range, when the lender publishes one. */
  maxRate: number | null
  maxLtv: number | null
  minCreditScore: number | null
  /** true when the lender publishes that it has no credit-score minimum (on at least one program). */
  noCreditMinimum?: boolean
  minLoanAmount: number | null
  maxLoanAmount: number | null
  originationFee: string | null
  speedToClose: string | null
  /** States served, as the lender words it. null = not published. */
  coverage: string | null
  /** State abbreviations the lender says it does NOT lend in. */
  excludedStates?: string[]
  /** Full list of states (and DC) the lender says it lends in, when it publishes one. */
  statesServed?: string[]
  propertyTypes: string[]
  /** 'none' | 'beginner' | 'intermediate' | 'experienced' | 'varies'; null = not published. */
  experienceRequired: string | null
  allowsLlc: boolean
  interestOnlyAvailable: boolean | null
  prepaymentPenalty: string | null
  foreignNational: boolean | null
  /**
   * true when the lender says it funds other lenders/originators rather than
   * lending to investors directly. Kept in the directory, left out of the finder.
   */
  capitalProvider?: boolean
  /** Which product each published figure belongs to, in the lender's terms. */
  termsNote?: string
  /** ISO date the figures were last checked against the lender's site. */
  lastReviewed: string | null
  /** Lender pages the figures were taken from. */
  sources: SourceRef[]
  bestForTags: string[]
  pros: string[]
  cons: string[]
  featured: boolean
  editorSummary: string
  /**
   * Optional long-form editorial review, rendered as a "Full Review" section
   * below the Editor's Take. Plain paragraphs separated by blank lines. Company
   * history only — loan figures belong in the verified fields above.
   */
  editorReview?: string
  /**
   * Optional tracked affiliate link. Set this ONLY when the lender is a genuine
   * paid affiliate partner. When present, the directory marks the listing with
   * an "Affiliate partner" label and routes the outbound CTA through this link
   * (FTC 16 CFR 255 disclosure). Leave undefined for editorial-only listings.
   */
  affiliateUrl?: string
  metaTitle: string
  metaDescription: string
}

/** Date of the most recent lender verification pass (all lenders below). */
export const LENDER_VERIFICATION_DATE = '2026-11-16'
const V = LENDER_VERIFICATION_DATE

export const lenders: LenderData[] = [
  // ── DSCR & Multi-Product Lenders ────────────────────
  {
    name: 'Kiavi',
    slug: 'kiavi',
    website: 'https://www.kiavi.com',
    founded: null,
    headquarters: null,
    description:
      'Kiavi (formerly LendingHome) is an online lender to residential real estate investors, offering fix-and-flip and DSCR rental loans through a digital platform.',
    loanTypeSlugs: ['dscr-loans', 'fix-and-flip-loans', 'bridge-loans', 'fix-and-rent-loans'],
    minRate: 6.375,
    maxRate: null,
    maxLtv: 80,
    minCreditScore: null,
    minLoanAmount: 75000,
    maxLoanAmount: 5000000,
    originationFee: null,
    speedToClose: 'As few as 7 business days (fix-and-flip)',
    coverage: '49 states + DC — not Utah',
    excludedStates: ['UT'],
    propertyTypes: ['sfr', 'condo', 'townhouse'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: true,
    prepaymentPenalty: 'None after year 3 (rental loans)',
    foreignNational: null,
    termsNote: 'Rental (DSCR) loans: rates as low as 6.375%, up to 80% LTV, no prepayment penalty after year 3, for single-family, PUD and 2–4 unit rentals. Fix-and-flip loans: rates as low as 8.25%, $75K–$5M, up to 100% of purchase price, 100% of rehab and 80% of after-repair value, 12-, 18- and 24-month interest-only terms, closings in as few as 7 business days. Kiavi\'s states page lists 49 states plus DC (not Utah); its rental page still says 32 states plus DC. Kiavi\'s site notes that its DSCR and rental loans are originated by Figure Lending LLC as of September 1, 2026. Credit-score minimum and fees are not published.',
    lastReviewed: V,
    sources: [
      { label: 'Kiavi — rental (DSCR) loan terms', url: 'https://www.kiavi.com/rental-loans-for-investors' },
      { label: 'Kiavi — fix-and-flip loan terms', url: 'https://www.kiavi.com/fix-and-flip-loans' },
      { label: 'Kiavi — states it lends in', url: 'https://www.kiavi.com/states-kiavi-lends-in' },
    ],
    bestForTags: ['Flip and rental investors', 'BRRRR investors', 'Online-first borrowers'],
    pros: [
      'Fix-and-flip and rental loans from one lender',
      'Publishes starting rates and leverage on its site',
      'Fix-and-flip loans from $75K to $5M, up to 100% of purchase and rehab',
      'No prepayment penalty on rental loans after year 3',
    ],
    cons: [
      'Does not lend in Utah',
      'Credit-score minimum and fees not published',
    ],
    featured: true,
    editorSummary: 'Kiavi is a good fit if you want flips and rentals with one lender and prefer to handle the loan online. It publishes starting rates (rental from 6.375%, fix-and-flip from 8.25%) and leverage, but not a credit-score floor or fees, so get a written quote. Its states page lists 49 states plus DC — not Utah.',
    editorReview: `Kiavi launched as LendingHome and later rebranded to Kiavi, building its business around a digital process for investor loans — fix-and-flip and bridge financing for the buy-rehab phase, plus DSCR loans for the long-term hold. Its site now describes Kiavi as a Figure company, and notes that its DSCR and rental loans are originated by Figure Lending LLC as of September 1, 2026.

If you run the BRRRR playbook, you can stay with one platform from acquisition through the long-term rental loan, which not every lender on this list offers. What you're buying with Kiavi is a standardized, online process. The trade-off is that a high-volume platform is better at standard flips and rentals than at deals that need a lot of custom structuring. Confirm current rates, fees and state availability for your scenario before you commit.`,
    metaTitle: 'Kiavi Review 2026: DSCR & Fix-and-Flip Loans | ProInvestorHub',
    metaDescription:
      'Kiavi review for real estate investors: published DSCR and fix-and-flip rates, LTV and loan limits checked against Kiavi\'s own site, plus pros and cons.',
  },
  {
    name: 'Lima One Capital',
    slug: 'lima-one-capital',
    website: 'https://www.limaone.com',
    founded: 2010,
    headquarters: 'Greenville, SC',
    description:
      'Lima One Capital is an investment property lender offering fix-and-flip, bridge, rental (DSCR), new construction, and multifamily loans.',
    loanTypeSlugs: ['dscr-loans', 'fix-and-flip-loans', 'bridge-loans', 'construction-loans', 'fix-and-rent-loans'],
    minRate: null,
    maxRate: null,
    maxLtv: 80,
    minCreditScore: null,
    minLoanAmount: 100000,
    maxLoanAmount: 2500000,
    originationFee: null,
    speedToClose: null,
    coverage: '46 states — not AK, ND, SD or VT',
    excludedStates: ['AK', 'ND', 'SD', 'VT'],
    propertyTypes: ['sfr', 'multifamily', 'mixed-use', 'condo', 'townhouse', 'new-construction'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: true,
    prepaymentPenalty: null,
    foreignNational: null,
    termsNote: 'Single-family rental loans: $100K–$2.5M, up to 80% LTV on purchases and rate/term refinances, 75% on cash-out, 1–4 units, 5-, 10- and 30-year options and a 5-year interest-only option. Short-term rental loans: up to 75% LTV on purchases, 1.3+ DSCR, 700 minimum FICO. Lima One\'s site says it does not lend in Alaska, North Dakota, South Dakota, Vermont or Puerto Rico. Rates and fees are not published on these pages.',
    lastReviewed: V,
    sources: [
      { label: 'Lima One — home page (states, volume)', url: 'https://www.limaone.com/' },
      { label: 'Lima One — rental loan details', url: 'https://www.limaone.com/rental/detail/' },
    ],
    bestForTags: ['BRRRR strategy', 'Construction projects', 'Multifamily investors'],
    pros: [
      'Rental, fix-and-flip, bridge, new construction and multifamily programs',
      'Publishes rental leverage (up to 80% LTV)',
      'Lends in 46 states',
    ],
    cons: [
      'Rates, fees and a general credit minimum not published',
      'Does not lend in AK, ND, SD or VT',
    ],
    featured: true,
    editorSummary:
      'Lima One is a good fit if you want one lender across several strategies — rentals, flips, bridge, new construction and multifamily. Its site publishes rental-loan leverage and loan sizes but not rates or fees, so compare written quotes.',
    editorReview: `Lima One Capital was founded in 2010 and is headquartered in Greenville, South Carolina. It is backed by MFA Financial, a publicly traded mortgage REIT, and operates as an MFA subsidiary. Lima One's site cites more than $10 billion in loans funded across 46 states.

For investors, the draw is breadth: DSCR rental loans, fix-and-flip, bridge, new construction and multifamily, so you can grow from a single rental into a portfolio without changing lenders. The usual trade-off applies — a larger, process-driven lender is less flexible than a local private lender. Verify current pricing for your specific loan type before applying.`,
    metaTitle: 'Lima One Capital Review 2026: Full-Service Investor Lender | ProInvestorHub',
    metaDescription:
      'Lima One Capital review: DSCR, flip, construction and multifamily loans, with rental-loan terms checked against Lima One\'s own site. Pros, cons and what it doesn\'t publish.',
  },
  {
    name: 'RCN Capital',
    slug: 'rcn-capital',
    website: 'https://www.rcncapital.com',
    founded: null,
    headquarters: null,
    description:
      'RCN Capital is a lender to real estate investors offering fix-and-flip, bridge, new construction and long-term rental (DSCR) loans, with program terms published on its site.',
    loanTypeSlugs: ['dscr-loans', 'fix-and-flip-loans', 'bridge-loans', 'construction-loans'],
    minRate: 5.25,
    maxRate: null,
    maxLtv: 80,
    minCreditScore: 650,
    minLoanAmount: 70000,
    maxLoanAmount: 3000000,
    originationFee: null,
    speedToClose: null,
    coverage: 'Most states — not AK, NV, UT, ND, SD or VT',
    excludedStates: ['AK', 'NV', 'UT', 'ND', 'SD', 'VT'],
    propertyTypes: ['sfr', 'condo', 'townhouse', 'multifamily'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: 'Adjustable, up to 5 years (rental); none on fix-and-flip',
    foreignNational: null,
    termsNote:
      'Long-term rental: rates starting at 5.25%, $70K–$1.5M, 660 minimum FICO, up to 80% LTV on purchase and refinance (75% cash-out). Fix-and-flip: from 9.49%, $75K–$2M, 650 minimum FICO, up to 75% of after-repair value. Bridge: from 9.49%, $75K–$3M, 650 minimum FICO. New construction: from 9.84%, $100K–$2M, 650 minimum FICO. Points and closing times are not published.',
    lastReviewed: V,
    sources: [{ label: 'RCN Capital — FAQs (program terms, states)', url: 'https://rcncapital.com/faqs' }],
    bestForTags: ['DSCR investors', 'Fix-and-flip investors', 'Investors who want published terms'],
    pros: [
      'Publishes starting rates, credit minimums and leverage by program',
      '650 minimum FICO on short-term loans (660 on rentals)',
      'Rental, fix-and-flip, bridge and new construction programs',
    ],
    cons: [
      'Does not lend in AK, NV, UT, ND, SD or VT',
      'Points and closing times not published',
    ],
    featured: false,
    editorSummary:
      'RCN Capital is a good fit if you want a lender that publishes its program terms: rental loans from 5.25% with a 660 minimum FICO, and short-term loans with a 650 minimum. It does not lend in six states, so check yours.',
    editorReview: `RCN Capital started as "Rehab Cash Now," founded in South Windsor, Connecticut after the 2008 crisis, when traditional banks pulled back from real estate lending. It lends both directly and through brokers and correspondents.

For an investor, RCN's strength is range and transparency: long-term rental, fix-and-flip, bridge and new construction programs, each with starting rates, credit minimums and leverage on its FAQ page. Confirm the current rate sheet and fees for your loan type — a lender this size prices to the scenario.`,
    metaTitle: 'RCN Capital Review 2026: DSCR, Flip & Bridge Loans | ProInvestorHub',
    metaDescription:
      'RCN Capital review: published rates, credit minimums, LTV and loan limits for its rental, fix-and-flip, bridge and construction programs, checked against RCN\'s site.',
  },
  {
    name: 'Visio Lending',
    slug: 'visio-lending',
    website: 'https://www.visiolending.com',
    founded: 2012,
    headquarters: 'Austin, TX',
    description:
      'Visio Lending specializes in long-term DSCR rental loans for single-family and vacation rental properties.',
    loanTypeSlugs: ['dscr-loans'],
    minRate: null,
    maxRate: null,
    maxLtv: 85,
    minCreditScore: 680,
    minLoanAmount: null,
    maxLoanAmount: null,
    originationFee: null,
    speedToClose: null,
    coverage: 'Nationwide (DSCR loans)',
    propertyTypes: ['sfr', 'condo', 'townhouse', 'str'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: null,
    foreignNational: null,
    termsNote: 'DSCR loans for 1–4 unit rentals, condos, townhomes and vacation rentals: 680 minimum credit score and a 15% minimum down payment on purchases (up to 85% LTV), 30-year terms with no balloon. Visio\'s site says it was founded in 2012, is headquartered in Austin, Texas, and makes DSCR loans nationwide. Rates, loan sizes and fees are not published.',
    lastReviewed: V,
    sources: [
      { label: 'Visio — DSCR loan guide and FAQs', url: 'https://visiolending.com/dscr-loans/' },
    ],
    bestForTags: ['Buy-and-hold investors', 'Portfolio builders', 'Vacation rental owners'],
    pros: [
      'DSCR specialist — rental loans are its core product',
      'Short-term / vacation rental loans available',
      'Publishes credit and down-payment minimums',
    ],
    cons: [
      'DSCR only — no flip or bridge products',
      '680 minimum credit score',
      'Rates, loan sizes and fees not published',
    ],
    featured: false,
    editorSummary:
      'Visio Lending is a good fit if a long-term rental loan is all you need and you want a lender that specializes in it. It requires a 680 credit score and 15% down on purchases; rates and fees come by quote.',
    editorReview: `Visio Lending was founded in 2012 and built its business specifically around DSCR loans for single-family rental properties, rather than adding DSCR as one product among many.

For a buy-and-hold investor, the appeal is that specialization: Visio does long-term rental financing qualified on the property's cash flow, including vacation rentals. If you want a fix-and-flip or bridge loan, you'll look elsewhere. Confirm current rates, loan size limits and LTV for your market before you apply.`,
    metaTitle: 'Visio Lending Review 2026: DSCR Loan Specialist | ProInvestorHub',
    metaDescription:
      'Visio Lending review for rental property investors: a DSCR-only lender. Credit and down-payment minimums checked against Visio\'s own site, plus pros and cons.',
  },
  {
    name: 'New Silver',
    slug: 'new-silver',
    website: 'https://www.newsilver.com',
    founded: null,
    headquarters: null,
    description:
      'New Silver is an online hard money and rental lender offering fix-and-flip, rental and ground-up construction loans with online pre-approval.',
    loanTypeSlugs: ['hard-money-loans', 'fix-and-flip-loans', 'dscr-loans', 'bridge-loans'],
    minRate: 6.875,
    maxRate: null,
    maxLtv: 80,
    minCreditScore: null,
    minLoanAmount: 100000,
    maxLoanAmount: 5000000,
    originationFee: '1%–1.75% (flip); 0–2% (rental)',
    speedToClose: '10 days on average',
    coverage: null,
    propertyTypes: ['sfr', 'condo', 'townhouse', 'multifamily'],
    experienceRequired: 'none',
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: null,
    foreignNational: null,
    termsNote: 'Fix & flip: 8.5%–11%, loans $100K–$5M, up to 90% of cost and 100% of rehab, 1%–1.75% origination, no experience required. Rental (DSCR): from 6.875%, $150K–$3M, up to 80% LTV, 0.75 minimum DSCR, 0–2% origination. Ground-up: 9.75%–11.25%, up to $5M, up to 90% LTC, 1%–2% origination. Average time to close: 10 days. Credit minimum and states served are not published.',
    lastReviewed: V,
    sources: [{ label: 'New Silver — home page (program terms)', url: 'https://newsilver.com/' }],
    bestForTags: ['Speed-focused investors', 'Online-first borrowers', 'First-time flippers'],
    pros: [
      'Publishes rate ranges and origination fees by program',
      'No experience required for fix-and-flip or rental loans',
      '10-day average time to close (published)',
      'Online pre-approval',
    ],
    cons: [
      'Credit minimum and states served not published',
      'Smaller and younger than the largest investor lenders',
    ],
    featured: false,
    editorSummary:
      'New Silver is a good fit if speed and an online process matter most. It publishes its fix-and-flip range (8.5%–11%), rental starting rate (6.875%), fees and a 10-day average close. Confirm state availability and credit requirements in your quote.',
    editorReview: `New Silver is the fintech of the group. It began as software that could value a property as-is and as-renovated and issue preliminary terms quickly, then moved into doing the lending itself. That software DNA is still the pitch: online pre-approval and published program terms.

It also has an unusual chapter in its history: it was an early participant in securitizing real-estate loans on blockchain/DeFi infrastructure, partnering with Centrifuge and MakerDAO. It's a small, tech-forward shop rather than a balance-sheet giant.

For investors, New Silver fits the borrower who values speed and a digital process — hard money for flips plus rental loans for holds. The trade-off is scale and track record. Verify the final terms before you rely on an online estimate.`,
    metaTitle: 'New Silver Review 2026: Hard Money & Rental Loans | ProInvestorHub',
    metaDescription:
      'New Silver review: published fix-and-flip, rental and ground-up rates, fees and average closing time, checked against New Silver\'s own site. Pros and cons.',
  },
  {
    name: 'Angel Oak Mortgage Solutions',
    slug: 'angel-oak',
    website: 'https://www.angeloakms.com',
    founded: null,
    headquarters: 'Atlanta, GA',
    description:
      'Angel Oak Mortgage Solutions is a non-QM lender offering DSCR (investor cash flow), bank statement and other alternative-documentation loans, largely through mortgage brokers.',
    loanTypeSlugs: ['dscr-loans', 'bank-statement-loans'],
    minRate: null,
    maxRate: null,
    maxLtv: 85,
    minCreditScore: 640,
    minLoanAmount: null,
    maxLoanAmount: null,
    originationFee: null,
    speedToClose: null,
    coverage: null,
    propertyTypes: ['sfr', 'condo', 'townhouse', 'multifamily'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: null,
    foreignNational: null,
    termsNote: 'DSCR loan: 680 minimum credit score, up to 85% LTV (75% with the automated rent-schedule waiver, 1 unit only). Bank statement loan: 640 minimum credit score, up to 90% LTV. The 640 shown as the minimum credit score is the bank statement program\'s; DSCR needs 680. Rates, loan sizes and fees are not published.',
    lastReviewed: V,
    sources: [{ label: 'Angel Oak Mortgage Solutions — product highlights', url: 'https://angeloakms.com/' }],
    bestForTags: ['Self-employed investors', 'Bank statement borrowers', 'DSCR investors'],
    pros: [
      'Bank statement loans for self-employed borrowers (640 minimum credit)',
      'DSCR loans up to 85% LTV',
      'Available through many mortgage brokers',
    ],
    cons: [
      'Mostly reached through brokers rather than direct',
      'DSCR minimum credit score is 680',
      'Rates, loan sizes and fees not published',
    ],
    featured: false,
    editorSummary:
      'Angel Oak is a good fit if you are self-employed and need a bank statement loan, or want a DSCR loan through a mortgage broker. Its site publishes credit minimums (640 bank statement, 680 DSCR) and maximum LTVs; pricing comes through a broker quote.',
    editorReview: `Angel Oak Mortgage Solutions is the wholesale and correspondent lending arm of Angel Oak Companies, the Atlanta-based non-QM specialist co-founded by Mike Fierman and Sreeni Prabhu after the financial crisis. The group both originates and securitizes non-QM loans, which is what lets it keep alternative-documentation programs available.

For investors, the relevant products are bank statement loans for self-employed borrowers and DSCR loans for rentals. A quirk worth knowing: "Angel Oak" spans several affiliated entities — the lender, an asset-management arm, and a publicly traded mortgage REIT — so make sure you're dealing with the lending operation. As a wholesale-leaning lender, you will usually reach Angel Oak through a broker.`,
    metaTitle: 'Angel Oak Review 2026: DSCR & Bank Statement Loans | ProInvestorHub',
    metaDescription:
      'Angel Oak Mortgage Solutions review: DSCR and bank statement loans for investors, with credit minimums and LTV checked against Angel Oak\'s own site.',
  },
  {
    name: 'CoreVest',
    slug: 'corevest',
    website: 'https://www.corevestfinance.com',
    founded: null,
    headquarters: null,
    description:
      'CoreVest finances rental portfolios — one loan across 5+ properties — along with bridge and build-to-rent loans for larger investors.',
    loanTypeSlugs: ['dscr-loans', 'portfolio-loans', 'bridge-loans', 'construction-loans'],
    minRate: null,
    maxRate: null,
    maxLtv: 75,
    minCreditScore: null,
    minLoanAmount: 500000,
    maxLoanAmount: 50000000,
    originationFee: null,
    speedToClose: 'As little as 30 days (portfolio loans)',
    coverage: null,
    propertyTypes: ['sfr', 'condo', 'townhouse', 'multifamily', 'new-construction'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: null,
    foreignNational: null,
    termsNote:
      'Rental portfolio loans for 5+ properties: $500K to $50M+, up to 75% of value, 3–10 year terms, non-recourse options, close in as little as 30 days. Rates, credit minimum and fees are not published.',
    lastReviewed: V,
    sources: [
      { label: 'CoreVest — rental portfolio loans', url: 'https://www.corevestfinance.com/loan-types/rental-portfolio-loans' },
      { label: 'CoreVest — home page', url: 'https://www.corevestfinance.com/' },
    ],
    bestForTags: ['Portfolio investors (5+ properties)', 'Build-to-rent developers', 'Blanket loan seekers'],
    pros: [
      'One loan across a portfolio of 5+ rentals',
      'Large loan sizes ($500K to $50M+ published)',
      'Non-recourse options on portfolio loans',
    ],
    cons: [
      '$500K minimum on portfolio loans',
      'Built for investors with 5+ properties, not a first rental',
      'Rates, credit minimum and fees not published',
    ],
    featured: true,
    editorSummary:
      'CoreVest is a good fit once you own several rentals and want to finance them together. Its portfolio loans start at $500K, cover 5+ properties and go up to 75% of value; it is not built for a first rental.',
    editorReview: `CoreVest launched as Colony American Finance, was acquired and renamed CoreVest under Fortress Investment Group, and was later bought by Redwood Trust (NYSE: RWT), the mortgage REIT it operates under today.

That ownership explains what CoreVest is good at: larger, more complex deals — blanket/portfolio loans across many properties, build-to-rent financing and bridge loans. For a scaling investor financing a portfolio at once, its structuring experience is the draw; for a single starter rental it's overkill. Pricing is deal-specific, so get a written quote for your portfolio.`,
    metaTitle: 'CoreVest Review 2026: Portfolio & Build-to-Rent Loans | ProInvestorHub',
    metaDescription:
      'CoreVest review for portfolio investors: rental portfolio loan size, LTV and terms checked against CoreVest\'s own site. Blanket loans for 5+ properties.',
  },
  {
    name: 'Easy Street Capital',
    slug: 'easy-street-capital',
    website: 'https://www.easystreetcap.com',
    founded: null,
    headquarters: null,
    description: 'Easy Street Capital is a private lender offering fix-and-flip (EasyFix), DSCR rental (EasyRent) and new construction (EasyBuild) loans for real estate investors.',
    loanTypeSlugs: ['dscr-loans', 'fix-and-flip-loans', 'bridge-loans', 'construction-loans'],
    minRate: 5.75,
    maxRate: null,
    maxLtv: 80,
    minCreditScore: 600,
    minLoanAmount: 75000,
    maxLoanAmount: 5000000,
    originationFee: '0–2 points + $1,995 document fee (fix-and-flip); 0-point options (rental)',
    speedToClose: 'As little as 48 hours (fix-and-flip); 30 days (rental)',
    coverage: 'All states except ND and SD (fix-and-flip also not in LA or MN)',
    excludedStates: ['ND', 'SD'],
    propertyTypes: ['sfr', 'condo', 'townhouse', 'multifamily', 'str'],
    experienceRequired: 'none',
    allowsLlc: true,
    interestOnlyAvailable: true,
    prepaymentPenalty: 'Rental: from a 5% fixed penalty down to none; fix-and-flip: none',
    foreignNational: null,
    termsNote: 'EasyRent (DSCR): rates from 5.75%, $100K–$3.5M ($5M blanket), 640 minimum FICO, up to 80% LTV on purchases and rate/term refinances (75% cash-out), no minimum DSCR, 1–10 units, 10-year partial interest-only option, closings in as little as 30 days. EasyFix (fix-and-flip): rates from 8.90%, $75K–$5M+, 600 minimum FICO, up to 93% of cost and 75% of after-repair value, 0–2 points plus a $1,995 document fee, no prepayment penalty. Does not lend in ND or SD; fix-and-flip also excludes LA, MN and select metros (Baltimore, Chicago, Detroit).',
    lastReviewed: V,
    sources: [
      { label: 'Easy Street — EasyRent DSCR loans', url: 'https://easystreetcap.com/easyrent/' },
      { label: 'Easy Street — EasyFix fix-and-flip loans', url: 'https://easystreetcap.com/easyfix/' },
      { label: 'Easy Street — where it lends', url: 'https://easystreetcap.com/where-we-lend/' },
    ],
    bestForTags: [
      'DSCR borrowers',
      'Fix-and-flip investors',
      'Short-term rental investors',
      'First-time investors',
    ],
    pros: [
      'Publishes rates, credit minimums and leverage for rental and fix-and-flip loans',
      'No minimum DSCR on rental loans',
      'Choice of prepayment structures on rental loans, including none',
      'Open to first-time investors',
    ],
    cons: [
      'Does not lend in ND or SD',
      'Fix-and-flip not offered in LA, MN or some metros (Baltimore, Chicago, Detroit)',
      '$1,995 document fee on fix-and-flip loans',
    ],
    featured: false,
    editorSummary: 'Easy Street Capital is a good fit if you want rental and flip loans from a lender that publishes its terms: DSCR loans from 5.75% with a 640 minimum FICO and no minimum DSCR, and fix-and-flip loans from 8.90% with a 600 minimum. It lends everywhere except North and South Dakota.',
    metaTitle: 'Easy Street Capital Review 2026: DSCR & Flip Loans | ProInvestorHub',
    metaDescription: 'Easy Street Capital review: DSCR and fix-and-flip rates, credit minimums, LTV and state coverage checked against Easy Street\'s own site, plus pros and cons.',
  },
  {
    name: 'Groundfloor',
    slug: 'groundfloor',
    website: 'https://lending.groundfloor.com',
    founded: null,
    headquarters: null,
    description: 'Groundfloor Lending makes short-term fix-and-flip, new construction and bridge loans, plus DSCR rental loans, to real estate investors.',
    loanTypeSlugs: ['fix-and-flip-loans', 'hard-money-loans', 'bridge-loans', 'construction-loans', 'dscr-loans'],
    minRate: 9,
    maxRate: null,
    maxLtv: null,
    minCreditScore: null,
    minLoanAmount: 75000,
    maxLoanAmount: 2500000,
    originationFee: '2.75%–4% of principal (can be financed into the loan), plus $1,250 closing costs and a $495 application fee',
    speedToClose: 'As little as 7 days',
    coverage: null,
    propertyTypes: ['sfr', 'condo', 'townhouse'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: '3 months\' minimum interest if repaid in the first 3 months; none after',
    foreignNational: null,
    termsNote: 'Rates starting at 9%, 6–18 month terms, loans from $75,000 to $2.5 million+, minimum property value $50,000, deferred or monthly payment options, no hard credit pull, closings in as little as 7 days. Points and fees of 2.75%–4% of principal can be financed into the loan; closing costs are $1,250 plus a $495 application fee. Its DSCR product terms, credit minimum, leverage and states served are not published on this page.',
    lastReviewed: V,
    sources: [
      { label: 'Groundfloor Lending — home page and FAQ', url: 'https://lending.groundfloor.com/' },
    ],
    bestForTags: [
      'Fix-and-flip investors',
      'Investors who want deferred payments',
    ],
    pros: [
      'Option to defer all payments until the loan repays',
      'Points and fees can be financed into the loan',
      'Publishes starting rate, terms, loan sizes and fees',
      'No hard credit pull',
    ],
    cons: [
      'Points and fees of 2.75%–4% of principal',
      'Credit minimum, leverage and states served not published',
    ],
    featured: false,
    editorSummary: 'Groundfloor is a good fit for a flipper who wants to defer payments until the sale: its loans start at 9%, run 6–18 months, and can finance the 2.75%–4% in points and fees into the loan. Compare the all-in cost against other hard money quotes.',
    editorReview: `Groundfloor works differently from most lenders on this list. Its parent company raises capital from individual investors who buy into its loans for yield, under an SEC Regulation A offering, and its lending arm makes short-term loans to investors who renovate and build.

For a borrower, Groundfloor Lending is a source of fix-and-flip, new construction and bridge financing with the option of deferred payments, and it now offers DSCR rental loans as well. Compare the all-in cost — rate plus 2.75%–4% in points and fees — against the other hard money options here, and confirm current terms for your project before committing.`,
    metaTitle: 'Groundfloor Review 2026: Crowdfunded Fix-and-Flip Loans | ProInvestorHub',
    metaDescription:
      'Groundfloor review for fix-and-flip investors: published starting rate, loan sizes, terms and fees checked against Groundfloor\'s own site, plus pros and cons.',
  },
  {
    name: 'Upright (formerly Fund That Flip)',
    // NOTE: slug kept as 'arrived' to preserve the existing /lenders/reviews/arrived URL.
    // Earlier data mislabeled this entry "Arrived" — a separate, unrelated fractional
    // rental-INVESTING platform (arrived.com). The loan data here is Fund That Flip's,
    // which rebranded to Upright in Sept 2023. Corrected to Upright.
    slug: 'arrived',
    website: 'https://www.uprightlending.com',
    founded: null,
    headquarters: null,
    description: 'Upright (formerly Fund That Flip) offers fix-and-flip, new construction and bridge loans, plus DSCR rental loans, for real estate investors.',
    loanTypeSlugs: ['fix-and-flip-loans', 'bridge-loans', 'construction-loans', 'dscr-loans', 'hard-money-loans'],
    minRate: 5.99,
    maxRate: null,
    maxLtv: 80,
    minCreditScore: 660,
    minLoanAmount: 100000,
    maxLoanAmount: 3500000,
    originationFee: null,
    speedToClose: '7–10 days for most loans',
    coverage: '38 states + DC (hard money); DSCR in 39 states',
    statesServed: ['AL', 'AR', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MS', 'MO', 'MT', 'NE', 'NH', 'NJ', 'NM', 'NY', 'NC', 'OH', 'OK', 'PA', 'RI', 'SC', 'TN', 'TX', 'VA', 'WA', 'WV', 'WI', 'WY'],
    propertyTypes: ['sfr', 'condo', 'townhouse', 'multifamily', 'new-construction'],
    experienceRequired: 'none',
    allowsLlc: true,
    interestOnlyAvailable: true,
    prepaymentPenalty: 'None on fix-and-flip, construction and bridge loans',
    foreignNational: null,
    termsNote: 'Rates "from" (lowest available as of August 2026, per Upright): DSCR 5.99%, bridge 8.25%, rehab 8.375%, new construction 8.75%. Hard money loans (fix-and-flip, construction, bridge): $125K–$3.5M, up to 90% of purchase, 92.5% of total cost and 75% of after-repair value, 6–24 month interest-only terms, no prepayment penalty, no experience required. DSCR loans: $100K–$3M ($5M portfolio), up to 80% LTV (75% cash-out), 660 practical credit floor. Bridge loans generally need 680+. Most loans close in 7–10 days. Hard money in 38 states plus DC, DSCR in 39 states.',
    lastReviewed: V,
    sources: [
      { label: 'Upright — where it lends (terms and FAQ)', url: 'https://www.uprightlending.com/where-we-lend-hard-money' },
      { label: 'Upright — rehab loans', url: 'https://www.uprightlending.com/loan/rehab' },
      { label: 'Upright — DSCR loans', url: 'https://www.uprightlending.com/loan/dscr' },
      { label: 'Upright — bridge loans', url: 'https://www.uprightlending.com/loan/bridge' },
    ],
    bestForTags: [
      'Fix-and-flip investors',
      'New-construction builders',
      'BRRRR investors',
    ],
    pros: [
      'Publishes starting rates and leverage for each program',
      'Up to 92.5% of total cost on hard money loans',
      'No prepayment penalty on hard money loans',
      'Fix-and-flip, construction, bridge and DSCR from one lender',
    ],
    cons: [
      'Lends in 38 states plus DC, not nationwide',
      'Bridge loans generally need a 680+ credit score',
      'Brand transition (Fund That Flip → Upright) may cause confusion',
    ],
    featured: false,
    editorSummary: 'Upright is a good fit for a flipper or small builder who wants high leverage on cost: its hard money loans go up to 92.5% of total cost and 75% of after-repair value, with no prepayment penalty. It lends in 38 states plus DC, so confirm yours and get a written quote.',
    editorReview: `Upright is the fix-and-flip lender that spent its first decade as Fund That Flip. It originates short-term loans to house flippers and builders and, more recently, long-term DSCR rental loans, and it now operates its lending site under the Upright Lending name.

For a borrower, the draw is leverage on cost, published terms, and one lender for rehab, new construction, bridge and the long-term rental loan. Short-term money costs more than long-term rental financing, which is normal for this product. Confirm Upright's NMLS registration and current terms before applying, and know that you may still see "Fund That Flip" in older reviews and search results.`,
    metaTitle: 'Upright (Fund That Flip) Review 2026: Fix-and-Flip Loans | ProInvestorHub',
    metaDescription: 'Upright (formerly Fund That Flip) review: fix-and-flip, construction, bridge and DSCR rates, leverage and state coverage checked against Upright\'s own site.',
  },
  {
    name: 'Griffin Funding',
    slug: 'griffin-funding',
    website: 'https://www.griffinfunding.com',
    founded: null,
    headquarters: null,
    description:
      'Griffin Funding is a mortgage lender specializing in non-QM products for investors, including DSCR and bank statement loans.',
    loanTypeSlugs: ['dscr-loans', 'bank-statement-loans'],
    minRate: 5.99,
    maxRate: null,
    maxLtv: 85,
    minCreditScore: 620,
    minLoanAmount: 100000,
    maxLoanAmount: 4500000,
    originationFee: null,
    speedToClose: 'As few as 6 days',
    coverage: 'DSCR loans in all 50 states + DC',
    propertyTypes: ['sfr', 'condo', 'townhouse', 'multifamily'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: 'Typically 1 to 5 years (DSCR)',
    foreignNational: null,
    termsNote: 'DSCR loans (rates as of October 2026): from 5.99% on a 1-year ARM and from 7.125% on 30-year fixed, 40-year fixed and 5-year ARM; 620 minimum credit score; 20% standard down payment, 15% (85% LTV) at 740+ on loans up to $1M; cash-out up to 80% LTV; $100K–$4.5M; no minimum DSCR; prepayment penalty typically 1–5 years; closings in as few as 6 days (34-day average, per Griffin). Fees are not published on this page.',
    lastReviewed: V,
    sources: [{ label: 'Griffin Funding — DSCR loans', url: 'https://griffinfunding.com/non-qm-mortgages/dscr-loans/' }],
    bestForTags: ['Self-employed investors', 'Bank statement borrowers', 'DSCR investors'],
    pros: [
      '620 minimum credit score on DSCR loans',
      'No minimum DSCR',
      'Bank statement programs for self-employed borrowers',
      'Publishes rates, loan limits and LTV',
    ],
    cons: [
      'No fix-and-flip or bridge products',
      'DSCR loans typically carry a 1–5 year prepayment penalty',
      '85% LTV only at 740+ credit on loans up to $1M',
    ],
    featured: false,
    editorSummary: 'Griffin Funding is a good fit for a rental investor whose credit is around 620, or a self-employed borrower who needs a bank statement loan. Its DSCR page publishes rates from 5.99% (7.125% on 30-year fixed), no minimum DSCR, and loans from $100K to $4.5M.',
    editorReview: `Griffin Funding is a non-QM lender that has built its investor business around two products most banks won't offer: DSCR loans and bank statement loans — the programs that let you qualify on the property's cash flow or your deposits instead of W-2s and tax returns.

On its DSCR page, Griffin publishes rates from 5.99% on a 1-year ARM (from 7.125% on 30-year fixed), a 620 minimum credit score, loans from $100,000 to $4.5 million and no minimum DSCR. Treat every figure as a starting point and get a written quote; non-QM pricing moves with the market and your profile.

The bank statement program is the other reason investors find Griffin. If you're self-employed and your tax returns understate your income, it can qualify you on bank deposits instead.

Where Griffin isn't the answer: there's no fix-and-flip or bridge product, so a BRRRR or flip investor needs a second lender for the acquisition-and-rehab leg, and DSCR loans typically carry a 1–5 year prepayment penalty you'll want to model if you plan to refinance or sell early. Confirm Griffin Funding's NMLS registration and compare at least one written quote against a competing DSCR lender.`,
    metaTitle: 'Griffin Funding Review 2026: DSCR & Bank Statement Loans | ProInvestorHub',
    metaDescription: 'Griffin Funding review: DSCR rates, credit minimum, loan limits and LTV checked against Griffin\'s own site, plus bank statement loans for the self-employed.',
  },
  {
    name: 'Defy Mortgage',
    slug: 'defy-mortgage',
    website: 'https://www.defymortgage.com',
    founded: null,
    headquarters: null,
    description:
      'Defy Mortgage is a non-QM lender offering DSCR, bank statement and other alternative-documentation loans for real estate investors.',
    loanTypeSlugs: ['dscr-loans', 'bank-statement-loans'],
    minRate: null,
    maxRate: null,
    maxLtv: 85,
    minCreditScore: 640,
    minLoanAmount: 75000,
    maxLoanAmount: null,
    originationFee: null,
    speedToClose: '14–21 days',
    coverage: null,
    propertyTypes: ['sfr', 'condo', 'townhouse', 'multifamily', 'str'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: null,
    foreignNational: null,
    termsNote:
      'DSCR loans: 640 minimum credit score; minimum DSCR 0.75 (1.00 for cash-out); loans from $75,000 with no hard maximum; up to 85% LTV on single-family purchases (740+ credit, loans up to $1.5M) and 80% on refinances; closings in 14–21 days.',
    lastReviewed: V,
    sources: [
      { label: 'Defy Mortgage — DSCR loans', url: 'https://defymortgage.com/non-qm-loans/dscr-loans/' },
      { label: 'Defy Mortgage — DSCR loan requirements', url: 'https://defymortgage.com/dscr-loan-requirements/' },
      { label: 'Defy Mortgage — non-QM rates FAQ', url: 'https://defymortgage.com/non-qm-rates/' },
    ],
    bestForTags: ['Airbnb/STR investors', 'Self-employed investors', 'Thin-cash-flow rentals'],
    pros: [
      'DSCR as low as 0.75 on purchases',
      '640 minimum credit score',
      'Loans from $75,000',
      'Bank statement programs',
    ],
    cons: [
      'No fix-and-flip or bridge products',
      '85% LTV requires 740+ credit',
      'Rates and fees not published',
    ],
    featured: false,
    editorSummary:
      'Defy Mortgage is a good fit for a rental that doesn\'t quite cover its payment — it publishes a 0.75 minimum DSCR — or for a borrower with a 640 score. Leverage tops out at 85% only with 740+ credit; get the terms in writing.',
    metaTitle: 'Defy Mortgage Review 2026: DSCR & Non-QM Loans | ProInvestorHub',
    metaDescription:
      'Defy Mortgage review: DSCR credit minimum, minimum DSCR, loan size, LTV and closing time checked against Defy\'s own site. Bank statement loans too.',
  },
  {
    name: 'Tidal Loans',
    slug: 'tidal-loans',
    website: 'https://www.tidalloans.com',
    founded: null,
    headquarters: 'Houston, TX',
    description:
      'Tidal Loans is a Houston-based direct lender offering hard money, fix-and-flip, DSCR and commercial loans.',
    loanTypeSlugs: ['hard-money-loans', 'fix-and-flip-loans', 'dscr-loans', 'bridge-loans'],
    minRate: null,
    maxRate: null,
    maxLtv: 90,
    minCreditScore: null,
    noCreditMinimum: true,
    minLoanAmount: null,
    maxLoanAmount: null,
    originationFee: null,
    speedToClose: null,
    coverage: '39 states + DC',
    excludedStates: ['AK', 'CA', 'DE', 'HI', 'MN', 'NV', 'NM', 'ND', 'OR', 'SD', 'UT'],
    propertyTypes: ['sfr', 'multifamily', 'mixed-use', 'commercial'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: null,
    foreignNational: null,
    termsNote: 'Hard money / fix-and-flip: up to 90% of purchase price plus 100% of rehab, with the total capped at 75% of after-repair value. No minimum credit score — credit is pulled, and a lower score means a higher rate, lower LTV or more reserves. Commercial bridge and rehab up to 65% LTV. Its lending-area map excludes AK, CA, DE, HI, MN, NV, NM, ND, OR, SD and UT. Rates, fees and loan sizes are not published.',
    lastReviewed: V,
    sources: [
      { label: 'Tidal Loans — hard money lending terms', url: 'https://www.tidalloans.com/hard-money-lenders-florida/' },
      { label: 'Tidal Loans — credit requirements', url: 'https://www.tidalloans.com/hard-money-lenders-no-credit-check/' },
      { label: 'Tidal Loans — home page (lending areas)', url: 'https://www.tidalloans.com/' },
    ],
    bestForTags: ['Hard money borrowers', 'Borrowers with lower credit scores', 'High-leverage rehabs'],
    pros: [
      'No minimum credit score (credit is still pulled)',
      'Up to 90% of purchase and 100% of rehab',
      'Hard money, DSCR and commercial products',
    ],
    cons: [
      'Total loan capped at 75% of after-repair value',
      'Does not lend in 11 states, including CA',
      'Rates, fees and loan sizes not published',
    ],
    featured: false,
    editorSummary:
      'Tidal Loans is a good fit for a rehab where you want maximum leverage or your credit is thin: it publishes up to 90% of purchase plus 100% of rehab (capped at 75% of ARV) and no minimum credit score. Rates come by quote.',
    metaTitle: 'Tidal Loans Review 2026: Hard Money & DSCR | ProInvestorHub',
    metaDescription:
      'Tidal Loans review: hard money leverage and credit requirements checked against Tidal\'s own site, plus DSCR and commercial loans. Pros and cons.',
  },
  {
    name: 'Aloha Capital',
    slug: 'aloha-capital',
    website: 'https://alohaprivatelending.com',
    founded: null,
    headquarters: 'Boulder, CO',
    description: 'Aloha Capital is a private lender based in Boulder, Colorado offering DSCR rental, fix-and-flip, bridge, multifamily and ground-up construction loans to real estate investors.',
    loanTypeSlugs: ['hard-money-loans', 'fix-and-flip-loans', 'bridge-loans', 'dscr-loans', 'portfolio-loans', 'construction-loans'],
    minRate: 6.5,
    maxRate: null,
    maxLtv: 80,
    minCreditScore: 640,
    minLoanAmount: 75000,
    maxLoanAmount: 10000000,
    originationFee: null,
    speedToClose: 'As little as 5 business days (bridge)',
    coverage: '44 states + DC listed on its site',
    statesServed: ['AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'NE', 'NH', 'NJ', 'NM', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'TN', 'TX', 'VA', 'WA', 'WI', 'WY'],
    propertyTypes: ['sfr', 'condo', 'townhouse', 'multifamily', 'str', 'new-construction'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: true,
    prepaymentPenalty: null,
    foreignNational: true,
    termsNote: 'Rental (DSCR) loans: rates as low as 6.50%, up to 80% LTV on purchase or refinance, $75,000–$3 million ($10 million on a multi-property portfolio), 640 minimum FICO, foreign nationals at up to 65%. Fix & flip: rates starting at 10%, up to 85% of purchase and 100% of rehab, up to 75% of after-repair value, 9–24 month terms. Stable bridge: from 9.49%, up to 80% LTV. Ground-up and multifamily programs from 10.99%. Fees are not published.',
    lastReviewed: V,
    sources: [
      { label: 'Aloha Capital — loan options and terms', url: 'https://alohaprivatelending.com/borrow/loan-options/' },
      { label: 'Aloha Capital — home page (states)', url: 'https://alohaprivatelending.com/' },
    ],
    bestForTags: [
      'Fix-and-flip investors',
      'DSCR borrowers',
      'Portfolio investors',
    ],
    pros: [
      'Publishes rates and leverage by program',
      'Rental, fix-and-flip, bridge, multifamily and ground-up programs',
      'Blanket portfolio loans up to $10M',
      'Foreign nationals eligible on rental loans (up to 65%)',
    ],
    cons: [
      '640 minimum FICO on rental loans',
      'Fees not published',
      'Not every state is on its lending list',
    ],
    featured: false,
    editorSummary: 'Aloha Capital is a good fit for an investor who wants rental and rehab loans from a smaller private lender that still publishes its terms: rentals from 6.50% with a 640 minimum FICO, and fix-and-flip loans from 10%. Confirm your state and get a written term sheet.',
    metaTitle: 'Aloha Capital Review 2026: Private Hard Money Lender | ProInvestorHub',
    metaDescription: 'Aloha Capital review: a Boulder, Colorado private lender. DSCR, fix-and-flip and bridge rates, leverage and credit minimums checked against Aloha\'s own site.',
  },
  {
    name: 'Lendency',
    slug: 'lendency',
    website: 'https://www.lendency.com',
    founded: null,
    headquarters: null,
    description:
      'Lendency offers DSCR rental loans and fix-and-flip / bridge loans for real estate investors, with an online instant-quote tool.',
    loanTypeSlugs: ['dscr-loans', 'fix-and-flip-loans', 'bridge-loans'],
    minRate: null,
    maxRate: null,
    maxLtv: 80,
    minCreditScore: 660,
    minLoanAmount: 50000,
    maxLoanAmount: 3000000,
    originationFee: '2% origination + $999 service fee (bridge)',
    speedToClose: '5 business days (bridge) / 10–15 business days (DSCR) from a complete file',
    coverage: '30 states listed on its site',
    statesServed: ['AL', 'AR', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'IA', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MO', 'MS', 'MT', 'NH', 'NM', 'OH', 'OK', 'SC', 'TX', 'WA', 'WI', 'WV', 'WY'],
    propertyTypes: ['sfr', 'condo', 'townhouse', 'multifamily'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: '5-4-3-2-1 (DSCR); none (bridge)',
    foreignNational: null,
    termsNote: 'DSCR loans: $50K–$2M, up to 80% of cost or as-is value, 660 minimum guarantor credit score, minimum DSCR 1.20, minimum property value $75K, 5-year step-down prepayment penalty, closing within 10–15 business days of a full file. Fix-and-flip / bridge: $50K–$3M ($1M standard), up to 90% of cost, 100% of rehab and 75% of after-repair value, 660 minimum credit (600–659 at lender discretion), 2% origination plus a $999 service fee, no prepayment penalty, closing within 5 business days. Eligible in 30 states. Rates are by instant quote.',
    lastReviewed: V,
    sources: [
      { label: 'Lendency — DSCR loans', url: 'https://www.lendency.com/dscr-loans' },
      { label: 'Lendency — bridge / fix-and-flip loans', url: 'https://www.lendency.com/bridge-loans' },
    ],
    bestForTags: ['DSCR investors', 'Low-cost markets', 'Small loan amounts'],
    pros: [
      'Loans from $50,000 — useful in lower-cost markets',
      'Both DSCR and fix-and-flip / bridge programs',
      'Online instant quote',
    ],
    cons: [
      'Lends in 30 states',
      'DSCR loans require a 1.20 DSCR',
      'Rates not published',
    ],
    featured: false,
    editorSummary: 'Lendency is a good fit for smaller deals in the 30 states it serves: its DSCR and bridge loans start at $50,000, and it publishes its fees (2% plus $999 on bridge loans). Its DSCR program asks for a 1.20 ratio and a 660 credit score.',
    metaTitle: 'Lendency Review 2026: DSCR & Bridge Loans | ProInvestorHub',
    metaDescription:
      'Lendency review: DSCR and fix-and-flip loans from $50,000, with credit minimums and loan limits checked against Lendency\'s own site.',
  },
  {
    name: 'Civic Financial Services',
    slug: 'civic-financial',
    website: 'https://www.civicfs.com',
    founded: null,
    headquarters: null,
    description:
      'Civic Financial Services is a private money lender offering business-purpose loans including fix-and-flip, bridge, multifamily and rental portfolio products. It is now part of the Roc360 family of companies.',
    loanTypeSlugs: ['hard-money-loans', 'fix-and-flip-loans', 'bridge-loans', 'dscr-loans', 'portfolio-loans', 'construction-loans'],
    minRate: 6.56,
    maxRate: null,
    maxLtv: 80,
    minCreditScore: 660,
    minLoanAmount: 50000,
    maxLoanAmount: 10000000,
    originationFee: null,
    speedToClose: null,
    coverage: '47 states + DC — not ND, SD or VT',
    excludedStates: ['ND', 'SD', 'VT'],
    propertyTypes: ['sfr', 'multifamily', 'mixed-use', 'condo', 'townhouse'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: null,
    foreignNational: true,
    termsNote: 'Starting rates: rental and rental portfolio 6.56%, fix-and-flip and 1–4 unit bridge 8.49%, construction 8.99%, multifamily bridge 10.99%. Single rental loan: $75K–$2MM, 660 minimum FICO, up to 80% LTV (75% cash-out), foreign nationals up to 65% LTV. Rental portfolio: 680 minimum FICO, up to $2MM. Fix-and-flip: $50K–$3MM, up to 90% of cost, 100% of rehab and 75% of after-repair value. Multifamily bridge: $1M–$10M, 725 minimum FICO, select East Coast markets. Not available in ND, SD or VT. Fees are not published.',
    lastReviewed: V,
    sources: [
      { label: 'Civic — product overview (starting rates)', url: 'https://civicfs.com/product-overview/' },
      { label: 'Civic — rental loan', url: 'https://civicfs.com/rental/' },
      { label: 'Civic — fix and flip loan', url: 'https://civicfs.com/fix-and-flip/' },
      { label: 'Civic — multifamily bridge loan', url: 'https://civicfs.com/multifamily-bridge-loan/' },
      { label: 'Civic — where it lends', url: 'https://civicfs.com/where-we-lend/' },
    ],
    bestForTags: ['All-in-one lender', 'Multifamily investors'],
    pros: [
      'Publishes starting rates and program terms',
      'Product range from fix-and-flip to multifamily bridge up to $10M',
      'Foreign nationals eligible on rental loans (up to 65% LTV)',
    ],
    cons: [
      'Does not lend in ND, SD or VT',
      'Fees not published',
      'Sister company of Roc Capital — not an independent second quote',
    ],
    featured: false,
    editorSummary: 'Civic Financial is a good fit if you want a private lender that publishes starting rates (rentals from 6.56%, flips from 8.49%) across a range from fix-and-flip to multifamily bridge. It is a Roc360 company, so a Civic quote and a Roc Capital quote come from the same group.',
    editorReview: `CIVIC Financial Services was founded as a venture of Wedgewood, the California real estate firm, and grew into one of the better-known institutional private lenders. In 2021 Pacific Western Bank (PacWest Bancorp) acquired Civic; in 2023, during the regional-banking stress that hit PacWest, Roc360 — the holding company behind Roc Capital — acquired Civic's origination business. Civic now operates as a Roc360 company under its own brand.

For investors, that means a broad product line — fix-and-flip, bridge, multifamily and rental portfolio loans — backed by Roc360's capital rather than a bank. One thing worth knowing if you're comparing options on this site: Civic and Roc Capital are sibling brands under the same parent, so you may effectively be evaluating the same lending group twice. Confirm current rates and terms for your specific loan.`,
    metaTitle: 'Civic Financial Services Review 2026: Private Money Lender | ProInvestorHub',
    metaDescription:
      'Civic Financial Services review: Roc360-family private lender for fix-and-flip, bridge and multifamily loans, with published program terms from Civic\'s own site.',
  },
  {
    name: 'Velocity Mortgage Capital',
    slug: 'velocity-mortgage',
    website: 'https://www.velocitymortgage.com',
    founded: null,
    headquarters: null,
    description:
      'Velocity Mortgage Capital lends on investor 1–4 unit residential rentals and small-balance commercial properties.',
    loanTypeSlugs: ['dscr-loans', 'commercial-loans'],
    minRate: 7.915,
    maxRate: null,
    maxLtv: 75,
    minCreditScore: null,
    noCreditMinimum: true,
    minLoanAmount: 75000,
    maxLoanAmount: 10000000,
    originationFee: '2% + $999 underwriting fee (Flex I/O)',
    speedToClose: null,
    coverage: 'Nationwide (per its rate sheet)',
    propertyTypes: ['sfr', 'multifamily', 'mixed-use', 'commercial'],
    experienceRequired: 'varies',
    allowsLlc: true,
    interestOnlyAvailable: true,
    prepaymentPenalty: '5-4-3-2-1 on 30-year fixed; none on Flex I/O',
    foreignNational: true,
    termsNote: 'From Velocity\'s Investor 1–4 rate sheet effective September 21, 2026 (written for mortgage brokers): 30-year fixed rates from 7.915% (purchase, 750+ FICO, 50% LTV), $75K–$2MM, up to 75% LTV, rows down to sub-600 FICO, 5-year step-down prepayment penalty, 5% lower LTV for first-time investors. Fast50: up to 50% LTV, no minimum credit score. Flex I/O: $75K–$2MM, up to 75% LTV (70% over $1MM), 675 minimum FICO, 24-month interest-only, 2% + $999 lender fees, first-time investors capped at 65% LTV. Super jumbo: $2MM–$10MM in major metros, 600 minimum FICO. Foreign investors up to 65% LTV, ITIN OK. Lending nationwide.',
    lastReviewed: V,
    sources: [
      { label: 'Velocity — Investor 1–4 rate sheet (effective 9/21/2026)', url: 'https://www.velocitymortgage.com/wp-content/uploads/2026/09/9_21_26-Matrix-1-4.pdf' },
    ],
    bestForTags: ['Small balance commercial', 'Multifamily investors', 'Mixed-use investors', 'Foreign investors'],
    pros: [
      'Residential 1–4 and small-balance commercial programs',
      'Foreign investors eligible (up to 65% LTV)',
      'Publishes a detailed rate sheet',
      'No credit-score minimum on 30-year fixed and Fast50 programs',
    ],
    cons: [
      'Max 75% LTV on its investor 1–4 programs',
      'First-time investors get reduced leverage',
      'Rate sheet is written for brokers — expect to go through one',
    ],
    featured: false,
    editorSummary: 'Velocity Mortgage is a good fit for investors moving from 1–4 unit rentals into small commercial, for foreign investors (up to 65% LTV), and for borrowers with weak credit: its 30-year fixed and Fast50 programs have no credit-score floor. Its published leverage tops out at 75% LTV.',
    editorReview: `Velocity Mortgage Capital built its niche in investor 1–4 unit residential rentals and small-balance commercial real estate, a corner of the market large banks tend to skip. Its parent, Velocity Financial, is publicly traded on the NYSE under the ticker VEL, which brings a level of financial disclosure most private lenders don't offer.

For investors, Velocity's sweet spot is the deal that straddles residential and commercial — small multifamily, mixed-use and small-balance commercial alongside standard rentals. The trade-off is that a long-established, broker-driven lender is less nimble than a boutique. Check the current rate matrix for your property type before you apply.`,
    metaTitle: 'Velocity Mortgage Review 2026: DSCR & Commercial | ProInvestorHub',
    metaDescription: 'Velocity Mortgage Capital review: investor 1–4 and small-balance commercial loans, with rates, LTV, credit and loan limits from Velocity\'s published rate sheet.',
  },
  {
    name: 'Roc Capital',
    slug: 'roc-capital',
    website: 'https://roccapital.com',
    founded: null,
    headquarters: null,
    description: 'Roc Capital, the lending brand of Roc360, describes itself as a capital provider for private lenders: it funds fix-and-flip, ground-up construction, stabilized bridge, and single and portfolio rental loans that private lenders and originators make to investors. You usually reach its loans through one of them rather than by applying directly.',
    loanTypeSlugs: ['hard-money-loans', 'fix-and-flip-loans', 'bridge-loans', 'dscr-loans'],
    minRate: null,
    maxRate: null,
    maxLtv: null,
    minCreditScore: null,
    minLoanAmount: null,
    maxLoanAmount: null,
    originationFee: null,
    speedToClose: null,
    coverage: null,
    propertyTypes: ['sfr', 'multifamily', 'condo', 'townhouse', 'new-construction'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: null,
    foreignNational: null,
    capitalProvider: true,
    termsNote: 'Roc Capital sells its loan programs to private lenders and originators, who make the loans to investors. It advertises DSCR rates "starting as low as 5.39%" to those partners, but does not publish borrower-facing leverage, credit minimums or fees.',
    lastReviewed: V,
    sources: [{ label: 'Roc Capital — home page', url: 'https://roccapital.com/' }],
    bestForTags: ['Investors working through a broker or private lender'],
    pros: [
      'Fix-and-flip, ground-up, bridge and rental programs',
      'Large institutional lending group (Roc360)',
    ],
    cons: [
      'Mainly a capital provider to other lenders — you may not deal with it directly',
      'Borrower-facing terms not published',
      'Sister company of Civic — not an independent second quote',
    ],
    featured: false,
    editorSummary:
      'Roc Capital mostly funds loans that private lenders and brokers originate, so you are likely to meet it through an intermediary rather than apply directly. Ask your broker whether a quote is Roc-funded.',
    editorReview: `Roc Capital is the lending brand of Roc360, founded in New York City by Arvind Raghunathan, Maksim Stavinsky and Eric Abramovich. Its site describes it as a capital provider for private lenders — it supplies the money and loan programs that other lenders and brokers offer to investors.

A lot of Roc's scale has come through acquisition: in 2023 it acquired Finance of America Commercial and the origination business of Civic Financial Services. One thing to keep straight: "Roc Capital" and "Roc360" are the same organization — the brand and its parent — and Civic is a sister brand, not a competitor. If a broker quotes you a Roc-funded loan, confirm the terms in writing.`,
    metaTitle: 'Roc Capital Review 2026: Capital Provider for Investor Loans | ProInvestorHub',
    metaDescription:
      'Roc Capital review: how Roc360\'s lending brand works as a capital provider to private lenders and brokers, and what that means for investors.',
  },
  {
    // NOTE: corrected from a prior mislabel of "Lima One (formerly OfferMarket)".
    // OfferMarket is unrelated to Lima One Capital (Greenville SC, owned by MFA
    // Financial) — no rebrand or acquisition links them.
    name: 'OfferMarket',
    slug: 'offermarket',
    website: 'https://www.offermarket.us',
    founded: null,
    headquarters: null,
    description: 'OfferMarket is a lender for real estate investors offering DSCR rental, fix-and-flip and ground-up construction loans, with its loan guidelines and current rates published online.',
    loanTypeSlugs: ['dscr-loans', 'fix-and-flip-loans', 'fix-and-rent-loans', 'bridge-loans', 'construction-loans', 'portfolio-loans'],
    minRate: 6.375,
    maxRate: 8.5,
    maxLtv: 85,
    minCreditScore: 660,
    minLoanAmount: 50000,
    maxLoanAmount: 2000000,
    originationFee: '0–2 points (DSCR); 1–2 points (fix-and-flip)',
    speedToClose: null,
    coverage: null,
    propertyTypes: ['sfr', 'condo', 'townhouse', 'multifamily'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: true,
    prepaymentPenalty: null,
    foreignNational: null,
    termsNote: 'Today\'s terms (updated September 23, 2026): DSCR 6.375%–8.5% with 0–2 points; fix-and-flip from 8.50% with 1–2 points; ground-up construction also offered. 1–4 unit DSCR loans: $75,000–$2,000,000, 30- or 40-year fixed or interest-only, up to 85% LTV on purchases and 80% on refinances, 680 minimum guarantor FICO, 1.0 minimum DSCR, full recourse. Blanket portfolio DSCR: from $100,000, 660 minimum FICO, up to 80% LTV (75% cash-out). Fix and rent: $50,000–$2,000,000, up to 90% of purchase, 100% of rehab and 75% of after-repair value, 680 minimum FICO, no prepayment penalty.',
    lastReviewed: V,
    sources: [{ label: 'OfferMarket — loan guidelines', url: 'https://www.offermarket.us/loans' }],
    bestForTags: [
      'DSCR investors',
      'BRRRR investors',
      'Investors who want published guidelines',
    ],
    pros: [
      'Publishes current rates, points and full guidelines',
      'Up to 85% LTV on DSCR purchases',
      'DSCR, fix-and-flip, construction and blanket portfolio loans',
    ],
    cons: [
      '680 minimum FICO on single-property DSCR and fix-and-rent loans',
      'Full recourse (personal guarantee)',
    ],
    featured: false,
    editorSummary: 'OfferMarket is a good fit for an investor who wants the rules up front: it publishes its rates (DSCR 6.375%–8.5% as of September 2026), points and guidelines, including up to 85% LTV on DSCR purchases and a 680 minimum FICO on single-property loans.',
    editorReview: `OfferMarket comes at investor financing from a different angle than the big balance-sheet lenders. Its lending arm sits alongside an off-market property marketplace and an insurance marketplace — the pitch is a one-stop platform for buy-and-hold investors rather than a pure lender.

On the loan side, OfferMarket publishes its guidelines in full — loan sizes, points, maximum LTV, credit and DSCR minimums — plus a dated table of current rates for DSCR, fix-and-flip and ground-up loans. That transparency is the differentiator. Confirm current terms and NMLS registration before you apply.`,
    metaTitle: 'OfferMarket Review 2026: DSCR Loans for Investors | ProInvestorHub',
    metaDescription: 'OfferMarket review: DSCR and fix-and-flip rates, points, LTV and credit minimums checked against OfferMarket\'s published guidelines. Pros and cons.',
  },
  {
    name: 'Park Place Finance',
    slug: 'park-place-finance',
    website: 'https://www.parkplacefinance.com',
    founded: null,
    headquarters: 'Austin, TX',
    description:
      'Park Place Finance is an independent private lender offering hard money, bridge and fix-and-flip loans to real estate investors.',
    loanTypeSlugs: ['hard-money-loans', 'fix-and-flip-loans', 'bridge-loans', 'construction-loans', 'dscr-loans'],
    minRate: 5.75,
    maxRate: null,
    maxLtv: 85,
    minCreditScore: null,
    minLoanAmount: null,
    maxLoanAmount: null,
    originationFee: null,
    speedToClose: '5–7 business days',
    coverage: '46 states — not AK, NV, ND or SD',
    excludedStates: ['AK', 'NV', 'ND', 'SD'],
    propertyTypes: ['sfr', 'multifamily', 'mixed-use', 'commercial'],
    experienceRequired: null,
    allowsLlc: true,
    interestOnlyAvailable: null,
    prepaymentPenalty: null,
    foreignNational: null,
    termsNote: 'Renovation loans: up to 93% of cost and 75% of after-repair value, closing in 5–7 days. Bridge: up to 80% of cost, up to 80% LTV on refinances, 12–24 month terms. Ground-up construction: up to 90% of cost, 70% of after-repair value. Rental: rates from 5.75%, up to 85% LTV on purchases, 30-year term. Main office in Austin, Texas; lends in 46 states (not AK, NV, ND or SD); $2B+ funded. Credit minimum, loan sizes and fees are not published on its home page.',
    lastReviewed: V,
    sources: [{ label: 'Park Place Finance — home page', url: 'https://parkplacefinance.com/' }],
    bestForTags: ['Flip investors', 'High-leverage purchases', 'Fast closings'],
    pros: [
      'Up to 93% of cost on renovation loans and 85% LTV on rental purchases (published)',
      '5–7 business day closings (published)',
      'Renovation, bridge, construction and rental programs',
    ],
    cons: [
      'Does not lend in AK, NV, ND or SD',
      'Credit minimum, loan sizes and fees not published',
    ],
    featured: false,
    editorSummary: 'Park Place Finance is a good fit for a flip where leverage and speed matter: its site publishes up to 93% of cost on renovation loans and 5–7 business day closings, plus rental loans from 5.75%. It lends in 46 states, so check yours and get the fees in writing.',
    editorReview: `Park Place Finance is one of the longer-running independent private lenders on this list: its site cites 20 years in business, more than $2 billion funded, a main office in Austin, Texas, and lending in 46 states.

It has stayed an independent shop rather than part of a larger financial group, and it offers renovation, bridge, ground-up construction and rental programs. That independence can mean a more direct, relationship-driven process than you'd get from a national institution. As a privately held lender, much of its track record is self-reported, so confirm current rates, points and terms in writing for your deal, and check the firm's NMLS registration before you commit.`,
    metaTitle: 'Park Place Finance Review 2026: Hard Money Lender | ProInvestorHub',
    metaDescription: 'Park Place Finance review: published rental rate, renovation leverage, closing speed and state coverage checked against Park Place\'s own site. Pros and cons.',
  },
]

export function getLenderBySlug(slug: string): LenderData | undefined {
  return lenders.find((l) => l.slug === slug)
}

/** Alphabetical: the directory does not rank lenders. */
const byName = (a: LenderData, b: LenderData) => a.name.localeCompare(b.name)

export function getLendersByLoanType(loanTypeSlug: string): LenderData[] {
  return lenders.filter((l) => l.loanTypeSlugs.includes(loanTypeSlug)).sort(byName)
}

export function getFeaturedLenders(): LenderData[] {
  return lenders.filter((l) => l.featured).sort(byName)
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`
  }
  return `$${(value / 1000).toFixed(0)}K`
}

// ── Display helpers: unpublished figures render as "Not published", never a guess ──

export const NOT_PUBLISHED = 'Not published'

export function formatRate(l: Pick<LenderData, 'minRate' | 'maxRate'>): string {
  if (l.minRate != null && l.maxRate != null) return `${l.minRate}%–${l.maxRate}%`
  if (l.minRate != null) return `From ${l.minRate}%`
  return NOT_PUBLISHED
}

export function formatLtv(l: Pick<LenderData, 'maxLtv'>): string {
  return l.maxLtv != null ? `Up to ${l.maxLtv}%` : NOT_PUBLISHED
}

export function formatCredit(l: Pick<LenderData, 'minCreditScore' | 'noCreditMinimum'>): string {
  if (l.minCreditScore != null) return `${l.minCreditScore}`
  return l.noCreditMinimum ? 'No minimum' : NOT_PUBLISHED
}

export function formatLoanRange(l: Pick<LenderData, 'minLoanAmount' | 'maxLoanAmount'>): string {
  const { minLoanAmount: lo, maxLoanAmount: hi } = l
  if (lo != null && hi != null) return `${formatCurrency(lo)}–${formatCurrency(hi)}`
  if (lo != null) return `From ${formatCurrency(lo)}`
  if (hi != null) return `Up to ${formatCurrency(hi)}`
  return NOT_PUBLISHED
}

export function formatText(v: string | null | undefined): string {
  return v ?? NOT_PUBLISHED
}

export function formatYesNo(v: boolean | null | undefined, yes = 'Yes', no = 'No'): string {
  if (v == null) return NOT_PUBLISHED
  return v ? yes : no
}

export const experienceLabels: Record<string, string> = {
  none: 'No experience required',
  beginner: '1–2 completed deals',
  intermediate: '3–5 completed deals',
  experienced: '5+ completed deals',
  varies: 'Varies by program',
}

export function formatExperience(v: string | null): string {
  return v ? experienceLabels[v] || v : NOT_PUBLISHED
}

/**
 * Whether a lender lends in a state, from what the lender publishes:
 * 'no' — the state is on its excluded list, or missing from its published list of states served;
 * 'yes' — the state is on its published list of states served;
 * 'unknown' — the lender publishes no state list (it may still say "nationwide" in `coverage`).
 */
export function lenderStateStatus(
  l: Pick<LenderData, 'excludedStates' | 'statesServed'>,
  stateAbbr: string,
): 'yes' | 'no' | 'unknown' {
  if (l.excludedStates?.includes(stateAbbr)) return 'no'
  if (l.statesServed) return l.statesServed.includes(stateAbbr) ? 'yes' : 'no'
  return 'unknown'
}

/** Lenders that do not say they exclude the state. */
export function lendersServingState<T extends Pick<LenderData, 'excludedStates' | 'statesServed'>>(
  list: T[],
  stateAbbr: string,
): T[] {
  return list.filter((l) => lenderStateStatus(l, stateAbbr) !== 'no')
}

/** Coverage as the lender words it, or "Not published". */
export function formatCoverage(l: Pick<LenderData, 'coverage'>): string {
  return l.coverage ?? NOT_PUBLISHED
}
