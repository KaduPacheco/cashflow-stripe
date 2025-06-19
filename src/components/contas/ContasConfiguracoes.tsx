
import { useState } from 'react'
import { useClientesFornecedores } from '@/hooks/useClientesFornecedores'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Users, Settings } from 'lucide-react'
import type { ClienteFornecedor } from '@/types/contas'

export function ContasConfiguracoes() {
  const { clientesFornecedores, createClienteFornecedor, updateClienteFornecedor, deleteClienteFornecedor } = useClientesFornecedores()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ClienteFornecedor | null>(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'cliente' as 'cliente' | 'fornecedor' | 'ambos',
    documento: '',
    email: '',
    telefone: '',
    endereco: '',
    observacoes: ''
  })

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'cliente',
      documento: '',
      email: '',
      telefone: '',
      endereco: '',
      observacoes: ''
    })
    setEditingItem(null)
  }

  const openDialog = (item?: ClienteFornecedor) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        nome: item.nome,
        tipo: item.tipo,
        documento: item.documento || '',
        email: item.email || '',
        telefone: item.telefone || '',
        endereco: item.endereco || '',
        observacoes: item.observacoes || ''
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome) return

    const data = {
      ...formData,
      ativo: true,
      user_id: '' // Will be set by the hook
    }

    if (editingItem) {
      await updateClienteFornecedor(editingItem.id, data)
    } else {
      await createClienteFornecedor(data)
    }

    setDialogOpen(false)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente/fornecedor?')) {
      await deleteClienteFornecedor(id)
    }
  }

  const getTipoBadge = (tipo: string) => {
    const colors = {
      cliente: 'default',
      fornecedor: 'secondary',
      ambos: 'outline'
    } as const
    
    return (
      <Badge variant={colors[tipo as keyof typeof colors] || 'default'}>
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie clientes, fornecedores e configurações do módulo</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes e Fornecedores
            </CardTitle>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cliente/Fornecedor
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Editar' : 'Novo'} Cliente/Fornecedor
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="tipo">Tipo *</Label>
                      <Select value={formData.tipo} onValueChange={(value: 'cliente' | 'fornecedor' | 'ambos') => setFormData(prev => ({ ...prev, tipo: value }))}>
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
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endereco">Endereço</Label>
                    <Textarea
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingItem ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {clientesFornecedores.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum cliente ou fornecedor cadastrado
              </p>
            ) : (
              clientesFornecedores.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.nome}</span>
                      {getTipoBadge(item.tipo)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      {item.documento && <div>Doc: {item.documento}</div>}
                      {item.email && <div>Email: {item.email}</div>}
                      {item.telefone && <div>Tel: {item.telefone}</div>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDialog(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configurações adicionais serão implementadas aqui conforme necessidade.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
