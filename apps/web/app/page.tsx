import {
  fetchLandingStats,
  fetchUseCases,
  fetchFeatureHighlights,
  fetchAnalyticsCallouts,
  fetchAutomationSteps,
} from './(marketing)/lib/data'
import { MarketingNavbar } from './(marketing)/components/MarketingNavbar'
import { HeroSection } from './(marketing)/components/HeroSection'
import { StatsBand } from './(marketing)/components/StatsBand'
import { UseCasesSection } from './(marketing)/components/UseCasesSection'
import { FeatureStorySection } from './(marketing)/components/FeatureStorySection'

export const revalidate = 1800

export default async function LandingPage() {
  const [stats, useCases, highlights, callouts, automationSteps] = await Promise.all([
    fetchLandingStats(),
    fetchUseCases(),
    fetchFeatureHighlights(),
    fetchAnalyticsCallouts(),
    fetchAutomationSteps(),
  ])

  const trustLogos = ['Santagloria', 'Casa Mono', 'FitClub', 'Healthy Poke', 'La Parada', 'Grosso Napoletano']

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <MarketingNavbar />
      <main className="flex flex-1 flex-col">
        <HeroSection stats={stats} trustLogos={trustLogos} />
        <StatsBand stats={stats} />
        <UseCasesSection useCases={useCases} />
        <FeatureStorySection highlights={highlights} callouts={callouts} steps={automationSteps} />
      </main>
      <footer className="border-t border-neutral-200 bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-neutral-500 md:px-8">
          <span>© {new Date().getFullYear()} MYSTAMP · Loyalty CRM para retail & hospitality</span>
          <div className="flex flex-wrap items-center gap-4">
            <a href="/terms" className="hover:text-neutral-900">
              Términos
            </a>
            <a href="/privacy" className="hover:text-neutral-900">
              Privacidad
            </a>
            <a href="mailto:hola@mystamp.io" className="hover:text-neutral-900">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}