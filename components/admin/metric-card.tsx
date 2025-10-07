import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: MetricCardProps) {
  return (
    <Card className="border-border/40 hover:border-primary/30 transition-all duration-300 hover:shadow-medium group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
        {trend && (
          <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            {trend.isPositive ? '+' : ''}
            {trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}
