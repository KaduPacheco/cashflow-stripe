
import React, { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Calendar, Building2, FileText } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'

interface Transaction {
  id: number
  estabelecimento: string
  valor: number
  tipo: 'receita' | 'despesa'
  category_id: string
  detalhes?: string
  quando: string
  created_at: string
}

interface OptimizedTransactionCardProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (id: number) => void
  categoryName?: string
  isReadOnly?: boolean
}

export const OptimizedTransactionCard = memo(function OptimizedTransactionCard({
  transaction,
  onEdit,
  onDelete,
  categoryName = 'Categoria não encontrada',
  isReadOnly = false
}: OptimizedTransactionCardProps) {
  const handleEdit = React.useCallback(() => {
    onEdit(transaction)
  }, [onEdit, transaction])

  const handleDelete = React.useCallback(() => {
    onDelete(transaction.id)
  }, [onDelete, transaction.id])

  const formatDate = React.useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }, [])

  const isReceita = transaction.tipo === 'receita'

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm truncate">
                {transaction.estabelecimento}
              </h3>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(transaction.quando)}</span>
              </div>
              
              <Badge 
                variant="secondary"
                className="text-xs"
              >
                {categoryName}
              </Badge>
            </div>
          </div>

          <div className="text-right ml-4">
            <div className={`text-lg font-bold ${
              isReceita ? 'text-green-600' : 'text-red-600'
            }`}>
              {isReceita ? '+' : '-'} {formatCurrency(transaction.valor)}
            </div>
            
            <Badge 
              variant={isReceita ? 'default' : 'destructive'}
              className="text-xs"
            >
              {isReceita ? 'Receita' : 'Despesa'}
            </Badge>
          </div>
        </div>

        {transaction.detalhes && (
          <div className="flex items-start gap-2 mb-3 p-2 bg-muted/50 rounded">
            <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground line-clamp-2">
              {transaction.detalhes}
            </p>
          </div>
        )}

        {!isReadOnly && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleEdit}
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Excluir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
