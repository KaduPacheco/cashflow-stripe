
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
  'Receitas': '#0F4C81',
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
        color: CATEGORY_COLORS.Receitas
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

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
    if (percent < 0.05) return null; // Não exibir labels para fatias muito pequenas

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="modern-card animate-scale-in w-full max-w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          Receitas vs Despesas por Categoria
        </CardTitle>
        <CardDescription className="text-sm">
          Distribuição detalhada entre receitas e categorias de despesas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 w-full max-w-full">
        {getPieData().length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Sem dados para exibir
          </div>
        ) : (
          <div className="space-y-6 w-full">
            <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full max-w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
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
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: 'hsl(var(--card-foreground))'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legenda responsiva customizada */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-4 border-t border-border/50">
              {getPieData().map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20"
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-card-foreground font-medium truncate text-xs md:text-sm">
                      {entry.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatCurrency(entry.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
