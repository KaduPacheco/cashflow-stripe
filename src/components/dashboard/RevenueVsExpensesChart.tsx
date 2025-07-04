
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/utils/currency'

interface Transacao {
  id: number
  valor: number | null
  tipo: string | null
  categorias?: {
    nome: string
  }
}

interface RevenueVsExpensesChartProps {
  transacoes: Transacao[]
  totalReceitas: number
}

const CATEGORY_COLORS = {
  'Habitação': '#6366F1',
  'Alimentação': '#22C55E', 
  'Transporte': '#EAB308',
  'Saúde': '#F97316',
  'Educação': '#10B981',
  'Lazer': '#8B5CF6',
  'Outros': '#F43F5E',
  'default': '#64748B'
}

export function RevenueVsExpensesChart({ transacoes, totalReceitas }: RevenueVsExpensesChartProps) {
  const getPieData = () => {
    const receitasValue = Math.abs(totalReceitas)
    const data = []

    // Adicionar receitas como uma fatia única
    if (receitasValue > 0) {
      data.push({ 
        name: 'Receitas', 
        value: receitasValue,
        color: '#0F4C81'
      })
    }

    // Adicionar despesas separadas por categoria
    const categoriasDespesas: { [key: string]: number } = {}
    
    transacoes.forEach(t => {
      if (t.categorias?.nome && t.valor && t.tipo === 'despesa') {
        const categoryName = t.categorias.nome
        categoriasDespesas[categoryName] = (categoriasDespesas[categoryName] || 0) + Math.abs(t.valor)
      }
    })

    Object.entries(categoriasDespesas).forEach(([categoria, valor]) => {
      if (valor > 0) {
        data.push({
          name: categoria,
          value: valor,
          color: CATEGORY_COLORS[categoria as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default
        })
      }
    })

    return data
  }

  return (
    <Card className="modern-card animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          Receitas vs Despesas por Categoria
        </CardTitle>
        <CardDescription>
          Distribuição detalhada entre receitas e categorias de despesas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {getPieData().length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Sem dados para exibir
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    animationDuration={500}
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legenda personalizada */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t">
              {getPieData().map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-card-foreground truncate">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
