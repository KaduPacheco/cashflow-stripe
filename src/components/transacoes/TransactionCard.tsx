
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
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {transacao.tipo === 'receita' ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <h3 className="font-semibold">
              {transacao.estabelecimento || 'Sem estabelecimento'}
            </h3>
            <Badge variant={transacao.tipo === 'receita' ? 'default' : 'destructive'}>
              {transacao.tipo}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            {transacao.categorias && (
              <p>Categoria: {transacao.categorias.nome}</p>
            )}
            {transacao.quando && (
              <p>Data: {formatBrazilianDateTime(transacao.quando)}</p>
            )}
            <p>Criado em: {formatBrazilianDateTime(transacao.created_at)}</p>
            {transacao.detalhes && (
              <p>Detalhes: {transacao.detalhes}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${
            transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transacao.tipo === 'receita' ? '+' : '-'}
            {formatCurrency(Math.abs(transacao.valor || 0))}
          </span>
          <ReadOnlyWrapper message="Edição disponível apenas na versão premium" showOverlay={false}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(transacao)}
              disabled={isReadOnly}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </ReadOnlyWrapper>
          
          <ReadOnlyWrapper message="Exclusão disponível apenas na versão premium" showOverlay={false}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(transacao.id)}
              disabled={isReadOnly}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </ReadOnlyWrapper>
        </div>
      </div>
    </Card>
  )
}
