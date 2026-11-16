'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { LenderData } from '@/data/lenders'
import {
  formatRate, formatLtv, formatCredit, formatLoanRange, formatText, formatYesNo,
  formatExperience, formatCoverage,
} from '@/data/lenders'
import { formatMonthYear } from '@/lib/content-freshness'
import { LenderOutboundLink } from '@/components/lender-outbound-link'

const propertyTypeLabels: Record<string, string> = {
  sfr: 'SFR (1-4)',
  multifamily: 'Multifamily (5+)',
  'mixed-use': 'Mixed Use',
  commercial: 'Commercial',
  str: 'STR / Airbnb',
  condo: 'Condo',
  townhouse: 'Townhouse',
  mobile: 'Mobile/Manufactured',
  land: 'Land',
  'new-construction': 'New Construction',
}

type ComparisonRow = {
  label: string
  getValue: (l: LenderData) => string
}

// Side-by-side published facts only. No "best" highlighting: the directory has
// no scoring rule, and "Not published" means the lender doesn't state the figure.
const comparisonRows: ComparisonRow[] = [
  { label: 'Published rates', getValue: (l) => formatRate(l) },
  { label: 'Max LTV', getValue: (l) => formatLtv(l) },
  { label: 'Min credit score', getValue: (l) => formatCredit(l) },
  { label: 'Loan range', getValue: (l) => formatLoanRange(l) },
  { label: 'Origination / fees', getValue: (l) => formatText(l.originationFee) },
  { label: 'Speed to close', getValue: (l) => formatText(l.speedToClose) },
  { label: 'Experience required', getValue: (l) => formatExperience(l.experienceRequired) },
  { label: 'LLC borrowing', getValue: (l) => formatYesNo(l.allowsLlc) },
  { label: 'Interest-only', getValue: (l) => formatYesNo(l.interestOnlyAvailable, 'Available', 'Not available') },
  { label: 'Prepayment penalty', getValue: (l) => formatText(l.prepaymentPenalty) },
  { label: 'Foreign nationals', getValue: (l) => formatYesNo(l.foreignNational) },
  { label: 'State coverage', getValue: (l) => formatCoverage(l) },
  { label: 'Property types', getValue: (l) => l.propertyTypes.map((pt) => propertyTypeLabels[pt] || pt).join(', ') },
  { label: 'Headquarters', getValue: (l) => formatText(l.headquarters) },
  {
    label: 'Verified',
    getValue: (l) => (l.lastReviewed ? `${formatMonthYear(l.lastReviewed)} from ${l.name}'s site` : 'Not yet verified'),
  },
]

export function LenderComparison({ allLenders }: { allLenders: LenderData[] }) {
  const [selected, setSelected] = useState<string[]>([])

  const selectedLenders = selected
    .map((slug) => allLenders.find((l) => l.slug === slug))
    .filter((l): l is LenderData => l !== undefined)

  function toggleLender(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug)
      if (prev.length >= 3) return prev // max 3
      return [...prev, slug]
    })
  }

  return (
    <div>
      {/* Lender Selector */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-text mb-2">
          Select 2–3 Lenders to Compare
        </h2>
        <p className="text-sm text-text-muted mb-4">
          {selected.length === 0 && 'Choose lenders below to see a side-by-side comparison.'}
          {selected.length === 1 && 'Select at least one more lender.'}
          {selected.length >= 2 && `Comparing ${selected.length} lenders. ${selected.length < 3 ? 'You can add one more.' : 'Maximum 3 selected.'}`}
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...allLenders]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((lender) => {
              const isSelected = selected.includes(lender.slug)
              const isDisabled = !isSelected && selected.length >= 3
              return (
                <button
                  key={lender.slug}
                  type="button"
                  onClick={() => toggleLender(lender.slug)}
                  disabled={isDisabled}
                  className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                      : isDisabled
                        ? 'border-border bg-surface text-text-light cursor-not-allowed opacity-50'
                        : 'border-border bg-white text-text hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  <span>{lender.name}</span>
                  <p className="mt-1 text-xs text-text-light">
                    {lender.loanTypeSlugs.length} products &middot; {formatRate(lender)}
                  </p>
                </button>
              )
            })}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedLenders.length >= 2 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-raised">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text w-48">
                  Feature
                </th>
                {selectedLenders.map((lender) => (
                  <th key={lender.slug} className="px-4 py-3 text-left font-semibold text-text min-w-[200px]">
                    <Link
                      href={`/lenders/reviews/${lender.slug}`}
                      className="text-primary hover:text-primary-light transition-colors"
                    >
                      {lender.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {comparisonRows.map((row) => (
                <tr key={row.label} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-medium text-text-muted">
                    {row.label}
                  </td>
                  {selectedLenders.map((lender) => (
                    <td key={lender.slug} className="px-4 py-3 text-text">
                      {row.getValue(lender)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Pros */}
              <tr>
                <td className="px-4 py-3 font-medium text-text-muted align-top">Pros</td>
                {selectedLenders.map((lender) => (
                  <td key={lender.slug} className="px-4 py-3 align-top">
                    <ul className="space-y-1">
                      {lender.pros.slice(0, 4).map((pro) => (
                        <li key={pro} className="flex items-start gap-1.5 text-xs text-green-800">
                          <span className="text-green-600 mt-0.5">+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              {/* Cons */}
              <tr>
                <td className="px-4 py-3 font-medium text-text-muted align-top">Cons</td>
                {selectedLenders.map((lender) => (
                  <td key={lender.slug} className="px-4 py-3 align-top">
                    <ul className="space-y-1">
                      {lender.cons.slice(0, 3).map((con) => (
                        <li key={con} className="flex items-start gap-1.5 text-xs text-red-800">
                          <span className="text-red-600 mt-0.5">&ndash;</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Per-lender CTAs aligned under columns */}
      {selectedLenders.length >= 2 && (
        <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: `12rem repeat(${selectedLenders.length}, minmax(200px, 1fr))` }}>
          {/* Empty cell for the label column */}
          <div />
          {selectedLenders.map((lender) => (
            <div key={lender.slug} className="flex flex-col gap-2">
              <Link
                href={`/lenders/reviews/${lender.slug}`}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors text-center"
              >
                Full {lender.name} Review &rarr;
              </Link>
              <LenderOutboundLink
                websiteUrl={lender.website}
                lenderName={lender.name}
                lenderSlug={lender.slug}
                placement="comparison-table"
                className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors text-center"
              >
                Visit {lender.name}
              </LenderOutboundLink>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
