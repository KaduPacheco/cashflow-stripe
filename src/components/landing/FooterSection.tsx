

interface FooterSectionProps {
  onScrollToSection: (sectionId: string) => void
}

export const FooterSection = ({ onScrollToSection }: FooterSectionProps) => {
  return (
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
              <button 
                onClick={() => onScrollToSection('features-section')}
                className="block text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Funcionalidades
              </button>
              <button 
                onClick={() => onScrollToSection('pricing-section')}
                className="block text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Preços
              </button>
              <button 
                onClick={() => onScrollToSection('charts-section')}
                className="block text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Demonstração
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Suporte</h4>
            <div className="space-y-2">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Ajuda</a>
              <a 
                href="https://wa.me/5521959206442?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20para%20o%20Cash%20Flow." 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Contato
              </a>
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
  )
}

