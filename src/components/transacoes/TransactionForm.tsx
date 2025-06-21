
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CurrencyInput } from '@/components/ui/currency-input'
import { CategorySelector } from '@/components/transactions/CategorySelector'
import { TransactionFormData } from '@/types/transaction'

interface TransactionFormProps {
  formData: TransactionFormData
  setFormData: (data: TransactionFormData) => void
  onSubmit: (e: React.FormEvent) => void
  isEditing: boolean
}

export function TransactionForm({ formData, setFormData, onSubmit, isEditing }: TransactionFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipo" className="text-sm">Tipo</Label>
          <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="valor" className="text-sm">Valor</Label>
          <CurrencyInput
            value={formData.valor}
            onChange={(value) => setFormData({...formData, valor: value})}
            required
            className="h-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="estabelecimento" className="text-sm">Estabelecimento</Label>
        <Input
          id="estabelecimento"
          placeholder="Ex: Supermercado, Salário, etc."
          value={formData.estabelecimento}
          onChange={(e) => setFormData({...formData, estabelecimento: e.target.value})}
          className="h-10"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="categoria" className="text-sm">Categoria</Label>
        <CategorySelector
          value={formData.category_id}
          onValueChange={(value) => setFormData({...formData, category_id: value})}
          placeholder="Selecione a categoria"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="quando" className="text-sm">Data</Label>
        <Input
          id="quando"
          type="date"
          value={formData.quando}
          onChange={(e) => setFormData({...formData, quando: e.target.value})}
          className="h-10"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="detalhes" className="text-sm">Detalhes</Label>
        <Textarea
          id="detalhes"
          placeholder="Informações adicionais..."
          value={formData.detalhes}
          onChange={(e) => setFormData({...formData, detalhes: e.target.value})}
          className="min-h-[80px] resize-none"
        />
      </div>
      
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-10">
        {isEditing ? 'Atualizar' : 'Adicionar'} Transação
      </Button>
    </form>
  )
}
