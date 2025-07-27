
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'

interface AdminMetricCardProps {
  title: string
  value: number
  icon: LucideIcon
  filterValue: string
  filterOptions: { value: string; label: string }[]
  onFilterChange: (value: string) => void
  loading: boolean
  isCurrency?: boolean
}

export function AdminMetricCard({
  title,
  value,
  icon: Icon,
  filterValue,
  filterOptions,
  onFilterChange,
  loading,
  isCurrency = false
}: AdminMetricCardProps) {
  const formatValue = (val: number) => {
    if (isCurrency) {
      return formatCurrency(val)
    }
    return val.toLocaleString()
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-200">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold text-white">
          {loading ? '...' : formatValue(value)}
        </div>
        <Select value={filterValue} onValueChange={onFilterChange}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {filterOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-gray-200 focus:bg-gray-600 focus:text-white"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
