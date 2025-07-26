
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface LoginFormProps {
  onForgotPassword: () => void
  onSignUp: () => void
}

export function LoginForm({ onForgotPassword, onSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const isMobile = useIsMobile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        console.error('Login error:', error)
        
        let errorMessage = 'Erro desconhecido no login'
        
        if (error.message) {
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Email ou senha incorretos'
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Email não confirmado. Verifique sua caixa de entrada'
          } else if (error.message.includes('Too many requests')) {
            errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos'
          } else {
            errorMessage = error.message
          }
        }

        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login realizado com sucesso",
          description: "Você será redirecionado em instantes",
          variant: "default",
        })
      }
    } catch (error: any) {
      console.error('Login exception:', error)
      toast({
        title: "Erro no login",
        description: "Erro interno. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full mx-auto">
      <div className={`text-start ${isMobile ? 'py-4' : 'py-8'}`}>
        <h1 className={`${isMobile ? 'text-lg' : 'text-lg'} font-bold text-slate-800 mb-2 dark:text-slate-300`}>
          Bem-vindo de volta
        </h1>
        <p className={`${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground`}>
          Entre na sua conta para continuar
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '4' : '6'}`}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className={`${isMobile ? 'h-10' : 'h-11'}`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className={`${isMobile ? 'h-10' : 'h-11'}`}
          />
        </div>
        <Button
          type="submit"
          className={`w-full ${isMobile ? 'h-10' : 'h-11'} bg-primary hover:bg-primary/90`}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>
      
      <div className={`${isMobile ? 'mt-4' : 'mt-6'} space-y-${isMobile ? '3' : '4'} text-center`}>
        <Button
          onClick={onSignUp}
          variant="outline"
          disabled={loading}
          className={`w-full ${isMobile ? 'h-10' : 'h-11'} border-primary text-primary hover:bg-primary hover:text-primary-foreground`}
        >
          Criar conta
        </Button>
        
        <Button
          variant="link"
          onClick={onForgotPassword}
          disabled={loading}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Esqueceu sua senha?
        </Button>
      </div>
    </div>
  )
}
