
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Lightbulb } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'

interface Lembrete {
  id: number
  created_at: string
  userId: string | null
  descricao: string | null
  data: string | null
  valor: number | null
}

interface DashboardSidebarProps {
  lembretes: Lembrete[]
  dicaDoDia: string
}

export function DashboardSidebar({ lembretes, dicaDoDia }: DashboardSidebarProps) {
  const proximoLembrete = lembretes
    .filter(l => l.data && new Date(l.data) >= new Date())
    .sort((a, b) => new Date(a.data!).getTime() - new Date(b.data!).getTime())[0]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximo Lembrete
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proximoLembrete ? (
            <div className="space-y-2">
              <p className="font-medium">{proximoLembrete.descricao}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(proximoLembrete.data!).toLocaleDateString('pt-BR')}
              </p>
              {proximoLembrete.valor && (
                <p className="text-sm font-medium text-primary">
                  {formatCurrency(proximoLembrete.valor)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum lembrete próximo</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Dica do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{dicaDoDia}</p>
        </CardContent>
      </Card>
    </div>
  )
}
