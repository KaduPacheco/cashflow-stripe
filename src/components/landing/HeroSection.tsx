
import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface HeroSectionProps {
  onNavigateToAuth: () => void
  onScrollToSection: (sectionId: string) => void
}

export const HeroSection = ({ onNavigateToAuth, onScrollToSection }: HeroSectionProps) => {
  const lineData = [
    { month: 'Jan', receitas: 4500, despesas: 3200 },
    { month: 'Fev', receitas: 4800, despesas: 3100 },
    { month: 'Mar', receitas: 5200, despesas: 2900 },
    { month: 'Abr', receitas: 5600, despesas: 3400 },
    { month: 'Mai', receitas: 6000, despesas: 3200 },
    { month: 'Jun', receitas: 6400, despesas: 3100 }
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
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
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-fintech-lg hover:shadow-fintech-xl cursor-pointer hover:bg-opacity-90"
                onClick={onNavigateToAuth}
                aria-label="Começar agora gratuitamente por 7 dias"
              >
                Comece Agora – Grátis por 7 dias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 cursor-pointer hover:bg-opacity-90"
                onClick={() => onScrollToSection('charts-section')}
                aria-label="Ver demonstração da plataforma"
              >
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
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
          >
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
          </motion.div>
        </div>
      </div>
    </section>
  )
}
