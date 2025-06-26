
export const validateCategoryOwnership = (categoryId: string, userCategories: any[]) => {
  return userCategories?.some(cat => cat.id === categoryId) || false
}

export const calculateTotals = (transactions: any[]) => {
  const receitas = transactions
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + (t.valor || 0), 0)
  
  const despesas = transactions
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Math.abs(t.valor || 0), 0)
  
  return {
    receitas,
    despesas,
    saldo: receitas - despesas
  }
}
