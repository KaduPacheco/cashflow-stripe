
import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormSectionTitleProps {
  title: string
  icon?: LucideIcon
  iconColor?: string
  dotColor?: string
  className?: string
}

/**
 * Componente para títulos de seções em formulários
 * @param title - Texto do título
 * @param icon - Ícone Lucide (opcional)
 * @param iconColor - Cor do ícone
 * @param dotColor - Cor do ponto indicador
 * @param className - Classes CSS adicionais
 */
export const FormSectionTitle: React.FC<FormSectionTitleProps> = ({
  title,
  icon: Icon,
  iconColor = "text-blue-500",
  dotColor = "bg-green-500",
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2 text-sm font-medium text-muted-foreground", className)}>
      <div className={cn("w-2 h-2 rounded-full", dotColor)}></div>
      {Icon && <Icon className={cn("h-4 w-4", iconColor)} />}
      <span>{title}</span>
    </div>
  )
}
