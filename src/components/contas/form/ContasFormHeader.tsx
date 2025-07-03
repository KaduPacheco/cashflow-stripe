
import { X } from 'lucide-react'
import type { ContaPagarReceber } from '@/types/contas'

interface ContasFormHeaderProps {
  conta?: ContaPagarReceber
  onClose?: () => void
}

export function ContasFormHeader({ conta, onClose }: ContasFormHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-green-500 rounded-sm flex items-center justify-center">
          <span className="text-white text-sm font-bold">{conta ? '✏️' : '+'}</span>
        </div>
        <h2 className="text-lg font-semibold">
          {conta ? 'Editar Lançamento' : 'Novo Lançamento Futuro'}
        </h2>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
