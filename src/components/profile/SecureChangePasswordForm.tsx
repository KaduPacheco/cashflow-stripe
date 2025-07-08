
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { SecureAuthManager } from '@/lib/secureAuth'
import { useAuth } from '@/hooks/useAuth'
import { EnhancedRateLimiter } from '@/lib/enhancedSecurity'
import { SecureLogger } from '@/lib/logger'

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

export function SecureChangePasswordForm() {
  const { user } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) score += 1
    else feedback.push('Pelo menos 8 caracteres')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Uma letra maiúscula')

    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Uma letra minúscula')

    if (/\d/.test(password)) score += 1
    else feedback.push('Um número')

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    else feedback.push('Um caractere especial')

    const colors = ['red', 'red', 'orange', 'yellow', 'green']
    return {
      score,
      feedback,
      color: colors[score] || 'red'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      })
      return
    }

    // Verificar rate limiting
    if (!EnhancedRateLimiter.checkLimit(user.id, 'password_change')) {
      toast({
        title: "Erro",
        description: "Muitas tentativas de alteração de senha. Tente novamente mais tarde.",
        variant: "destructive",
      })
      return
    }

    // Validações básicas
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "Nova senha e confirmação devem ser iguais",
        variant: "destructive",
      })
      return
    }

    const strength = calculatePasswordStrength(newPassword)
    if (strength.score < 4) {
      toast({
        title: "Senha muito fraca",
        description: `Requisitos faltando: ${strength.feedback.join(', ')}`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const result = await SecureAuthManager.changePasswordSecurely(newPassword, user.id)
      
      if (result.success) {
        // Limpar formulário
        setNewPassword('')
        setConfirmPassword('')
        
        // Limpar tentativas de rate limiting
        EnhancedRateLimiter.clearAttempts(user.id, 'password_change')

        toast({
          title: "Senha atualizada com sucesso!",
          description: "Sua senha foi alterada com êxito",
        })
      } else {
        throw new Error(result.error || 'Erro desconhecido')
      }
    } catch (error: any) {
      SecureLogger.error('Password change error', { error: error.message })
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = calculatePasswordStrength(newPassword)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Alterar senha
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium text-${passwordStrength.color}-600`}>
                    {passwordStrength.score < 3 ? 'Fraca' : passwordStrength.score < 5 ? 'Média' : 'Forte'}
                  </span>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Faltam: {passwordStrength.feedback.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || passwordStrength.score < 4}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? 'Atualizando...' : 'Atualizar senha'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
