
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'

interface DashboardMetricCardProps {
  title: string
  value: number
  description: string
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  borderColor: string
  valueColor: string
  delay?: number
}

export function DashboardMetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  borderColor,
  valueColor,
  delay = 0
}: DashboardMetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={`${borderColor} modern-card hover-lift`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`p-2 ${iconBgColor} rounded-xl`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.1 }}
            className={`text-3xl font-bold mb-1 ${valueColor}`}
          >
            {formatCurrency(value)}
          </motion.div>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
