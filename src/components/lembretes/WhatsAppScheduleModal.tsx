
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Clock } from 'lucide-react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'

interface WhatsAppScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (date: string, time: string) => void
  lembreteTitle: string
}

export function WhatsAppScheduleModal({ 
  open, 
  onOpenChange, 
  onConfirm, 
  lembreteTitle 
}: WhatsAppScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(selectedDate, selectedTime)
      setSelectedDate('')
      setSelectedTime('')
      onOpenChange(false)
    }
  }

  const isFormValid = selectedDate && selectedTime

  return (
    <ResponsiveModal 
      open={open} 
      onOpenChange={onOpenChange} 
      title="Agendar Notificação WhatsApp"
    >
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Configure quando deseja receber a notificação via WhatsApp para o lembrete:
        </div>
        
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="font-medium text-sm">{lembreteTitle}</div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="notification-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data da notificação
            </Label>
            <Input
              id="notification-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário da notificação
            </Label>
            <Input
              id="notification-time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isFormValid}
            className="flex-1"
          >
            Confirmar Agendamento
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}
