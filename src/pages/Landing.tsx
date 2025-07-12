
import { useNavigate } from 'react-router-dom'
import { HeroSection } from '@/components/landing/HeroSection'
import { WhatsAppSection } from '@/components/landing/WhatsAppSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { ChartsSection } from '@/components/landing/ChartsSection'
import { PainPointsSection } from '@/components/landing/PainPointsSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { FooterSection } from '@/components/landing/FooterSection'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const Landing = () => {
  const navigate = useNavigate()

  // Funções para navegação e scroll
  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleNavigateToPlano = () => {
    navigate('/plano')
  }

  const handleNavigateToAuth = () => {
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Theme Toggle Button */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <HeroSection 
        onNavigateToAuth={handleNavigateToAuth}
        onScrollToSection={handleScrollToSection}
      />
      
      <WhatsAppSection />
      
      <FeaturesSection />
      
      <TestimonialsSection />
      
      <ChartsSection />
      
      <PainPointsSection 
        onScrollToSection={handleScrollToSection}
      />
      
      <PricingSection 
        onNavigateToPlano={handleNavigateToPlano}
      />
      
      <FAQSection />
      
      <FooterSection 
        onScrollToSection={handleScrollToSection}
      />
    </div>
  )
}

export default Landing
