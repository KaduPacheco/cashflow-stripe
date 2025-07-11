
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LembreteFormData } from '@/types/lembrete'

interface LembreteFormProps {
  formData: LembreteFormData
  setFormData: (data: LembreteFormData) => void
  onSubmit: (e: React.FormEvent) => void
  isEditing: boolean
}

export function LembreteForm({ formData, setFormData, onSubmit, isEditing }: LembreteFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          placeholder="Ex: Pagar conta de luz, Aniversário da Maria..."
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data">Data</Label>
          <Input
            id="data"
            type="date"
            value={formData.data}
            onChange={(e) => setFormData({...formData, data: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valor">Valor (opcional)</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={formData.valor}
            onChange={(e) => setFormData({...formData, valor: e.target.value})}
          />
        </div>
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
        {isEditing ? 'Atualizar' : 'Adicionar'} Lembrete
      </Button>
    </form>
  )
}
