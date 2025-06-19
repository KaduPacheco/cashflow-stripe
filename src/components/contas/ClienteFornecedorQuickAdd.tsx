
import { useState } from 'react'
import { useClientesFornecedores } from '@/hooks/useClientesFornecedores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface ClienteFornecedorQuickAddProps {
  tipo: 'cliente' | 'fornecedor'
  onSuccess: (novoId: string) => void
}

export function ClienteFornecedorQuickAdd({ tipo, onSuccess }: ClienteFornecedorQuickAddProps) {
  const { createClienteFornecedor } = useClientesFornecedores()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    email: '',
    telefone: '',
    tipo: tipo
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    setLoading(true)

    try {
      const result = await createClienteFornecedor({
        nome: formData.nome,
        tipo: formData.tipo as 'cliente' | 'fornecedor' | 'ambos',
        documento: formData.documento || undefined,
        email: formData.email || undefined,
        telefone: formData.telefone || undefined,
        ativo: true,
        user_id: '' // Will be set by the hook
      })

      if (result) {
        toast.success(`${tipo === 'cliente' ? 'Cliente' : 'Fornecedor'} adicionado com sucesso!`)
        onSuccess(result.id)
        setOpen(false)
        setFormData({
          nome: '',
          documento: '',
          email: '',
          telefone: '',
          tipo: tipo
        })
      }
    } catch (error) {
      console.error('Erro ao criar:', error)
      toast.error('Erro ao adicionar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <Plus className="h-4 w-4 mr-1" />
          Novo {tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar {tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Digite o nome"
              required
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="fornecedor">Fornecedor</SelectItem>
                <SelectItem value="ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="documento">Documento</Label>
              <Input
                id="documento"
                value={formData.documento}
                onChange={(e) => setFormData(prev => ({ ...prev, documento: e.target.value }))}
                placeholder="CPF/CNPJ"
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
