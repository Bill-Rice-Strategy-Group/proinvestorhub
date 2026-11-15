import { SanityLive } from '@/sanity/lib/live'

// SanityLive revalidates the Sanity cache tags set by sanityFetch. Only routes
// that read Sanity through sanityFetch mount it, so calculator, lender and
// market pages don't ship its ~70 KB (gzip) client bundle. See
// src/app/layout.tsx.
export default function SanityContentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <SanityLive />
    </>
  )
}
