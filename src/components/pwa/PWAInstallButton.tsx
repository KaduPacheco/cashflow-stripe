
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
    if (!deferredPrompt || isInstalling) return

    setIsInstalling(true)
    
    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setShowButton(false)
        toast({
          title: "App instalado com sucesso!",
          description: "Cash Flow foi instalado no seu dispositivo.",
        })
      } else {
        toast({
          title: "Instalação cancelada",
          description: "Você pode instalar o app a qualquer momento.",
        })
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
    <button
      onClick={handleInstallClick}
      disabled={isInstalling}
      className="w-full flex items-center gap-3 text-sm font-medium py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Instale o Cash Flow no seu dispositivo"
    >
      <Smartphone className="h-5 w-5" />
      <span>{isInstalling ? "Instalando..." : "📲 Instalar App"}</span>
    </button>
  )
}
