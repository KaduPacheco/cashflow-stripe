
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Lock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/utils/currency'

interface Transacao {
  id: number
  valor: number | null
  tipo: string | null
  categorias?: {
    nome: string
  }
}

interface ExpensesByCategoryChartProps {
  transacoes: Transacao[]
  isSubscribed: boolean
}

export function ExpensesByCategoryChart({ transacoes, isSubscribed }: ExpensesByCategoryChartProps) {
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

  return (
    <Card className="lg:col-span-2 modern-card animate-scale-in">
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
      <CardContent>
        <div className="h-[320px] rounded-xl overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="categoria" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
