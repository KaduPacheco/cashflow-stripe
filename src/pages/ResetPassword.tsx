
import { useState } from 'react'
import { Eye, EyeOff, Lock, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { usePasswordReset } from '@/hooks/usePasswordReset'
import { SafeDisplay } from '@/components/ui/safe-display'

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const {
    password,
    confirmPassword,
    updatePassword,
    updateConfirmPassword,
    resetPassword,
    isLoading,
    isTokenValid,
    errors
  } = usePasswordReset()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    resetPassword()
  }

  // Loading state enquanto verifica token
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              Verificando Link
            </h2>
            <p className="text-slate-500">
              Validando seu link de recuperação...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Token inválido ou expirado
  if (isTokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Link Inválido ou Expirado
            </h1>
            
            <div className="space-y-4 text-slate-600">
              <p>Este link de recuperação é inválido, expirado ou já foi usado.</p>
              <p className="text-sm">
                Links de recuperação expiram em 1 hora por segurança e só podem ser usados uma vez.
              </p>
            </div>

            {/* Caixa de informação sobre URLs do Supabase */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-amber-900 text-sm">
                    Problema com redirecionamento?
                  </p>
                  <div className="text-xs text-amber-700 space-y-1">
                    <p>• Verifique se clicou no link correto do email</p>
                    <p>• O administrador deve configurar as URLs no painel Supabase</p>
                    <p>• Links só funcionam no domínio autorizado</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Solicitar Novo Link
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'}
                className="w-full text-slate-600"
              >
                Voltar ao Início
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Formulário de redefinição
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Nova Senha
          </h1>
          
          <p className="text-slate-600">
            Defina uma nova senha segura para sua conta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-medium">
              Nova Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => updatePassword(e.target.value)}
                className={`pl-10 pr-12 ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
                placeholder="Mínimo 8 caracteres"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <SafeDisplay className="text-sm text-red-600">
                {errors.password}
              </SafeDisplay>
            )}
          </div>

          {/* Campo Confirmar Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
              Confirmar Nova Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => updateConfirmPassword(e.target.value)}
                className={`pl-10 pr-12 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
                placeholder="Digite a senha novamente"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <SafeDisplay className="text-sm text-red-600">
                {errors.confirmPassword}
              </SafeDisplay>
            )}
          </div>

          {/* Requisitos da Senha */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-slate-700 mb-3">
              Requisitos da senha:
            </p>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span>Pelo menos 8 caracteres</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span>Uma letra maiúscula</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span>Uma letra minúscula</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${/\d/.test(password) ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span>Um número</span>
              </div>
            </div>
          </div>

          {/* Botão de Envio */}
          <Button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-12 font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Redefinindo Senha...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Redefinir Senha
              </div>
            )}
          </Button>
        </form>

        {/* Rodapé com Informações de Segurança */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-2">
              🔒 Conexão protegida por criptografia SSL
            </p>
            <p className="text-xs text-slate-500">
              Após redefinir, você será redirecionado para fazer login
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
