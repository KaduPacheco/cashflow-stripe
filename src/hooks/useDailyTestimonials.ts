import { useState, useEffect } from 'react'

export interface Testimonial {
  name: string
  role: string
  content: string
  avatar: string
}

const TESTIMONIALS_BANK: Testimonial[] = [
  {
    name: 'Carlos Mendes',
    role: 'MEI - Consultor de TI',
    content: 'Tinha medo de mexer com controle financeiro, mas o Cash Flow é tão simples que uso todo dia agora.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Juliana Oliveira',
    role: 'Dentista',
    content: 'Consigo separar minhas finanças pessoais da clínica com facilidade. Indispensável!',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Roberto Almeida',
    role: 'Freelancer - Designer',
    content: 'Desde que comecei a usar, nunca mais me perdi nas contas. Recomendo de olhos fechados!',
    avatar: 'https://images.pexels.com/photos/1484810/pexels-photo-1484810.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Fernanda Costa',
    role: 'Professora',
    content: 'O aplicativo é perfeito para quem quer ter controle real do dinheiro sem complicação.',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Pedro Santos',
    role: 'Empresário - Restaurante',
    content: 'Uso para controlar o fluxo de caixa do meu restaurante. Consegui reduzir 40% dos custos!',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Amanda Silva',
    role: 'Contadora',
    content: 'Indico para todos os meus clientes. Interface limpa e relatórios muito úteis.',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Ricardo Ferreira',
    role: 'Médico Veterinário',
    content: 'Finalmente consigo visualizar para onde vai cada centavo da clínica. Excelente!',
    avatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Beatriz Lima',
    role: 'Arquiteta',
    content: 'Gerenciar projetos ficou muito mais fácil. Sei exatamente quanto gastei em cada obra.',
    avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Thiago Rodrigues',
    role: 'E-commerce',
    content: 'Aumentei minha margem de lucro em 25% só por ter controle real das finanças.',
    avatar: 'https://images.pexels.com/photos/1520760/pexels-photo-1520760.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Camila Pereira',
    role: 'Personal Trainer',
    content: 'Consigo separar recebimentos de alunos e despesas com equipamentos. Muito prático!',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Lucas Martins',
    role: 'Advogado',
    content: 'O Cash Flow me ajudou a organizar honorários e despesas do escritório. Recomendo!',
    avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Patricia Souza',
    role: 'Comerciante',
    content: 'Minha loja nunca esteve tão organizada financeiramente. Valeu cada centavo!',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Marcelo Dias',
    role: 'Engenheiro Civil',
    content: 'Uso para controlar orçamentos de obras. Economizei muito tempo e dinheiro.',
    avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Renata Barros',
    role: 'Psicóloga',
    content: 'Interface intuitiva e funcionalidades excelentes. Meu consultório está mais rentável.',
    avatar: 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Gabriel Nunes',
    role: 'Fotógrafo',
    content: 'Gerencio todos os meus jobs e equipamentos. Nunca foi tão fácil!',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Larissa Rocha',
    role: 'Nutricionista',
    content: 'Controlo consultas e despesas do consultório de forma simples e eficiente.',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Felipe Azevedo',
    role: 'Desenvolvedor',
    content: 'Como dev, aprecio a simplicidade do app. Uso para projetos freelance.',
    avatar: 'https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Vanessa Campos',
    role: 'Fisioterapeuta',
    content: 'Nunca imaginei que controlar finanças pudesse ser tão descomplicado!',
    avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Diego Carvalho',
    role: 'Mecânico',
    content: 'Uso na oficina para controlar peças e serviços. Simples e direto ao ponto.',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Aline Moraes',
    role: 'Farmacêutica',
    content: 'Gerencio a farmácia toda pelo app. Relatórios excelentes para tomada de decisão.',
    avatar: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Rafael Gomes',
    role: 'Corretor de Imóveis',
    content: 'Acompanho comissões e despesas facilmente. Aumentei minha produtividade!',
    avatar: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Tatiana Ribeiro',
    role: 'Cabeleireira',
    content: 'Meu salão nunca esteve tão organizado. Sei exatamente quanto lucro por mês.',
    avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Bruno Castro',
    role: 'Chef de Cozinha',
    content: 'Controlo custos de insumos e receitas do restaurante. Ferramenta indispensável!',
    avatar: 'https://images.pexels.com/photos/1416736/pexels-photo-1416736.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Cristina Alves',
    role: 'Jornalista Freelancer',
    content: 'Organizo todos os meus freelas e despesas. Muito melhor que planilhas!',
    avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Henrique Pinto',
    role: 'Personal Stylist',
    content: 'Acompanho cada cliente e suas compras. O Cash Flow simplificou minha vida!',
    avatar: 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Isabela Teixeira',
    role: 'Confeiteira',
    content: 'Gerencio encomendas e ingredientes perfeitamente. Lucro aumentou 35%!',
    avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'André Viana',
    role: 'Eletricista',
    content: 'Uso para controlar serviços e materiais. Simples, rápido e eficiente.',
    avatar: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Mariana Cunha',
    role: 'Terapeuta Ocupacional',
    content: 'Consultório organizado e finanças em dia. Não vivo mais sem!',
    avatar: 'https://images.pexels.com/photos/1124724/pexels-photo-1124724.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Vinicius Lopes',
    role: 'Barbeiro',
    content: 'Transformou minha barbearia. Consigo planejar investimentos e expansão agora.',
    avatar: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?w=96&h=96&fit=crop'
  },
  {
    name: 'Daniela Freitas',
    role: 'Esteticista',
    content: 'Clínica de estética organizada financeiramente. Relatórios incríveis!',
    avatar: 'https://images.pexels.com/photos/1319459/pexels-photo-1319459.jpeg?w=96&h=96&fit=crop'
  }
]

export function useDailyTestimonials(): Testimonial[] {
  const [selectedTestimonials, setSelectedTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 0)
    const diff = today.getTime() - startOfYear.getTime()
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    const startIndex = (dayOfYear * 3) % TESTIMONIALS_BANK.length
    
    const selected = [
      TESTIMONIALS_BANK[startIndex % TESTIMONIALS_BANK.length],
      TESTIMONIALS_BANK[(startIndex + 1) % TESTIMONIALS_BANK.length],
      TESTIMONIALS_BANK[(startIndex + 2) % TESTIMONIALS_BANK.length]
    ]
    
    setSelectedTestimonials(selected)
  }, [])

  return selectedTestimonials
}
