
import { useState } from 'react'
import { useContas } from '@/hooks/useContas'
import { ContasList } from './ContasList'
import { ContasFilters } from './ContasFilters'
import { ContasForm } from './ContasForm'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">Contas a Receber</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas contas a receber</p>
        </div>
        
        <Button 
          onClick={() => setDialogOpen(true)}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta a Receber
        </Button>
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

      <ResponsiveModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Nova Conta a Receber"
      >
        <ContasForm 
          tipo="receber" 
          onSuccess={() => {
            setDialogOpen(false)
            fetchContas(filters)
          }} 
        />
      </ResponsiveModal>
    </div>
  )
}
