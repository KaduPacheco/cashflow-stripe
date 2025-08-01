import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ValidationService } from '@/services/validationService'
import { toast } from 'sonner'

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validar email
    const emailError = ValidationService.validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setIsLoading(true)
    
    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        setError('Erro ao enviar email de recuperação. Tente novamente.')
        toast.error('Erro', {
          description: 'Não foi possível enviar o email de recuperação.'
        })
      } else {
        setEmailSent(true)
        toast.success('Email Enviado!', {
          description: 'Verifique sua caixa de entrada para redefinir sua senha.'
        })
      }
    } catch (error) {
      setError('Erro interno. Tente novamente mais tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Email Enviado!
          </CardTitle>
          <CardDescription className="text-slate-600">
            Enviamos as instruções para recuperar sua senha
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-blue-900">
                  Verifique seu email
                </p>
                <p className="text-sm text-blue-700">
                  Enviamos um link para <strong>{email}</strong>
                </p>
                <p className="text-sm text-blue-700">
                  O link expira em 30 minutos por segurança.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-amber-900">
                  Não recebeu o email?
                </p>
                <div className="text-sm text-amber-700 space-y-1">
                  <p>• Verifique a pasta de spam</p>
                  <p>• Aguarde alguns minutos</p>
                  <p>• Certifique-se que digitou o email correto</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => {
                setEmailSent(false)
                setEmail('')
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Enviar Novamente
            </Button>
            
            <Button
              onClick={onBack}
              variant="ghost"
              className="w-full text-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Esqueceu a Senha?</CardTitle>
        <CardDescription>
          Informe seu email e enviaremos um link para resetar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <Button disabled={isLoading} className="w-full">
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Enviar Link de Recuperação
          </Button>
        </form>
        <div className="mt-4 text-sm">
          <Button variant="link" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
