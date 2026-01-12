import { Loader2 } from "lucide-react"

import { cn } from "@/shared/utils/cn"

type LoadingStateProps = {
  message?: string
  icon?: typeof Loader2
  className?: string
}

export function LoadingState({
  message = "Loading...",
  icon: Icon = Loader2,
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 p-8", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  )
}
