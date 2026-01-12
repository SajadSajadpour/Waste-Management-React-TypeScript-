import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/shared/ui/card"
import { cn } from "@/shared/utils/cn"

type KpiCardProps = {
  label: string
  value: string
  delta?: string
  helper?: string
  icon?: LucideIcon
  className?: string
}

export function KpiCard({
  label,
  value,
  delta,
  helper,
  icon: Icon,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("min-h-[120px]", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          {Icon ? <Icon className="h-4 w-4" /> : null}
        </div>
        <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
        {delta ? <div className="mt-1 text-xs text-muted-foreground">{delta}</div> : null}
        {helper ? <div className="mt-2 text-xs text-muted-foreground">{helper}</div> : null}
      </CardContent>
    </Card>
  )
}
