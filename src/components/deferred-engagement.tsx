'use client'

import dynamic from 'next/dynamic'

// The sticky bottom bar and the exit-intent modal render nothing on first paint
// (each returns null until a scroll or mouse-leave fires), so there is no reason
// to ship their code in the initial bundle of every page. Loading them as
// separate client-only chunks after hydration trims the shared JS that blocks
// interactivity (TBT/INP) without changing what the visitor sees.
const StickyCTA = dynamic(
  () => import('@/components/sticky-cta').then((m) => m.StickyCTA),
  { ssr: false }
)
const ExitIntentModal = dynamic(
  () => import('@/components/exit-intent-modal').then((m) => m.ExitIntentModal),
  { ssr: false }
)

export function DeferredEngagement() {
  return (
    <>
      <StickyCTA />
      <ExitIntentModal />
    </>
  )
}
