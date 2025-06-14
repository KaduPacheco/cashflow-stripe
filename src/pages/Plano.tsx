
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useTheme } from '@/hooks/useTheme'
import { useSubscription } from '@/hooks/useSubscription'
import { Check, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Plano() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { createCheckout, subscriptionData } = useSubscription()

  // Determine which logo to use based on theme
  const getLogoSrc = () => {
    if (theme === 'dark') {
      return 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429600/5_jh9nh0.png' // logo-white
    } else if (theme === 'light') {
      return 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429599/1_ezh8mk.png' // logo-black
    } else {
      // System theme - check actual computed theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return isDark 
        ? 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429600/5_jh9nh0.png'
        : 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429599/1_ezh8mk.png'
    }
  }

  const handleSubscribe = () => {
    createCheckout()
  }

  const handleBackToLogin = () => {
    navigate('/auth')
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const benefits = [
    'Registre gastos e receitas automaticamente',
    'Receba lembretes de contas e metas',
    'Tenha um assistente sempre pronto para ajudar'
  ]

  // Check if coming from checkout cancellation
  const urlParams = new URLSearchParams(window.location.search)
  const checkoutCanceled = urlParams.get('checkout') === 'canceled'

  return (
    <div className="h-screen flex bg-background p-6">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-3xl">
        <img
          src="https://res.cloudinary.com/dio2sipj1/image/upload/v1749930215/cashflow_t8dcnl.jpg"
          alt="Finance Management"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/20" />
        <div className="absolute bottom-8 left-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-3xl font-bold text-white">Agora ficou fácil!</h2>
          </div>
          <p className="text-lg opacity-90">
            Gerencie suas finanças de forma simples e inteligente
          </p>
        </div>
      </div>

      {/* Right side - Plan Info */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Header with Logo and Theme Toggle */}
        <div className="absolute top-4 left-4 right-4 flex justify-end items-center">
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        <div className="grid w-full min-w-[480px] mt-16 justify-center gap-4">
          <div>
            <img 
              src={getLogoSrc()} 
              alt="Cash Flow" 
              className="h-8 w-auto"
            />
          </div>
          
          <div className="w-full lg:min-w-[470px] mx-auto">
            <div className="text-start py-8">
              {checkoutCanceled && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    Pagamento cancelado. Você pode tentar novamente quando quiser.
                  </p>
                </div>
              )}

              <h1 className="text-2xl font-bold text-slate-800 mb-2 dark:text-slate-300">
                Plano Agente Financeiro – R$ 34,90/mês
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Organize suas finanças de forma simples e inteligente!
              </p>

              {/* Benefits List */}
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-primary rounded-full p-1 mt-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-base text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>

              {/* Impact Message */}
              <div className="bg-primary/10 rounded-lg p-4 mb-8">
                <p className="text-lg font-semibold text-primary text-center">
                  Invista no controle da sua vida financeira por pouco mais de R$ 1 por dia!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {!subscriptionData.subscribed ? (
                  <Button
                    onClick={handleSubscribe}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-lg font-semibold"
                  >
                    Assinar agora
                  </Button>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      ✅ Você já possui uma assinatura ativa!
                    </p>
                  </div>
                )}
                
                {subscriptionData.subscribed ? (
                  <Button
                    variant="outline"
                    onClick={handleBackToDashboard}
                    className="w-full h-11 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleBackToLogin}
                    className="w-full h-11 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao login
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
