import type { LenderData } from '@/data/lenders'
import { freshnessStamp } from '@/lib/content-freshness'

/**
 * "Verified {Month YYYY} from {lender}'s site" + the pages the figures came from.
 * Rendered wherever a lender's loan figures are shown as fact.
 */
export function LenderVerification({
  lender,
  showNote = true,
  className = '',
}: {
  lender: Pick<LenderData, 'name' | 'lastReviewed' | 'sources' | 'termsNote'>
  showNote?: boolean
  className?: string
}) {
  const stamp = lender.lastReviewed ? freshnessStamp('lenders', lender.lastReviewed) : null
  return (
    <div className={`text-xs text-text-light leading-5 ${className}`}>
      {showNote && lender.termsNote && <p className="mb-2 text-text-muted">{lender.termsNote}</p>}
      <p>
        {stamp
          ? `Figures verified ${stamp.date} from ${lender.name}'s own site`
          : `Figures not yet verified against ${lender.name}'s site`}
        {lender.sources.length > 0 && ': '}
        {lender.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && ' · '}
            <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="underline hover:text-primary">
              {s.label}
            </a>
          </span>
        ))}
        . &ldquo;Not published&rdquo; means the lender doesn&apos;t state that figure on its site.
      </p>
    </div>
  )
}
