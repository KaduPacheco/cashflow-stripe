
import { useNavigate } from 'react-router-dom'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { ChartsSection } from '@/components/landing/ChartsSection'
import { PainPointsSection } from '@/components/landing/PainPointsSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { FooterSection } from '@/components/landing/FooterSection'

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
      <HeroSection 
        onNavigateToAuth={handleNavigateToAuth}
        onScrollToSection={handleScrollToSection}
      />
      
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
