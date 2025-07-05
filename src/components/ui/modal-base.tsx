
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ModalBaseProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Componente base para modais reutilizáveis
 * @param open - Estado de abertura do modal
 * @param onOpenChange - Callback para mudança de estado
 * @param title - Título do modal
 * @param description - Descrição opcional
 * @param children - Conteúdo do modal
 * @param className - Classes CSS adicionais
 * @param maxWidth - Largura máxima do modal
 */
export const ModalBase: React.FC<ModalBaseProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  maxWidth = 'md'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "w-[95vw] mx-auto",
        maxWidthClasses[maxWidth],
        className
      )}>
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
