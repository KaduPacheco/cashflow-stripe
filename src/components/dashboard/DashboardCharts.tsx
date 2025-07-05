
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, FileText, TrendingUp, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency } from '@/utils/currency'
import { EmptyState } from '@/components/ui/empty-state'
import { Transacao, DashboardStats, CATEGORY_COLORS } from '@/types/dashboard'

interface DashboardChartsProps {
  transacoes: Transacao[]
  stats: DashboardStats
  isSubscribed: boolean
}

export function DashboardCharts({ transacoes, stats, isSubscribed }: DashboardChartsProps) {
  const getChartData = () => {
    const categorias: { [key: string]: number } = {}
    
    transacoes.forEach(t => {
      if (t.categorias?.nome && t.valor && t.tipo === 'despesa') {
        const categoryName = t.categorias.nome
        categorias[categoryName] = (categorias[categoryName] || 0) + Math.abs(t.valor)
      }
    })

    return Object.entries(categorias).map(([categoria, valor]) => ({
      categoria,
      valor
    }))
  }

  const getPieData = () => {
    const receitasValue = Math.abs(stats.totalReceitas)
    const data = []

    if (receitasValue > 0) {
      data.push({ 
        name: 'Receitas', 
        value: receitasValue,
        color: '#0F4C81'
      })
    }

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
    <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
      <Card className="modern-card animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            Gastos por Categoria
            {!isSubscribed && <Lock className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          <CardDescription className="text-base">
            {isSubscribed 
              ? "Distribuição dos seus gastos no período selecionado"
              : "Distribuição dos últimos gastos registrados"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {getChartData().length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="Nenhuma despesa encontrada"
              description="Adicione algumas transações para ver os gráficos"
            />
          ) : (
            <div className="h-[280px] sm:h-[320px] lg:h-[350px] w-full rounded-xl overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={getChartData()}
                  margin={{ 
                    top: 20, 
                    right: 10, 
                    left: 10, 
                    bottom: 60 
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="categoria" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    width={60}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="valor" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

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
            <EmptyState
              icon={<TrendingUp className="h-8 w-8" />}
              title="Sem dados para exibir"
              description="Adicione transações para visualizar o gráfico"
            />
          ) : (
            <div className="space-y-4">
              <div className="h-[280px] sm:h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={getPieData()}
                      cx="50%"
                      cy="50%"
                      outerRadius="75%"
                      innerRadius="25%"
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => {
                        // Só mostra label se tiver espaço suficiente
                        if (percent > 0.05) {
                          return `${name}: ${formatCurrency(value)}`
                        }
                        return ''
                      }}
                      labelLine={false}
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
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                {getPieData().map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-card-foreground truncate text-xs sm:text-sm">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
