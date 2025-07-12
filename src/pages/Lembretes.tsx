
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useLembretes } from '@/hooks/useLembretes'
import { useAuth } from '@/hooks/useAuth'
import { LembreteForm } from '@/components/lembretes/LembreteForm'
import { LembretesList } from '@/components/lembretes/LembretesList'
import { LembretesActions } from '@/components/lembretes/LembretesActions'
import { Lembrete, LembreteFormData } from '@/types/lembrete'

export default function Lembretes() {
  const { user } = useAuth()
  const { 
    lembretes, 
    loading, 
    createLembrete, 
    updateLembrete, 
    deleteLembrete, 
    deleteAllLembretes,
    scheduleWhatsAppNotification
  } = useLembretes()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLembrete, setEditingLembrete] = useState<Lembrete | null>(null)
  const [formData, setFormData] = useState<LembreteFormData>({
    descricao: '',
    data: '',
    valor: '',
    notificar_whatsapp: false,
    data_envio_whatsapp: '',
    horario_envio_whatsapp: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingLembrete) {
        await updateLembrete(editingLembrete.id, formData)
      } else {
        await createLembrete(formData)
      }

      setDialogOpen(false)
      setEditingLembrete(null)
      setFormData({
        descricao: '',
        data: '',
        valor: '',
        notificar_whatsapp: false,
        data_envio_whatsapp: '',
        horario_envio_whatsapp: '',
      })
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleEdit = (lembrete: Lembrete) => {
    setEditingLembrete(lembrete)
    setFormData({
      descricao: lembrete.descricao || '',
      data: lembrete.data || '',
      valor: lembrete.valor?.toString() || '',
      notificar_whatsapp: lembrete.notificar_whatsapp || false,
      data_envio_whatsapp: lembrete.data_envio_whatsapp?.split('T')[0] || '',
      horario_envio_whatsapp: lembrete.horario_envio_whatsapp || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este lembrete?')) return
    await deleteLembrete(id)
  }

  const handleScheduleWhatsApp = async (id: number, date: string, time: string) => {
    await scheduleWhatsAppNotification(id, date, time)
  }

  const handleCreateNew = () => {
    setEditingLembrete(null)
    setFormData({
      descricao: '',
      data: '',
      valor: '',
      notificar_whatsapp: false,
      data_envio_whatsapp: '',
      horario_envio_whatsapp: '',
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-400">Lembretes</h2>
          <p className="text-muted-foreground">Gerencie seus lembretes de pagamentos e compromissos</p>
        </div>
        
        <LembretesActions 
          hasLembretes={lembretes.length > 0}
          onCreateNew={handleCreateNew}
          onDeleteAll={deleteAllLembretes}
        />
      </div>

      <LembretesList 
        lembretes={lembretes}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onScheduleWhatsApp={handleScheduleWhatsApp}
        onCreateNew={handleCreateNew}
        userName={user?.user_metadata?.nome || user?.email}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingLembrete ? 'Editar Lembrete' : 'Novo Lembrete'}
            </DialogTitle>
            <DialogDescription>
              {editingLembrete 
                ? 'Faça as alterações necessárias no lembrete.' 
                : 'Adicione um novo lembrete para não esquecer pagamentos importantes.'}
            </DialogDescription>
          </DialogHeader>
          <LembreteForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isEditing={!!editingLembrete}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
