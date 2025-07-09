
import { Card } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export const FAQSection = () => {
  const faqItems = [
    {
      question: 'O que é o Cash Flow?',
      answer: 'É uma plataforma de controle financeiro pessoal com lembretes, relatórios e gráficos que te ajudam a organizar suas finanças de forma inteligente e simples.'
    },
    {
      question: 'Preciso pagar para usar?',
      answer: 'Existe uma versão gratuita com recursos limitados e uma versão premium com funcionalidades completas. Você pode começar grátis por 7 dias.'
    },
    {
      question: 'Posso cancelar quando quiser?',
      answer: 'Sim. Você pode cancelar a assinatura a qualquer momento sem multas ou taxas adicionais. É simples e rápido.'
    },
    {
      question: 'Meus dados estão seguros?',
      answer: 'Sim. Usamos Supabase e Stripe com criptografia de ponta e as melhores práticas de segurança modernas para proteger seus dados.'
    },
    {
      question: 'Tem aplicativo para celular?',
      answer: 'Ainda não temos app nativo, mas nossa versão web é 100% responsiva e funciona perfeitamente no celular, oferecendo uma experiência completa.'
    }
  ]

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-muted-foreground">
            Tire suas dúvidas sobre o Cash Flow
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="fintech-card p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </div>
    </section>
  )
}
