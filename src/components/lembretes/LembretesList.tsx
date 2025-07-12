
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { Lembrete } from '@/types/lembrete'
import { LembreteCard } from './LembreteCard'

interface LembretesListProps {
  lembretes: Lembrete[]
  loading: boolean
  onEdit: (lembrete: Lembrete) => void
  onDelete: (id: number) => void
  onScheduleWhatsApp: (id: number, date: string, time: string) => void
  onCreateNew: () => void
  userName?: string
}

export function LembretesList({ 
  lembretes, 
  loading, 
  onEdit, 
  onDelete, 
  onScheduleWhatsApp, 
  onCreateNew, 
  userName 
}: LembretesListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse dark:bg-muted/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (lembretes.length === 0) {
    return (
      <Card className="dark:bg-muted/40">
        <CardContent className="p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-muted-foreground mb-4">Nenhum lembrete encontrado</p>
          <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
            Adicionar primeiro lembrete
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {lembretes.map((lembrete) => (
        <LembreteCard 
          key={lembrete.id}
          lembrete={lembrete}
          onEdit={onEdit}
          onDelete={onDelete}
          onScheduleWhatsApp={onScheduleWhatsApp}
          userName={userName}
        />
      ))}
    </div>
  )
}
