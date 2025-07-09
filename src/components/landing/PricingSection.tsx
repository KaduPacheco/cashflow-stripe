
import { ArrowRight, Check, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PricingSectionProps {
  onNavigateToPlano: () => void
}

export const PricingSection = ({ onNavigateToPlano }: PricingSectionProps) => {
  return (
    <section id="pricing-section" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Plano Premium
          </h2>
          <p className="text-xl text-muted-foreground">
            Acesso completo a todas as funcionalidades
          </p>
        </motion.div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
          >
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

                <Button 
                  size="lg" 
                  className="w-full text-lg py-6 cursor-pointer hover:bg-opacity-90"
                  onClick={onNavigateToPlano}
                  aria-label="Assinar plano premium agora"
                >
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
          </motion.div>
        </div>
      </div>
    </section>
  )
}
