
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Empreendedora',
      content: 'O Cash Flow mudou completamente minha relação com o dinheiro. Agora sei exatamente para onde vai cada centavo!',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face'
    },
    {
      name: 'João Santos',
      role: 'Freelancer',
      content: 'Desde que uso o Cash Flow, consegui economizar 30% da minha renda mensal. Recomendo para todos!',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face'
    },
    {
      name: 'Ana Costa',
      role: 'Professora',
      content: 'Interface simples e intuitiva. Finalmente um app que me ajuda a organizar minhas finanças sem complicação.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b381d2da?w=96&h=96&fit=crop&crop=face'
    }
  ]

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que nossos usuários dizem
          </h2>
          <p className="text-xl text-muted-foreground">
            Transformações reais de pessoas reais
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="fintech-card p-6">
                <CardContent className="space-y-4">
                  <p className="text-lg italic text-muted-foreground leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={`Foto de perfil de ${testimonial.name}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
