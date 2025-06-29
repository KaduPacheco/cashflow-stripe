
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
      <Card className="modern-card animate-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            Próximo Lembrete
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proximoLembrete ? (
            <div className="space-y-3">
              <p className="font-medium text-card-foreground">{proximoLembrete.descricao}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(proximoLembrete.data!).toLocaleDateString('pt-BR')}
              </div>
              {proximoLembrete.valor && (
                <div className="text-lg font-semibold text-primary">
                  {formatCurrency(proximoLembrete.valor)}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="p-3 bg-muted/50 rounded-xl mb-3 w-fit mx-auto">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Nenhum lembrete próximo</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="modern-card animate-slide-in" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
              <Lightbulb className="h-5 w-5 text-amber-600" />
            </div>
            Dica do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-card-foreground bg-gradient-to-r from-primary/5 to-blue-600/5 p-4 rounded-xl border border-primary/10">
            {dicaDoDia}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
