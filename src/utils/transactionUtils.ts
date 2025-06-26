
export const validateCategoryOwnership = (categoryId: string, userCategories: any[]) => {
  return userCategories?.some(cat => cat.id === categoryId) || false
}

export const calculateTotals = (transactions: any[]) => {
  console.log('calculateTotals: Input transactions:', transactions?.length || 0)
  
  // Log tipos encontrados para auditoria
  const tiposEncontrados = transactions?.map(t => t.tipo).filter(Boolean)
  console.log('calculateTotals: Tipos encontrados:', [...new Set(tiposEncontrados)])
  
  const receitas = transactions
    ?.filter(t => t.tipo?.toLowerCase() === 'receita')
    .reduce((acc, t) => {
      const valor = Number(t.valor) || 0
      console.log('calculateTotals: Adding receita:', valor, 'from', t.estabelecimento)
      return acc + valor
    }, 0) || 0
  
  const despesas = transactions
    ?.filter(t => t.tipo?.toLowerCase() === 'despesa')
    .reduce((acc, t) => {
      const valor = Number(t.valor) || 0
      console.log('calculateTotals: Adding despesa:', Math.abs(valor), 'from', t.estabelecimento)
      return acc + Math.abs(valor)
    }, 0) || 0
  
  const result = {
    receitas,
    despesas,
    saldo: receitas - despesas
  }
  
  console.log('calculateTotals: Final result:', result)
  return result
}
