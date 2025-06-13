
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface SignUpFormProps {
  onBackToLogin: () => void
}

export function SignUpForm({ onBackToLogin }: SignUpFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nome, setNome] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+55')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Erro de validação",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    if (!phone.trim()) {
      toast({
        title: "Erro de validação",
        description: "O telefone é obrigatório",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Combine country code with phone number
      const fullPhone = countryCode + phone.replace(/\D/g, '')
      
      const { error } = await signUp(email, password, { 
        nome,
        phone: fullPhone
      })

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Cadastro realizado",
          description: "Verifique seu email para confirmar a conta",
          variant: "default",
        })
        onBackToLogin()
      }
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <div className="w-full lg:min-w-[470px] mx-auto">
      <div className="text-start py-8">
        <h1 className="text-lg font-bold text-slate-800 mb-2 dark:text-slate-300">
          Crie sua conta
        </h1>
        <p className="text-base text-muted-foreground">
          Preencha os dados para se cadastrar
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-sm font-medium">
            Nome
          </Label>
          <Input
            id="nome"
            type="text"
            placeholder="Seu nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Telefone
          </Label>
          <PhoneInput
            id="phone"
            value={phone}
            countryCode={countryCode}
            onValueChange={setPhone}
            onCountryChange={setCountryCode}
            required
            className="h-11"
          />
        </div>
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
            className="h-11"
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
            minLength={6}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmar Senha
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="h-11"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-11 bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar conta'
          )}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <Button
          variant="link"
          onClick={onBackToLogin}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Já tem uma conta? Faça login
        </Button>
      </div>
    </div>
  )
}
