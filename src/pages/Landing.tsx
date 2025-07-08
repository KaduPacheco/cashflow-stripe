
import { useState } from 'react'
import { ArrowRight, Check, BarChart3, CreditCard, Bell, FileText, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Landing = () => {
  const [selectedPlan, setSelectedPlan] = useState('premium')

  // Dados para os gráficos
  const lineData = [
    { month: 'Jan', receitas: 4500, despesas: 3200 },
    { month: 'Fev', receitas: 4800, despesas: 3100 },
    { month: 'Mar', receitas: 5200, despesas: 2900 },
    { month: 'Abr', receitas: 5600, despesas: 3400 },
    { month: 'Mai', receitas: 6000, despesas: 3200 },
    { month: 'Jun', receitas: 6400, despesas: 3100 }
  ]

  const pieData = [
    { name: 'Alimentação', value: 35, color: '#0F4C81' },
    { name: 'Transporte', value: 20, color: '#006D5B' },
    { name: 'Lazer', value: 15, color: '#16A34A' },
    { name: 'Saúde', value: 12, color: '#CA8A04' },
    { name: 'Outros', value: 18, color: '#DC2626' }
  ]

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

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Empreendedora',
      content: 'O Cash Flow mudou completamente minha relação com o dinheiro. Agora sei exatamente para onde vai cada centavo!',
      avatar: '/lovable-uploads/a5a40de7-4096-4a32-af0c-76fe03ec72f7.png'
    },
    {
      name: 'João Santos',
      role: 'Freelancer',
      content: 'Desde que uso o Cash Flow, consegui economizar 30% da minha renda mensal. Recomendo para todos!',
      avatar: '/lovable-uploads/bd48b065-36ce-4af8-926d-a1f05a2d43c5.png'
    },
    {
      name: 'Ana Costa',
      role: 'Professora',
      content: 'Interface simples e intuitiva. Finalmente um app que me ajuda a organizar minhas finanças sem complicação.',
      avatar: '/lovable-uploads/f49ea338-eba8-4e12-b460-c6276f4c4a93.png'
    }
  ]

  const painPoints = [
    'Falta de planejamento mensal',
    'Esquecimento de contas a pagar',
    'Dificuldade em entender para onde vai seu dinheiro',
    'Ausência de controle sobre gastos recorrentes',
    'Falta de visão clara do patrimônio líquido'
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  🚀 Plataforma de Gestão Financeira
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  Controle suas finanças com{' '}
                  <span className="text-primary">inteligência</span> e{' '}
                  <span className="text-secondary">simplicidade</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  O Cash Flow te ajuda a entender, planejar e evoluir financeiramente com dashboards visuais, lembretes inteligentes e relatórios detalhados.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6 shadow-fintech-lg hover:shadow-fintech-xl">
                  Comece Agora – Grátis por 7 dias
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Ver Demonstração
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>Gratuito por 7 dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="fintech-card p-8 shadow-fintech-xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Dashboard Financeiro</h3>
                    <Badge variant="outline" className="text-success border-success/20 bg-success/10">
                      +15% este mês
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Receitas</p>
                      <p className="text-2xl font-bold text-success">R$ 6.400</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Despesas</p>
                      <p className="text-2xl font-bold text-destructive">R$ 3.100</p>
                    </div>
                  </div>

                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip />
                        <Line type="monotone" dataKey="receitas" stroke="hsl(var(--success))" strokeWidth={3} />
                        <Line type="monotone" dataKey="despesas" stroke="hsl(var(--destructive))" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
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

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que nossos usuários dizem
            </h2>
            <p className="text-xl text-muted-foreground">
              Transformações reais de pessoas reais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="fintech-card p-6">
                <CardContent className="space-y-4">
                  <p className="text-lg italic text-muted-foreground leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Visualize seus dados financeiros
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Nossos gráficos intuitivos te ajudam a identificar padrões de gastos e oportunidades de economia. 
                Com dados claros, você toma decisões financeiras mais inteligentes.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  <span>Alimentação representa 35% dos seus gastos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-secondary rounded-full"></div>
                  <span>Transporte consome 20% do orçamento</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-success rounded-full"></div>
                  <span>Lazer equilibrado em 15%</span>
                </div>
              </div>
            </div>

            <div className="fintech-card p-8">
              <h3 className="text-xl font-semibold mb-6 text-center">Distribuição de Gastos por Categoria</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
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
              <Button size="lg" className="px-8 py-6 text-lg">
                Resolver Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Plano Premium
            </h2>
            <p className="text-xl text-muted-foreground">
              Acesso completo a todas as funcionalidades
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="fintech-card overflow-hidden">
              <CardHeader className="text-center bg-primary/5 pb-8">
                <div className="space-y-4">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                  <CardTitle className="text-3xl">Plano Premium</CardTitle>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold">R$ 34,90</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <p className="text-sm text-muted-foreground">7 dias grátis</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 p-8">
                <div className="space-y-4">
                  {[
                    'Dashboard completo com KPIs',
                    'Transações ilimitadas',
                    'Categorias personalizadas',
                    'Lembretes inteligentes',
                    'Relatórios detalhados',
                    'Gráficos interativos',
                    'Suporte premium',
                    'Backup automático'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button size="lg" className="w-full text-lg py-6">
                  Assinar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <span>Pagamento Seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    <span>Ativação Imediata</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-primary">Cash Flow</h3>
              <p className="text-muted-foreground">
                Sua plataforma de gestão financeira inteligente
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Produto</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Preços</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Demonstração</a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Suporte</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Ajuda</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Contato</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Termos de Uso</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Política de Privacidade</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Cash Flow. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
