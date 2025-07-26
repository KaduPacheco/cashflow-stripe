
import { useState } from 'react'
import { ValidationUtils } from '@/lib/enhancedValidation'
import { XSSSecurityClient } from '@/lib/xssSecurity'
import { z } from 'zod'

export function useSecureForm<T extends Record<string, any>>(
  initialData: T,
  validationSchema: z.ZodSchema<T>
) {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: keyof T, value: any) => {
    // Sanitize input on change
    const sanitizedValue = typeof value === 'string' 
      ? XSSSecurityClient.sanitizeText(value)
      : value

    setData(prev => ({ ...prev, [field]: sanitizedValue }))
    
    // Clear field error on change
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }))
    }
  }

  const validateField = (field: keyof T, value: any): string | null => {
    try {
      // For individual field validation, we'll use a partial schema approach
      const fieldSchema = z.object({ [field]: validationSchema.shape?.[field as string] || z.any() })
      const result = fieldSchema.safeParse({ [field]: value })
      
      if (!result.success) {
        return result.error.errors[0]?.message || 'Valor inválido'
      }
      return null
    } catch (error: any) {
      return 'Erro de validação'
    }
  }

  const validateForm = (): boolean => {
    const validation = ValidationUtils.validateAndSanitize(validationSchema, data)
    
    if (!validation.success) {
      const newErrors: Record<string, string> = {}
      validation.errors.forEach((error, index) => {
        // Map errors to fields (simplified approach)
        const fieldName = Object.keys(data)[index] || 'form'
        newErrors[fieldName] = error
      })
      setErrors(newErrors)
      return false
    }

    setErrors({})
    return true
  }

  const handleSubmit = async (
    onSubmit: (data: T) => Promise<void>,
    onError?: (error: string) => void
  ) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    
    try {
      if (!validateForm()) {
        return
      }

      // Final sanitization before submission
      const sanitizedData = ValidationUtils.sanitizeFormData(data) as T
      await onSubmit(sanitizedData)
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao processar formulário'
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setData(initialData)
    setErrors({})
    setIsSubmitting(false)
  }

  return {
    data,
    errors,
    isSubmitting,
    updateField,
    validateField,
    validateForm,
    handleSubmit,
    reset
  }
}
