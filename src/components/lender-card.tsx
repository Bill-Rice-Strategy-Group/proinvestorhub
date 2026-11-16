import Link from 'next/link'
import type { LenderData } from '@/data/lenders'
import {
  formatRate, formatLtv, formatCredit, formatLoanRange, formatText, formatExperience,
} from '@/data/lenders'
import { formatMonthYear } from '@/lib/content-freshness'

export function LenderCard({ lender }: { lender: LenderData }) {
  return (
    <Link
      href={`/lenders/reviews/${lender.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
          {lender.name}
        </h3>
      </div>

      {/* FTC disclosure: only renders for genuine paid affiliate partners */}
      {lender.affiliateUrl && (
        <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary">
          Affiliate partner
        </span>
      )}

      <p className="text-sm text-text-muted leading-6 line-clamp-3 mb-4">
        {lender.description}
      </p>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
        <div>
          <span className="text-text-light">Rates</span>
          <p className="font-semibold text-text tabular-nums">
            {formatRate(lender)}
          </p>
        </div>
        <div>
          <span className="text-text-light">Max LTV</span>
          <p className="font-semibold text-text tabular-nums">{formatLtv(lender)}</p>
        </div>
        <div>
          <span className="text-text-light">Min Credit</span>
          <p className="font-semibold text-text tabular-nums">{formatCredit(lender)}</p>
        </div>
        <div>
          <span className="text-text-light">Close In</span>
          <p className="font-semibold text-text">{formatText(lender.speedToClose)}</p>
        </div>
        <div>
          <span className="text-text-light">Loan Range</span>
          <p className="font-semibold text-text tabular-nums">
            {formatLoanRange(lender)}
          </p>
        </div>
        <div>
          <span className="text-text-light">States</span>
          <p className="font-semibold text-text">{formatText(lender.coverage)}</p>
        </div>
        <div className="col-span-2">
          <span className="text-text-light">Experience</span>
          <p className="font-semibold text-text">
            {formatExperience(lender.experienceRequired)}
          </p>
        </div>
      </div>

      {lender.lastReviewed && (
        <p className="mb-3 text-[11px] text-text-light">
          Verified {formatMonthYear(lender.lastReviewed)} from {lender.name}&apos;s site
        </p>
      )}

      {/* Best-For Tags */}
      {lender.bestForTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border">
          {lender.bestForTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
