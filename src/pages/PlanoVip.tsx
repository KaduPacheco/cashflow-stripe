import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useTheme } from '@/hooks/useTheme'
import { useVipCheckout } from '@/hooks/useVipCheckout'
import { useSubscription } from '@/hooks/useSubscription'
import { useIsMobile } from '@/hooks/use-mobile'
import { Check, ArrowLeft, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

export default function PlanoVip() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { createVipCheckout } = useVipCheckout()
  const { subscriptionData } = useSubscription()
  const isMobile = useIsMobile()

  const getLogoSrc = () => {
    if (theme === 'dark') {
      return 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429600/5_jh9nh0.png'
    } else if (theme === 'light') {
      return 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429599/1_ezh8mk.png'
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return isDark 
        ? 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429600/5_jh9nh0.png'
        : 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429599/1_ezh8mk.png'
    }
  }

  const handleSubscribe = () => {
    createVipCheckout()
  }

  const handleBackToLogin = () => {
    navigate('/auth')
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const benefits = [
    'Todas as funcionalidades Premium',
    'Suporte prioritário VIP',
    'Acesso antecipado a novos recursos',
    'Condições exclusivas',
  ]

  const urlParams = new URLSearchParams(window.location.search)
  const checkoutCanceled = urlParams.get('checkout') === 'canceled'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background p-4 lg:p-6">
      {/* Image section */}
      <div className={`${isMobile ? 'h-48 w-full mb-4' : 'hidden lg:flex lg:w-1/2'} relative overflow-hidden rounded-3xl`}>
        <img
          src="https://res.cloudinary.com/dio2sipj1/image/upload/v1749930215/cashflow_t8dcnl.jpg"
          alt="Finance Management"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-amber-600/20" />
        <div className={`absolute ${isMobile ? 'bottom-4 left-4' : 'bottom-8 left-8'} text-white`}>
          <div className="flex items-center gap-3 mb-2 lg:mb-4">
            <Crown className="h-8 w-8 text-yellow-300" />
            <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-white`}>Acesso VIP</h2>
          </div>
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} opacity-90`}>
            Experiência premium exclusiva
          </p>
        </div>
      </div>

      {/* Content section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 relative">
        <div className="absolute top-2 lg:top-4 left-2 lg:left-4 right-2 lg:right-4 flex justify-end items-center">
          <ThemeToggle />
        </div>

        <div className="grid w-full max-w-md lg:max-w-lg mt-12 lg:mt-16 justify-center gap-4">
          <div className="mb-2">
            <img 
              src={getLogoSrc()} 
              alt="Cash Flow" 
              className="h-6 lg:h-8 w-auto"
            />
          </div>
          
          <div className="w-full mx-auto">
            <div className="text-start py-4 lg:py-8">
              {checkoutCanceled && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 lg:p-4 mb-4 lg:mb-6">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    Pagamento cancelado. Você pode tentar novamente quando quiser.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                  🔒 Plano Exclusivo
                </Badge>
              </div>

              <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                Plano VIP Premium
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground mb-6 lg:mb-8">
                Acesso completo com condições especiais
              </p>

              {/* Benefits List */}
              <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full p-1 mt-0.5 shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm lg:text-base text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>

              {/* Impact Message */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-amber-600/10 rounded-lg p-3 lg:p-4 mb-6 lg:mb-8 border border-yellow-500/20">
                <p className="text-base lg:text-lg font-semibold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent text-center">
                  Acesso especial por convite
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 lg:space-y-4">
                {!subscriptionData.subscribed ? (
                  <Button
                    onClick={handleSubscribe}
                    className="w-full h-10 lg:h-11 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white text-base lg:text-lg font-semibold shadow-lg"
                  >
                    <Crown className="mr-2 h-5 w-5" />
                    Ativar Acesso VIP
                  </Button>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 lg:p-4 text-center">
                    <p className="text-green-800 dark:text-green-200 font-medium text-sm lg:text-base">
                      ✅ Você já possui uma assinatura ativa!
                    </p>
                  </div>
                )}
                
                {subscriptionData.subscribed ? (
                  <Button
                    variant="outline"
                    onClick={handleBackToDashboard}
                    className="w-full h-10 lg:h-11 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white text-sm lg:text-base"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Dashboard
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleBackToLogin}
                    className="w-full h-10 lg:h-11 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white text-sm lg:text-base"
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
