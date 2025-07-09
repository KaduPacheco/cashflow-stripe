
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PainPointsSectionProps {
  onScrollToSection: (sectionId: string) => void
}

export const PainPointsSection = ({ onScrollToSection }: PainPointsSectionProps) => {
  const painPoints = [
    'Falta de planejamento mensal',
    'Esquecimento de contas a pagar',
    'Dificuldade em entender para onde vai seu dinheiro',
    'Ausência de controle sobre gastos recorrentes',
    'Falta de visão clara do patrimônio líquido'
  ]

  return (
    <section className="py-20 bg-destructive/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Você já perdeu controle dos seus gastos?
          </h2>
          <p className="text-xl text-muted-foreground">
            Essas dores são mais comuns do que você imagina
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {painPoints.map((pain, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-destructive/20">
              <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0"></div>
              <span className="text-base">{pain}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="fintech-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-success">
              O Cash Flow resolve tudo isso para você, com poucos cliques
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Nossa plataforma foi criada especificamente para eliminar essas dores e te dar controle total sobre suas finanças.
            </p>
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg cursor-pointer hover:bg-opacity-90"
              onClick={() => onScrollToSection('pricing-section')}
              aria-label="Resolver problemas financeiros agora"
            >
              Resolver Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
