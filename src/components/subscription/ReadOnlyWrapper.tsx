
import { ReactNode } from 'react'
import { useReadOnlyMode } from '@/hooks/useReadOnlyMode'
import { ReadOnlyOverlay } from './ReadOnlyOverlay'

interface ReadOnlyWrapperProps {
  children: ReactNode
  message?: string
  showOverlay?: boolean
}

export function ReadOnlyWrapper({ 
  children, 
  message,
  showOverlay = true 
}: ReadOnlyWrapperProps) {
  const { isReadOnly } = useReadOnlyMode()

  return (
    <div className="relative">
      {children}
      {isReadOnly && showOverlay && (
        <ReadOnlyOverlay message={message} />
      )}
    </div>
  )
}
