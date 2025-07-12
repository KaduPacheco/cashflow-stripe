import { motion } from 'framer-motion'
import { MessageCircle, CheckCircle, Mic, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const WhatsAppSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-secondary/5 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              <Badge className="bg-success/10 text-success border-success/20">
                <MessageCircle className="w-4 h-4 mr-2" />
                🚀 Integração com WhatsApp
              </Badge>
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Gerencie suas finanças de forma prática{' '}
                <span className="text-success">diretamente pelo WhatsApp!</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nossa integração revolucionária com WhatsApp permite que você controle suas finanças 
                de forma natural e intuitiva, sem sair do aplicativo que você já usa todos os dias.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Registre receitas e despesas com mensagens de texto ou áudio
                  </h3>
                  <p className="text-muted-foreground">
                    Envie uma mensagem simples como "Gastei R$ 50 no mercado" e deixe nossa IA fazer o resto.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    O assistente virtual interpreta e categoriza automaticamente
                  </h3>
                  <p className="text-muted-foreground">
                    Nossa inteligência artificial entende o contexto e categoriza suas transações de forma inteligente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Lançamento automático na sua conta em segundos
                  </h3>
                  <p className="text-muted-foreground">
                    Suas transações aparecem instantaneamente no dashboard, organizadas e categorizadas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <Mic className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Praticidade e comodidade no seu dia a dia
                  </h3>
                  <p className="text-muted-foreground">
                    Controle financeiro sem complicação, integrado ao seu fluxo de comunicação natural.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative bg-card rounded-2xl p-8 shadow-fintech-xl border">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">WhatsApp Business</h3>
                    <p className="text-sm text-muted-foreground">Cash Flow Assistant</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-2xl p-4 max-w-[80%]">
                    <p className="text-sm text-foreground">
                      "Gastei R$ 120 no supermercado hoje"
                    </p>
                    <span className="text-xs text-muted-foreground">14:32</span>
                  </div>

                  <div className="bg-success/10 rounded-2xl p-4 max-w-[80%] ml-auto">
                    <p className="text-sm text-foreground">
                      ✅ Transação registrada!<br/>
                      💰 Despesa: R$ 120,00<br/>
                      📂 Categoria: Alimentação<br/>
                      📅 Data: Hoje
                    </p>
                    <span className="text-xs text-muted-foreground">14:32</span>
                  </div>

                  <div className="bg-muted/30 rounded-2xl p-4 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 bg-muted-foreground/20 rounded-full h-2">
                        <div className="bg-success w-3/4 h-full rounded-full"></div>
                      </div>
                      <span className="text-xs text-muted-foreground">0:03</span>
                    </div>
                    <span className="text-xs text-muted-foreground">14:45</span>
                  </div>

                  <div className="bg-success/10 rounded-2xl p-4 max-w-[80%] ml-auto">
                    <p className="text-sm text-foreground">
                      🎯 Entendi seu áudio!<br/>
                      💸 Receita: R$ 2.500,00<br/>
                      📂 Categoria: Salário<br/>
                      📅 Data: Hoje
                    </p>
                    <span className="text-xs text-muted-foreground">14:45</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}