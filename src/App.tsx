import { useEffect } from 'react'
import { integrateSecurityMonitoring } from '@/lib/integrateSecurity'
import { AppRouter } from './router'
import { AuthProvider } from './hooks/useAuth'
import { CategoriesProvider } from './hooks/useCategories'
import { SubscriptionProvider } from './hooks/useSubscription'
import { OnboardingProvider } from './hooks/useOnboarding'
import { ToastProvider } from '@/components/ui/use-toast'

function App() {
  useEffect(() => {
    // Inicializar monitoramento de segurança
    integrateSecurityMonitoring()
  }, [])

  return (
    <ToastProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <OnboardingProvider>
            <CategoriesProvider>
              <AppRouter />
            </CategoriesProvider>
          </OnboardingProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
