
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">Contas a Pagar</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas contas a pagar</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta a Pagar
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
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
