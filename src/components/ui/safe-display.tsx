import React from 'react'
import { XSSSecurityClient } from '@/lib/xssSecurity'

interface SafeDisplayProps {
  children: string | null | undefined
  allowBasicHTML?: boolean
  className?: string
  fallback?: string
}

export function SafeDisplay({ 
  children, 
  allowBasicHTML = false, 
  className,
  fallback = '' 
}: SafeDisplayProps) {
  if (!children) {
    return <span className={className}>{fallback}</span>
  }

  const safeContent = allowBasicHTML 
    ? XSSSecurityClient.sanitizeHTML(children)
    : XSSSecurityClient.sanitizeText(children)

  if (allowBasicHTML) {
    return (
      <span 
        className={className}
        dangerouslySetInnerHTML={{ __html: safeContent }} 
      />
    )
  }

  return <span className={className}>{safeContent}</span>
}

interface SafeFieldProps {
  label: string
  value: string | null | undefined
  className?: string
}

export function SafeField({ label, value, className }: SafeFieldProps) {
  return (
    <div className={className}>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1">
        <SafeDisplay>{value}</SafeDisplay>
      </dd>
    </div>
  )
}