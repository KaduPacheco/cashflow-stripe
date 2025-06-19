
import { useState } from 'react'
import { useContas } from '@/hooks/useContas'
import { ContasList } from './ContasList'
import { ContasFilters } from './ContasFilters'
import { ContasForm } from './ContasForm'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { ContasFilters as IContasFilters } from '@/types/contas'

export function ContasPagar() {
  const { contas, loading, fetchContas } = useContas()
  const [filters, setFilters] = useState<IContasFilters>({ tipo: 'pagar' })
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleFiltersChange = (newFilters: IContasFilters) => {
    const updatedFilters = { ...newFilters, tipo: 'pagar' as const }
    setFilters(updatedFilters)
    fetchContas(updatedFilters)
  }

  const contasPagar = contas.filter(conta => conta.tipo === 'pagar')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie suas contas a pagar</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta a Pagar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Conta a Pagar</DialogTitle>
            </DialogHeader>
            <ContasForm 
              tipo="pagar" 
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
        tipo="pagar"
      />

      <ContasList 
        contas={contasPagar}
        loading={loading}
        tipo="pagar"
        onUpdate={() => fetchContas(filters)}
      />
    </div>
  )
}
