
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Download, Smartphone, Monitor } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay to not be intrusive
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen')
        if (!hasSeenPrompt) {
          setShowPrompt(true)
        }
      }, 10000) // 10 seconds delay
    }

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
      localStorage.setItem('pwa-install-prompt-seen', 'true')
    } catch (error) {
      console.error('Error during installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-prompt-seen', 'true')
    // Allow showing again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-prompt-seen')
    }, 7 * 24 * 60 * 60 * 1000)
  }

  const getInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    if (isIOS && isSafari) {
      return {
        title: 'Instalar no iPhone/iPad',
        steps: [
          'Toque no ícone de compartilhar (quadrado com seta)',
          'Role para baixo e toque em "Adicionar à Tela de Início"',
          'Toque em "Adicionar" para confirmar'
        ]
      }
    }
    
    if (isMobile) {
      return {
        title: 'Instalar no Android',
        steps: [
          'Toque no menu (três pontos) do navegador',
          'Selecione "Adicionar à tela inicial" ou "Instalar app"',
          'Confirme a instalação'
        ]
      }
    }
    
    return {
      title: 'Instalar no Desktop',
      steps: [
        'Clique no ícone de instalação na barra de endereço',
        'Ou vá no menu do navegador e selecione "Instalar Cash Flow"',
        'Confirme a instalação'
      ]
    }
  }

  if (isInstalled || !showPrompt) return null

  const instructions = getInstallInstructions()
  const showNativePrompt = deferredPrompt && !(/iPad|iPhone|iPod/.test(navigator.userAgent))

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-in md:left-auto md:right-4 md:w-80">
      <Card className="fintech-card shadow-fintech-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMobile ? <Smartphone className="h-5 w-5 text-primary" /> : <Monitor className="h-5 w-5 text-primary" />}
              <CardTitle className="text-sm">Instalar Cash Flow</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Acesse rapidamente suas finanças offline
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {showNativePrompt ? (
            <Button
              onClick={handleInstallClick}
              className="w-full fintech-button"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar Agora
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium">{instructions.title}:</p>
              <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
                {instructions.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}
          
          <div className="flex gap-2">
            {!showNativePrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="flex-1 text-xs"
              >
                Agora não
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
