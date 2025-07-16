
import { useState, useEffect } from 'react'

interface PWAStatus {
  isInstalled: boolean
  isInstallable: boolean
  canInstall: boolean
  platform: 'ios' | 'android' | 'desktop' | 'unknown'
}

export function usePWA(): PWAStatus {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [platform, setPlatform] = useState<PWAStatus['platform']>('unknown')

  useEffect(() => {
    // Detect if app is installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true ||
                          window.location.search.includes('pwa=true')
      
      setIsInstalled(isStandalone)
    }

    // Detect platform
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      
      if (/ipad|iphone|ipod/.test(userAgent)) {
        setPlatform('ios')
      } else if (/android/.test(userAgent)) {
        setPlatform('android')
      } else {
        setPlatform('desktop')
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setIsInstallable(true)
      setCanInstall(true)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
    }

    checkIfInstalled()
    detectPlatform()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return {
    isInstalled,
    isInstallable,
    canInstall,
    platform
  }
}
