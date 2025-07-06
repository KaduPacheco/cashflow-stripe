
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResponsiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  className?: string
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  open,
  onOpenChange,
  title,
  children,
  className
}) => {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className={cn(
            "max-h-[calc(100vh-40px)] overflow-y-auto px-4 py-3",
            "transition-transform ease-in-out duration-300",
            className
          )}
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "w-full max-w-[600px] max-h-[calc(100vh-40px)] overflow-y-auto",
          "px-6 py-4 transition-transform ease-in-out duration-300",
          "md:w-[95vw] sm:max-w-[600px]",
          className
        )}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
