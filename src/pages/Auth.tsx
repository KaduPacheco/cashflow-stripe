
import { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useTheme } from '@/hooks/useTheme'
import { useIsMobile } from '@/hooks/use-mobile'

type AuthMode = 'login' | 'signup' | 'forgot'

const authImages = {
  login: 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749909272/freepik__upload__21739_pufvnw.jpg',
  signup: 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749909272/freepik__upload__21739_pufvnw.jpg',
  forgot: 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749909272/freepik__upload__21739_pufvnw.jpg'
}

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login')
  const { theme } = useTheme()
  const isMobile = useIsMobile()

  // Determine which logo to use based on theme
  const getLogoSrc = () => {
    if (theme === 'dark') {
      return 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429600/5_jh9nh0.png' // logo-black
    } else if (theme === 'light') {
      return 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429599/1_ezh8mk.png' // logo-white
    } else {
      // System theme - check actual computed theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return isDark 
        ? 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429600/5_jh9nh0.png'
        : 'https://res.cloudinary.com/dio2sipj1/image/upload/v1749429599/1_ezh8mk.png'
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background p-4 lg:p-6">
      {/* Image section - visible on mobile at top, side on desktop */}
      <div className={`${isMobile ? 'h-48 w-full mb-4' : 'hidden lg:flex lg:w-1/2'} relative overflow-hidden rounded-3xl`}>
        <img
          src={authImages[mode]}
          alt="Finance Management"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/20" />
        <div className={`absolute ${isMobile ? 'bottom-4 left-4' : 'bottom-8 left-8'} text-white`}>
          <div className="flex items-center gap-3 mb-2 lg:mb-4">
            <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-white`}>Agora ficou fácil!</h2>
          </div>
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} opacity-90`}>
            Gerencie suas finanças de forma simples e inteligente
          </p>
        </div>
      </div>

      {/* Forms section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 relative">
        {/* Header with Theme Toggle */}
        <div className="absolute top-2 lg:top-4 left-2 lg:left-4 right-2 lg:right-4 flex justify-end items-center">
          <ThemeToggle />
        </div>

        <div className="grid w-full max-w-md lg:max-w-lg mt-12 lg:mt-16 justify-center gap-4">
          <div className="mb-2">
            <img 
              src={getLogoSrc()} 
              alt="FinanceFlow" 
              className="h-6 lg:h-8 w-auto"
            />
          </div>
          
          {mode === 'login' && (
            <LoginForm
              onForgotPassword={() => setMode('forgot')}
              onSignUp={() => setMode('signup')}
            />
          )}
          {mode === 'signup' && (
            <SignUpForm onBackToLogin={() => setMode('login')} />
          )}
          {mode === 'forgot' && (
            <ForgotPasswordForm onBack={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  )
}
