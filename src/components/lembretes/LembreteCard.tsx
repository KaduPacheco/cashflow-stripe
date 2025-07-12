
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, MessageCircle, Trash2, Edit, Clock } from 'lucide-react'
import { SafeDisplay } from '@/components/ui/safe-display'
import { toast } from '@/hooks/use-toast'
import { createWhatsAppMessage, openWhatsApp } from '@/utils/whatsappService'
import type { Lembrete } from '@/types/lembrete'

interface LembreteCardProps {
  lembrete: Lembrete
  onEdit: (lembrete: Lembrete) => void
  onDelete: (id: number) => void
  onWhatsApp: (lembrete: Lembrete) => void
  userName?: string
}

export function LembreteCard({ lembrete, onEdit, onDelete, onWhatsApp, userName }: LembreteCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5) // Remove os segundos, mantém apenas HH:MM
  }

  const handleWhatsAppClick = () => {
    if (!lembrete.whatsapp) {
      toast({
        title: "WhatsApp não configurado",
        description: "Número de WhatsApp não configurado no perfil. Por favor, configure para utilizar esta função.",
        variant: "destructive",
      })
      return
    }

    const message = createWhatsAppMessage(lembrete, userName)
    openWhatsApp(lembrete.whatsapp, message)
    
    toast({
      title: "WhatsApp aberto",
      description: "O WhatsApp foi aberto com a mensagem do lembrete.",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-medium">
            <SafeDisplay>{lembrete.descricao}</SafeDisplay>
          </CardTitle>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(lembrete)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(lembrete.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {lembrete.data && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(lembrete.data)}</span>
            </div>
          )}
          
          {lembrete.valor && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(lembrete.valor)}</span>
            </div>
          )}
        </div>

        {lembrete.notificar_whatsapp && (lembrete.data_envio_whatsapp || lembrete.horario_envio_whatsapp) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            <Clock className="h-3 w-3" />
            <span>
              WhatsApp agendado para:{' '}
              {lembrete.data_envio_whatsapp && formatDate(lembrete.data_envio_whatsapp)}
              {lembrete.data_envio_whatsapp && lembrete.horario_envio_whatsapp && ' às '}
              {lembrete.horario_envio_whatsapp && formatTime(lembrete.horario_envio_whatsapp)}
            </span>
          </div>
        )}

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsAppClick}
            className="w-full"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Enviar WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
