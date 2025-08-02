
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hasValidTokens, setHasValidTokens] = useState(false)
  const navigate = useNavigate()
  const { theme } = useTheme()

  // Determine which logo to use based on theme
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

  useEffect(() => {
    console.log('ResetPassword: Component mounted')
    console.log('ResetPassword: Current URL hash:', window.location.hash)
    console.log('ResetPassword: Current URL search:', window.location.search)
    
    // Verificar tokens tanto na hash quanto na query string
    const checkTokens = () => {
      // Primeiro, tentar capturar da hash (formato padrão do Supabase)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      let accessToken = hashParams.get('access_token')
      let refreshToken = hashParams.get('refresh_token')
      let tokenType = hashParams.get('token_type')
      let type = hashParams.get('type')

      // Se não encontrou na hash, tentar na query string
      if (!accessToken) {
        const searchParams = new URLSearchParams(window.location.search)
        accessToken = searchParams.get('access_token')
        refreshToken = searchParams.get('refresh_token')
        tokenType = searchParams.get('token_type')
        type = searchParams.get('type')
      }

      console.log('ResetPassword: Extracted tokens:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        tokenType,
        type
      })

      // Verificar se é um link de recovery válido
      if (accessToken && type === 'recovery') {
        console.log('ResetPassword: Valid recovery tokens found')
        setHasValidTokens(true)
        
        // Definir a sessão com os tokens
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        }).then(({ error }) => {
          if (error) {
            console.error('ResetPassword: Error setting session:', error)
            toast({
              title: "Erro",
              description: "Erro ao validar link de reset. Tente novamente.",
              variant: "destructive",
            })
            navigate('/auth')
          } else {
            console.log('ResetPassword: Session set successfully')
          }
        })
      } else {
        console.log('ResetPassword: Invalid or missing tokens')
        toast({
          title: "Link inválido",
          description: "Este link de reset de senha é inválido ou expirou. Solicite um novo reset.",
          variant: "destructive",
        })
        navigate('/auth')
      }
    }

    checkTokens()

    // Também escutar mudanças na URL (caso o usuário recarregue a página)
    const handleHashChange = () => {
      console.log('ResetPassword: Hash changed, rechecking tokens')
      checkTokens()
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('ResetPassword: Form submitted')
    
    if (!hasValidTokens) {
      toast({
        title: "Erro",
        description: "Sessão inválida. Solicite um novo link de reset.",
        variant: "destructive",
      })
      navigate('/auth')
      return
    }
    
    if (!password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não conferem.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log('ResetPassword: Updating user password')
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('ResetPassword: Error updating password:', error)
        throw error
      }

      console.log('ResetPassword: Password updated successfully')
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi redefinida com sucesso. Faça login com sua nova senha.",
      })

      // Fazer logout e redirecionar para login
      await supabase.auth.signOut()
      navigate('/auth')
    } catch (error: any) {
      console.error('ResetPassword: Password update failed:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao redefinir senha. Tente novamente.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  // Mostrar loading enquanto verifica tokens
  if (!hasValidTokens) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando link de reset...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <img 
              src={getLogoSrc()} 
              alt="FinanceFlow" 
              className="h-8 w-auto mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Redefinir Senha
            </h1>
            <p className="text-base text-muted-foreground">
              Digite sua nova senha abaixo
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Nova senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar nova senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                'Redefinir senha'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => navigate('/auth')}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Voltar ao login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
