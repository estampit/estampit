import Navbar from '../components/Navbar'
import { Hero } from '../components/Hero'
import Stats from '../components/Stats'
import { Features } from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Pricing from '../components/Pricing'
import { CTA } from '../components/CTA'
import Footer from '../components/Footer'

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}