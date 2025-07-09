
import { BarChart3, CreditCard, Bell, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const FeaturesSection = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard Visual',
      description: 'KPIs e métricas importantes em tempo real para controle total das suas finanças'
    },
    {
      icon: CreditCard,
      title: 'Gestão de Transações',
      description: 'Organize receitas e despesas por categorias personalizadas'
    },
    {
      icon: Bell,
      title: 'Lembretes Inteligentes',
      description: 'Nunca mais esqueça de pagar uma conta importante'
    },
    {
      icon: FileText,
      title: 'Relatórios Detalhados',
      description: 'Gráficos e análises para entender seus padrões financeiros'
    }
  ]

  return (
    <section id="features-section" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Funcionalidades que fazem a diferença
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra como o Cash Flow simplifica sua gestão financeira
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="fintech-card hover:shadow-fintech-lg transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-2xl w-fit">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
