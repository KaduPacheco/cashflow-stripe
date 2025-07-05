
import { useState, useCallback } from 'react'

export type RecurrenceType = 'mensal' | 'trimestral' | 'semestral' | 'anual'

interface UseRecurringLogicReturn {
  recorrente: boolean
  recorrencia: RecurrenceType
  parcelado: boolean
  numeroParcelas: number
  setRecorrente: (value: boolean) => void
  setRecorrencia: (value: RecurrenceType) => void
  setParcelado: (value: boolean) => void
  setNumeroParcelas: (value: number) => void
  resetRecurring: () => void
}

/**
 * Hook personalizado para gerenciar lógica de recorrência e parcelamento
 * @returns Objeto com estados e funções para gerenciar recorrência
 */
export const useRecurringLogic = (): UseRecurringLogicReturn => {
  const [recorrente, setRecorrente] = useState<boolean>(false)
  const [recorrencia, setRecorrencia] = useState<RecurrenceType>('mensal')
  const [parcelado, setParcelado] = useState<boolean>(false)
  const [numeroParcelas, setNumeroParcelas] = useState<number>(2)

  const resetRecurring = useCallback((): void => {
    setRecorrente(false)
    setRecorrencia('mensal')
    setParcelado(false)
    setNumeroParcelas(2)
  }, [])

  return {
    recorrente,
    recorrencia,
    parcelado,
    numeroParcelas,
    setRecorrente,
    setRecorrencia,
    setParcelado,
    setNumeroParcelas,
    resetRecurring
  }
}
