import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DeferredEngagement } from '@/components/deferred-engagement'
import { AiReferralTracker } from '@/components/ai-referral-tracker'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <DeferredEngagement />
      <AiReferralTracker />
    </div>
  )
}
