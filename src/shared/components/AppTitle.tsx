import { Badge } from "@/shared/ui/badge"
import { cn } from "@/shared/utils/cn"

type AppTitleProps = {
  envLabel?: string
  className?: string
}

export function AppTitle({ envLabel, className }: AppTitleProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-lg font-semibold">FoodCycler</span>
      {envLabel ? (
        <Badge variant="secondary" className="uppercase tracking-wide">
          {envLabel}
        </Badge>
      ) : null}
    </div>
  )
}
