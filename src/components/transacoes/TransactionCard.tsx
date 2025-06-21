
import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react'
import { Transacao } from '@/types/transaction'
import { formatCurrency } from '@/utils/currency'
import { formatBrazilianDateTime } from '@/utils/dateFormatter'
import { ReadOnlyWrapper } from '@/components/subscription/ReadOnlyWrapper'

interface TransactionCardProps {
  transacao: Transacao
  onEdit: (transacao: Transacao) => void
  onDelete: (id: number) => void
  isReadOnly: boolean
}

export function TransactionCard({ transacao, onEdit, onDelete, isReadOnly }: TransactionCardProps) {
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {transacao.tipo === 'receita' ? (
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
            ) : (
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
            )}
            <h3 className="font-semibold text-sm sm:text-base truncate">
              {transacao.estabelecimento || 'Sem estabelecimento'}
            </h3>
            <Badge variant={transacao.tipo === 'receita' ? 'default' : 'destructive'} className="text-xs flex-shrink-0">
              {transacao.tipo}
            </Badge>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
            {transacao.categorias && (
              <p className="truncate">Categoria: {transacao.categorias.nome}</p>
            )}
            {transacao.quando && (
              <p>Data: {formatBrazilianDateTime(transacao.quando)}</p>
            )}
            <p>Criado em: {formatBrazilianDateTime(transacao.created_at)}</p>
            {transacao.detalhes && (
              <p className="truncate">Detalhes: {transacao.detalhes}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <span className={`text-lg sm:text-xl font-bold ${
            transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transacao.tipo === 'receita' ? '+' : '-'}
            {formatCurrency(Math.abs(transacao.valor || 0))}
          </span>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <ReadOnlyWrapper message="Edição disponível apenas na versão premium" showOverlay={false}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(transacao)}
                disabled={isReadOnly}
                className="flex-1 sm:flex-none"
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="ml-1 sm:hidden">Editar</span>
              </Button>
            </ReadOnlyWrapper>
            
            <ReadOnlyWrapper message="Exclusão disponível apenas na versão premium" showOverlay={false}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(transacao.id)}
                disabled={isReadOnly}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="ml-1 sm:hidden">Excluir</span>
              </Button>
            </ReadOnlyWrapper>
          </div>
        </div>
      </div>
    </Card>
  )
}
