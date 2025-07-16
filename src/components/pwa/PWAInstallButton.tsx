
import { useState, useEffect } from 'react'
import { Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showButton, setShowButton] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowButton(true)
    }

    // Listen for successful installation
    const handleAppInstalled = () => {
      setShowButton(false)
      setDeferredPrompt(null)
      toast({
        title: "App instalado com sucesso!",
        description: "Cash Flow foi instalado no seu dispositivo.",
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [toast])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)
    
    try {
      toast({
        title: "Instalação iniciada",
        description: "Confirme a instalação no popup que apareceu.",
      })

      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setShowButton(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error during installation:', error)
      toast({
        title: "Erro na instalação",
        description: "Não foi possível instalar o app. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsInstalling(false)
    }
  }

  if (!showButton) return null

  return (
    <Button
      onClick={handleInstallClick}
      disabled={isInstalling}
      variant="outline"
      className="w-full justify-start gap-3 text-left"
      title="Instale o Cash Flow no seu dispositivo"
    >
      <Smartphone className="h-5 w-5" />
      <span>{isInstalling ? "Instalando..." : "📲 Instalar App"}</span>
    </Button>
  )
}
