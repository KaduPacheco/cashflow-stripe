
import { Routes, Route, Navigate } from 'react-router-dom'
import { ContasHeader } from '@/components/contas/ContasHeader'
import { ContasPainel } from '@/components/contas/ContasPainel'
import { ContasPagar } from '@/components/contas/ContasPagar'
import { ContasReceber } from '@/components/contas/ContasReceber'
import { ContasRelatorios } from '@/components/contas/ContasRelatorios'
import { ContasConfiguracoes } from '@/components/contas/ContasConfiguracoes'

export default function ContasPagarReceber() {
  return (
    <div className="h-full">
      <ContasHeader />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/contas/painel" replace />} />
          <Route path="/painel" element={<ContasPainel />} />
          <Route path="/pagar" element={<ContasPagar />} />
          <Route path="/receber" element={<ContasReceber />} />
          <Route path="/relatorios" element={<ContasRelatorios />} />
          <Route path="/configuracoes" element={<ContasConfiguracoes />} />
        </Routes>
      </div>
    </div>
  )
}
