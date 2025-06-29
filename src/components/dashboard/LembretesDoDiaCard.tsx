
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import { useLembretesDoDia } from '@/hooks/useLembretesDoDia'
import { Skeleton } from '@/components/ui/skeleton'

export function LembretesDoDiaCard() {
  const { lembretesDoDia, isLoading } = useLembretesDoDia()

  if (isLoading) {
    return (
      <Card className="modern-card animate-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            Lembretes do Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-20" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="modern-card animate-slide-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          Lembretes do Dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lembretesDoDia.length > 0 ? (
          <div className="space-y-4">
            {lembretesDoDia.map((lembrete) => (
              <div key={lembrete.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <p className="font-medium text-card-foreground text-sm">
                  {lembrete.descricao}
                </p>
                {lembrete.valor && (
                  <div className="text-primary font-semibold">
                    {formatCurrency(lembrete.valor)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="p-3 bg-muted/50 rounded-xl mb-3 w-fit mx-auto">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Nenhum lembrete para hoje</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
