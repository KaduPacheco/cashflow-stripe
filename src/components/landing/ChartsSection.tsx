
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export const ChartsSection = () => {
  const pieData = [
    { name: 'Alimentação', value: 35, color: '#0F4C81' },
    { name: 'Transporte', value: 20, color: '#006D5B' },
    { name: 'Lazer', value: 15, color: '#16A34A' },
    { name: 'Saúde', value: 12, color: '#CA8A04' },
    { name: 'Outros', value: 18, color: '#DC2626' }
  ]

  return (
    <section id="charts-section" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Visualize seus dados financeiros
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Nossos gráficos intuitivos te ajudam a identificar padrões de gastos e oportunidades de economia. 
              Com dados claros, você toma decisões financeiras mais inteligentes.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-primary rounded-full"></div>
                <span>Alimentação representa 35% dos seus gastos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-secondary rounded-full"></div>
                <span>Transporte consome 20% do orçamento</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-success rounded-full"></div>
                <span>Lazer equilibrado em 15%</span>
              </div>
            </div>
          </div>

          <div className="fintech-card p-8">
            <h3 className="text-xl font-semibold mb-6 text-center">Distribuição de Gastos por Categoria</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
