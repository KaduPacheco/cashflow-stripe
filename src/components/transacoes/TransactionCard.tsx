
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Calendar, Building2, FileText, Tag } from 'lucide-react'
import { SafeDisplay } from '@/components/ui/safe-display'
import type { Transacao } from '@/types/transaction'

interface TransactionCardProps {
  transacao: Transacao
  onEdit: (transacao: Transacao) => void
  onDelete: (id: number) => void
  isReadOnly?: boolean
}

export function TransactionCard({ 
  transacao, 
  onEdit, 
  onDelete, 
  isReadOnly = false 
}: TransactionCardProps) {
  // Modo gratuito premium: sempre permite edição
  const actuallyReadOnly = false

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <SafeDisplay className="font-medium truncate">
                {transacao.estabelecimento}
              </SafeDisplay>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(transacao.quando || '')}</span>
            </div>
            {transacao.categorias && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <Badge variant="secondary" className="text-xs">
                  {transacao.categorias.nome}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={transacao.tipo === 'receita' ? 'default' : 'destructive'}
              className="ml-2"
            >
              {transacao.tipo === 'receita' ? '+' : '-'} {formatCurrency(transacao.valor || 0)}
            </Badge>
            
            {!actuallyReadOnly && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(transacao)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(transacao.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {transacao.detalhes && (
        <CardContent className="pt-0">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <SafeDisplay className="break-words">
              {transacao.detalhes}
            </SafeDisplay>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
