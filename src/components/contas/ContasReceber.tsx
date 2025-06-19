
import { useState } from 'react'
import { useContas } from '@/hooks/useContas'
import { ContasList } from './ContasList'
import { ContasFilters } from './ContasFilters'
import { ContasForm } from './ContasForm'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { ContasFilters as IContasFilters } from '@/types/contas'

export function ContasReceber() {
  const { contas, loading, fetchContas } = useContas()
  const [filters, setFilters] = useState<IContasFilters>({ tipo: 'receber' })
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleFiltersChange = (newFilters: IContasFilters) => {
    const updatedFilters = { ...newFilters, tipo: 'receber' as const }
    setFilters(updatedFilters)
    fetchContas(updatedFilters)
  }

  const contasReceber = contas.filter(conta => conta.tipo === 'receber')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contas a Receber</h1>
          <p className="text-muted-foreground">Gerencie suas contas a receber</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta a Receber
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Conta a Receber</DialogTitle>
            </DialogHeader>
            <ContasForm 
              tipo="receber" 
              onSuccess={() => {
                setDialogOpen(false)
                fetchContas(filters)
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <ContasFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        tipo="receber"
      />

      <ContasList 
        contas={contasReceber}
        loading={loading}
        tipo="receber"
        onUpdate={() => fetchContas(filters)}
      />
    </div>
  )
}
