
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { useDailyTestimonials } from '@/hooks/useDailyTestimonials'

export const TestimonialsSection = () => {
  const testimonials = useDailyTestimonials()

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
