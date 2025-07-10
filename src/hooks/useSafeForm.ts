
import { useState, useCallback } from 'react'
import { XSSSecurityClient } from '@/lib/xssSecurity'

export function useSafeForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues)

  const updateValue = useCallback((key: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [key]: typeof value === 'string' ? XSSSecurityClient.sanitizeText(value) : value
    }))
  }, [])

  const updateValues = useCallback((newValues: Partial<T>) => {
    const sanitizedValues = XSSSecurityClient.sanitizeObject(newValues)
    setValues(prev => ({ ...prev, ...sanitizedValues }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
  }, [initialValues])

  const getSafeValues = useCallback(() => {
    return XSSSecurityClient.sanitizeObject(values)
  }, [values])

  return {
    values,
    updateValue,
    updateValues,
    reset,
    getSafeValues
  }
}
