
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'

interface DashboardTipCardProps {
  tip: string
}

export function DashboardTipCard({ tip }: DashboardTipCardProps) {
  return (
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
          {tip}
        </p>
      </CardContent>
    </Card>
  )
}
