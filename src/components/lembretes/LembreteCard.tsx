
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Edit, Trash2 } from 'lucide-react'
import { Lembrete } from '@/types/lembrete'
import { formatCurrency } from '@/utils/currency'
import { formatDate, getDateStatus, isOverdue } from '@/utils/lembreteUtils'

interface LembreteCardProps {
  lembrete: Lembrete
  onEdit: (lembrete: Lembrete) => void
  onDelete: (id: number) => void
}

export function LembreteCard({ lembrete, onEdit, onDelete }: LembreteCardProps) {
  const dateStatus = lembrete.data ? getDateStatus(lembrete.data) : null

  return (
    <Card className={`hover:shadow-md transition-shadow ${
      lembrete.data && isOverdue(lembrete.data) ? 'border-red-200 bg-red-50' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">{lembrete.descricao}</h3>
              {dateStatus && (
                <Badge variant={dateStatus.variant}>
                  {dateStatus.label}
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {lembrete.data && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Data: {formatDate(lembrete.data)}</span>
                </div>
              )}
              {lembrete.valor && (
                <p>Valor: {formatCurrency(lembrete.valor)}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(lembrete)}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(lembrete.id)}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
